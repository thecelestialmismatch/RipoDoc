/**
 * Reading a customer's PDF: cross-reference resolution and the page tree.
 *
 * Three things make this harder than the spec's happy path, and all three occur
 * in ordinary files an MSP would hand us:
 *
 *  1. **Cross-reference streams** (PDF 1.5+). Word, Chrome and qpdf all emit
 *     them. A reader that only understands the classic `xref` table sees a
 *     modern file as empty.
 *  2. **Object streams.** Page dictionaries are routinely compressed inside
 *     another object, so "seek to the offset and parse" finds nothing.
 *  3. **Wrong offsets.** Files edited by careless tools have cross-reference
 *     tables that no longer match the bytes. Viewers silently rebuild the index
 *     by scanning; so does this reader, rather than failing on a file the
 *     customer can plainly open.
 *
 * Nothing here mutates the input buffer. The overlay writer only ever appends.
 */

import {
  asName,
  asNumber,
  dictGet,
  isDictLike,
  Lexer,
  type DictLike,
  type PdfObject,
} from './objects.ts';
import { decodeStream } from './filters.ts';

export interface XrefInUse {
  readonly type: 1;
  readonly offset: number;
  readonly gen: number;
}
export interface XrefCompressed {
  readonly type: 2;
  readonly stream: number;
  readonly index: number;
}
export type XrefEntry = XrefInUse | XrefCompressed;

export interface LoadedObject {
  readonly object: PdfObject;
  /** The buffer `object`'s spans index into — the file, or a decoded stream. */
  readonly src: Buffer;
  readonly num: number;
  readonly gen: number;
}

/** `[llx, lly, urx, ury]` in PDF user space, normalised so lower < upper. */
export interface PdfRect {
  readonly llx: number;
  readonly lly: number;
  readonly urx: number;
  readonly ury: number;
}

export interface PdfPage {
  /** 0-based position in the document. */
  readonly index: number;
  readonly num: number;
  readonly gen: number;
  readonly dict: DictLike;
  readonly src: Buffer;
  readonly mediaBox: PdfRect;
  /** The visible box — `/CropBox` when present, else `/MediaBox`. */
  readonly cropBox: PdfRect;
  /** Normalised to 0, 90, 180 or 270. */
  readonly rotate: number;
  readonly resources: PdfObject | undefined;
  readonly contents: PdfObject | undefined;
}

const DEFAULT_BOX: PdfRect = { llx: 0, lly: 0, urx: 612, ury: 792 };

const normaliseRect = (values: readonly number[]): PdfRect => ({
  llx: Math.min(values[0] ?? 0, values[2] ?? 0),
  lly: Math.min(values[1] ?? 0, values[3] ?? 0),
  urx: Math.max(values[0] ?? 0, values[2] ?? 0),
  ury: Math.max(values[1] ?? 0, values[3] ?? 0),
});

export class EncryptedPdfError extends Error {
  constructor() {
    super(
      'This PDF is encrypted. RipoDoc will not add evidence links to an encrypted file: ' +
        're-saving it would silently strip the protection the customer applied.',
    );
    this.name = 'EncryptedPdfError';
  }
}

const MAX_XREF_SECTIONS = 64;
const MAX_PAGE_TREE_NODES = 20_000;

export class PdfReader {
  readonly bytes: Buffer;
  /** Offset of `%PDF-` — nonzero when a file carries a junk prefix. */
  readonly headerOffset: number;
  readonly xref: ReadonlyMap<number, XrefEntry>;
  readonly trailer: DictLike;
  /** Byte offset of the newest cross-reference section. */
  readonly startXref: number;
  /** Which form the newest section took; an update must match it. */
  readonly xrefStyle: 'table' | 'stream';
  readonly recovered: boolean;

  private readonly cache = new Map<number, LoadedObject | undefined>();
  private readonly objectStreamCache = new Map<number, Map<number, number> | undefined>();
  private readonly objectStreamData = new Map<number, Buffer>();
  private readonly scanned: ReadonlyMap<number, number>;
  private pageCache: readonly PdfPage[] | undefined;

