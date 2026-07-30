/**
 * A PDF object model and parser for files RipoDoc did **not** write.
 *
 * The generator in `../pdf/` only ever serialises; this module has the harder
 * job of reading a stranger's PDF well enough to append to it. It is kept
 * separate from the writer on purpose: code that touches attacker-controlled
 * bytes should share no state with code that produces our own output.
 *
 * The decision everything else rests on: **every parsed value keeps the byte
 * range it came from**. When RipoDoc rewrites a page dictionary to add
 * `/Annots`, every other entry is copied back as its original bytes rather than
 * re-serialised. A re-serialiser that subtly disagrees with the original — a
 * float rounded, a string re-encoded — would corrupt a customer's report, and
 * the corruption would only surface in their client's viewer.
 */

/** A byte range in the buffer a value was parsed from. */
export interface Span {
  readonly start: number;
  readonly end: number;
}

export type PdfObject =
  | { readonly kind: 'null'; readonly span: Span }
  | { readonly kind: 'bool'; readonly value: boolean; readonly span: Span }
  | { readonly kind: 'num'; readonly value: number; readonly span: Span }
  | { readonly kind: 'str'; readonly bytes: Buffer; readonly span: Span }
  | { readonly kind: 'name'; readonly value: string; readonly span: Span }
  | { readonly kind: 'array'; readonly items: readonly PdfObject[]; readonly span: Span }
  | { readonly kind: 'dict'; readonly map: ReadonlyMap<string, PdfObject>; readonly span: Span }
  | {
      readonly kind: 'stream';
      readonly map: ReadonlyMap<string, PdfObject>;
      /** Raw, still-encoded stream bytes. */
      readonly data: Buffer;
      readonly span: Span;
    }
  | { readonly kind: 'ref'; readonly num: number; readonly gen: number; readonly span: Span }
  | { readonly kind: 'op'; readonly value: string; readonly span: Span };

export type DictLike = Extract<PdfObject, { kind: 'dict' | 'stream' }>;

export const isDictLike = (object: PdfObject | undefined): object is DictLike =>
  object?.kind === 'dict' || object?.kind === 'stream';

const WHITESPACE = new Set([0x00, 0x09, 0x0a, 0x0c, 0x0d, 0x20]);
const DELIMITER = new Set([0x28, 0x29, 0x3c, 0x3e, 0x5b, 0x5d, 0x7b, 0x7d, 0x2f, 0x25]);

const isWhitespace = (byte: number | undefined): boolean =>
  byte !== undefined && WHITESPACE.has(byte);
const isDelimiter = (byte: number | undefined): boolean =>
  byte !== undefined && DELIMITER.has(byte);

export const isRegular = (byte: number | undefined): boolean =>
  byte !== undefined && !isWhitespace(byte) && !isDelimiter(byte);

/**
 * A cursor over PDF syntax.
 *
 * Bounded by construction: every loop either advances or throws, and containers
 * carry a depth limit, so a hand-crafted file cannot make the parser spin or
 * recurse until the stack gives out.
 */
export class Lexer {
  readonly buf: Buffer;
  pos: number;
  private readonly depthLimit: number;

  constructor(buf: Buffer, pos = 0, depthLimit = 64) {
    this.buf = buf;
    this.pos = pos;
    this.depthLimit = depthLimit;
  }

  atEnd(): boolean {
    return this.pos >= this.buf.length;
  }

  peek(offset = 0): number | undefined {
    return this.buf[this.pos + offset];
  }

  /** Skip whitespace and `%` comments, which are legal between any two tokens. */
  skipWhitespace(): void {
    while (this.pos < this.buf.length) {
      const byte = this.buf[this.pos];
      if (isWhitespace(byte)) {
        this.pos += 1;
        continue;
      }
      if (byte === 0x25) {
        while (this.pos < this.buf.length) {
          const current = this.buf[this.pos];
          if (current === 0x0a || current === 0x0d) break;
          this.pos += 1;
        }
        continue;
      }
      return;
    }
  }

