/**
 * Font decoding: turning a PDF's byte codes back into characters and widths.
 *
 * This exists for one reason — RipoDoc has to find the figure "14" on a page
 * before it can put a click zone on it. Two independent things are needed per
 * font:
 *
 *  - **Codes → text**, so a search for `97.4%` matches. `/ToUnicode` is
 *    authoritative when present; otherwise the simple-font encoding tables are.
 *  - **Codes → advance widths**, so the rectangle ends where the glyphs do. A
 *    width table that is merely *plausible* produces a zone that drifts right
 *    across a long line and stops covering the number.
 *
 * Composite (Type0) fonts without a `/ToUnicode` map are treated as opaque:
 * their advances still count, so later text stays correctly positioned, but
 * their characters are not offered for matching. Guessing a CID-to-Unicode
 * mapping would silently place a link on the wrong figure, and a wrong link in
 * a client report is worse than no link.
 */

import { asName, asNumber, dictGet, Lexer, type PdfObject } from './objects.ts';
import type { PdfReader } from './reader.ts';

/** WinAnsi code points 128..159 that differ from Latin-1. */
const WIN_ANSI_HIGH: Readonly<Record<number, number>> = {
  128: 0x20ac, 130: 0x201a, 131: 0x0192, 132: 0x201e, 133: 0x2026, 134: 0x2020,
  135: 0x2021, 136: 0x02c6, 137: 0x2030, 138: 0x0160, 139: 0x2039, 140: 0x0152,
  142: 0x017d, 145: 0x2018, 146: 0x2019, 147: 0x201c, 148: 0x201d, 149: 0x2022,
  150: 0x2013, 151: 0x2014, 152: 0x02dc, 153: 0x2122, 154: 0x0161, 155: 0x203a,
  156: 0x0153, 158: 0x017e, 159: 0x0178,
};

/**
 * The Adobe glyph names that actually turn up in a `/Differences` array of a
 * business report: digits, punctuation, currency and the letters. Anything
 * missing degrades to a replacement character, which simply fails to match —
 * the safe direction.
 */
const GLYPH_NAMES: Readonly<Record<string, number>> = {
  space: 32, exclam: 33, quotedbl: 34, numbersign: 35, dollar: 36, percent: 37,
  ampersand: 38, quotesingle: 39, parenleft: 40, parenright: 41, asterisk: 42,
  plus: 43, comma: 44, hyphen: 45, period: 46, slash: 47, zero: 48, one: 49,
  two: 50, three: 51, four: 52, five: 53, six: 54, seven: 55, eight: 56,
  nine: 57, colon: 58, semicolon: 59, less: 60, equal: 61, greater: 62,
  question: 63, at: 64, bracketleft: 91, backslash: 92, bracketright: 93,
  asciicircum: 94, underscore: 95, grave: 96, braceleft: 123, bar: 124,
  braceright: 125, asciitilde: 126, quoteleft: 0x2018, quoteright: 0x2019,
  quotedblleft: 0x201c, quotedblright: 0x201d, endash: 0x2013, emdash: 0x2014,
  bullet: 0x2022, Euro: 0x20ac, sterling: 0xa3, yen: 0xa5, cent: 0xa2,
  degree: 0xb0, plusminus: 0xb1, ellipsis: 0x2026, trademark: 0x2122,
  nbspace: 32, uni0020: 32,
};

const standardCharCode = (code: number): number => {
  if (code >= 32 && code < 127) return code;
  return WIN_ANSI_HIGH[code] ?? (code >= 160 ? code : 0xfffd);
};

const glyphNameToUnicode = (name: string): number => {
  const direct = GLYPH_NAMES[name];
  if (direct !== undefined) return direct;
  if (/^[A-Za-z]$/.test(name)) return name.charCodeAt(0);
  const uni = /^uni([0-9A-Fa-f]{4})$/.exec(name);
  if (uni) return Number.parseInt(uni[1] as string, 16);
  const gid = /^g?(\d+)$/.exec(name);
  if (gid) return 0xfffd;
  return 0xfffd;
};

export interface LoadedFont {
  /** 1 for simple fonts, 2 for Identity-encoded composite fonts. */
  readonly codeBytes: number;
  /** Text for a code, or `undefined` when the mapping is unknown. */
  text(code: number): string | undefined;
  /** Advance width in 1/1000 em. */
  width(code: number): number;
}

