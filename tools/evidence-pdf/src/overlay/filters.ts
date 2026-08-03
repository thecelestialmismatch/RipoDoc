/**
 * Stream filters — enough of them to read a real-world PDF's plumbing.
 *
 * RipoDoc only ever decodes the *structural* streams it must understand to
 * append safely: cross-reference streams, object streams, and page content
 * streams. Image filters (`DCTDecode`, `JPXDecode`, `CCITTFaxDecode`) are
 * deliberately not implemented — decoding a customer's image data is work with
 * no product value and a large attack surface, so those streams are refused
 * rather than half-parsed.
 */

import { constants, inflateSync, inflateRawSync } from 'node:zlib';
import { asName, asNumber, dictGet, type PdfObject } from './objects.ts';

export class UnsupportedFilterError extends Error {
  readonly filter: string;
  constructor(filter: string) {
    super(`Unsupported PDF stream filter: ${filter}`);
    this.name = 'UnsupportedFilterError';
    this.filter = filter;
  }
}

/** Zlib streams in the wild are sometimes truncated; salvage what inflates. */
const inflate = (data: Buffer): Buffer => {
  try {
    return inflateSync(data);
  } catch {
    /* fall through */
  }
  try {
    // Some producers omit the zlib header.
    return inflateRawSync(data);
  } catch {
    /* fall through */
  }
  // Truncated stream: recover the prefix that did inflate rather than failing
  // the whole overlay. Producers that omit the final block are common enough.
  for (const attempt of [inflateSync, inflateRawSync]) {
    try {
      return attempt(data, { finishFlush: constants.Z_SYNC_FLUSH });
    } catch {
      continue;
    }
  }
  throw new Error('Could not inflate PDF stream');
};

const asciiHexDecode = (data: Buffer): Buffer => {
  let hex = '';
  for (const byte of data) {
    const char = String.fromCharCode(byte);
    if (char === '>') break;
    if (/[0-9a-fA-F]/.test(char)) hex += char;
  }
  if (hex.length % 2 === 1) hex += '0';
  return Buffer.from(hex, 'hex');
};

