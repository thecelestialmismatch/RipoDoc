import type { ReportManifest } from '../evidence/types.ts';
import type { ApprovedSource, ComposerReceipt, DraftStatus, EvidenceStrength, QuestionDraft, SourceCitation } from './types.ts';

const STOP_WORDS = new Set(['a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'can', 'do', 'for', 'from', 'have', 'how', 'in', 'is', 'it', 'of', 'on', 'or', 'our', 'please', 'the', 'this', 'to', 'we', 'what', 'when', 'where', 'which', 'who', 'with', 'you', 'your']);
const MAX_QUESTION_LENGTH = 420;
const MAX_QUESTIONS = 80;

const clean = (value: string) => value.replace(/\s+/g, ' ').trim();
const tokenise = (value: string) => [...new Set((value.toLowerCase().match(/[a-z0-9][a-z0-9-]{2,}/g) ?? []).filter((token) => !STOP_WORDS.has(token)))];
const compact = (value: string, max = 280) => value.length <= max ? value : `${value.slice(0, Math.max(0, max - 1)).trimEnd()}…`;

export function approvedSourcesFromReports(reports: readonly ReportManifest[]): readonly ApprovedSource[] {
  return reports.flatMap((report) => report.elements.map((element) => {
    const source = report.source ? `${report.source.system} · ${report.source.description}` : element.evidence.provenance.sourceSystem;
    const provenance = `${source} · approved by ${element.evidence.provenance.approvedBy} on ${new Date(element.evidence.provenance.approvedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}`;
    const summary = clean([element.caption, element.evidence.title, element.evidence.summary].filter(Boolean).join(' '));
    return {
      sourceId: `${report.reportId}:${element.id}`,
      reportId: report.reportId,
      reportTitle: report.title,
      client: report.client,
      elementId: element.id,
      label: element.label,
      summary,
      provenance,
      approvedBy: element.evidence.provenance.approvedBy,
      approvedAt: element.evidence.provenance.approvedAt,
      searchText: clean([report.title, report.client, report.periodLabel, element.label, element.caption, element.evidence.title, element.evidence.summary, element.evidence.provenance.sourceSystem, element.evidence.provenance.sourceQuery].filter(Boolean).join(' ')),
    };
  }));
}

export function extractCandidateQuestions(extractedText: string): readonly string[] {
  const lines = extractedText.replace(/\s+(?=\d{1,3}[.)]\s+)/g, '\n').split(/\r?\n/).map(clean).filter(Boolean);
  const candidates: string[] = [];
  const add = (value: string) => {
    const normalized = clean(value.replace(/^\s*(?:\d+[.)]|[a-z][.)]|[-•])\s*/i, ''));
    if (normalized.length < 12 || normalized.length > MAX_QUESTION_LENGTH || candidates.some((item) => item.toLowerCase() === normalized.toLowerCase())) return;
    candidates.push(normalized);
  };
  for (const line of lines) {
    if (line.endsWith('?')) add(line);
    else if (/^\s*(?:\d+[.)]|[a-z][.)])\s+.{12,}$/i.test(line) && /\b(do|does|is|are|can|will|describe|provide|confirm|explain|identify|state)\b/i.test(line)) add(line);
    if (candidates.length >= MAX_QUESTIONS) break;
  }
  if (candidates.length > 0) return candidates;
  const sentences = extractedText.match(/[^.!?\n]{12,420}[?]/g) ?? [];
  sentences.forEach(add);
  return candidates.slice(0, MAX_QUESTIONS);
}

function citation(source: ApprovedSource, score: number): SourceCitation {
  const excerpt = compact(source.summary || source.label, 300);
  return { sourceId: source.sourceId, label: source.label, reportTitle: source.reportTitle, elementId: source.elementId, provenance: source.provenance, approvedBy: source.approvedBy, approvedAt: source.approvedAt, excerpt, score, };
}

export function matchApprovedSources(question: string, sources: readonly ApprovedSource[]): readonly SourceCitation[] {
  const questionTokens = tokenise(question);
  if (questionTokens.length === 0) return [];
  return sources.map((source) => {
    const sourceText = source.searchText.toLowerCase();
    const matchedTerms = questionTokens.filter((term) => sourceText.includes(term));
    const labelBonus = tokenise(source.label).filter((term) => questionTokens.includes(term)).length * .25;
    const score = Math.min(1, (matchedTerms.length / questionTokens.length) + labelBonus);
    return { source, score, matchedTerms };
  }).filter((item) => item.score >= .18 && item.matchedTerms.length > 0)
    .sort((a, b) => b.score - a.score || a.source.label.localeCompare(b.source.label))
    .slice(0, 3)
    .map((item) => citation(item.source, Number(item.score.toFixed(2))));
}

const strengthFor = (citations: readonly SourceCitation[]): EvidenceStrength => {
  if (citations.length === 0) return 'missing';
  if ((citations[0]?.score ?? 0) >= .5) return 'strong';
  return 'partial';
};

const answerFor = (question: string, citations: readonly SourceCitation[], strength: EvidenceStrength): { readonly answer: string; readonly gaps: readonly string[]; readonly status: DraftStatus } => {
  if (strength === 'missing') return { answer: 'No approved evidence record in this workspace directly supports a response to this question. Add or select a reviewed source before sending a response.', gaps: ['No matching approved evidence record'], status: 'needs-evidence' };
  const primary = citations[0]!;
  if (strength === 'partial') return { answer: `A related approved record exists: “${primary.label}.” Its approved summary is: ${primary.excerpt} Review the scope before using this as a response to: ${question}`, gaps: ['Related evidence found, but direct coverage is incomplete'], status: 'needs-evidence' };
  return { answer: `According to the approved evidence record “${primary.label},” ${primary.excerpt} This draft is source-linked and still requires reviewer approval before external use.`, gaps: [], status: 'ready-for-review' };
};

export function createDrafts(questions: readonly string[], sources: readonly ApprovedSource[]): readonly QuestionDraft[] {
  return questions.map((question, index) => {
    const citations = matchApprovedSources(question, sources);
    const strength = strengthFor(citations);
    const response = answerFor(question, citations, strength);
    return { id: `draft-${index + 1}`, ordinal: index + 1, question, answer: response.answer, status: response.status, strength, citations, gaps: response.gaps, reviewerNote: '' };
  });
}

export function createComposerReceipt({ documentName, documentPages, sources, drafts }: { readonly documentName: string; readonly documentPages: number; readonly sources: readonly ApprovedSource[]; readonly drafts: readonly QuestionDraft[] }): ComposerReceipt {
  return { generatedAt: new Date().toISOString(), documentName, documentPages, localOnly: true, approvedSourcesConsidered: sources.length, questionsDetected: drafts.length, drafts };
}

export function reviewStatus(draft: QuestionDraft, status: DraftStatus, reviewerNote = draft.reviewerNote): QuestionDraft {
  if (status === 'approved' && (draft.strength !== 'strong' || draft.citations.length === 0)) return { ...draft, status: 'needs-evidence', reviewerNote: clean(reviewerNote || 'Approval blocked: a strong approved evidence source is required.') };
  return { ...draft, status, reviewerNote: clean(reviewerNote) };
}
