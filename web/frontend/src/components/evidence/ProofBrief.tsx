import { BadgeCheck, Clock3, Database, FileCheck2, LockKeyhole, ShieldCheck } from 'lucide-react';
import type { ReportElement, ReportManifest } from '@/lib/evidence/types.ts';

interface ProofBriefProps {
  readonly manifest: ReportManifest;
  readonly element: ReportElement;
  readonly expiresOn: string;
}

const dateOnly = (value: string | undefined): string => value ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value)) : 'Not declared';

/**
 * A concise, manifest-derived explanation of one evidence handoff. It intentionally
 * avoids material from sibling report figures and makes no compliance conclusion.
 */
export function ProofBrief({ manifest, element, expiresOn }: ProofBriefProps) {
  const { evidence } = element;
  return <section className="border border-[#141111] bg-[#fff9ef]" aria-labelledby="proof-brief-title">
    <div className="flex flex-col gap-4 border-b border-[#141111]/15 bg-[#f7ecdc] px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
      <div><p className="stage-kicker text-[#b52e20]">Proof brief / selected claim</p><h2 id="proof-brief-title" className="mt-2 text-xl font-extrabold tracking-[-0.04em]">What this evidence can answer.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#655c55]">{evidence.summary}</p></div>
      <span className="inline-flex w-fit items-center gap-2 border border-[#1f6146]/25 bg-[#d9f0dc] px-3 py-2 text-xs font-bold text-[#1f6146]"><BadgeCheck className="h-4 w-4" aria-hidden="true" /> Reviewed handoff</span>
    </div>
    <div className="grid divide-y divide-[#141111]/15 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
      <BriefFact icon={FileCheck2} label="Included support" value={`${evidence.table.rows.length} approved row${evidence.table.rows.length === 1 ? '' : 's'} across ${evidence.table.columns.length} declared field${evidence.table.columns.length === 1 ? '' : 's'}.`} />
      <BriefFact icon={Database} label="Declared source" value={`${evidence.provenance.sourceSystem} · captured ${dateOnly(manifest.source?.capturedAt)}.`} />
      <BriefFact icon={ShieldCheck} label="Review record" value={`Approved by ${evidence.provenance.approvedBy} on ${dateOnly(evidence.provenance.approvedAt)}.`} />
      <BriefFact icon={LockKeyhole} label="Delivery condition" value={`Recipient proof is required. This report version expires ${expiresOn}.`} />
    </div>
    <div className="border-t border-[#141111]/15 bg-[#141111] px-5 py-4 text-xs leading-5 text-[#f8f0df]/78 sm:px-6"><span className="font-bold text-[#f8f0df]">Boundary:</span> This view contains only approved detail linked to this selected report figure. It does not expose the full report dataset, create a portal login, or make a compliance determination.</div>
  </section>;
}

function BriefFact({ icon: Icon, label, value }: { readonly icon: typeof Clock3; readonly label: string; readonly value: string }) {
  return <div className="p-5 sm:p-6"><Icon className="h-4 w-4 text-[#b52e20]" aria-hidden="true" /><p className="mt-3 text-xs font-bold uppercase tracking-[0.11em] text-[#857b72]">{label}</p><p className="mt-1.5 text-sm font-semibold leading-6 text-[#141111]">{value}</p></div>;
}
