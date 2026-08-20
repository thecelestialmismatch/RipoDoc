import type { ComposerReceipt } from './types.ts';

const safe = (value: string) => value.replace(/[^\x20-\x7E]/g, '?');

export async function downloadLocalResponseRegister(receipt: ComposerReceipt): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'pt', format: 'letter', compress: true });
  const width = 612;
  const height = 792;
  const margin = 42;
  let y = 48;
  let page = 1;
  const navy = [8, 19, 34] as const;
  const ink = [30, 44, 61] as const;
  const muted = [92, 111, 132] as const;
  const red = [184, 54, 40] as const;
  const mint = [31, 97, 70] as const;
  const set = (size: number, color: readonly number[] = ink, bold = false) => { pdf.setFont('helvetica', bold ? 'bold' : 'normal'); pdf.setFontSize(size); pdf.setTextColor(color[0]!, color[1]!, color[2]!); };
  const rule = () => { pdf.setDrawColor(194, 207, 219); pdf.setLineWidth(.6); pdf.line(margin, y, width - margin, y); y += 14; };
  const footer = () => { pdf.setDrawColor(194, 207, 219); pdf.line(margin, height - 34, width - margin, height - 34); set(7, muted, true); pdf.text('RIPODOC / LOCAL-ONLY EVIDENCE COMPOSER', margin, height - 21); pdf.text(`PAGE ${page}`, width - margin - 30, height - 21); };
  const nextPage = () => { footer(); pdf.addPage(); page += 1; y = 48; };
  const paragraph = (value: string, size = 9, color: readonly number[] = ink, indent = 0, leading = 12) => { set(size, color); const lines = pdf.splitTextToSize(safe(value), width - margin * 2 - indent) as string[]; if (y + lines.length * leading > height - 58) nextPage(); lines.forEach((line, index) => pdf.text(line, margin + indent, y + index * leading)); y += lines.length * leading; };

  pdf.setFillColor(navy[0], navy[1], navy[2]); pdf.rect(0, 0, width, 112, 'F'); set(8, [84, 227, 182], true); pdf.text('RIPODOC / LOCAL RESPONSE REGISTER', margin, 42); set(22, [239, 247, 252], true); pdf.text('Evidence Composer output', margin, 76); set(8, [189, 207, 224]); pdf.text('Generated in this browser. No document or response was uploaded, stored, or sent to an AI service.', margin, 96); y = 142;
  set(8, red, true); pdf.text('LOCAL SESSION TRACE', margin, y); y += 15; paragraph(`Document: ${receipt.documentName} · ${receipt.documentPages} pages · ${receipt.questionsDetected} detected questions · ${receipt.approvedSourcesConsidered} approved workspace sources considered.`, 9); paragraph(`Created: ${new Date(receipt.generatedAt).toLocaleString()} · session-only: yes · server copy: none · external request: none.`, 8, muted); y += 6; rule();
  receipt.drafts.forEach((draft) => {
    if (y > height - 175) nextPage();
    set(8, red, true); pdf.text(`QUESTION ${String(draft.ordinal).padStart(2, '0')} / ${draft.status.toUpperCase()}`, margin, y); y += 15;
    paragraph(draft.question, 10, ink); y += 3;
    set(8, mint, true); pdf.text('SOURCE-LINKED DRAFT', margin, y); y += 14;
    paragraph(draft.answer, 9, ink);
    if (draft.gaps.length) { set(8, red, true); pdf.text('GAP', margin, y); y += 13; paragraph(draft.gaps.join(' · '), 8, red); }
    if (draft.citations.length) { set(8, mint, true); pdf.text('APPROVED EVIDENCE REFERENCES', margin, y); y += 13; draft.citations.forEach((citation) => paragraph(`${citation.label} [${citation.reportTitle} / ${citation.elementId}] — ${citation.provenance}`, 8, muted, 12, 10)); }
    if (draft.reviewerNote) { set(8, muted, true); pdf.text('REVIEWER NOTE', margin, y); y += 13; paragraph(draft.reviewerNote, 8, muted); }
    y += 8; rule();
  });
  footer();
  pdf.save('ripodoc-local-evidence-response-register.pdf');
}
