import {
  BadgeCheck,
  Clock3,
  Database,
  FileCheck2,
  FileText,
  LockKeyhole,
  ReceiptText,
  ShieldAlert,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import type { EvidenceDeliveryReceipt as EvidenceDeliveryReceiptModel } from '@/lib/evidence/operations.ts';

interface EvidenceDeliveryReceiptProps {
  readonly receipt: EvidenceDeliveryReceiptModel;
}

const formatDate = (value: string): string => new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(value));

const formatDateOnly = (value: string | undefined): string => value
  ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value))
  : 'Not declared';

/**
 * Operator-only receipt for delivery posture. Its input model intentionally
 * excludes raw recipient addresses, signed token material, source queries,
 * and supporting evidence rows.
 */
export function EvidenceDeliveryReceipt({ receipt }: EvidenceDeliveryReceiptProps) {
  const totalEvents = receipt.audit.granted + receipt.audit.denied;
  const ready = receipt.status === 'ready';

  return <section className="border border-[#141111] bg-[#fff9ef]" aria-labelledby="delivery-receipt-title">
    <div className="border-b border-[#141111] bg-[#141111] px-5 py-5 text-[#f8f0df]">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center bg-[#e8442e]"><ReceiptText className="h-5 w-5" aria-hidden="true" /></span>
        <div className="min-w-0">
          <p className="stage-kicker text-[#ff9b88]">Delivery posture record</p>
          <h3 id="delivery-receipt-title" className="mt-1 text-lg font-extrabold tracking-[-0.04em]">Evidence Delivery Receipt</h3>
          <p className="mt-1 text-xs leading-5 text-[#f8f0df]/70">A report-version record for one reviewed claim—not a compliance verdict.</p>
        </div>
      </div>
    </div>

    <div className="space-y-5 p-5">
      <div className={`border p-3.5 ${ready ? 'border-[#1f6146]/30 bg-[#d9f0dc]' : 'border-[#8c3d00]/30 bg-[#ffe2b8]'}`}>
        <div className="flex items-center gap-2">
          {ready ? <BadgeCheck className="h-4 w-4 text-[#1f6146]" aria-hidden="true" /> : <ShieldAlert className="h-4 w-4 text-[#8c3d00]" aria-hidden="true" />}
          <p className={`text-sm font-bold ${ready ? 'text-[#1f6146]' : 'text-[#8c3d00]'}`}>{ready ? 'Ready for a controlled handoff' : 'Delivery posture needs attention'}</p>
        </div>
        <p className="mt-1.5 text-xs leading-5 text-[#655c55]">Status is calculated from declared immutable manifest facts. It does not verify the source system or how a recipient acts after viewing.</p>
      </div>

      <div className="grid gap-4 border-y border-[#141111]/15 py-5">
        <ReceiptFact icon={FileText} label="Report scope" value={`${receipt.reportTitle} · ${receipt.reportId} · v${receipt.version}`} />
        <ReceiptFact icon={Clock3} label="Published" value={formatDate(receipt.publishedAt)} />
        {receipt.claimReference ? <>
          <ReceiptFact icon={FileCheck2} label="Selected claim" value={`${receipt.claimReference.label} · ${receipt.claimReference.id}`} />
          <ReceiptFact icon={BadgeCheck} label="Review record" value={`${receipt.claimReference.reviewer} · approved ${formatDateOnly(receipt.claimReference.approvedAt)}`} />
        </> : <ReceiptFact icon={ShieldAlert} label="Selected claim" value="No reviewed claim is declared in this report version." />}
        <ReceiptFact icon={Database} label="Declared source" value={receipt.sourceDeclaration} />
        <ReceiptFact icon={Clock3} label="Source captured" value={formatDateOnly(receipt.sourceCapturedAt)} />
        <ReceiptFact icon={UsersRound} label="Recipient-safe reference" value={receipt.recipientReference} />
      </div>

      <div className="space-y-3">
        <ReceiptFact icon={LockKeyhole} label="Delivery condition" value={receipt.deliveryCondition} compact />
        <ReceiptFact icon={Clock3} label="Expiry condition" value={receipt.expiryCondition} compact />
      </div>

      <div className="border-t border-[#141111]/15 pt-5">
        <p className="text-xs font-bold uppercase tracking-[0.11em] text-[#857b72]">Durable access summary</p>
        {receipt.audit.status === 'durable' ? <div className="mt-3 grid grid-cols-2 gap-3">
          <AuditMetric label="Granted" value={receipt.audit.granted.toString()} />
          <AuditMetric label="Denied" value={receipt.audit.denied.toString()} />
          <p className="col-span-2 text-xs leading-5 text-[#655c55]">{totalEvents === 0
            ? 'No access events have been recorded for this report version yet.'
            : receipt.audit.lastEventAt
              ? `Most recent access event: ${formatDate(receipt.audit.lastEventAt)}.${receipt.audit.lastGrantedAt ? ` Most recent granted access: ${formatDate(receipt.audit.lastGrantedAt)}.` : ''}`
              : 'Access activity was recorded for this report version.'}</p>
        </div> : <p className="mt-3 text-xs leading-5 text-[#655c55]">No durable access summary is configured in this deployment. The receipt remains a declared delivery-posture record; it does not invent delivery analytics.</p>}
      </div>

      <p className="border-l-4 border-[#e8442e] bg-[#f7ecdc] px-3 py-2.5 text-xs leading-5 text-[#655c55]">This receipt intentionally omits recipient addresses, signed-link material, source queries, and supporting rows. It records delivery posture and aggregate access activity only; it is not a compliance, source-accuracy, forwarding-prevention, or recipient-comprehension determination.</p>
    </div>
  </section>;
}

function ReceiptFact({ icon: Icon, label, value, compact = false }: { readonly icon: LucideIcon; readonly label: string; readonly value: string; readonly compact?: boolean }) {
  return <div className="flex gap-3"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#b52e20]" aria-hidden="true" /><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[0.1em] text-[#857b72]">{label}</p><p className={`mt-1 break-words font-semibold text-[#141111] ${compact ? 'text-xs leading-5' : 'text-sm leading-5'}`}>{value}</p></div></div>;
}

function AuditMetric({ label, value }: { readonly label: string; readonly value: string }) {
  return <div className="border border-[#141111]/15 bg-[#f7ecdc] p-3"><p className="text-xl font-extrabold tracking-[-0.05em] text-[#141111]">{value}</p><p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-[#655c55]">{label}</p></div>;
}
