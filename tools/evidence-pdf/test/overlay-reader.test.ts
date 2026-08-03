import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deflateSync } from 'node:zlib';
import { Lexer, asName, asNumber, dictGet, parseValue, spanBytes } from '../src/overlay/objects.ts';
import { decodeStream, undoPredictor, UnsupportedFilterError } from '../src/overlay/filters.ts';
import { EncryptedPdfError, PdfReader } from '../src/overlay/reader.ts';
import {
  annotatedPdf,
  brokenXrefPdf,
  classicPdf,
  croppedPdf,
  encryptedPdf,
  objectStreamPdf,
  prefixedPdf,
  rotatedPdf,
} from './helpers/pdf-fixtures.ts';

test('a reference is only a reference when all three tokens are present', () => {
  const asRef = parseValue(Buffer.from('12 0 R', 'latin1'));
  assert.equal(asRef.kind, 'ref');
  if (asRef.kind === 'ref') assert.equal(asRef.num, 12);

  const asNum = parseValue(Buffer.from('12 0', 'latin1'));
  assert.equal(asNum.kind, 'num');
  if (asNum.kind === 'num') assert.equal(asNum.value, 12);
});

test('names decode #XX escapes', () => {
  const value = parseValue(Buffer.from('/A#20Name', 'latin1'));
  assert.equal(asName(value), 'A Name');
});

test('literal strings honour nesting, escapes and octal', () => {
  const value = parseValue(Buffer.from(String.raw`(a (nested) b \) c \101 \n)`, 'latin1'));
  assert.equal(value.kind, 'str');
  if (value.kind === 'str') {
    assert.equal(value.bytes.toString('latin1'), 'a (nested) b ) c A \n');
  }
});

test('comments are skipped between tokens', () => {
  const value = parseValue(Buffer.from('<< % a comment\n/Size 6 >>', 'latin1'));
  assert.equal(asNumber(dictGet(value, 'Size')), 6);
});

test('every value records the bytes it came from', () => {
  const source = Buffer.from('<< /Key [1 2 3] >>', 'latin1');
  const value = parseValue(source);
  const key = dictGet(value, 'Key');
  assert.ok(key);
  assert.equal(spanBytes(source, key), '[1 2 3]');
});

test('parsing refuses to recurse without bound', () => {
  const deep = Buffer.from('['.repeat(200), 'latin1');
  assert.throws(() => new Lexer(deep).parseObject(), /too deep|Unterminated/);
});

test('a truncated dictionary raises rather than looping', () => {
  assert.throws(() => parseValue(Buffer.from('<< /A 1 ', 'latin1')), /Unterminated/);
});

test('flate streams decode, with and without a PNG predictor', () => {
  const payload = Buffer.from('hello evidence', 'latin1');
  const plain = parseValue(Buffer.from('<< /Filter /FlateDecode >>', 'latin1'));
  assert.equal(decodeStream(plain, deflateSync(payload)).toString('latin1'), 'hello evidence');

  // Two rows of four bytes, `Up` predicted.
  const rows = [Buffer.from([1, 2, 3, 4]), Buffer.from([2, 4, 6, 8])];
  const encoded = Buffer.from([2, 1, 2, 3, 4, 2, 1, 2, 3, 4]);
  const decoded = undoPredictor(encoded, {
    predictor: 12,
    colors: 1,
    bitsPerComponent: 8,
    columns: 4,
  });
  assert.deepEqual([...decoded], [...rows[0]!, ...rows[1]!]);
});

test('an image filter is refused rather than half-decoded', () => {
  const dict = parseValue(Buffer.from('<< /Filter /DCTDecode >>', 'latin1'));
  assert.throws(() => decodeStream(dict, Buffer.alloc(4)), UnsupportedFilterError);
});

test('a classic cross-reference table is read', () => {
  const reader = PdfReader.open(classicPdf());
  assert.equal(reader.xrefStyle, 'table');
  assert.equal(reader.pages.length, 1);
  assert.equal(reader.recovered, false);
  assert.deepEqual(reader.pages[0]?.mediaBox, { llx: 0, lly: 0, urx: 200, ury: 100 });
});

test('a cross-reference stream with object streams is read', () => {
  const reader = PdfReader.open(objectStreamPdf());
  assert.equal(reader.xrefStyle, 'stream');
  assert.equal(reader.pages.length, 1);
  // The page dictionary lives inside a compressed object stream.
  assert.equal(asName(reader.resolve(reader.pages[0]?.dict.map.get('Type'))), 'Page');
});

test('a cross-reference stream without a predictor is read too', () => {
  const reader = PdfReader.open(objectStreamPdf({ predictor: false }));
  assert.equal(reader.pages.length, 1);
});

test('page rotation and crop box are resolved', () => {
  const reader = PdfReader.open(rotatedPdf(90));
  assert.equal(reader.pages[0]?.rotate, 90);

  const negative = PdfReader.open(rotatedPdf(-90));
  assert.equal(negative.pages[0]?.rotate, 270, 'rotation is normalised into 0..359');

  const cropped = PdfReader.open(croppedPdf());
  assert.deepEqual(cropped.pages[0]?.cropBox, { llx: 20, lly: 10, urx: 180, ury: 90 });
});

test('bytes before the header do not shift every object', () => {
  const reader = PdfReader.open(prefixedPdf());
  assert.ok(reader.headerOffset > 0);
  assert.equal(reader.pages.length, 1);
});

test('a file whose index is wrong is rebuilt by scanning', () => {
  const reader = PdfReader.open(brokenXrefPdf());
  assert.equal(reader.pages.length, 1, 'a viewer opens this file, so RipoDoc must too');
});

test('an encrypted PDF is refused, not silently stripped', () => {
  assert.throws(() => PdfReader.open(encryptedPdf()), EncryptedPdfError);
});

test('existing annotations are visible to the reader', () => {
  const reader = PdfReader.open(annotatedPdf());
  const annots = reader.resolve(reader.pages[0]?.dict.map.get('Annots'));
  assert.equal(annots?.kind, 'array');
  if (annots?.kind === 'array') assert.equal(annots.items.length, 1);
});

test('a file that is not a PDF is rejected', () => {
  assert.throws(() => PdfReader.open(Buffer.from('just some text', 'latin1')), /Not a PDF/);
});
