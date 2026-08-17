import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Clock3, FileCheck2, LockKeyhole, ShieldCheck } from 'lucide-react';
import { ProofBrief } from '@/components/evidence/ProofBrief.tsx';
import { EvidenceGrid } from '@/components/evidence/EvidenceGrid.tsx';
import { recordAccess } from '@/lib/evidence/audit.ts';
import { evidenceSecret, exportsEnabled, revokedTokenIds } from '@/lib/evidence/config.ts';
import { currentUnixSeconds } from '@/lib/evidence/clock.ts';
import { loadManifest } from '@/lib/evidence/store.ts';
import { failureMessage, hashRecipient, verifyEvidenceToken } from '@/lib/evidence/token.ts';
import { findElement } from '@/lib/evidence/types.ts';
import { hasRecipientProof } from '@/lib/evidence/recipient-proof.ts';
import { recordFounderEvent } from '@/lib/founder/events.ts';

export const dynamic = 'force-dynamic';

interface PageProps { readonly params: Promise<{ readonly token: string; readonly elementId: string }>; }

function Denied({ message }: { message: string }) {
  return <main className="min-h-screen bg-[#f8f0df] px-5 py-12 text-[#141111] sm:px-6 sm:py-16"><section className="mx-auto max-w-xl border border-[#141111] bg-[#fff9ef]"><div className="border-b border-[#141111] bg-[#e8442e] px-6 py-5 text-[#f8f0df]"><div className="flex items-center gap-3"><AlertTriangle aria-hidden="true" className="h-5 w-5" /><p className="stage-kicker text-[#ffb2a3]">Evidence delivery</p></div><h1 className="mt-3 text-2xl font-extrabold tracking-[-0.05em]">Evidence unavailable</h1></div><div className="p-6"><p className="text-sm leading-6 text-[#655c55]">{message}</p><div className="mt-5 border-l-4 border-[#e8442e] bg-[#f7ecdc] p-4 text-xs leading-5 text-[#655c55]">Evidence links are recipient-bound, time-limited, and independently verified before supporting rows render. This protects report data; it does not indicate a problem with your device.</div></div></section></main>;
}

