/**
 * The evidence page — where a click inside the PDF lands.
 *
 * Scoping rule: this page renders one element of one report version for one
 * recipient. It never exposes the rest of the report's data.
 */

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Clock, FileCheck2, LockKeyhole, ShieldCheck } from 'lucide-react';
import { EvidenceGrid } from '@/components/evidence/EvidenceGrid.tsx';
import { recordAccess } from '@/lib/evidence/audit.ts';
import { evidenceSecret, exportsEnabled, revokedTokenIds } from '@/lib/evidence/config.ts';
import { currentUnixSeconds } from '@/lib/evidence/clock.ts';
import { loadManifest } from '@/lib/evidence/store.ts';
import { failureMessage, hashRecipient, verifyEvidenceToken } from '@/lib/evidence/token.ts';
import { findElement } from '@/lib/evidence/types.ts';
import { hasRecipientProof } from '@/lib/evidence/recipient-proof.ts';

export const dynamic = 'force-dynamic';

interface PageProps {
  readonly params: Promise<{ readonly token: string; readonly elementId: string }>;
}

function Denied({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <section className="mx-auto max-w-xl rounded-2xl border border-amber-200 bg-white p-7 shadow-sm">
        <div className="flex items-center gap-3 text-amber-900">
          <AlertTriangle aria-hidden="true" className="h-5 w-5" />
          <h1 className="text-lg font-semibold">Evidence unavailable</h1>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-700">{message}</p>
        <div className="mt-5 rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-900">
          Evidence links are recipient-bound, time-limited, and independently verified before the underlying data is shown. This protects the report data; it does not indicate a problem with your device.
        </div>
      </section>
    </main>
  );
}

export default async function EvidencePage({ params }: PageProps) {
  const { token, elementId } = await params;
  if (!(await hasRecipientProof(token))) redirect(`/e/${encodeURIComponent(token)}/access`);

  const verified = verifyEvidenceToken(token, evidenceSecret(), {
    now: await currentUnixSeconds(),
    revoked: revokedTokenIds(),
  });

  if (!verified.ok) {
    await recordAccess({ outcome: 'denied', elementId, reason: verified.reason });
    return <Denied message={failureMessage(verified.reason)} />;
  }

  const { claims } = verified;
  const manifest = await loadManifest(claims.reportId);

  if (!manifest || manifest.version !== claims.version) {
    await recordAccess({
      outcome: 'denied',
      elementId,
      jti: claims.jti,
      reportId: claims.reportId,
      reason: 'version-superseded',
    });
    return <Denied message="This report version is no longer published. Ask your provider for the current report." />;
  }

  if (hashRecipient(manifest.recipient.email) !== claims.recipientHash) {
    await recordAccess({
      outcome: 'denied',
      elementId,
      jti: claims.jti,
      reportId: claims.reportId,
      reason: 'recipient-mismatch',
    });
    return <Denied message="This evidence link is not valid." />;
  }

  const element = findElement(manifest, elementId);
  if (!element) {
    await recordAccess({
      outcome: 'denied',
      elementId,
      jti: claims.jti,
      reportId: claims.reportId,
      reason: 'unknown-element',
    });
    return <Denied message="That figure is not part of this report." />;
  }

  await recordAccess({
    outcome: 'granted',
    reportId: manifest.reportId,
    version: manifest.version,
    elementId: element.id,
    jti: claims.jti,
    recipientHash: claims.recipientHash,
  });

  const { evidence } = element;
  const expires = new Date(claims.expiresAt * 1000).toISOString().slice(0, 10);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-300/15 ring-1 ring-cyan-200/20">
                <ShieldCheck className="h-5 w-5 text-cyan-200" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">RipoDoc evidence delivery</p>
                <p className="mt-1 text-sm text-slate-300">Verified, scoped evidence behind one reported figure</p>
              </div>
            </div>
            <Link href={`/e/${token}`} className="inline-flex items-center gap-2 text-sm font-bold text-cyan-200 hover:text-cyan-100">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All figures in this report
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-10 lg:py-12">
        <header className="grid gap-7 border-b border-slate-200 pb-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">{manifest.provider} <span aria-hidden="true">·</span> {manifest.periodLabel}</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{evidence.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{evidence.summary}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-900"><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Recipient proof confirmed</div>
            <p className="mt-2 text-sm leading-6 text-emerald-800">This view is released only after mailbox verification and is recorded in the evidence access audit trail.</p>
          </div>
        </header>

        <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-700">Evidence table</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950">Approved source rows</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Only the approved detail supporting this figure is shown. The rest of the report dataset remains outside this view.</p>
                </div>
                <FileCheck2 className="h-5 w-5 text-blue-600" aria-hidden="true" />
              </div>
              <div className="mt-6">
                <EvidenceGrid table={evidence.table} exportName={`${manifest.reportId}-${element.id}`} canExport={exportsEnabled()} />
              </div>
            </div>

            <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-800">Calculation provenance</p>
              <h2 className="mt-2 text-lg font-bold text-blue-950">How this figure was calculated</h2>
              <p className="mt-3 break-words font-mono text-xs leading-6 text-blue-900">{evidence.provenance.sourceSystem} — {evidence.provenance.sourceQuery}</p>
            </section>
          </div>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <LockKeyhole className="h-5 w-5 text-slate-700" aria-hidden="true" />
              <h2 className="mt-4 text-base font-bold text-slate-950">Access receipt</h2>
              <dl className="mt-4 space-y-4 text-sm">
                <div><dt className="text-slate-500">Report scope</dt><dd className="mt-1 font-semibold text-slate-900">{manifest.reportId} v{manifest.version}</dd></div>
                <div><dt className="text-slate-500">Recipient</dt><dd className="mt-1 font-semibold text-slate-900">{manifest.recipient.name}</dd></div>
                <div><dt className="text-slate-500">Evidence figure</dt><dd className="mt-1 font-semibold text-slate-900">{element.id}</dd></div>
              </dl>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <Clock className="h-5 w-5 text-cyan-700" aria-hidden="true" />
              <h2 className="mt-4 text-base font-bold text-slate-950">Delivery controls</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Approved by <strong className="text-slate-800">{evidence.provenance.approvedBy}</strong> on {evidence.provenance.approvedAt.slice(0, 10)}.</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">This recipient-bound link expires <strong className="text-slate-800">{expires}</strong>. Every access is recorded before evidence renders.</p>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
