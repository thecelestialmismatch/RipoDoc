/**
 * Index of every clickable figure in a report.
 *
 * Reached from the "All figures in this report" link on an evidence page, and
 * useful when a recipient is reading the PDF on a device where opening links is
 * awkward. Shows labels and row counts only — never the rows themselves, which
 * stay behind their own scoped page.
 */

import Link from 'next/link';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { recordAccess } from '@/lib/evidence/audit.ts';
import { evidenceSecret, revokedTokenIds } from '@/lib/evidence/config.ts';
import { currentUnixSeconds } from '@/lib/evidence/clock.ts';
import { loadManifest } from '@/lib/evidence/store.ts';
import { failureMessage, hashRecipient, verifyEvidenceToken } from '@/lib/evidence/token.ts';

export const dynamic = 'force-dynamic';

interface PageProps {
  readonly params: Promise<{ readonly token: string }>;
}

const KIND_LABEL: Readonly<Record<string, string>> = {
  kpi: 'Figure',
  'bar-chart': 'Chart',
  claim: 'Claim',
};

export default async function ReportIndexPage({ params }: PageProps) {
  const { token } = await params;

  const verified = verifyEvidenceToken(token, evidenceSecret(), {
    now: await currentUnixSeconds(),
    revoked: revokedTokenIds(),
  });

  if (!verified.ok) {
    await recordAccess({ outcome: 'denied', reason: verified.reason });
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <div className="flex items-center gap-3">
            <AlertTriangle aria-hidden="true" className="h-5 w-5" />
            <h1 className="text-lg font-semibold">Report unavailable</h1>
          </div>
          <p className="mt-3 text-sm">{failureMessage(verified.reason)}</p>
        </div>
      </main>
    );
  }

  const { claims } = verified;
  const manifest = await loadManifest(claims.reportId);
  const recipientMatches =
    manifest !== undefined && hashRecipient(manifest.recipient.email) === claims.recipientHash;

  if (!manifest || manifest.version !== claims.version || !recipientMatches) {
    await recordAccess({
      outcome: 'denied',
      jti: claims.jti,
      reportId: claims.reportId,
      reason: manifest ? 'version-or-recipient-mismatch' : 'unknown-report',
    });
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <h1 className="text-lg font-semibold">Report unavailable</h1>
          <p className="mt-3 text-sm">
            This report version is no longer published. Ask your provider for the current report.
          </p>
        </div>
      </main>
    );
  }

  await recordAccess({
    outcome: 'granted',
    reportId: manifest.reportId,
    version: manifest.version,
    jti: claims.jti,
    recipientHash: claims.recipientHash,
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
        {manifest.provider}
      </p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">{manifest.title}</h1>
      <p className="mt-2 text-sm text-slate-600">
        {manifest.client} · {manifest.periodLabel} · version {manifest.version}
      </p>

      <ul className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {manifest.elements.map((element) => (
          <li key={element.id}>
            <Link
              href={`/e/${token}/${encodeURIComponent(element.id)}`}
              className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-50"
            >
              <span>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {KIND_LABEL[element.kind] ?? 'Figure'}
                </span>
                <span className="block text-sm font-medium text-slate-900">
                  {element.value ? `${element.value} — ` : ''}
                  {element.label}
                </span>
                <span className="block text-xs text-slate-500">
                  {element.evidence.table.rows.length} supporting{' '}
                  {element.evidence.table.rows.length === 1 ? 'row' : 'rows'}
                </span>
              </span>
              <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" />
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-xs text-slate-500">
        Shared with {manifest.recipient.name}. Every figure opens only the rows approved for this
        report version, and every access is logged.
      </p>
    </main>
  );
}
