import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import { query, transaction } from '@/lib/auth/database.ts';
import { isEmail, normalizeEmail, privacyHash } from '@/lib/auth/primitives.ts';
import { encryptLeadEmail } from './lead-crypto.ts';

const sizeBands = new Set(['1-19', '20-49', '50-149', '150-plus', 'not-sure']);
const reportingToolBands = new Set(['manual', 'bi', 'msp-reporting', 'portal', 'mixed', 'other']);
const interestModes = new Set(['hosted', 'self-hosted', 'not-sure']);
const sources = new Set(['website', 'direct', 'referral', 'event', 'other']);

export interface FoundingPartnerLeadInput {
  readonly contactName: string;
  readonly companyName: string;
  readonly email: string;
  readonly companySizeBand: string;
  readonly reportingToolBand: string;
  readonly interestMode: string;
  readonly source: string;
  readonly crmSyncConsent: boolean;
  readonly ip: string;
}

/** A server-only, explicitly consented payload. It never includes report or evidence data. */
export interface CrmSyncLead {
  readonly leadId: string;
  readonly contactName: string;
  readonly companyName: string;
  readonly email: string;
  readonly companySizeBand: string;
  readonly reportingToolBand: string;
  readonly interestMode: string;
  readonly source: string;
}

const cleanText = (value: string, minimum: number, maximum: number): string | undefined => {
  const clean = value.trim().replace(/\s+/g, ' ');
  return clean.length >= minimum && clean.length <= maximum ? clean : undefined;
};

const allowed = (value: string, values: ReadonlySet<string>): string | undefined => values.has(value) ? value : undefined;

const consumeRateLimit = async (bucket: string, limit: number, windowMinutes: number): Promise<boolean> => {
  const rows = await query<{ count: number }>(
    `INSERT INTO auth_rate_limits (bucket, count, expires_at)
     VALUES ($1, 1, NOW() + ($2::text || ' minutes')::interval)
     ON CONFLICT (bucket) DO UPDATE SET
       count = CASE WHEN auth_rate_limits.expires_at <= NOW() THEN 1 ELSE auth_rate_limits.count + 1 END,
       expires_at = CASE WHEN auth_rate_limits.expires_at <= NOW() THEN NOW() + ($2::text || ' minutes')::interval ELSE auth_rate_limits.expires_at END
     RETURNING count`,
    [bucket, windowMinutes],
  );
  return (rows[0]?.count ?? limit + 1) <= limit;
};

const recordEvent = async (
  client: PoolClient,
  leadId: string,
  eventType: 'lead_submitted' | 'integration_requested',
): Promise<void> => {
  await client.query(
    `INSERT INTO founding_partner_events (id, lead_id, event_type, metadata)
     VALUES ($1, $2, $3, '{}'::jsonb)`,
    [randomUUID(), leadId, eventType],
  );
};

/**
 * Creates or refreshes a founding-partner inquiry without revealing whether the
 * address was previously submitted. A CRM outbox row is created only when the
 * applicant explicitly consents to RipoDoc storing these business-development
 * fields in a separate CRM.
 */
export const submitFoundingPartnerLead = async (input: FoundingPartnerLeadInput): Promise<CrmSyncLead | undefined> => {
  const email = normalizeEmail(input.email);
  const contactName = cleanText(input.contactName, 2, 120);
  const companyName = cleanText(input.companyName, 2, 160);
  const companySizeBand = allowed(input.companySizeBand, sizeBands);
  const reportingToolBand = allowed(input.reportingToolBand, reportingToolBands);
  const interestMode = allowed(input.interestMode, interestModes);
  const source = allowed(input.source, sources);
  const ipHash = privacyHash(input.ip || 'unknown');
  const emailHash = privacyHash(email || 'invalid');

  const [ipAllowed, emailAllowed] = await Promise.all([
    consumeRateLimit(`founding-partner:ip:${ipHash}`, 8, 60),
    consumeRateLimit(`founding-partner:email:${emailHash}`, 3, 60),
  ]);

  if (!ipAllowed || !emailAllowed || !isEmail(email) || !contactName || !companyName || !companySizeBand || !reportingToolBand || !interestMode || !source) return undefined;

  const encrypted = encryptLeadEmail(email);
  const leadId = await transaction(async (client) => {
    const candidateId = randomUUID();
    const result = await client.query<{ id: string }>(
      `INSERT INTO founding_partner_leads (
        id, email_hash, contact_email_ciphertext, contact_email_iv, contact_email_tag,
        contact_email_key_id, company_name, contact_name, company_size_band,
        reporting_tool_band, interest_mode, source, crm_sync_consent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (email_hash) DO UPDATE SET
        contact_email_ciphertext = EXCLUDED.contact_email_ciphertext,
        contact_email_iv = EXCLUDED.contact_email_iv,
        contact_email_tag = EXCLUDED.contact_email_tag,
        contact_email_key_id = EXCLUDED.contact_email_key_id,
        company_name = EXCLUDED.company_name,
        contact_name = EXCLUDED.contact_name,
        company_size_band = EXCLUDED.company_size_band,
        reporting_tool_band = EXCLUDED.reporting_tool_band,
        interest_mode = EXCLUDED.interest_mode,
        source = EXCLUDED.source,
        crm_sync_consent = founding_partner_leads.crm_sync_consent OR EXCLUDED.crm_sync_consent,
        updated_at = NOW()
      RETURNING id`,
      [
        candidateId,
        emailHash,
        encrypted.ciphertext,
        encrypted.iv,
        encrypted.tag,
        encrypted.keyId,
        companyName,
        contactName,
        companySizeBand,
        reportingToolBand,
        interestMode,
        source,
        input.crmSyncConsent,
      ],
    );
    const id = result.rows[0]?.id;
    if (!id) throw new Error('Founding-partner lead could not be stored.');
    await recordEvent(client, id, 'lead_submitted');

    if (input.crmSyncConsent) {
      await client.query(
        `INSERT INTO founding_partner_crm_syncs (lead_id, status)
         VALUES ($1, 'pending')
         ON CONFLICT (lead_id) DO UPDATE SET
           status = CASE WHEN founding_partner_crm_syncs.status = 'syncing' THEN 'syncing' ELSE 'pending' END,
           failure_code = NULL,
           updated_at = NOW()`,
        [id],
      );
      await recordEvent(client, id, 'integration_requested');
    }
    return id;
  });

  return input.crmSyncConsent
    ? { leadId, contactName, companyName, email, companySizeBand, reportingToolBand, interestMode, source }
    : undefined;
};