  private constructor(input: {
    bytes: Buffer;
    headerOffset: number;
    xref: Map<number, XrefEntry>;
    trailer: DictLike;
    startXref: number;
    xrefStyle: 'table' | 'stream';
    recovered: boolean;
    scanned: ReadonlyMap<number, number>;
  }) {
    this.bytes = input.bytes;
    this.headerOffset = input.headerOffset;
    this.xref = input.xref;
    this.trailer = input.trailer;
    this.startXref = input.startXref;
    this.xrefStyle = input.xrefStyle;
    this.recovered = input.recovered;
    this.scanned = input.scanned;
  }

  static open(bytes: Buffer): PdfReader {
    const headerOffset = bytes.indexOf('%PDF-', 0, 'latin1');
    if (headerOffset < 0) throw new Error('Not a PDF: no %PDF- header found');

    let parsed: ParsedXref | undefined;
    try {
      parsed = parseXrefChain(bytes, headerOffset);
    } catch {
      parsed = undefined;
    }

    const scanned = scanForObjects(bytes);
    let xref: Map<number, XrefEntry>;
    let trailer: DictLike | undefined;
    let startXref: number;
    let style: 'table' | 'stream';
    let recovered = false;

    if (parsed && parsed.xref.size > 0 && parsed.trailer) {
      xref = parsed.xref;
      trailer = parsed.trailer;
      startXref = parsed.startXref;
      style = parsed.style;
      // Offsets that do not land on the object they claim mean the table is
      // stale; trust the scan for those entries only.
      for (const [num, offset] of scanned) {
        const entry = xref.get(num);
        if (entry === undefined) {
          xref.set(num, { type: 1, offset: offset - headerOffset, gen: 0 });
          recovered = true;
        }
      }
    } else {
      xref = new Map();
      for (const [num, offset] of scanned) {
        xref.set(num, { type: 1, offset: offset - headerOffset, gen: 0 });
      }
      startXref = 0;
      style = 'table';
      recovered = true;
      trailer = recoverTrailer(bytes);
    }

    if (!trailer) throw new Error('PDF has no usable trailer dictionary');
    if (trailer.map.has('Encrypt')) throw new EncryptedPdfError();

    const reader = new PdfReader({
      bytes,
      headerOffset,
      xref,
      trailer,
      startXref,
      xrefStyle: style,
      recovered,
      scanned,
    });

    if (!reader.resolve(trailer.map.get('Root'))) {
      const root = reader.findCatalogByScan();
      if (!root) throw new Error('PDF has no document catalogue');
      const patched = new Map(trailer.map);
      patched.set('Root', root);
      return new PdfReader({
        bytes,
        headerOffset,
        xref,
        trailer: { kind: 'dict', map: patched, span: trailer.span },
        startXref,
        xrefStyle: style,
        recovered: true,
        scanned,
      });
    }
    return reader;
  }

  /** Highest object number currently in use — new objects start above it. */
  get maxObjectNumber(): number {
    let max = (asNumber(this.resolve(this.trailer.map.get('Size'))) ?? 1) - 1;
    for (const num of this.xref.keys()) max = Math.max(max, num);
    return max;
  }

  resolve(object: PdfObject | undefined, depth = 0): PdfObject | undefined {
    if (object === undefined || depth > 32) return undefined;
    if (object.kind !== 'ref') return object;
    const loaded = this.get(object.num);
    if (!loaded) return undefined;
    return this.resolve(loaded.object, depth + 1);
  }

  /** Resolve and return the buffer the value's spans index into. */
  resolveWithSource(
    object: PdfObject | undefined,
    src: Buffer,
  ): { object: PdfObject; src: Buffer } | undefined {
    if (object === undefined) return undefined;
    if (object.kind !== 'ref') return { object, src };
    const loaded = this.get(object.num);
    if (!loaded) return undefined;
    return this.resolveWithSource(loaded.object, loaded.src);
  }

  get(num: number): LoadedObject | undefined {
    if (this.cache.has(num)) return this.cache.get(num);
    this.cache.set(num, undefined); // cycle guard
    const loaded = this.load(num);
    this.cache.set(num, loaded);
    return loaded;
  }