const ascii85Decode = (data: Buffer): Buffer => {
  const out: number[] = [];
  let tuple: number[] = [];
  for (let index = 0; index < data.length; index += 1) {
    const byte = data[index] ?? 0;
    if (byte === 0x7e) break; // ~> terminator
    if (byte <= 0x20 || byte === 0x0a || byte === 0x0d) continue;
    if (byte === 0x7a && tuple.length === 0) {
      out.push(0, 0, 0, 0);
      continue;
    }
    if (byte < 0x21 || byte > 0x75) continue;
    tuple.push(byte - 0x21);
    if (tuple.length === 5) {
      let value = 0;
      for (const digit of tuple) value = value * 85 + digit;
      out.push((value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff);
      tuple = [];
    }
  }
  if (tuple.length > 1) {
    const count = tuple.length;
    while (tuple.length < 5) tuple.push(84);
    let value = 0;
    for (const digit of tuple) value = value * 85 + digit;
    const bytes = [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff];
    out.push(...bytes.slice(0, count - 1));
  }
  return Buffer.from(out);
};

const runLengthDecode = (data: Buffer): Buffer => {
  const out: number[] = [];
  let index = 0;
  while (index < data.length) {
    const length = data[index] ?? 128;
    index += 1;
    if (length === 128) break;
    if (length < 128) {
      for (let count = 0; count <= length; count += 1) out.push(data[index + count] ?? 0);
      index += length + 1;
    } else {
      const byte = data[index] ?? 0;
      index += 1;
      for (let count = 0; count < 257 - length; count += 1) out.push(byte);
    }
  }
  return Buffer.from(out);
};

/** LZW as used by PDF: variable code width, early change by default. */
const lzwDecode = (data: Buffer, earlyChange: number): Buffer => {
  const out: number[] = [];
  let dictionary: number[][] = [];
  const reset = (): void => {
    dictionary = [];
    for (let code = 0; code < 256; code += 1) dictionary.push([code]);
    dictionary.push([], []); // 256 clear, 257 EOD
  };
  reset();

  let codeWidth = 9;
  let previous: number[] | undefined;
  let bitBuffer = 0;
  let bitCount = 0;

  for (let index = 0; index <= data.length; index += 1) {
    if (index < data.length) {
      bitBuffer = (bitBuffer << 8) | (data[index] ?? 0);
      bitCount += 8;
    } else if (bitCount < codeWidth) {
      break;
    }
    while (bitCount >= codeWidth) {
      const code = (bitBuffer >> (bitCount - codeWidth)) & ((1 << codeWidth) - 1);
      bitCount -= codeWidth;
      if (code === 256) {
        reset();
        codeWidth = 9;
        previous = undefined;
        continue;
      }
      if (code === 257) return Buffer.from(out);

      const known = dictionary[code];
      let entry: number[];
      if (known !== undefined && code < dictionary.length) {
        entry = known;
      } else if (previous !== undefined) {
        entry = [...previous, previous[0] as number];
      } else {
        return Buffer.from(out);
      }
      out.push(...entry);
      if (previous !== undefined) dictionary.push([...previous, entry[0] as number]);
      previous = entry;

      if (dictionary.length + earlyChange >= 1 << codeWidth && codeWidth < 12) codeWidth += 1;
    }
  }
  return Buffer.from(out);
};

interface PredictorParams {
  readonly predictor: number;
  readonly colors: number;
  readonly bitsPerComponent: number;
  readonly columns: number;
}

/**
 * Undo a PNG or TIFF predictor.
 *
 * Cross-reference streams almost always use PNG predictor 12 (`Up`), so a
 * reader without this decodes structural garbage — and then writes an
 * incremental update against a corrupted object map.
 */
export const undoPredictor = (data: Buffer, params: PredictorParams): Buffer => {
  const { predictor, colors, bitsPerComponent, columns } = params;
  if (predictor <= 1) return data;

  const bytesPerPixel = Math.max(1, Math.ceil((colors * bitsPerComponent) / 8));
  const rowLength = Math.ceil((colors * bitsPerComponent * columns) / 8);

  if (predictor === 2) {
    if (bitsPerComponent !== 8) return data;
    const out = Buffer.from(data);
    const rows = Math.floor(out.length / rowLength);
    for (let row = 0; row < rows; row += 1) {
      const base = row * rowLength;
      for (let index = colors; index < rowLength; index += 1) {
        out[base + index] = ((out[base + index] ?? 0) + (out[base + index - colors] ?? 0)) & 0xff;
      }
    }
    return out;
  }

  const out: number[] = [];
  let previousRow = new Uint8Array(rowLength);
  let offset = 0;
  while (offset + 1 <= data.length) {
    const filter = data[offset] ?? 0;
    offset += 1;
    const row = new Uint8Array(rowLength);
    const available = Math.min(rowLength, data.length - offset);
    if (available <= 0) break;
    for (let index = 0; index < available; index += 1) row[index] = data[offset + index] ?? 0;
    offset += available;

    for (let index = 0; index < rowLength; index += 1) {
      const raw = row[index] ?? 0;
      const left = index >= bytesPerPixel ? (row[index - bytesPerPixel] ?? 0) : 0;
      const up = previousRow[index] ?? 0;
      const upLeft = index >= bytesPerPixel ? (previousRow[index - bytesPerPixel] ?? 0) : 0;
      let value = raw;
      switch (filter) {
        case 0:
          value = raw;
          break;
        case 1:
          value = raw + left;
          break;
        case 2:
          value = raw + up;
          break;
        case 3:
          value = raw + ((left + up) >> 1);
          break;
        case 4: {
          const p = left + up - upLeft;
          const pa = Math.abs(p - left);
          const pb = Math.abs(p - up);
          const pc = Math.abs(p - upLeft);
          const nearest = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
          value = raw + nearest;
          break;
        }
        default:
          value = raw;
      }
      row[index] = value & 0xff;
    }
    for (const byte of row) out.push(byte);
    previousRow = row;
  }
  return Buffer.from(out);
};

const filterNames = (dict: PdfObject | undefined): readonly string[] => {
  const filter = dictGet(dict, 'Filter') ?? dictGet(dict, 'F');
  if (!filter) return [];
  if (filter.kind === 'name') return [filter.value];
  if (filter.kind === 'array') {
    return filter.items.map((item) => asName(item) ?? '').filter((value) => value.length > 0);
  }
  return [];
};

const decodeParmsAt = (dict: PdfObject | undefined, index: number): PdfObject | undefined => {
  const parms = dictGet(dict, 'DecodeParms') ?? dictGet(dict, 'DP');
  if (!parms) return undefined;
  if (parms.kind === 'array') return parms.items[index];
  return index === 0 ? parms : undefined;
};

/**
 * Decode a stream's bytes.
 *
 * `resolve` is supplied by the reader so that `/DecodeParms` written as an
 * indirect reference still works — a case that is rare enough to be a
 * silent-corruption bug in naive implementations.
 */
export const decodeStream = (
  dict: PdfObject,
  raw: Buffer,
  resolve: (object: PdfObject | undefined) => PdfObject | undefined = (value) => value,
): Buffer => {
  let data = raw;
  const names = filterNames(dict);

  names.forEach((filter, index) => {
    const parms = resolve(decodeParmsAt(dict, index));
    switch (filter) {
      case 'FlateDecode':
      case 'Fl':
        data = inflate(data);
        break;
      case 'LZWDecode':
      case 'LZW':
        data = lzwDecode(data, asNumber(resolve(dictGet(parms, 'EarlyChange'))) ?? 1);
        break;
      case 'ASCIIHexDecode':
      case 'AHx':
        data = asciiHexDecode(data);
        return;
      case 'ASCII85Decode':
      case 'A85':
        data = ascii85Decode(data);
        return;
      case 'RunLengthDecode':
      case 'RL':
        data = runLengthDecode(data);
        return;
      case 'Crypt':
        return;
      default:
        throw new UnsupportedFilterError(filter);
    }

    const predictor = asNumber(resolve(dictGet(parms, 'Predictor'))) ?? 1;
    if (predictor > 1) {
      data = undoPredictor(data, {
        predictor,
        colors: asNumber(resolve(dictGet(parms, 'Colors'))) ?? 1,
        bitsPerComponent: asNumber(resolve(dictGet(parms, 'BitsPerComponent'))) ?? 8,
        columns: asNumber(resolve(dictGet(parms, 'Columns'))) ?? 1,
      });
    }
  });

  return data;
};
