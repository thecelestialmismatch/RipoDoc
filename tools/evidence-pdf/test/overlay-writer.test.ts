import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PdfReader } from '../src/overlay/reader.ts';
import {
  appendLinkAnnotations,
  assertPrefixPreserved,
  type LinkAnnotation,
} from '../src/overlay/writer.ts';
import { readEvidenceLinks } from '../src/overlay/plan.ts';
import {
  annotatedPdf,
  classicPdf,
  exoticKeysPdf,
  objectStreamPdf,
  prefixedPdf,
  rotatedPdf,
} from './helpers/pdf-fixtures.ts';

const LINK = 'https://ripodoc.com/e/token/assets-at-risk';

const overlay = (
  bytes: Buffer,
  links: readonly LinkAnnotation[] = [{ pageIndex: 0, rect: [10, 10, 60, 30], uri: LINK }],
): { input: Buffer; output: Buffer } => {
  const reader = PdfReader.open(bytes);
  return { input: bytes, output: appendLinkAnnotations(reader, links).bytes };
};

test('the customer document is a byte-for-byte prefix of the output', () => {
  for (const fixture of [classicPdf(), objectStreamPdf(), rotatedPdf(90), prefixedPdf()]) {
    const { input, output } = overlay(fixture);
    assert.ok(output.length > input.length);
    assert.equal(
      Buffer.compare(output.subarray(0, input.length), input),
      0,
      'RipoDoc appends to a customer PDF, it never rewrites one',
    );
  }
});

test('the prefix check actually fires when a byte changes', () => {
  const original = classicPdf();
  const tampered = Buffer.concat([original, Buffer.from('x')]);
  tampered[10] = (tampered[10] ?? 0) ^ 0xff;
  assert.throws(() => assertPrefixPreserved(original, tampered), /never rewrites/);
  assert.throws(
    () => assertPrefixPreserved(original, original.subarray(0, 10)),
    /shorter than the original/,
  );
});

test('a link added to a plain file is readable back from the finished bytes', () => {
  const { output } = overlay(classicPdf());
  const links = readEvidenceLinks(output);
  assert.equal(links.length, 1);
  assert.equal(links[0]?.uri, LINK);
  assert.equal(links[0]?.page, 1);
  assert.deepEqual(links[0]?.rect, [10, 10, 60, 30]);
});

test('a page compressed inside an object stream can still be given a link', () => {
  const { output } = overlay(objectStreamPdf());
  const links = readEvidenceLinks(output);
  assert.equal(links.length, 1, 'the rewritten page overrides the compressed original');
  assert.equal(links[0]?.uri, LINK);
});

test('an existing annotation survives; the new one is appended to it', () => {
  const { output } = overlay(annotatedPdf());
  const links = readEvidenceLinks(output);
  assert.equal(links.length, 2);
  assert.deepEqual(
    links.map((link) => link.uri),
    ['https://example.test/existing', LINK],
    'the report author’s own links must not be dropped',
  );
});

test('an update matches the cross-reference form the file already uses', () => {
  const table = PdfReader.open(classicPdf());
  const tableOut = appendLinkAnnotations(table, [
    { pageIndex: 0, rect: [1, 1, 2, 2], uri: LINK },
  ]);
  assert.equal(tableOut.xrefStyle, 'table');
  assert.match(tableOut.bytes.subarray(table.bytes.length).toString('latin1'), /\nxref\n/);

  const stream = PdfReader.open(objectStreamPdf());
  const streamOut = appendLinkAnnotations(stream, [
    { pageIndex: 0, rect: [1, 1, 2, 2], uri: LINK },
  ]);
  assert.equal(streamOut.xrefStyle, 'stream');
  const appended = streamOut.bytes.subarray(stream.bytes.length).toString('latin1');
  assert.match(appended, /\/Type \/XRef/);
  assert.doesNotMatch(appended, /\nxref\n/, 'a classic table after an xref stream is a hybrid');
});