  /** Read a run of regular characters — a keyword, operator, or number body. */
  readToken(): string {
    const start = this.pos;
    while (this.pos < this.buf.length && isRegular(this.buf[this.pos])) this.pos += 1;
    // A lone delimiter still has to advance, or callers loop forever.
    if (this.pos === start) this.pos += 1;
    return this.buf.subarray(start, this.pos).toString('latin1');
  }

  /** Consume `literal` if it is next. */
  eat(literal: string): boolean {
    if (this.buf.subarray(this.pos, this.pos + literal.length).toString('latin1') === literal) {
      this.pos += literal.length;
      return true;
    }
    return false;
  }

  /**
   * Parse one object.
   *
   * Returns an `op` for anything that is not a value — `endobj`, `stream`, or a
   * content-stream operator. Callers decide whether that is an error.
   */
  parseObject(depth = 0): PdfObject {
    if (depth > this.depthLimit) throw new Error('PDF object nesting is too deep');
    this.skipWhitespace();
    const start = this.pos;
    const byte = this.peek();
    if (byte === undefined) throw new Error('Unexpected end of PDF input');

    if (byte === 0x2f) return this.parseName(start);
    if (byte === 0x28) return this.parseLiteralString(start);
    if (byte === 0x5b) return this.parseArray(start, depth);
    if (byte === 0x3c) {
      if (this.peek(1) === 0x3c) return this.parseDictionary(start, depth);
      return this.parseHexString(start);
    }
    if (byte === 0x5d || byte === 0x3e || byte === 0x7d || byte === 0x29 || byte === 0x7b) {
      this.pos += 1;
      return { kind: 'op', value: String.fromCharCode(byte), span: { start, end: this.pos } };
    }

    const token = this.readToken();
    if (token === 'true' || token === 'false') {
      return { kind: 'bool', value: token === 'true', span: { start, end: this.pos } };
    }
    if (token === 'null') return { kind: 'null', span: { start, end: this.pos } };

    if (/^[+\-.0-9]/.test(token)) {
      const value = Number.parseFloat(token);
      if (Number.isFinite(value)) {
        const reference = this.tryReadReference(value, start);
        if (reference) return reference;
        return { kind: 'num', value, span: { start, end: this.pos } };
      }
    }

    return { kind: 'op', value: token, span: { start, end: this.pos } };
  }

  /**
   * `12 0 R` is only a reference when all three tokens are present; `12 0` on
   * its own is two numbers. Backtracking is the only way to tell them apart.
   */
  private tryReadReference(first: number, start: number): PdfObject | undefined {
    if (!Number.isInteger(first) || first < 0) return undefined;
    const rewind = this.pos;
    this.skipWhitespace();
    const genToken = this.readToken();
    if (!/^[0-9]+$/.test(genToken)) {
      this.pos = rewind;
      return undefined;
    }
    this.skipWhitespace();
    const keyword = this.readToken();
    if (keyword !== 'R') {
      this.pos = rewind;
      return undefined;
    }
    return {
      kind: 'ref',
      num: first,
      gen: Number.parseInt(genToken, 10),
      span: { start, end: this.pos },
    };
  }

  private parseName(start: number): PdfObject {
    this.pos += 1;
    let value = '';
    while (this.pos < this.buf.length && isRegular(this.buf[this.pos])) {
      const byte = this.buf[this.pos] ?? 0;
      if (byte === 0x23 && this.pos + 2 < this.buf.length) {
        const hex = this.buf.subarray(this.pos + 1, this.pos + 3).toString('latin1');
        if (/^[0-9a-fA-F]{2}$/.test(hex)) {
          value += String.fromCharCode(Number.parseInt(hex, 16));
          this.pos += 3;
          continue;
        }
      }
      value += String.fromCharCode(byte);
      this.pos += 1;
    }
    return { kind: 'name', value, span: { start, end: this.pos } };
  }

