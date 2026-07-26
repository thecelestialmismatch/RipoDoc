import { test } from 'node:test';
import assert from 'node:assert/strict';
import { A4_PORTRAIT, PdfDocument } from '../src/pdf/document.ts';
import { escapeLiteral, formatNumber, name, serialize, textString } from '../src/pdf/primitives.ts';
import { textWidth, truncateToWidth, wrapText } from '../src/pdf/metrics.ts';

const DOC_ID = '0123456789abcdef0123456789abcdef';
const baseOptions = {
  title: 'Test',
  author: 'RipoDoc',
  createdAt: new Date('2026-07-02T09:15:00Z'),
  documentId: DOC_ID,
};

const decode = (bytes: Uint8Array): string => Buffer.from(bytes).toString('latin1');

test('numbers never serialise in exponent form', () => {
  assert.equal(formatNumber(0.0000001), '0');
  assert.equal(formatNumber(-0), '0');
  assert.equal(formatNumber(12), '12');
  assert.equal(formatNumber(12.5), '12.5');
  assert.equal(formatNumber(1 / 3), '0.3333');
});

test('literal strings escape the characters that would terminate them', () => {
  assert.equal(escapeLiteral('a(b)c\\d'), 'a\\(b\\)c\\\\d');
});

test('a client name containing parentheses cannot inject PDF syntax', () => {
  const hostile = 'Acme ) >> /Type /Action /S /JavaScript (';
  const output = serialize({ kind: 'string', value: hostile });
  assert.equal(output.startsWith('('), true);
  assert.equal(output.endsWith(')'), true);
  assert.ok(!/[^\\]\)/.test(output.slice(1, -1)), 'no unescaped closing parenthesis');
});

test('metadata strings with non-ASCII use UTF-16BE with a BOM', () => {
  const value = textString('Quarterly Review — Client');
  const output = serialize(value);
  assert.ok(output.startsWith('<feff'), `expected a BOM-prefixed hex string, got ${output}`);
  const decoded = Buffer.from(output.slice(1, -1), 'hex').subarray(2).toString('utf16le');
  // The hex is big-endian; swap to compare.
  const swapped = Buffer.from(output.slice(1, -1), 'hex').subarray(2).swap16().toString('utf16le');
  assert.equal(swapped, 'Quarterly Review — Client');
  assert.notEqual(decoded, '');
});

test('pure-ASCII metadata stays a literal string so files remain greppable', () => {
  assert.equal(serialize(textString('Plain Title')), '(Plain Title)');
});

test('unsafe PDF names are rejected', () => {
  assert.throws(() => name('bad name'), /Unsafe PDF name/);
});

test('text measurement matches known Helvetica advances', () => {
  // 'ABC' = 667 + 667 + 722 = 2056/1000 em.
  assert.equal(Math.round(textWidth('ABC', 'Helvetica', 1000)), 2056);
  assert.ok(textWidth('WWW', 'Helvetica-Bold', 10) > textWidth('iii', 'Helvetica-Bold', 10));
});

test('truncation never exceeds the budget', () => {
  const result = truncateToWidth('A very long client organisation name', 'Helvetica', 10, 60);
  assert.ok(textWidth(result, 'Helvetica', 10) <= 60);
  assert.ok(result.endsWith('...'));
});

test('wrapping respects the line cap and truncates the last line', () => {
  const lines = wrapText('one two three four five six seven eight', 'Helvetica', 10, 50, 2);
  assert.equal(lines.length, 2);
  for (const line of lines) assert.ok(textWidth(line, 'Helvetica', 10) <= 50);
});

test('a link annotation is emitted with an https URI and no visible border', () => {
  const doc = new PdfDocument(baseOptions);
  const page = doc.addPage();
  page.link({ x: 10, y: 20, width: 100, height: 40 }, 'https://ripodoc.com/e/tok/element-a');

  const output = decode(doc.toBytes());
  assert.equal(doc.linkCount, 1);
  assert.match(output, /\/Subtype \/Link/);
  assert.match(output, /\/Border \[0 0 0\]/);
  assert.match(output, /\/S \/URI/);
  assert.match(output, /\/URI \(https:\/\/ripodoc\.com\/e\/tok\/element-a\)/);
  assert.match(output, /\/Annots \[\d+ 0 R\]/);
});