/** Fallback advances, used when a font declares no `/Widths`. */
const HELVETICA_FALLBACK: readonly number[] = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];

const fallbackWidth = (baseFont: string, code: number): number => {
  if (/Courier|Mono/i.test(baseFont)) return 600;
  if (code < 32 || code > 126) return 500;
  return HELVETICA_FALLBACK[code - 32] ?? 500;
};

const parseToUnicode = (data: Buffer): Map<number, string> => {
  const map = new Map<number, string>();
  const text = data.toString('latin1');
  const hexToText = (hex: string): string => {
    const buffer = Buffer.from(hex.length % 4 === 0 ? hex : hex.padStart(4, '0'), 'hex');
    let out = '';
    for (let index = 0; index + 1 < buffer.length; index += 2) {
      out += String.fromCharCode(((buffer[index] ?? 0) << 8) | (buffer[index + 1] ?? 0));
    }
    if (buffer.length === 1) out = String.fromCharCode(buffer[0] ?? 0);
    return out;
  };

  const charBlocks = text.matchAll(/beginbfchar([\s\S]*?)endbfchar/g);
  for (const block of charBlocks) {
    const pairs = (block[1] ?? '').matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]*)>/g);
    for (const pair of pairs) {
      map.set(Number.parseInt(pair[1] as string, 16), hexToText(pair[2] as string));
    }
  }

  const rangeBlocks = text.matchAll(/beginbfrange([\s\S]*?)endbfrange/g);
  for (const block of rangeBlocks) {
    const body = block[1] ?? '';
    const simple = body.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]*)>/g);
    for (const range of simple) {
      const low = Number.parseInt(range[1] as string, 16);
      const high = Number.parseInt(range[2] as string, 16);
      const start = range[3] as string;
      if (high - low > 65_535) continue;
      const base = Number.parseInt(start.slice(-4) || '0', 16);
      const prefix = start.slice(0, Math.max(0, start.length - 4));
      for (let code = low; code <= high; code += 1) {
        map.set(code, hexToText(prefix + (base + code - low).toString(16).padStart(4, '0')));
      }
    }
    const arrays = body.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*\[([\s\S]*?)\]/g);
    for (const range of arrays) {
      const low = Number.parseInt(range[1] as string, 16);
      const items = [...(range[3] ?? '').matchAll(/<([0-9A-Fa-f]*)>/g)];
      items.forEach((item, offset) => map.set(low + offset, hexToText(item[1] as string)));
    }
  }

  return map;
};

const parseDifferences = (items: readonly PdfObject[]): Map<number, string> => {
  const map = new Map<number, string>();
  let code = 0;
  for (const item of items) {
    if (item.kind === 'num') code = item.value;
    else if (item.kind === 'name') {
      map.set(code, item.value);
      code += 1;
    }
  }
  return map;
};

/** `/W` for a CID font: `[ c [w1 w2 …] cFirst cLast w ]`. */
const parseCidWidths = (
  reader: PdfReader,
  widths: readonly PdfObject[],
): Map<number, number> => {
  const map = new Map<number, number>();
  let index = 0;
  while (index < widths.length) {
    const first = asNumber(reader.resolve(widths[index]));
    const next = reader.resolve(widths[index + 1]);
    if (first === undefined || next === undefined) break;
    if (next.kind === 'array') {
      next.items.forEach((item, offset) => {
        const value = asNumber(reader.resolve(item));
        if (value !== undefined) map.set(first + offset, value);
      });
      index += 2;
      continue;
    }
    const last = asNumber(next);
    const value = asNumber(reader.resolve(widths[index + 2]));
    if (last === undefined || value === undefined) break;
    if (last - first <= 65_535) {
      for (let cid = first; cid <= last; cid += 1) map.set(cid, value);
    }
    index += 3;
  }
  return map;
};