  private load(num: number): LoadedObject | undefined {
    const entry = this.xref.get(num);
    if (!entry) return undefined;
    if (entry.type === 1) {
      const direct = this.parseIndirectAt(entry.offset + this.headerOffset, num);
      if (direct) return direct;
      // A stale offset is common in files edited by careless tools. Viewers
      // rebuild the index by scanning rather than refusing the file; so do we.
      const rescanned = this.scanned.get(num);
      if (rescanned === undefined) return undefined;
      return this.parseIndirectAt(rescanned, num);
    }
    return this.loadFromObjectStream(entry, num);
  }

  private parseIndirectAt(offset: number, expected: number): LoadedObject | undefined {
    if (offset < 0 || offset >= this.bytes.length) return undefined;
    const lexer = new Lexer(this.bytes, offset);
    lexer.skipWhitespace();
    const numToken = lexer.readToken();
    if (!/^[0-9]+$/.test(numToken) || Number.parseInt(numToken, 10) !== expected) return undefined;
    lexer.skipWhitespace();
    const genToken = lexer.readToken();
    if (!/^[0-9]+$/.test(genToken)) return undefined;
    lexer.skipWhitespace();
    if (lexer.readToken() !== 'obj') return undefined;

    const value = lexer.parseObject();
    lexer.skipWhitespace();
    const save = lexer.pos;
    const keyword = lexer.readToken();
    if (keyword !== 'stream' || !isDictLike(value)) {
      lexer.pos = save;
      return { object: value, src: this.bytes, num: expected, gen: Number.parseInt(genToken, 10) };
    }

    // `stream` is followed by CRLF or LF — never CR alone.
    let dataStart = lexer.pos;
    if (this.bytes[dataStart] === 0x0d) dataStart += 1;
    if (this.bytes[dataStart] === 0x0a) dataStart += 1;

    const declared = asNumber(this.resolve(value.map.get('Length')));
    let dataEnd = declared !== undefined ? dataStart + declared : -1;
    const endstreamAt = (from: number): number => this.bytes.indexOf('endstream', from, 'latin1');
    if (
      dataEnd < dataStart ||
      dataEnd > this.bytes.length ||
      endstreamAt(dataEnd) < 0 ||
      endstreamAt(dataEnd) > dataEnd + 4
    ) {
      const found = endstreamAt(dataStart);
      if (found < 0) return undefined;
      dataEnd = found;
      while (dataEnd > dataStart && (this.bytes[dataEnd - 1] === 0x0a || this.bytes[dataEnd - 1] === 0x0d)) {
        dataEnd -= 1;
      }
    }

    return {
      object: {
        kind: 'stream',
        map: value.map,
        data: this.bytes.subarray(dataStart, dataEnd),
        span: { start: value.span.start, end: dataEnd },
      },
      src: this.bytes,
      num: expected,
      gen: Number.parseInt(genToken, 10),
    };
  }

  /** Decoded bytes of a stream object, with filters applied. */
  decode(object: PdfObject): Buffer {
    if (object.kind !== 'stream') return Buffer.alloc(0);
    return decodeStream(object, object.data, (value) => this.resolve(value));
  }

  private objectStreamIndex(streamNum: number): Map<number, number> | undefined {
    if (this.objectStreamCache.has(streamNum)) return this.objectStreamCache.get(streamNum);
    this.objectStreamCache.set(streamNum, undefined);

    const loaded = this.get(streamNum);
    if (!loaded || loaded.object.kind !== 'stream') return undefined;
    if (asName(this.resolve(loaded.object.map.get('Type'))) !== 'ObjStm') return undefined;

    let decoded: Buffer;
    try {
      decoded = this.decode(loaded.object);
    } catch {
      return undefined;
    }
    const count = asNumber(this.resolve(loaded.object.map.get('N'))) ?? 0;
    const first = asNumber(this.resolve(loaded.object.map.get('First'))) ?? 0;

    const index = new Map<number, number>();
    const header = new Lexer(decoded, 0);
    for (let entry = 0; entry < count; entry += 1) {
      header.skipWhitespace();
      const objNum = header.readToken();
      header.skipWhitespace();
      const objOffset = header.readToken();
      if (!/^[0-9]+$/.test(objNum) || !/^[0-9]+$/.test(objOffset)) break;
      index.set(Number.parseInt(objNum, 10), first + Number.parseInt(objOffset, 10));
    }

    this.objectStreamData.set(streamNum, decoded);
    this.objectStreamCache.set(streamNum, index);
    return index;
  }

