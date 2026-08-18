import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../../../', import.meta.url);
const readProjectFile = async (relativePath: string): Promise<string> => readFile(new URL(relativePath, root), 'utf8');

test('public launch homepage names the MSP report problem, category, boundary and diagnostic CTA', async () => {
  const home = await readProjectFile('web/frontend/src/app/page.tsx');
  assert.match(home, /When a client asks where a QBR figure came from/);
  assert.match(home, /Controlled evidence delivery for MSP client reports/);
  assert.match(home, /without replacing the systems that create your operational data/);
  assert.match(home, /See the proof experience/);
  assert.match(home, /Open a report diagnostic/);
  assert.match(home, /Keep the reporting stack/);
  assert.match(home, /RipoDoc is not a new system of record, generic BI layer, or QBR deck builder/);
});

test('global launch metadata preserves canonical entity and brand signals', async () => {
  const layout = await readProjectFile('web/frontend/src/app/layout.tsx');
  assert.match(layout, /Controlled evidence delivery for MSP client reports/);
  assert.match(layout, /ripodoc-mark\.svg/);
  assert.match(layout, /'@type': 'Organization'/);
  assert.match(layout, /'@type': 'SoftwareApplication'/);
  assert.match(layout, /applicationSubCategory: 'Evidence delivery for MSP client reports'/);
});

test('launch navigation exposes the customer, security, technical and diagnostic paths', async () => {
  const navigation = await readProjectFile('web/frontend/src/components/Navbar.tsx');
  for (const requiredLabel of ['How it works', 'For MSPs', 'Security boundary', 'Self-host', 'Open a report diagnostic']) {
    assert.match(navigation, new RegExp(requiredLabel));
  }
  assert.match(navigation, /href="\/founding-partners"/);
});

test('public deployment applies browser hardening and private-route crawl exclusions', async () => {
  const [config, proxy] = await Promise.all([
    readProjectFile('web/frontend/next.config.ts'),
    readProjectFile('web/frontend/src/proxy.ts'),
  ]);
  for (const header of ['Content-Security-Policy', 'Permissions-Policy', 'Referrer-Policy', 'X-Content-Type-Options', 'X-Frame-Options', 'Cross-Origin-Opener-Policy', 'Cross-Origin-Resource-Policy']) {
    assert.match(config, new RegExp(header));
  }
  assert.match(config, /frame-ancestors 'none'/);
  assert.match(config, /object-src 'none'/);
  assert.match(config, /noindex, nofollow, noarchive, nosnippet/);
  assert.match(config, /'\/dashboard\/:path\*'/);
  assert.match(config, /'\/e\/:path\*'/);
  assert.match(config, /'no-referrer'/);
  assert.match(proxy, /response\.headers\.set\('Content-Security-Policy', CSP\)/);
  assert.match(proxy, /response\.headers\.set\('Referrer-Policy', 'no-referrer'\)/);
  assert.match(proxy, /response\.headers\.set\('X-Permitted-Cross-Domain-Policies', 'none'\)/);
});

test('public launch mark and social preview exist with category-safe language', async () => {
  const [mark, socialPreview] = await Promise.all([
    readProjectFile('web/frontend/public/ripodoc-mark.svg'),
    readProjectFile('web/frontend/src/app/opengraph-image.tsx'),
  ]);
  assert.match(mark, /<svg/);
  assert.match(mark, /RipoDoc proof aperture mark/);
  assert.match(socialPreview, /give them proof—not a data chase/);
  assert.match(socialPreview, /Controlled evidence delivery for MSP client reports/);
});
