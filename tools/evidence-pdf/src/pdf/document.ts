/**
 * A minimal, dependency-free PDF 1.7 writer with first-class link annotations.
 *
 * Why hand-rolled: link annotations are the entire product mechanic (see
 * `docs/02-product/interaction-spec.md`). We need byte-level certainty that
 * every evidence zone emits a `/Subtype /Link` with an `https` URI action, an
 * invisible border, and a rectangle that actually covers the drawn element.
 *
 * Content streams are intentionally left uncompressed so that `grep` and the
 * test-suite can assert on the real bytes.
 */

import {
  array,
  dict,
  formatNumber,
  name,
  num,
  raw,
  ref,
  serialize,
  str,
  textString,
  type PdfValue,
} from './primitives.ts';
import { type FontId, textWidth } from './metrics.ts';

/** Page geometry in PostScript points (72pt = 1in). */
export const A4_PORTRAIT = { width: 595.276, height: 841.89 } as const;

export interface Rgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

/** Rectangle in **top-left origin** space — the coordinate system humans use. */
export interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export type TextAlign = 'left' | 'center' | 'right';

export interface TextOptions {
  readonly x: number;
  readonly y: number;
  readonly font?: FontId;
  readonly size?: number;
  readonly color?: Rgb;
  /** Horizontal alignment relative to `x`, or to `[x, x + width]` if given. */
  readonly align?: TextAlign;
  readonly width?: number;
}

export interface DocumentOptions {
  readonly title: string;
  readonly author: string;
  readonly subject?: string;
  /** Fixed timestamp — required so builds are byte-reproducible. */
  readonly createdAt: Date;
  /** 32-char hex document identifier. Deterministic by design. */
  readonly documentId: string;
}

const FONT_RESOURCE: Readonly<Record<FontId, string>> = {
  Helvetica: 'F1',
  'Helvetica-Bold': 'F2',
};

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const LOOPBACK_HOSTS: ReadonlySet<string> = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

/**
 * Plain `http` is permitted **only** for loopback, and only when the caller has
 * explicitly opted in. Local development genuinely needs it; a report emailed to
 * a client must never carry an unencrypted link, so the exception is pinned to
 * hosts that can never leave the developer's machine.
 */
export const isLoopbackHttp = (url: URL, allowed: boolean | undefined): boolean =>
  allowed === true && url.protocol === 'http:' && LOOPBACK_HOSTS.has(url.hostname);

const colorOp = (color: Rgb, stroke: boolean): string =>
  `${formatNumber(clamp01(color.r))} ${formatNumber(clamp01(color.g))} ${formatNumber(
    clamp01(color.b),
  )} ${stroke ? 'RG' : 'rg'}`;

/** One page: a content stream plus its annotation list. */
export class Page {
  readonly width: number;
  readonly height: number;
  private readonly ops: string[] = [];
  private readonly annotations: PdfValue[] = [];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  /** Convert a top-left y coordinate into PDF user space (bottom-left origin). */
  private toUserY(y: number): number {
    return this.height - y;
  }

  fillRect(box: Box, color: Rgb): this {
    this.ops.push(
      'q',
      colorOp(color, false),
      `${formatNumber(box.x)} ${formatNumber(this.toUserY(box.y + box.height))} ` +
        `${formatNumber(box.width)} ${formatNumber(box.height)} re f`,
      'Q',
    );
    return this;
  }

  strokeLine(
    from: { x: number; y: number },
    to: { x: number; y: number },
    color: Rgb,
    lineWidth = 0.75,
  ): this {
    this.ops.push(
      'q',
      colorOp(color, true),
      `${formatNumber(lineWidth)} w`,
      `${formatNumber(from.x)} ${formatNumber(this.toUserY(from.y))} m ` +
        `${formatNumber(to.x)} ${formatNumber(this.toUserY(to.y))} l S`,
      'Q',
    );
    return this;
  }

  /**
   * Draw text. `y` is the **baseline**, measured from the top of the page.
   */
  text(content: string, options: TextOptions): this {
    const font = options.font ?? 'Helvetica';
    const size = options.size ?? 10;
    const color = options.color ?? { r: 0, g: 0, b: 0 };
    const align = options.align ?? 'left';

    let x = options.x;
    if (align !== 'left') {
      const measured = textWidth(content, font, size);
      const span = options.width ?? 0;
      x = align === 'center' ? options.x + (span - measured) / 2 : options.x + span - measured;
    }

    this.ops.push(
      'BT',
      colorOp(color, false),
      `/${FONT_RESOURCE[font]} ${formatNumber(size)} Tf`,
      `${formatNumber(x)} ${formatNumber(this.toUserY(options.y))} Td`,
      `${serialize(str(content))} Tj`,
      'ET',
    );
    return this;
  }

  /**
   * Attach an invisible link annotation covering `box`.
   *
   * `/Border [0 0 0]` suppresses the default rectangle — otherwise every
   * evidence zone would be outlined in blue. `/F 4` sets the Print flag, so the
   * annotation survives printing without becoming visible.
   *
   * Only `https` is permitted: `javascript:` and `file:` URIs in a document
   * that gets emailed to clients are an attack surface, not a feature.
   */
  link(box: Box, uri: string, options: { readonly allowLoopbackHttp?: boolean } = {}): this {
    const parsed = new URL(uri);
    if (parsed.protocol !== 'https:' && !isLoopbackHttp(parsed, options.allowLoopbackHttp)) {
      throw new Error(`Evidence links must be https, received: ${parsed.protocol}`);
    }
    if (box.width <= 0 || box.height <= 0) {
      throw new Error(`Link annotation needs a positive area, received ${JSON.stringify(box)}`);
    }

    const bottom = this.toUserY(box.y + box.height);
    this.annotations.push(
      dict({
        Type: name('Annot'),
        Subtype: name('Link'),
        Rect: array([
          num(box.x),
          num(bottom),
          num(box.x + box.width),
          num(bottom + box.height),
        ]),
        Border: array([num(0), num(0), num(0)]),
        F: num(4),
        A: dict({ S: name('URI'), URI: str(uri) }),
      }),
    );
    return this;
  }