test('producer-specific page keys are copied back verbatim', () => {
  const input = exoticKeysPdf();
  const { output } = overlay(input);
  const appended = output.subarray(input.length).toString('latin1');
  assert.match(appended, /\/StructParents 0/);
  assert.match(appended, /\/Group << \/S \/Transparency \/CS \/DeviceRGB >>/);
  assert.match(
    appended,
    /\/Producer#20Note \(kept \(verbatim\) \\\) here\)/,
    'a re-serialised string would change a document we promised not to change',
  );
  assert.equal(readEvidenceLinks(output).length, 1);
});

test('only https reaches a client inbox', () => {
  const reader = PdfReader.open(classicPdf());
  for (const uri of [
    'http://ripodoc.com/e/t/x',
    'javascript:alert(1)',
    'file:///etc/passwd',
    'data:text/html,<script>',
  ]) {
    assert.throws(
      () => appendLinkAnnotations(reader, [{ pageIndex: 0, rect: [1, 1, 2, 2], uri }]),
      /must be https/,
      `${uri} must be refused`,
    );
  }
});

test('loopback http is permitted only behind an explicit opt-in', () => {
  const reader = PdfReader.open(classicPdf());
  const link: LinkAnnotation = {
    pageIndex: 0,
    rect: [1, 1, 2, 2],
    uri: 'http://localhost:3000/e/t/x',
  };
  assert.throws(() => appendLinkAnnotations(reader, [link]), /must be https/);
  assert.equal(
    appendLinkAnnotations(reader, [link], { allowLoopbackHttp: true }).addedAnnotations,
    1,
  );
});

test('the overlay introduces no executable PDF constructs', () => {
  const { input, output } = overlay(classicPdf());
  const appended = output.subarray(input.length).toString('latin1');
  for (const forbidden of ['/JavaScript', '/JS', '/OpenAction', '/Launch', '/EmbeddedFile']) {
    assert.ok(!appended.includes(forbidden), `appended region must not contain ${forbidden}`);
  }
});

test('a zone with no area, or off the end of the document, is refused', () => {
  const reader = PdfReader.open(classicPdf());
  assert.throws(
    () => appendLinkAnnotations(reader, [{ pageIndex: 0, rect: [10, 10, 10, 30], uri: LINK }]),
    /positive area/,
  );
  assert.throws(
    () => appendLinkAnnotations(reader, [{ pageIndex: 4, rect: [1, 1, 2, 2], uri: LINK }]),
    /but the PDF has 1 page/,
  );
  assert.throws(() => appendLinkAnnotations(reader, []), /No evidence links/);
});

test('several links on one page produce one rewritten page object', () => {
  const reader = PdfReader.open(classicPdf());
  const result = appendLinkAnnotations(reader, [
    { pageIndex: 0, rect: [1, 1, 20, 20], uri: `${LINK}-a` },
    { pageIndex: 0, rect: [30, 1, 50, 20], uri: `${LINK}-b` },
    { pageIndex: 0, rect: [60, 1, 80, 20], uri: `${LINK}-c` },
  ]);
  assert.equal(result.addedAnnotations, 3);
  assert.equal(result.updatedPageObjects.length, 1);
  assert.equal(readEvidenceLinks(result.bytes).length, 3);
});

test('the updated file declares a new document identifier', () => {
  const input = classicPdf();
  const { output } = overlay(input);
  const appended = output.subarray(input.length).toString('latin1');
  assert.match(appended, /\/ID \[<[0-9a-f]{32}> <[0-9a-f]{32}>\]/);
  assert.match(appended, /\/Prev \d+/, 'the update must chain to the original index');
});

test('an overlaid file can be overlaid again', () => {
  const first = overlay(classicPdf());
  const second = overlay(first.output, [
    { pageIndex: 0, rect: [70, 10, 90, 30], uri: `${LINK}-second` },
  ]);
  const links = readEvidenceLinks(second.output);
  assert.equal(links.length, 2, 'a second revision must not lose the first revision’s links');
});