/** Build a decoder for one font dictionary. */
export const loadFont = (reader: PdfReader, fontDict: PdfObject | undefined): LoadedFont => {
  const font = reader.resolve(fontDict);
  const subtype = asName(reader.resolve(dictGet(font, 'Subtype'))) ?? '';
  const baseFont = asName(reader.resolve(dictGet(font, 'BaseFont'))) ?? 'Helvetica';

  let toUnicode: Map<number, string> | undefined;
  const toUnicodeStream = reader.resolve(dictGet(font, 'ToUnicode'));
  if (toUnicodeStream?.kind === 'stream') {
    try {
      toUnicode = parseToUnicode(reader.decode(toUnicodeStream));
    } catch {
      toUnicode = undefined;
    }
  }

  if (subtype === 'Type0') {
    const descendants = reader.resolve(dictGet(font, 'DescendantFonts'));
    const descendant =
      descendants?.kind === 'array' ? reader.resolve(descendants.items[0]) : undefined;
    const defaultWidth = asNumber(reader.resolve(dictGet(descendant, 'DW'))) ?? 1000;
    const widthArray = reader.resolve(dictGet(descendant, 'W'));
    const widths =
      widthArray?.kind === 'array' ? parseCidWidths(reader, widthArray.items) : new Map();
    const map = toUnicode;
    return {
      codeBytes: 2,
      text: (code) => map?.get(code),
      width: (code) => widths.get(code) ?? defaultWidth,
    };
  }

  const firstChar = asNumber(reader.resolve(dictGet(font, 'FirstChar'))) ?? 0;
  const widthsValue = reader.resolve(dictGet(font, 'Widths'));
  const widths =
    widthsValue?.kind === 'array'
      ? widthsValue.items.map((item) => asNumber(reader.resolve(item)) ?? 0)
      : undefined;
  const descriptor = reader.resolve(dictGet(font, 'FontDescriptor'));
  const missingWidth = asNumber(reader.resolve(dictGet(descriptor, 'MissingWidth'))) ?? 0;

  const encoding = reader.resolve(dictGet(font, 'Encoding'));
  const differences =
    encoding !== undefined && encoding.kind !== 'name'
      ? (() => {
          const items = reader.resolve(dictGet(encoding, 'Differences'));
          return items?.kind === 'array' ? parseDifferences(items.items) : undefined;
        })()
      : undefined;

  return {
    codeBytes: 1,
    text: (code) => {
      const mapped = toUnicode?.get(code);
      if (mapped !== undefined && mapped.length > 0) return mapped;
      const glyphName = differences?.get(code);
      if (glyphName !== undefined) {
        const point = glyphNameToUnicode(glyphName);
        return point === 0xfffd ? undefined : String.fromCharCode(point);
      }
      const point = standardCharCode(code);
      return point === 0xfffd ? undefined : String.fromCharCode(point);
    },
    width: (code) => {
      if (widths && code >= firstChar && code - firstChar < widths.length) {
        const value = widths[code - firstChar] ?? 0;
        if (value > 0) return value;
        return missingWidth > 0 ? missingWidth : 0;
      }
      if (missingWidth > 0) return missingWidth;
      return fallbackWidth(baseFont, code);
    },
  };
};

/** Split a string of bytes into font codes. */
export const decodeCodes = (bytes: Buffer, codeBytes: number): readonly number[] => {
  const codes: number[] = [];
  if (codeBytes === 2) {
    for (let index = 0; index + 1 < bytes.length; index += 2) {
      codes.push(((bytes[index] ?? 0) << 8) | (bytes[index + 1] ?? 0));
    }
    if (bytes.length % 2 === 1) codes.push(bytes[bytes.length - 1] ?? 0);
    return codes;
  }
  for (const byte of bytes) codes.push(byte);
  return codes;
};

/** Parse a `/Resources /Font` dictionary into decoders, lazily. */
export const fontResources = (
  reader: PdfReader,
  resources: PdfObject | undefined,
): Map<string, LoadedFont> => {
  const cache = new Map<string, LoadedFont>();
  const fonts = reader.resolve(dictGet(reader.resolve(resources), 'Font'));
  if (fonts === undefined || fonts.kind !== 'dict') return cache;
  for (const [key, value] of fonts.map) {
    try {
      cache.set(key, loadFont(reader, value));
    } catch {
      continue;
    }
  }
  return cache;
};

export { parseToUnicode as parseToUnicodeCMap, glyphNameToUnicode };

/** Exposed for tests: the lexer is shared with content-stream scanning. */
export const contentLexer = (data: Buffer): Lexer => new Lexer(data, 0);