  get annotationCount(): number {
    return this.annotations.length;
  }

  contentStream(): string {
    return this.ops.join('\n');
  }

  annotationValues(): readonly PdfValue[] {
    return this.annotations;
  }
}

interface AllocatedObject {
  readonly id: number;
  readonly body: string;
}

export class PdfDocument {
  private readonly pages: Page[] = [];
  private readonly options: DocumentOptions;

  constructor(options: DocumentOptions) {
    if (!/^[0-9a-f]{32}$/.test(options.documentId)) {
      throw new Error('documentId must be 32 lowercase hex characters');
    }
    this.options = options;
  }

  addPage(size: { width: number; height: number } = A4_PORTRAIT): Page {
    const page = new Page(size.width, size.height);
    this.pages.push(page);
    return page;
  }

  get pageCount(): number {
    return this.pages.length;
  }

  /** Total link annotations across all pages — the product's core metric. */
  get linkCount(): number {
    return this.pages.reduce((total, page) => total + page.annotationCount, 0);
  }

  private static pdfDate(date: Date): string {
    const pad = (value: number, width = 2): string => String(value).padStart(width, '0');
    return (
      `D:${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
      `${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
    );
  }

  /** Serialise to bytes, building the cross-reference table from real offsets. */
  toBytes(): Uint8Array {
    if (this.pages.length === 0) throw new Error('Cannot serialise a PDF with no pages');

    const objects: AllocatedObject[] = [];
    let nextId = 1;
    const allocate = (body: string): number => {
      const id = nextId++;
      objects.push({ id, body });
      return id;
    };

    const catalogId = nextId++;
    const pagesId = nextId++;
    const fontRegularId = allocate(
      serialize(
        dict({
          Type: name('Font'),
          Subtype: name('Type1'),
          BaseFont: name('Helvetica'),
          Encoding: name('WinAnsiEncoding'),
        }),
      ),
    );
    const fontBoldId = allocate(
      serialize(
        dict({
          Type: name('Font'),
          Subtype: name('Type1'),
          BaseFont: name('Helvetica-Bold'),
          Encoding: name('WinAnsiEncoding'),
        }),
      ),
    );

    const pageIds: number[] = [];
    for (const page of this.pages) {
      const content = page.contentStream();
      const contentId = allocate(
        `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`,
      );
      const annotIds = page.annotationValues().map((annot) => allocate(serialize(annot)));
      const pageId = allocate(
        serialize(
          dict({
            Type: name('Page'),
            Parent: ref(pagesId),
            MediaBox: array([num(0), num(0), num(page.width), num(page.height)]),
            Resources: dict({
              Font: dict({ F1: ref(fontRegularId), F2: ref(fontBoldId) }),
            }),
            Contents: ref(contentId),
            ...(annotIds.length > 0
              ? { Annots: array(annotIds.map((id) => ref(id))) }
              : {}),
          }),
        ),
      );
      pageIds.push(pageId);
    }

    objects.push({
      id: pagesId,
      body: serialize(
        dict({
          Type: name('Pages'),
          Kids: array(pageIds.map((id) => ref(id))),
          Count: num(pageIds.length),
        }),
      ),
    });
    objects.push({
      id: catalogId,
      body: serialize(dict({ Type: name('Catalog'), Pages: ref(pagesId) })),
    });

    const infoId = allocate(
      serialize(
        dict({
          Title: textString(this.options.title),
          Author: textString(this.options.author),
          ...(this.options.subject ? { Subject: textString(this.options.subject) } : {}),
          Producer: str('RipoDoc Evidence PDF'),
          Creator: str('RipoDoc'),
          CreationDate: str(PdfDocument.pdfDate(this.options.createdAt)),
        }),
      ),
    );

    objects.sort((a, b) => a.id - b.id);

    const chunks: Buffer[] = [];
    let offset = 0;
    const push = (text: string): void => {
      const buffer = Buffer.from(text, 'latin1');
      chunks.push(buffer);
      offset += buffer.length;
    };

    push('%PDF-1.7\n');
    push('%âãÏÓ\n');

    const offsets = new Map<number, number>();
    for (const object of objects) {
      offsets.set(object.id, offset);
      push(`${object.id} 0 obj\n${object.body}\nendobj\n`);
    }

    const xrefOffset = offset;
    const size = objects.length + 1;
    let xref = `xref\n0 ${size}\n0000000000 65535 f \n`;
    for (let id = 1; id < size; id += 1) {
      const entry = offsets.get(id);
      if (entry === undefined) throw new Error(`Missing offset for object ${id}`);
      xref += `${String(entry).padStart(10, '0')} 00000 n \n`;
    }
    push(xref);

    const id = serialize(raw(`<${this.options.documentId}>`));
    push(
      `trailer\n${serialize(
        dict({
          Size: num(size),
          Root: ref(catalogId),
          Info: ref(infoId),
          ID: array([raw(id), raw(id)]),
        }),
      )}\nstartxref\n${xrefOffset}\n%%EOF\n`,
    );

    return new Uint8Array(Buffer.concat(chunks));
  }
}
