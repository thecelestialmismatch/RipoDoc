#!/usr/bin/env python3
"""Audit RipoDoc page geometry at a narrow mobile viewport.

The test allows intentionally full-bleed section backgrounds but fails horizontal scroll
and reports visible reader-facing elements that begin inside the 16px safe gutter.
"""

from __future__ import annotations

import json
import subprocess
import sys
import time
import urllib.request
from pathlib import Path
from typing import Any

import websocket

BASE_URL = "http://127.0.0.1:3100"
PORT = 9224
PROFILE = "/tmp/ripodoc-sitewide-gutter-audit"
VIEWPORT = {"width": 390, "height": 844}
ROUTES = (
    "/",
    "/about",
    "/download",
    "/for-msps",
    "/founding-partners",
    "/how-it-works",
    "/legal",
    "/login",
    "/signup",
    "/forgot-password",
    "/report-diagnostic-starter-kit",
    "/report-evidence-readiness",
    "/security",
    "/upload",
)


def request_json(url: str, method: str = "GET") -> Any:
    with urllib.request.urlopen(urllib.request.Request(url, method=method), timeout=5) as response:
        return json.load(response)


def wait_for_debugger() -> None:
    deadline = time.monotonic() + 15
    while time.monotonic() < deadline:
        try:
            request_json(f"http://127.0.0.1:{PORT}/json/version")
            return
        except Exception:
            time.sleep(0.2)
    raise RuntimeError("Chrome DevTools endpoint did not become available")


def send(ws: websocket.WebSocket, message_id: int, method: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
    ws.send(json.dumps({"id": message_id, "method": method, "params": params or {}}))
    while True:
        payload = json.loads(ws.recv())
        if payload.get("id") == message_id:
            if "error" in payload:
                raise RuntimeError(f"{method}: {payload['error']}")
            return payload.get("result", {})


def geometry(ws: websocket.WebSocket, message_id: int) -> dict[str, Any]:
    expression = """
      (() => {
        const safeInset = 16;
        const viewport = window.innerWidth;
        const visible = (node) => {
          const style = window.getComputedStyle(node);
          const rect = node.getBoundingClientRect();
          return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
        };
        const candidates = [...document.querySelectorAll('h1, h2, h3, p, a, button, input, select, textarea, [role="alert"]')]
          .filter(visible)
          .map((node) => {
            const rect = node.getBoundingClientRect();
            return {
              tag: node.tagName.toLowerCase(),
              text: (node.textContent || node.getAttribute('aria-label') || '').trim().replace(/\\s+/g, ' ').slice(0, 80),
              left: Math.round(rect.left),
              right: Math.round(rect.right),
            };
          });
        const edgeContent = candidates.filter((box) => box.left < safeInset - 1 || box.right > viewport - safeInset + 1);
        const overflow = candidates.filter((box) => box.left < -1 || box.right > viewport + 1);
        return JSON.stringify({
          viewport,
          documentWidth: document.documentElement.scrollWidth,
          bodyWidth: document.body.scrollWidth,
          horizontalScroll: document.documentElement.scrollWidth > viewport + 1,
          edgeContent,
          overflow,
        });
      })()
    """
    result = send(ws, message_id, "Runtime.evaluate", {"expression": expression, "returnByValue": True})
    return json.loads(result["result"]["value"])


def main() -> int:
    Path(PROFILE).mkdir(parents=True, exist_ok=True)
    chrome = subprocess.Popen([
        "chromium", "--headless", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
        "--remote-allow-origins=*", f"--remote-debugging-port={PORT}",
        f"--user-data-dir={PROFILE}", "about:blank",
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        wait_for_debugger()
        page = request_json(f"http://127.0.0.1:{PORT}/json/new?about:blank", method="PUT")
        ws = websocket.create_connection(page["webSocketDebuggerUrl"], timeout=10, origin="http://localhost")
        try:
            message_id = 1
            send(ws, message_id, "Emulation.setDeviceMetricsOverride", {**VIEWPORT, "deviceScaleFactor": 1, "mobile": False})
            message_id += 1
            results = []
            for route in ROUTES:
                send(ws, message_id, "Page.navigate", {"url": f"{BASE_URL}{route}"})
                message_id += 1
                time.sleep(0.8)
                send(ws, message_id, "Runtime.evaluate", {"expression": "localStorage.setItem('ripodoc-cookie-preferences-v1', JSON.stringify({version:1,choice:'rejected',necessary:true,analytics:false,marketing:false,savedAt:new Date().toISOString()}));"})
                message_id += 1
                result = geometry(ws, message_id)
                message_id += 1
                result["route"] = route
                results.append(result)
        finally:
            ws.close()
        report = {"baseUrl": BASE_URL, "viewport": VIEWPORT, "checked": results}
        report["passed"] = all(not item["horizontalScroll"] and not item["overflow"] and not item["edgeContent"] for item in results)
        print(json.dumps(report, indent=2))
        return 0 if report["passed"] else 1
    finally:
        chrome.terminate()
        try:
            chrome.wait(timeout=5)
        except subprocess.TimeoutExpired:
            chrome.kill()


if __name__ == "__main__":
    sys.exit(main())
