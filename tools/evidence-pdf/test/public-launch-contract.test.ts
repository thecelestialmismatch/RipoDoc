import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../../../', import.meta.url);
const readProjectFile = async (relativePath: string): Promise<string> => readFile(new URL(relativePath, root), 'utf8');

test('public launch homepage names the MSP report problem, clarity-first category, boundary and diagnostic CTA', async () => {
  const home = await readProjectFile('web/frontend/src/app/page.tsx');
  assert.match(home, /Make every report claim/);
  assert.match(home, /RipoDoc lets MSPs give clients the exact approved evidence/);
  assert.match(home, /without sending a broader export or another portal login/);
  assert.match(home, /See a live example/);
  assert.match(home, /Open a report diagnostic/);
  assert.match(home, /Keep the tools that build your report/);
  assert.match(home, /It does not ask you to replace the PSA, RMM, BI, QBR, documentation, or portal systems/);
  assert.match(home, /The public site never asks you to upload a client report/);
});

test('global launch metadata preserves canonical entity and brand signals', async () => {
  const layout = await readProjectFile('web/frontend/src/app/layout.tsx');
  assert.match(layout, /Controlled evidence delivery for MSP client reports/);
  assert.match(layout, /ripodoc-mark\.png/);
  assert.match(layout, /'@type': 'Organization'/);
  assert.match(layout, /'@type': 'SoftwareApplication'/);
  assert.match(layout, /applicationSubCategory: 'Evidence delivery for MSP client reports'/);
});

test('launch navigation exposes the customer, security, technical and diagnostic paths', async () => {
  const navigation = await readProjectFile('web/frontend/src/components/Navbar.tsx');
  for (const requiredLabel of ['How it works', 'For MSPs', 'Security', 'Self-host', 'Open a report diagnostic']) {
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

test('public repository excludes private operating material and protects the exclusions', async () => {
  const [readme, ignore] = await Promise.all([
    readProjectFile('README.md'),
    readProjectFile('.gitignore'),
  ]);
  for (const ignoredPath of ['/docs/00-strategy/', '/docs/01-research/', '/docs/06-legal/', '/var/', '/IDEA.md']) {
    assert.match(ignore, new RegExp(ignoredPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.doesNotMatch(readme, /docs\/(00-strategy|01-research|06-legal)\//);
  await Promise.all([
    assert.rejects(access(new URL('docs/00-strategy', root))),
    assert.rejects(access(new URL('docs/01-research', root))),
    assert.rejects(access(new URL('docs/06-legal', root))),
    assert.rejects(access(new URL('var', root))),
    assert.rejects(access(new URL('IDEA.md', root))),
  ]);
});

test('public launch mark and social preview exist with category-safe language', async () => {
  const socialPreview = await readProjectFile('web/frontend/src/app/opengraph-image.tsx');
  await assert.doesNotReject(access(new URL('web/frontend/public/ripodoc-mark.png', root)));
  assert.match(socialPreview, /give them proof—not a data chase/);
  assert.match(socialPreview, /Controlled evidence delivery for MSP client reports/);
});