test('link rectangles are converted to bottom-left origin user space', () => {
  const doc = new PdfDocument(baseOptions);
  const page = doc.addPage();
  page.link({ x: 10, y: 20, width: 100, height: 40 }, 'https://ripodoc.com/e/tok/a');

  const output = decode(doc.toBytes());
  const bottom = A4_PORTRAIT.height - 60;
  const top = A4_PORTRAIT.height - 20;
  assert.ok(
    output.includes(`/Rect [10 ${bottom} 110 ${top}]`),
    `expected converted rect, got:\n${output.match(/\/Rect \[[^\]]*\]/)?.[0]}`,
  );
});

test('non-https links are refused', () => {
  const doc = new PdfDocument(baseOptions);
  const page = doc.addPage();
  for (const uri of ['http://ripodoc.com/e/a', 'javascript:alert(1)', 'file:///etc/passwd']) {
    assert.throws(
      () => page.link({ x: 0, y: 0, width: 10, height: 10 }, uri),
      /must be https|Invalid URL/,
      `expected refusal for ${uri}`,
    );
  }
});

test('loopback http is allowed only when explicitly opted in', () => {
  const doc = new PdfDocument(baseOptions);
  const page = doc.addPage();
  assert.throws(() =>
    page.link({ x: 0, y: 0, width: 10, height: 10 }, 'http://localhost:3000/e/a'),
  );
  page.link({ x: 0, y: 0, width: 10, height: 10 }, 'http://localhost:3000/e/a', {
    allowLoopbackHttp: true,
  });
  assert.equal(doc.linkCount, 1);
  // The opt-in must not extend to non-loopback hosts.
  assert.throws(
    () =>
      page.link({ x: 0, y: 0, width: 10, height: 10 }, 'http://evil.example/e/a', {
        allowLoopbackHttp: true,
      }),
    /must be https/,
  );
});

test('zero-area link annotations are refused', () => {
  const doc = new PdfDocument(baseOptions);
  const page = doc.addPage();
  assert.throws(
    () => page.link({ x: 0, y: 0, width: 0, height: 10 }, 'https://ripodoc.com/e/a'),
    /positive area/,
  );
});

test('the document is structurally complete and reproducible', () => {
  const build = (): string => {
    const doc = new PdfDocument(baseOptions);
    const page = doc.addPage();
    page.text('Hello', { x: 10, y: 10 });
    page.link({ x: 1, y: 1, width: 5, height: 5 }, 'https://ripodoc.com/e/a');
    return decode(doc.toBytes());
  };

  const output = build();
  assert.ok(output.startsWith('%PDF-1.7\n'));
  assert.ok(output.trimEnd().endsWith('%%EOF'));
  assert.match(output, /\nxref\n0 \d+\n0000000000 65535 f \n/);
  assert.match(output, /\/Root \d+ 0 R/);
  assert.match(output, /startxref\n\d+\n/);
  assert.equal(build(), output, 'identical input must produce identical bytes');
});

test('xref offsets point at the real object headers', () => {
  const doc = new PdfDocument(baseOptions);
  const page = doc.addPage();
  page.text('Anchor', { x: 10, y: 10 });
  const bytes = doc.toBytes();
  const output = decode(bytes);

  const xrefStart = Number(output.match(/startxref\n(\d+)/)?.[1]);
  const table = output.slice(xrefStart);
  const entries = [...table.matchAll(/^(\d{10}) 00000 n $/gm)].map((match) => Number(match[1]));
  assert.ok(entries.length > 0);
  entries.forEach((offset, index) => {
    assert.match(
      output.slice(offset, offset + 12),
      new RegExp(`^${index + 1} 0 obj`),
      `object ${index + 1} offset mismatch`,
    );
  });
});

test('a document with no pages cannot be serialised', () => {
  assert.throws(() => new PdfDocument(baseOptions).toBytes(), /no pages/);
});

test('a bad document id is refused', () => {
  assert.throws(
    () => new PdfDocument({ ...baseOptions, documentId: 'nothex' }),
    /32 lowercase hex/,
  );
});