  private loadFromObjectStream(entry: XrefCompressed, num: number): LoadedObject | undefined {
    const index = this.objectStreamIndex(entry.stream);
    const data = this.objectStreamData.get(entry.stream);
    if (!index || !data) return undefined;
    const offset = index.get(num);
    if (offset === undefined || offset >= data.length) return undefined;
    const value = new Lexer(data, offset).parseObject();
    return { object: value, src: data, num, gen: 0 };
  }

  private findCatalogByScan(): PdfObject | undefined {
    for (const num of [...this.xref.keys()].sort((a, b) => a - b)) {
      const loaded = this.get(num);
      if (!loaded || !isDictLike(loaded.object)) continue;
      if (asName(this.resolve(loaded.object.map.get('Type'))) === 'Catalog') {
        return { kind: 'ref', num, gen: 0, span: { start: 0, end: 0 } };
      }
    }
    return undefined;
  }

  /** Pages in document order, with inheritable attributes already resolved. */
  get pages(): readonly PdfPage[] {
    if (this.pageCache) return this.pageCache;

    const root = this.resolve(this.trailer.map.get('Root'));
    const pagesRef = dictGet(root, 'Pages');
    const collected: PdfPage[] = [];
    const visited = new Set<number>();
    let budget = MAX_PAGE_TREE_NODES;

    const walk = (
      nodeRef: PdfObject | undefined,
      inherited: {
        mediaBox?: PdfRect;
        cropBox?: PdfRect;
        rotate?: number;
        resources?: PdfObject;
      },
    ): void => {
      if (budget-- <= 0 || nodeRef === undefined) return;
      const num = nodeRef.kind === 'ref' ? nodeRef.num : -1;
      if (num >= 0) {
        if (visited.has(num)) return;
        visited.add(num);
      }
      const loaded =
        nodeRef.kind === 'ref' ? this.get(nodeRef.num) : { object: nodeRef, src: this.bytes, num: -1, gen: 0 };
      if (!loaded || !isDictLike(loaded.object)) return;
      const node = loaded.object;

      const next = {
        mediaBox: this.readBox(node, 'MediaBox') ?? inherited.mediaBox,
        cropBox: this.readBox(node, 'CropBox') ?? inherited.cropBox,
        rotate: asNumber(this.resolve(node.map.get('Rotate'))) ?? inherited.rotate,
        resources: node.map.has('Resources') ? node.map.get('Resources') : inherited.resources,
      };

      const type = asName(this.resolve(node.map.get('Type')));
      const kids = this.resolve(node.map.get('Kids'));
      if (type === 'Pages' || (type !== 'Page' && kids?.kind === 'array')) {
        if (kids?.kind !== 'array') return;
        for (const kid of kids.items) walk(kid, next);
        return;
      }

      const mediaBox = next.mediaBox ?? DEFAULT_BOX;
      collected.push({
        index: collected.length,
        num: loaded.num,
        gen: loaded.gen,
        dict: node,
        src: loaded.src,
        mediaBox,
        cropBox: next.cropBox ?? mediaBox,
        rotate: (((Math.round((next.rotate ?? 0) / 90) * 90) % 360) + 360) % 360,
        resources: next.resources,
        contents: node.map.get('Contents'),
      });
    };

    walk(pagesRef, {});
    this.pageCache = collected;
    return collected;
  }

  private readBox(node: DictLike, key: string): PdfRect | undefined {
    const value = this.resolve(node.map.get(key));
    if (value?.kind !== 'array' || value.items.length < 4) return undefined;
    const numbers = value.items.map((item) => asNumber(this.resolve(item)) ?? 0);
    return normaliseRect(numbers);
  }
}

interface ParsedXref {
  readonly xref: Map<number, XrefEntry>;
  readonly trailer: DictLike | undefined;
  readonly startXref: number;
  readonly style: 'table' | 'stream';
}

