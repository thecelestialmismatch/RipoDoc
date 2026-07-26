/**
 * The evidence page — where a click inside the PDF lands.
 *
 * Scoping rule: this page renders **one element** of **one report version**,
 * for **one recipient**. It never exposes the rest of the report's data, which
 * is the difference between this and the unauthenticated dashboard link that
 * inspired the product (`docs/01-research/mspbots-teardown.md`).
 */

import Link from 'next/link';
import { AlertTriangle, ArrowLeft, Clock, ShieldCheck } from 'lucide-react';
import { EvidenceGrid } from '@/components/evidence/EvidenceGrid.tsx';
import { recordAccess } from '@/lib/evidence/audit.ts';
import { evidenceSecret, exportsEnabled, revokedTokenIds } from '@/lib/evidence/config.ts';
import { currentUnixSeconds } from '@/lib/evidence/clock.ts';
import { loadManifest } from '@/lib/evidence/store.ts';
import { failureMessage, hashRecipient, verifyEvidenceToken } from '@/lib/evidence/token.ts';
import { findElement } from '@/lib/evidence/types.ts';

export const dynamic = 'force-dynamic';

interface PageProps {
  readonly params: Promise<{ readonly token: string; readonly elementId: string }>;
}

function Denied({ message }: { message: string }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-center gap-3 text-amber-900">
          <AlertTriangle aria-hidden="true" className="h-5 w-5" />
          <h1 className="text-lg font-semibold">Evidence unavailable</h1>
        </div>
        <p className="mt-3 text-sm text-amber-900">{message}</p>
        <p className="mt-4 text-xs text-amber-800">
          Evidence links are bound to a single recipient and expire. This protects the data in
          your report — it is not a fault with your device.
        </p>
      </div>
    </main>
  );
}

export default async function EvidencePage({ params }: PageProps) {
  const { token, elementId } = await params;

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
    return (
      <Denied message="This report version is no longer published. Ask your provider for the current report." />
    );
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
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href={`/e/${token}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        All figures in this report
      </Link>

      <header className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
          {manifest.provider} · {manifest.periodLabel}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{evidence.title}</h1>
        <p className="mt-2 text-sm text-slate-600">{evidence.summary}</p>
      </header>

      <section className="mt-5 rounded-md bg-blue-50 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-blue-800">
          How this figure was calculated
        </h2>
        <p className="mt-1 font-mono text-xs break-words text-blue-900">
          {evidence.provenance.sourceSystem} — {evidence.provenance.sourceQuery}
        </p>
      </section>

      <div className="mt-5">
        <EvidenceGrid
          table={evidence.table}
          exportName={`${manifest.reportId}-${element.id}`}
          canExport={exportsEnabled()}
        />
      </div>

      <footer className="mt-6 grid gap-3 text-xs text-slate-600 sm:grid-cols-2">
        <p className="inline-flex items-start gap-2">
          <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <span>
            Approved by <strong>{evidence.provenance.approvedBy}</strong> on{' '}
            {evidence.provenance.approvedAt.slice(0, 10)}. Published as{' '}
            {manifest.reportId} v{manifest.version} — this version is immutable.
          </span>
        </p>
        <p className="inline-flex items-start gap-2">
          <Clock aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <span>
            Shared with {manifest.recipient.name}. This link expires {expires} and every
            access is logged.
          </span>
        </p>
      </footer>
    </main>
  );
}