  private parseLiteralString(start: number): PdfObject {
    this.pos += 1;
    const out: number[] = [];
    let nesting = 1;
    while (this.pos < this.buf.length) {
      const byte = this.buf[this.pos] ?? 0;
      this.pos += 1;
      if (byte === 0x5c) {
        const next = this.buf[this.pos];
        this.pos += 1;
        if (next === undefined) break;
        if (next === 0x6e) out.push(0x0a);
        else if (next === 0x72) out.push(0x0d);
        else if (next === 0x74) out.push(0x09);
        else if (next === 0x62) out.push(0x08);
        else if (next === 0x66) out.push(0x0c);
        else if (next === 0x0a) continue;
        else if (next === 0x0d) {
          if (this.buf[this.pos] === 0x0a) this.pos += 1;
          continue;
        } else if (next >= 0x30 && next <= 0x37) {
          let octal = String.fromCharCode(next);
          for (let index = 0; index < 2; index += 1) {
            const digit = this.buf[this.pos];
            if (digit === undefined || digit < 0x30 || digit > 0x37) break;
            octal += String.fromCharCode(digit);
            this.pos += 1;
          }
          out.push(Number.parseInt(octal, 8) & 0xff);
        } else out.push(next);
        continue;
      }
      if (byte === 0x28) nesting += 1;
      if (byte === 0x29) {
        nesting -= 1;
        if (nesting === 0) break;
      }
      out.push(byte);
    }
    return { kind: 'str', bytes: Buffer.from(out), span: { start, end: this.pos } };
  }

  private parseHexString(start: number): PdfObject {
    this.pos += 1;
    let hex = '';
    while (this.pos < this.buf.length) {
      const byte = this.buf[this.pos] ?? 0;
      this.pos += 1;
      if (byte === 0x3e) break;
      const char = String.fromCharCode(byte);
      if (/[0-9a-fA-F]/.test(char)) hex += char;
    }
    if (hex.length % 2 === 1) hex += '0';
    return { kind: 'str', bytes: Buffer.from(hex, 'hex'), span: { start, end: this.pos } };
  }

  private parseArray(start: number, depth: number): PdfObject {
    this.pos += 1;
    const items: PdfObject[] = [];
    for (;;) {
      this.skipWhitespace();
      if (this.atEnd()) throw new Error('Unterminated PDF array');
      if (this.peek() === 0x5d) {
        this.pos += 1;
        break;
      }
      const item = this.parseObject(depth + 1);
      if (item.kind === 'op' && (item.value === ']' || item.value === 'endobj')) break;
      items.push(item);
    }
    return { kind: 'array', items, span: { start, end: this.pos } };
  }

  private parseDictionary(start: number, depth: number): PdfObject {
    this.pos += 2;
    const map = new Map<string, PdfObject>();
    for (;;) {
      this.skipWhitespace();
      if (this.atEnd()) throw new Error('Unterminated PDF dictionary');
      if (this.peek() === 0x3e && this.peek(1) === 0x3e) {
        this.pos += 2;
        break;
      }
      const key = this.parseObject(depth + 1);
      if (key.kind !== 'name') {
        if (key.kind === 'op' && key.value === 'endobj') break;
        continue;
      }
      map.set(key.value, this.parseObject(depth + 1));
    }
    return { kind: 'dict', map, span: { start, end: this.pos } };
  }
}

/** Parse a standalone value from a buffer. */
export const parseValue = (buf: Buffer, at = 0): PdfObject => new Lexer(buf, at).parseObject();

export const dictGet = (object: PdfObject | undefined, key: string): PdfObject | undefined =>
  isDictLike(object) ? object.map.get(key) : undefined;

export const asNumber = (object: PdfObject | undefined): number | undefined =>
  object?.kind === 'num' ? object.value : undefined;

export const asName = (object: PdfObject | undefined): string | undefined =>
  object?.kind === 'name' ? object.value : undefined;

export const asArray = (object: PdfObject | undefined): readonly PdfObject[] | undefined =>
  object?.kind === 'array' ? object.items : undefined;

/** The exact bytes a value occupied, for verbatim copy-back. */
export const spanBytes = (src: Buffer, object: PdfObject): string =>
  src.subarray(object.span.start, object.span.end).toString('latin1');
