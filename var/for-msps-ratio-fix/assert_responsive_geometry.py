#!/usr/bin/env python3
"""Assert that /for-msps has no horizontal scroll or escaped content at representative viewport sizes."""

from __future__ import annotations

import json
import os
import subprocess
import sys
import time
import urllib.request
from pathlib import Path
from typing import Any

import websocket

ROUTE = "http://127.0.0.1:3100/for-msps"
PORT = 9223
PROFILE = "/tmp/ripodoc-for-msps-cdp-profile"
VIEWPORTS = [
    (320, 568, "phone-se-portrait"),
    (390, 844, "phone-modern-portrait"),
    (844, 390, "phone-landscape"),
    (768, 1024, "tablet-portrait"),
    (1024, 768, "tablet-landscape"),
    (1440, 900, "desktop"),
]


def http_json(url: str, method: str = "GET") -> Any:
    request = urllib.request.Request(url, method=method)
    with urllib.request.urlopen(request, timeout=5) as response:
        return json.load(response)


def wait_for_debugger() -> dict[str, Any]:
    deadline = time.monotonic() + 15
    while time.monotonic() < deadline:
        try:
            return http_json(f"http://127.0.0.1:{PORT}/json/version")
        except Exception:
            time.sleep(0.2)
    raise RuntimeError("Chrome DevTools endpoint did not become available")


def command(ws: websocket.WebSocket, message_id: int, method: str, params: dict[str, Any] | None = None) -> Any:
    ws.send(json.dumps({"id": message_id, "method": method, "params": params or {}}))
    while True:
        payload = json.loads(ws.recv())
        if payload.get("id") == message_id:
            if "error" in payload:
                raise RuntimeError(f"{method}: {payload['error']}")
            return payload.get("result", {})


def evaluate_json(ws: websocket.WebSocket, message_id: int) -> dict[str, Any]:
    expression = """
      (() => {
        const viewport = window.innerWidth;
        const candidates = [...document.querySelectorAll('header, main, footer, section, aside, article, h1, h2, h3, p, a, ol, li, button')];
        const offenders = candidates.map((node) => {
          const rect = node.getBoundingClientRect();
          return { tag: node.tagName.toLowerCase(), text: (node.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 72), left: Math.round(rect.left), right: Math.round(rect.right) };
        }).filter((box) => box.right > viewport + 1 || box.left < -1);
        return JSON.stringify({
          viewport,
          documentWidth: document.documentElement.scrollWidth,
          bodyWidth: document.body.scrollWidth,
          horizontalScroll: document.documentElement.scrollWidth > viewport + 1,
          offenders,
        });
      })()
    """
    result = command(ws, message_id, "Runtime.evaluate", {"expression": expression, "returnByValue": True})
    return json.loads(result["result"]["value"])


def main() -> int:
    Path(PROFILE).mkdir(parents=True, exist_ok=True)
    chrome = subprocess.Popen(
        [
            "chromium",
            "--headless",
            "--no-sandbox",
            "--disable-gpu",
            "--hide-scrollbars",
            "--remote-allow-origins=*",
            f"--remote-debugging-port={PORT}",
            f"--user-data-dir={PROFILE}",
            "about:blank",
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    try:
        wait_for_debugger()
        page = http_json(f"http://127.0.0.1:{PORT}/json/new?about:blank", method="PUT")
        ws = websocket.create_connection(page["webSocketDebuggerUrl"], timeout=10, origin="http://localhost")
        try:
            message_id = 1
            results = []
            for width, height, label in VIEWPORTS:
                command(ws, message_id, "Emulation.setDeviceMetricsOverride", {
                    "width": width,
                    "height": height,
                    "deviceScaleFactor": 1,
                    "mobile": False,
                })
                message_id += 1
                command(ws, message_id, "Page.navigate", {"url": ROUTE})
                message_id += 1
                time.sleep(1.2)
                command(ws, message_id, "Runtime.evaluate", {
                    "expression": "localStorage.setItem('ripodoc-cookie-preferences-v1', JSON.stringify({version:1,choice:'rejected',necessary:true,analytics:false,marketing:false,savedAt:new Date().toISOString()}));"
                })
                message_id += 1
                geometry = evaluate_json(ws, message_id)
                message_id += 1
                geometry["label"] = label
                geometry["size"] = f"{width}x{height}"
                results.append(geometry)
        finally:
            ws.close()

        report = {
            "route": ROUTE,
            "checked": results,
            "passed": all(not item["horizontalScroll"] and not item["offenders"] for item in results),
        }
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
