import { LOCAL_COMPOSER_MAX_BYTES, LOCAL_COMPOSER_MAX_PAGES, LOCAL_COMPOSER_MAX_TEXT, type LocalComposerError, type LocalDocument } from './types.ts';

const PDF_HEADER = '%PDF-';

const localError = (code: LocalComposerError['code'], message: string): LocalComposerError => ({ code, message });

export async function readLocalPdf(file: File): Promise<{ readonly document?: LocalDocument; readonly error?: LocalComposerError }> {
  if (file.size === 0) return { error: localError('empty', 'This file is empty. Select a non-empty PDF stored on this device.') };
  if (file.size > LOCAL_COMPOSER_MAX_BYTES) return { error: localError('too-large', `This local-only preview accepts PDFs up to ${Math.round(LOCAL_COMPOSER_MAX_BYTES / (1024 * 1024))} MB.`) };
  if (file.type && file.type !== 'application/pdf') return { error: localError('not-pdf', 'Only application/pdf files are accepted. The file was not read or uploaded.') };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const header = new TextDecoder('latin1').decode(bytes.slice(0, PDF_HEADER.length));
  if (header !== PDF_HEADER) return { error: localError('not-pdf', 'The selected file does not contain a valid PDF header. Its contents were not processed.') };

  let destroyTask: (() => Promise<void>) | undefined;
  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = new URL('../../../node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs', import.meta.url).toString();
    const loadingTask = pdfjs.getDocument({ data: bytes, disableFontFace: true, useWorkerFetch: false, stopAtErrors: true });
    destroyTask = () => loadingTask.destroy();
    const pdf = await loadingTask.promise;
    if (pdf.numPages > LOCAL_COMPOSER_MAX_PAGES) return { error: localError('page-limit', `This local-only preview accepts up to ${LOCAL_COMPOSER_MAX_PAGES} pages. The file was not retained.`) };

    const pages: string[] = [];
    let total = 0;
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => 'str' in item ? item.str : '').join(' ').replace(/\s+/g, ' ').trim();
      if (!pageText) continue;
      const remaining = LOCAL_COMPOSER_MAX_TEXT - total;
      if (remaining <= 0) break;
      const safeText = pageText.slice(0, remaining);
      pages.push(`Page ${pageNumber}\n${safeText}`);
      total += safeText.length;
    }
    const extractedText = pages.join('\n\n');
    if (!extractedText) return { error: localError('no-text', 'No selectable text was found. This local-only mode does not send image-only or scanned PDFs to cloud OCR; use a text-based PDF or add a local question list manually.') };
    return { document: { fileName: file.name, byteLength: file.size, pageCount: pdf.numPages, extractedText, extractedAt: new Date().toISOString() } };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Unknown parser failure';
    const encrypted = /password|encrypted/i.test(message);
    return { error: localError(encrypted ? 'encrypted-or-invalid' : 'unexpected', encrypted ? 'This PDF is encrypted or password-protected. Remove protection locally before opening it in the composer.' : 'The browser could not read this PDF locally. The file was not uploaded, stored, or sent anywhere.') };
  } finally {
    await destroyTask?.().catch(() => undefined);
    try { bytes.fill(0); } catch { /* PDF.js may detach bytes after transferring them to its local worker. */ }
  }
}