export default async function EvidencePage({ params }: PageProps) {
  const { token, elementId } = await params;
  if (!(await hasRecipientProof(token))) redirect(`/e/${encodeURIComponent(token)}/access`);

  const verified = verifyEvidenceToken(token, evidenceSecret(), { now: await currentUnixSeconds(), revoked: revokedTokenIds() });
  if (!verified.ok) {
    await recordAccess({ outcome: 'denied', elementId, reason: verified.reason });
    return <Denied message={failureMessage(verified.reason)} />;
  }

  const { claims } = verified;
  const manifest = await loadManifest(claims.reportId);
  if (!manifest || manifest.version !== claims.version) {
    await recordAccess({ outcome: 'denied', elementId, jti: claims.jti, reportId: claims.reportId, reason: 'version-superseded' });
    return <Denied message="This report version is no longer published. Ask your provider for the current report." />;
  }
  if (hashRecipient(manifest.recipient.email) !== claims.recipientHash) {
    await recordAccess({ outcome: 'denied', elementId, jti: claims.jti, reportId: claims.reportId, reason: 'recipient-mismatch' });
    return <Denied message="This evidence link is not valid." />;
  }

  const element = findElement(manifest, elementId);
  if (!element) {
    await recordAccess({ outcome: 'denied', elementId, jti: claims.jti, reportId: claims.reportId, reason: 'unknown-element' });
    return <Denied message="That figure is not part of this report." />;
  }

  await recordAccess({ outcome: 'granted', reportId: manifest.reportId, version: manifest.version, elementId: element.id, jti: claims.jti, recipientHash: claims.recipientHash });
  await recordFounderEvent({ eventType: 'evidence_opened', metadata: { result: 'granted', element_type_band: element.kind } });

  const { evidence } = element;
  const expires = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(claims.expiresAt * 1000));

  return <main className="min-h-screen bg-[#f8f0df] text-[#141111]">
    <section className="border-b border-[#141111] bg-[#141111] text-[#f8f0df]"><div className="mx-auto max-w-6xl px-5 py-6 sm:px-6"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center bg-[#e8442e]"><ShieldCheck className="h-5 w-5" aria-hidden="true" /></div><div><p className="stage-kicker text-[#ff9b88]">RipoDoc evidence delivery</p><p className="mt-1 text-sm text-[#f8f0df]/70">Verified, scoped evidence behind one reported figure</p></div></div><Link href={`/e/${token}`} className="inline-flex min-h-11 items-center gap-2 border border-[#f8f0df]/35 px-4 py-2 text-sm font-bold text-[#f8f0df] transition hover:bg-[#e8442e]"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> All figures in this report</Link></div></div></section>
    <div className="mx-auto max-w-6xl px-5 py-9 sm:px-6 lg:py-12"><header className="border-b border-[#141111]/20 pb-8"><p className="stage-kicker text-[#b52e20]">{manifest.provider} <span aria-hidden="true">·</span> {manifest.periodLabel}</p><div className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end"><div><h1 className="max-w-4xl text-4xl font-extrabold tracking-[-0.065em] sm:text-5xl">{evidence.title}</h1><p className="mt-4 max-w-3xl text-base leading-7 text-[#655c55]">A bounded source view is ready for the selected report claim. The report stays concise; this scene carries the inspected detail.</p></div><div className="border border-[#1f6146]/30 bg-[#d9f0dc] p-4"><p className="flex items-center gap-2 text-sm font-bold text-[#1f6146]"><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Recipient proof confirmed</p><p className="mt-2 text-xs leading-5 text-[#1f6146]/85">Mailbox proof was completed before the report’s supporting rows were released.</p></div></div></header>
      <div className="mt-8"><ProofBrief manifest={manifest} element={element} expiresOn={expires} /></div>
      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]"><div className="min-w-0"><div className="border border-[#141111] bg-[#fff9ef] p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="stage-kicker text-[#b52e20]">Evidence table</p><h2 className="mt-2 text-2xl font-extrabold tracking-[-0.05em]">Approved source rows</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#655c55]">Only the approved detail supporting this figure is shown. The rest of the report dataset remains outside this view.</p></div><FileCheck2 className="h-5 w-5 text-[#b52e20]" aria-hidden="true" /></div><div className="mt-6"><EvidenceGrid table={evidence.table} exportName={`${manifest.reportId}-${element.id}`} canExport={exportsEnabled()} /></div></div><section className="mt-6 border border-[#141111] bg-[#f7ecdc] p-5 sm:p-6"><p className="stage-kicker text-[#b52e20]">Calculation provenance</p><h2 className="mt-2 text-lg font-bold">How this figure was calculated</h2><p className="mt-3 break-words font-mono text-xs leading-6 text-[#655c55]">{evidence.provenance.sourceSystem} — {evidence.provenance.sourceQuery}</p></section></div>
        <aside className="space-y-4"><section className="border border-[#141111] bg-[#fff9ef] p-5"><LockKeyhole className="h-5 w-5 text-[#b52e20]" aria-hidden="true" /><h2 className="mt-4 text-base font-bold">Access receipt</h2><dl className="mt-4 space-y-4 text-sm"><ReceiptItem label="Report scope" value={`${manifest.reportId} v${manifest.version}`} /><ReceiptItem label="Recipient" value={manifest.recipient.name} /><ReceiptItem label="Evidence figure" value={element.id} /></dl></section><section className="border border-[#141111] bg-[#141111] p-5 text-[#f8f0df]"><Clock3 className="h-5 w-5 text-[#ff9b88]" aria-hidden="true" /><h2 className="mt-4 text-base font-bold">Delivery controls</h2><p className="mt-2 text-sm leading-6 text-[#f8f0df]/72">Approved by <strong className="text-[#f8f0df]">{evidence.provenance.approvedBy}</strong> on {evidence.provenance.approvedAt.slice(0, 10)}.</p><p className="mt-3 text-sm leading-6 text-[#f8f0df]/72">This recipient-bound link expires <strong className="text-[#f8f0df]">{expires}</strong>. Every access is recorded before evidence renders.</p></section></aside>
      </section>
    </div>
  </main>;
}

function ReceiptItem({ label, value }: { label: string; value: string }) { return <div><dt className="text-[#857b72]">{label}</dt><dd className="mt-1 break-words font-semibold text-[#141111]">{value}</dd></div>; }