const lastStartXref = (bytes: Buffer): number | undefined => {
  const marker = bytes.lastIndexOf('startxref', bytes.length, 'latin1');
  if (marker < 0) return undefined;
  const lexer = new Lexer(bytes, marker + 'startxref'.length);
  lexer.skipWhitespace();
  const token = lexer.readToken();
  if (!/^[0-9]+$/.test(token)) return undefined;
  return Number.parseInt(token, 10);
};

/** Walk the `/Prev` chain newest-first; the first entry seen for an id wins. */
const parseXrefChain = (bytes: Buffer, headerOffset: number): ParsedXref => {
  const start = lastStartXref(bytes);
  if (start === undefined) throw new Error('No startxref');

  const xref = new Map<number, XrefEntry>();
  let trailer: DictLike | undefined;
  let style: 'table' | 'stream' | undefined;
  const seen = new Set<number>();
  const queue: number[] = [start];

  while (queue.length > 0 && seen.size < MAX_XREF_SECTIONS) {
    const offset = queue.shift();
    if (offset === undefined || seen.has(offset)) continue;
    seen.add(offset);

    const section = parseXrefSection(bytes, offset + headerOffset);
    if (!section) continue;
    style ??= section.style;
    for (const [num, entry] of section.entries) if (!xref.has(num)) xref.set(num, entry);
    if (!trailer) trailer = section.trailer;
    else {
      const merged = new Map(trailer.map);
      for (const [key, value] of section.trailer.map) if (!merged.has(key)) merged.set(key, value);
      trailer = { kind: 'dict', map: merged, span: trailer.span };
    }

    const prev = section.trailer.map.get('Prev');
    if (prev?.kind === 'num') queue.push(prev.value);
    const hybrid = section.trailer.map.get('XRefStm');
    if (hybrid?.kind === 'num') queue.push(hybrid.value);
  }

  return { xref, trailer, startXref: start, style: style ?? 'table' };
};

interface XrefSection {
  readonly entries: Map<number, XrefEntry>;
  readonly trailer: DictLike;
  readonly style: 'table' | 'stream';
}

const parseXrefSection = (bytes: Buffer, offset: number): XrefSection | undefined => {
  if (offset < 0 || offset >= bytes.length) return undefined;
  const lexer = new Lexer(bytes, offset);
  lexer.skipWhitespace();

  if (lexer.eat('xref')) return parseXrefTable(bytes, lexer);
  return parseXrefStream(bytes, offset);
};

const parseXrefTable = (bytes: Buffer, lexer: Lexer): XrefSection | undefined => {
  const entries = new Map<number, XrefEntry>();
  for (;;) {
    lexer.skipWhitespace();
    if (lexer.eat('trailer')) break;
    const startToken = lexer.readToken();
    if (!/^[0-9]+$/.test(startToken)) return undefined;
    lexer.skipWhitespace();
    const countToken = lexer.readToken();
    if (!/^[0-9]+$/.test(countToken)) return undefined;

    const first = Number.parseInt(startToken, 10);
    const count = Number.parseInt(countToken, 10);
    for (let index = 0; index < count; index += 1) {
      lexer.skipWhitespace();
      const offsetToken = lexer.readToken();
      lexer.skipWhitespace();
      const genToken = lexer.readToken();
      lexer.skipWhitespace();
      const typeToken = lexer.readToken();
      if (!/^[0-9]+$/.test(offsetToken)) return undefined;
      const num = first + index;
      if (typeToken === 'n' && !entries.has(num)) {
        entries.set(num, {
          type: 1,
          offset: Number.parseInt(offsetToken, 10),
          gen: Number.parseInt(genToken, 10) || 0,
        });
      }
    }
  }

  const trailer = lexer.parseObject();
  if (!isDictLike(trailer)) return undefined;
  return { entries, trailer, style: 'table' };
};

