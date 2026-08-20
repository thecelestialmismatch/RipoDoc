import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { spawn, type ChildProcess } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type Page } from 'playwright-core';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const port = 3217;
const origin = `http://localhost:${port}`;
let server: ChildProcess | undefined;
let browser: Browser | undefined;

const waitForLocalServer = async () => {
  const deadline = Date.now() + 45_000;
  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${origin}/monte-carlo-scenario-lab`);
      if (response.ok) return;
    } catch (error) { lastError = error; }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));
  }
  throw new Error(`Local E2E server did not become ready: ${String(lastError)}`);
};

const withPage = async <T>(run: (page: Page) => Promise<T>) => {
  assert.ok(browser, 'Chromium must be initialized before a browser test runs');
  const page = await browser.newPage();
  try { return await run(page); } finally { await page.close(); }
};

const fixturePdf = (text: string) => {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(`BT /F1 12 Tf 48 720 Td (${text.replace(/[()\\]/g, '\\$&')}) Tj ET`, 'ascii')} >>\nstream\nBT /F1 12 Tf 48 720 Td (${text.replace(/[()\\]/g, '\\$&')}) Tj ET\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let body = '%PDF-1.4\n';
  const offsets: number[] = [0];
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(body, 'ascii')); body += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = Buffer.byteLength(body, 'ascii');
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(body, 'ascii');
};

before(async () => {
  server = spawn('npm', ['--prefix', 'web/frontend', 'run', 'dev', '--', '--port', String(port)], {
    cwd: repoRoot,
    env: { ...process.env, RIPODOC_E2E_TEST_MODE: 'true', NEXT_PUBLIC_RIPODOC_WEB_VITALS_ENABLED: 'false' },
    stdio: 'ignore',
    detached: true,
  });
  await waitForLocalServer();
  browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
}, { timeout: 60_000 });

after(async () => {
  await browser?.close();
  if (server?.pid) {
    try { process.kill(-server.pid, 'SIGTERM'); } catch { /* The local test server already exited. */ }
  }
});

test('custom stress profile changes the selected Run A fixture calculation locally', { timeout: 30_000 }, async () => {
  await withPage(async (page) => {
    await page.goto(`${origin}/monte-carlo-scenario-lab`, { waitUntil: 'domcontentloaded' });
    const p50 = page.locator('.scenario-result-rail > div').first().locator('b');
    const baseline = await p50.textContent();
    await page.selectOption('#scenario-a-stress', 'custom');
    await page.locator('#custom-profile-name').fill('E2E hardened local stress');
    await page.locator('#custom-profile-trend-shock').focus();
    for (let index = 0; index < 15; index += 1) await page.keyboard.press('ArrowLeft');
    await page.locator('#custom-profile-volatility').focus();
    for (let index = 0; index < 15; index += 1) await page.keyboard.press('ArrowRight');
    await page.locator('#custom-profile-notes').fill('Automated local-only browser test profile.');
    await page.waitForFunction("previous => document.querySelector('.scenario-result-rail > div b')?.textContent !== previous", baseline);
    assert.equal(await page.locator('#scenario-a-stress').inputValue(), 'custom');
    assert.match(await page.locator('.scenario-custom-profile').textContent() ?? '', /0\.65× trend and 2\.25× volatility/);
    assert.match(await page.locator('.scenario-chart').first().textContent() ?? '', /CUSTOM LOCAL/);
    assert.notEqual(await p50.textContent(), baseline);
  });
});

test('Scenario Lab generates a browser PDF report without a navigation or network submission', { timeout: 30_000 }, async () => {
  await withPage(async (page) => {
    const unsafeRequests: string[] = [];
    page.on('request', (request) => {
      const url = request.url();
      if (!url.startsWith(origin) || url.includes('/api/')) unsafeRequests.push(`${request.method()} ${url}`);
    });
    await page.goto(`${origin}/monte-carlo-scenario-lab`, { waitUntil: 'domcontentloaded' });
    const downloadPromise = page.waitForEvent('download');
    await page.click('#scenario-pdf-export');
    const download = await downloadPromise;
    const pdfPath = await download.path();
    assert.equal(download.suggestedFilename(), 'ripodoc-multi-scenario-comparison.pdf');
    assert.ok(pdfPath, 'The browser must materialize a local PDF download');
    const bytes = await readFile(pdfPath!);
    assert.equal(bytes.subarray(0, 5).toString('ascii'), '%PDF-');
    await page.getByText('PDF report downloaded from this browser. No scenario data was sent or stored.').waitFor();
    assert.deepEqual(unsafeRequests, []);
  });
});

test('Evidence Composer processes a local PDF with zero off-origin/API egress and no browser persistence', { timeout: 30_000 }, async () => {
  await withPage(async (page) => {
    const unsafeRequests: string[] = [];
    page.on('request', (request) => {
      const url = request.url();
      if (!url.startsWith(origin) || url.includes('/api/')) unsafeRequests.push(`${request.method()} ${url}`);
    });
    await page.goto(`${origin}/e2e-composer-harness`, { waitUntil: 'domcontentloaded' });
    await page.locator('#local-evidence-pdf').setInputFiles({ name: 'local-questionnaire.pdf', mimeType: 'application/pdf', buffer: fixturePdf('1. Do you have an approved incident response process?') });
    await page.getByText(/candidate questions found and matched against/i).waitFor();
    await page.getByText('Build local drafts').click();
    await page.getByRole('heading', { name: 'Do you have an approved incident response process?' }).waitFor();
    const storage = await page.evaluate('({ local: localStorage.length, session: sessionStorage.length })');
    assert.deepEqual(storage, { local: 0, session: 0 });
    assert.deepEqual(unsafeRequests, []);
  });
});
