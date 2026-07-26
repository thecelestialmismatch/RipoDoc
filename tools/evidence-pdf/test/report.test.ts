import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseManifest } from '../../../web/frontend/src/lib/evidence/manifest.ts';
import { renderReport } from '../src/render/report.ts';

const FIXTURE = join(import.meta.dirname, '..', 'fixtures', 'demo-report.json');
const raw = JSON.parse(readFileSync(FIXTURE, 'utf8')) as unknown;

const options = {
  evidenceBaseUrl: 'https://ripodoc.com/e/tok123',
  createdAt: new Date('2026-07-02T09:15:00Z'),
  documentId: '0123456789abcdef0123456789abcdef',
  expiresLabel: '2026-07-16',
};

const decode = (bytes: Uint8Array): string => Buffer.from(bytes).toString('latin1');

test('the shipped fixture is a valid manifest', () => {
  const manifest = parseManifest(raw);
  assert.equal(manifest.reportId, 'rpt-demo-0001');
  assert.ok(manifest.elements.length >= 3);
});

test('every element in the report becomes exactly one clickable link', () => {
  const manifest = parseManifest(raw);
  const doc = renderReport(manifest, options);
  assert.equal(doc.linkCount, manifest.elements.length);
});

test('each element id appears in a link URI exactly once', () => {
  const manifest = parseManifest(raw);
  const output = decode(renderReport(manifest, options).toBytes());
  for (const element of manifest.elements) {
    const uri = `${options.evidenceBaseUrl}/${element.id}`;
    const occurrences = output.split(`/URI (${uri})`).length - 1;
    assert.equal(occurrences, 1, `expected one link for ${element.id}, found ${occurrences}`);
  }
});

test('link rectangles stay inside the page', () => {
  const manifest = parseManifest(raw);
  const output = decode(renderReport(manifest, options).toBytes());
  const rects = [...output.matchAll(/\/Rect \[([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)\]/g)];
  assert.equal(rects.length, manifest.elements.length);
  for (const [, x0, y0, x1, y1] of rects) {
    const left = Number(x0);
    const bottom = Number(y0);
    const right = Number(x1);
    const top = Number(y1);
    assert.ok(right > left && top > bottom, 'rect must have positive area');
    assert.ok(left >= 0 && bottom >= 0, 'rect must not start off-page');
    assert.ok(right <= 595.276 && top <= 841.89, 'rect must not extend past the page');
  }
});

test('the evidence rows themselves are never embedded in the PDF', () => {
  const manifest = parseManifest(raw);
  const output = decode(renderReport(manifest, options).toBytes());
  // A ticket id from an evidence table must stay behind the recipient-bound
  // page — putting it in the PDF would defeat scoped disclosure.
  assert.ok(!output.includes('NG-40118'), 'evidence rows leaked into the PDF');
  assert.ok(!output.includes('HV-WKS-014'), 'evidence rows leaked into the PDF');
});

test('the PDF carries no embedded JavaScript', () => {
  const manifest = parseManifest(raw);
  const output = decode(renderReport(manifest, options).toBytes());
  assert.ok(!output.includes('/JavaScript'), 'PDF JS is Acrobat-only and must not be used');
  assert.ok(!output.includes('/OpenAction'));
  assert.ok(!output.includes('javascript:'));
});

test('a non-https base URL is refused', () => {
  const manifest = parseManifest(raw);
  assert.throws(
    () => renderReport(manifest, { ...options, evidenceBaseUrl: 'http://ripodoc.com/e/t' }),
    /must be https/,
  );
});

test('loopback http is accepted only with the explicit opt-in', () => {
  const manifest = parseManifest(raw);
  const local = { ...options, evidenceBaseUrl: 'http://localhost:3000/e/t' };
  assert.throws(() => renderReport(manifest, local), /must be https/);
  const doc = renderReport(manifest, { ...local, allowLoopbackHttp: true });
  assert.equal(doc.linkCount, manifest.elements.length);
});

test('element ids are percent-encoded into the URL', () => {
  const manifest = parseManifest({
    ...(raw as Record<string, unknown>),
    elements: [(raw as { elements: unknown[] }).elements[0]],
  });
  const output = decode(renderReport(manifest, options).toBytes());
  assert.ok(output.includes('/URI (https://ripodoc.com/e/tok123/tickets-resolved)'));
});