const parseXrefStream = (bytes: Buffer, offset: number): XrefSection | undefined => {
  const lexer = new Lexer(bytes, offset);
  lexer.skipWhitespace();
  if (!/^[0-9]+$/.test(lexer.readToken())) return undefined;
  lexer.skipWhitespace();
  if (!/^[0-9]+$/.test(lexer.readToken())) return undefined;
  lexer.skipWhitespace();
  if (lexer.readToken() !== 'obj') return undefined;

  const dict = lexer.parseObject();
  if (!isDictLike(dict)) return undefined;
  lexer.skipWhitespace();
  if (lexer.readToken() !== 'stream') return undefined;

  let dataStart = lexer.pos;
  if (bytes[dataStart] === 0x0d) dataStart += 1;
  if (bytes[dataStart] === 0x0a) dataStart += 1;
  const declared = asNumber(dict.map.get('Length'));
  let dataEnd = declared !== undefined ? dataStart + declared : bytes.indexOf('endstream', dataStart, 'latin1');
  if (dataEnd < dataStart || dataEnd > bytes.length) {
    dataEnd = bytes.indexOf('endstream', dataStart, 'latin1');
  }
  if (dataEnd < dataStart) return undefined;

  const streamObject: PdfObject = {
    kind: 'stream',
    map: dict.map,
    data: bytes.subarray(dataStart, dataEnd),
    span: dict.span,
  };

  let decoded: Buffer;
  try {
    decoded = decodeStream(streamObject, streamObject.data);
  } catch {
    return undefined;
  }

  const widths = dict.map.get('W');
  if (widths?.kind !== 'array') return undefined;
  const w = widths.items.map((item) => asNumber(item) ?? 0);
  const rowLength = w.reduce((total, value) => total + value, 0);
  if (rowLength <= 0) return undefined;

  const size = asNumber(dict.map.get('Size')) ?? 0;
  const indexValue = dict.map.get('Index');
  const ranges: Array<[number, number]> = [];
  if (indexValue?.kind === 'array') {
    for (let index = 0; index + 1 < indexValue.items.length; index += 2) {
      ranges.push([
        asNumber(indexValue.items[index]) ?? 0,
        asNumber(indexValue.items[index + 1]) ?? 0,
      ]);
    }
  } else {
    ranges.push([0, size]);
  }

  const entries = new Map<number, XrefEntry>();
  let cursor = 0;
  const readField = (width: number, fallback: number): number => {
    if (width === 0) return fallback;
    let value = 0;
    for (let index = 0; index < width; index += 1) {
      value = value * 256 + (decoded[cursor + index] ?? 0);
    }
    cursor += width;
    return value;
  };

  for (const [first, count] of ranges) {
    for (let index = 0; index < count; index += 1) {
      if (cursor + rowLength > decoded.length) break;
      const type = readField(w[0] ?? 1, 1);
      const second = readField(w[1] ?? 0, 0);
      const third = readField(w[2] ?? 0, 0);
      const num = first + index;
      if (entries.has(num)) continue;
      if (type === 1) entries.set(num, { type: 1, offset: second, gen: third });
      else if (type === 2) entries.set(num, { type: 2, stream: second, index: third });
    }
  }

  return { entries, trailer: { kind: 'dict', map: dict.map, span: dict.span }, style: 'stream' };
};

const OBJECT_HEADER = /(?:^|[\r\n\s])(\d{1,10})\s+(\d{1,5})\s+obj\b/g;

/** Last-resort index: find every `N G obj` in the file. Later wins. */
const scanForObjects = (bytes: Buffer): Map<number, number> => {
  const text = bytes.toString('latin1');
  const found = new Map<number, number>();
  OBJECT_HEADER.lastIndex = 0;
  for (;;) {
    const match = OBJECT_HEADER.exec(text);
    if (!match) break;
    const num = Number.parseInt(match[1] ?? '', 10);
    if (!Number.isInteger(num)) continue;
    // The pattern may capture one leading whitespace byte; the object header
    // starts where the first digit does.
    const at = match.index + (match[0].startsWith(match[1] ?? '') ? 0 : 1);
    found.set(num, at);
  }
  return found;
};

/** Recover a trailer dictionary from a file whose xref is unusable. */
const recoverTrailer = (bytes: Buffer): DictLike | undefined => {
  const marker = bytes.lastIndexOf('trailer', bytes.length, 'latin1');
  if (marker < 0) return { kind: 'dict', map: new Map(), span: { start: 0, end: 0 } };
  const value = new Lexer(bytes, marker + 'trailer'.length).parseObject();
  return isDictLike(value) ? value : { kind: 'dict', map: new Map(), span: { start: 0, end: 0 } };
};
