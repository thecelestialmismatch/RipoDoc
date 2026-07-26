/**
 * Low-level PDF value serialisation.
 *
 * Deliberately dependency-free: the evidence PDF is the product's trust
 * boundary, so its byte layout must be auditable without reading a third-party
 * library. Everything here maps 1:1 onto PDF 1.7 (ISO 32000-1) syntax.
 */

/** A serialisable PDF value. */
export type PdfValue =
  | { readonly kind: 'name'; readonly value: string }
  | { readonly kind: 'string'; readonly value: string }
  | { readonly kind: 'number'; readonly value: number }
  | { readonly kind: 'bool'; readonly value: boolean }
  | { readonly kind: 'null' }
  | { readonly kind: 'ref'; readonly id: number }
  | { readonly kind: 'array'; readonly items: readonly PdfValue[] }
  | { readonly kind: 'dict'; readonly entries: ReadonlyMap<string, PdfValue> }
  | { readonly kind: 'raw'; readonly value: string };

export const name = (value: string): PdfValue => {
  if (!/^[A-Za-z0-9._-]+$/.test(value)) {
    throw new Error(`Unsafe PDF name: ${JSON.stringify(value)}`);
  }
  return { kind: 'name', value };
};

export const str = (value: string): PdfValue => ({ kind: 'string', value });
export const num = (value: number): PdfValue => {
  if (!Number.isFinite(value)) {
    throw new Error(`Non-finite PDF number: ${value}`);
  }
  return { kind: 'number', value };
};
export const bool = (value: boolean): PdfValue => ({ kind: 'bool', value });
export const nul = (): PdfValue => ({ kind: 'null' });
export const ref = (id: number): PdfValue => {
  if (!Number.isInteger(id) || id < 1) {
    throw new Error(`Invalid object id: ${id}`);
  }
  return { kind: 'ref', id };
};
export const array = (items: readonly PdfValue[]): PdfValue => ({ kind: 'array', items });
export const raw = (value: string): PdfValue => ({ kind: 'raw', value });

export const dict = (entries: Readonly<Record<string, PdfValue>>): PdfValue => ({
  kind: 'dict',
  entries: new Map(Object.entries(entries)),
});

/**
 * Format a number the way PDF wants it: no exponent, no trailing zeros, and
 * never `-0`. Producers that emit `1e-7` create files that some viewers reject.
 */
export const formatNumber = (value: number): string => {
  const rounded = Math.round(value * 1e4) / 1e4;
  const normalised = Object.is(rounded, -0) ? 0 : rounded;
  if (Number.isInteger(normalised)) return String(normalised);
  return normalised.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
};

/**
 * Escape a PDF literal string.
 *
 * Backslash, parentheses and control characters must be escaped or the string
 * terminates early — which is also the injection vector: an unescaped `)` in a
 * client name would let attacker-controlled text emit arbitrary PDF syntax.
 */
export const escapeLiteral = (value: string): string => {
  let out = '';
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    if (char === '\\') out += '\\\\';
    else if (char === '(') out += '\\(';
    else if (char === ')') out += '\\)';
    else if (char === '\n') out += '\\n';
    else if (char === '\r') out += '\\r';
    else if (char === '\t') out += '\\t';
    else if (code < 32 || code > 126) out += winAnsiEscape(code);
    else out += char;
  }
  return out;
};

/**
 * Map a code point into WinAnsiEncoding, the encoding declared on our fonts.
 * Anything unrepresentable degrades to `?` rather than corrupting the stream.
 */
const WIN_ANSI_SPECIALS: ReadonlyMap<number, number> = new Map([
  [0x2018, 0x91], [0x2019, 0x92], [0x201c, 0x93], [0x201d, 0x94],
  [0x2013, 0x96], [0x2014, 0x97], [0x2022, 0x95], [0x20ac, 0x80],
  [0x2026, 0x85], [0x2122, 0x99],
]);

const winAnsiEscape = (code: number): string => {
  const mapped = WIN_ANSI_SPECIALS.get(code) ?? (code >= 0xa0 && code <= 0xff ? code : 0x3f);
  return `\\${mapped.toString(8).padStart(3, '0')}`;
};

/**
 * A PDF *text string* (ISO 32000-1 §7.9.2.2) — used for document metadata.
 *
 * Literal strings in the Info dictionary are interpreted as PDFDocEncoding, not
 * WinAnsi, so a byte like 0x97 renders as `Š` instead of an em dash. Any string
 * containing non-ASCII must therefore be emitted as UTF-16BE with a byte-order
 * mark. Pure-ASCII strings stay literal so the file remains greppable.
 */
export const textString = (value: string): PdfValue => {
  // eslint-disable-next-line no-control-regex
  if (/^[\x20-\x7e\n\r\t]*$/.test(value)) return str(value);
  const utf16 = Buffer.from(`﻿${value}`, 'utf16le').swap16();
  return raw(`<${utf16.toString('hex')}>`);
};

/** Serialise a value to PDF syntax. */
export const serialize = (value: PdfValue): string => {
  switch (value.kind) {
    case 'name':
      return `/${value.value}`;
    case 'string':
      return `(${escapeLiteral(value.value)})`;
    case 'number':
      return formatNumber(value.value);
    case 'bool':
      return value.value ? 'true' : 'false';
    case 'null':
      return 'null';
    case 'ref':
      return `${value.id} 0 R`;
    case 'raw':
      return value.value;
    case 'array':
      return `[${value.items.map(serialize).join(' ')}]`;
    case 'dict': {
      const body = [...value.entries]
        .map(([key, entry]) => `/${key} ${serialize(entry)}`)
        .join('\n  ');
      return `<<\n  ${body}\n>>`;
    }
  }
};
