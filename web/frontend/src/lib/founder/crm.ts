import { lookup } from 'node:dns/promises';
import { request as httpsRequest } from 'node:https';
import { isIP } from 'node:net';
import { query, transaction } from '@/lib/auth/database.ts';
import {
  crmAuthorization,
  isBlockedCrmAddress,
  type CrmSyncLead,
} from './crm-contract.ts';
import {
  CrmRemoteError,
  runCrmOutboxAttempt,
  upsertCrmLead,
  type CrmRequest,
} from './crm-sync-contract.ts';

export { crmAuthorization, crmLeadPayload, isBlockedCrmAddress, type CrmSyncLead } from './crm-contract.ts';
export { CrmRemoteError, crmFailureCode, runCrmOutboxAttempt, upsertCrmLead, type CrmOutboxAttemptDependencies, type CrmRequest } from './crm-sync-contract.ts';

const REQUEST_TIMEOUT_MS = 5_000;
const STALE_SYNC_MINUTES = 15;

interface CrmConfig {
  readonly baseUrl: URL;
  readonly apiKey: string;
  readonly hmacSecret: string;
  readonly allowedHost: string;
}

const splitHosts = (value: string | undefined): string[] =>
  (value ?? '').split(',').map((host) => host.trim().toLowerCase()).filter(Boolean);

const configFrom = (environment: NodeJS.ProcessEnv = process.env): CrmConfig | undefined => {
  const rawUrl = environment.RIPODOC_CRM_URL?.trim();
  const apiKey = environment.RIPODOC_CRM_API_KEY?.trim();
  const hmacSecret = environment.RIPODOC_CRM_HMAC_SECRET?.trim();
  if (!rawUrl && !apiKey && !hmacSecret) return undefined;
  if (!rawUrl || !apiKey || !hmacSecret) throw new Error('RipoDoc CRM configuration is incomplete.');
  if (apiKey.length < 24 || hmacSecret.length < 32) throw new Error('RipoDoc CRM API credentials do not meet minimum length requirements.');

  let baseUrl: URL;
  try {
    baseUrl = new URL(rawUrl);
  } catch {
    throw new Error('RipoDoc CRM URL is not valid.');
  }
  if (baseUrl.protocol !== 'https:' || baseUrl.username || baseUrl.password || baseUrl.hash || baseUrl.pathname !== '/' || baseUrl.search) {
    throw new Error('RipoDoc CRM URL must be an HTTPS origin without credentials, path, query, or fragment.');
  }
  if (isIP(baseUrl.hostname)) throw new Error('RipoDoc CRM URL must use an approved DNS hostname, not an IP address.');
  const allowedHosts = splitHosts(environment.RIPODOC_CRM_ALLOWED_HOSTS);
  if (allowedHosts.length !== 1 || allowedHosts[0] !== baseUrl.hostname.toLowerCase()) {
    throw new Error('RipoDoc CRM URL hostname is not explicitly allowlisted.');
  }
  return { baseUrl, apiKey, hmacSecret, allowedHost: allowedHosts[0] };
};

/** True only when all required, server-only configuration is valid. */
export const crmConfigured = (): boolean => {
  try {
    return configFrom() !== undefined;
  } catch {
    return false;
  }
};

const resolvePublicAddress = async (hostname: string): Promise<{ readonly address: string; readonly family: 4 | 6 }> => {
  const addresses = await lookup(hostname, { all: true, verbatim: true });
  if (addresses.length === 0 || addresses.some(({ address }) => isBlockedCrmAddress(address))) {
    throw new Error('RipoDoc CRM hostname resolved to a blocked network address.');
  }
  const selected = addresses[0];
  if (!selected || (selected.family !== 4 && selected.family !== 6)) throw new Error('RipoDoc CRM hostname did not resolve to a usable public address.');
  return { address: selected.address, family: selected.family };
};

const requestJson = async <T>(config: CrmConfig, method: 'GET' | 'POST' | 'PUT', uri: string, body?: unknown): Promise<T> => {
  const { address, family } = await resolvePublicAddress(config.allowedHost);
  const payload = body === undefined ? undefined : JSON.stringify(body);
  return new Promise<T>((resolve, reject) => {
    const request = httpsRequest({
      protocol: 'https:',
      hostname: config.allowedHost,
      port: 443,
      path: `/api/v1/${uri}`,
      method,
      servername: config.allowedHost,
      lookup: (_hostname, _options, callback) => callback(null, address, family),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Hmac-Authorization': crmAuthorization(method, uri, config.apiKey, config.hmacSecret),
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
      timeout: REQUEST_TIMEOUT_MS,
    }, (response) => {
      const chunks: Buffer[] = [];
      response.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
      response.on('end', () => {
        const status = response.statusCode ?? 0;
        if (status < 200 || status >= 300) return reject(new CrmRemoteError(status));
        const raw = Buffer.concat(chunks).toString('utf8');
        if (!raw) return resolve({} as T);
        try {
          resolve(JSON.parse(raw) as T);
        } catch {
          reject(new Error('RipoDoc CRM returned invalid JSON.'));
        }
      });
    });
    request.on('timeout', () => request.destroy(new Error('RipoDoc CRM request timed out.')));
    request.on('error', reject);
    if (payload) request.write(payload);
    request.end();
  });
};

const claimSync = async (leadId: string): Promise<boolean> => {
  const rows = await query<{ lead_id: string }>(
    `UPDATE founding_partner_crm_syncs
     SET status = 'syncing', attempt_count = attempt_count + 1, last_attempt_at = NOW(), failure_code = NULL, updated_at = NOW()
     WHERE lead_id = $1
       AND (status IN ('pending', 'failed') OR (status = 'syncing' AND last_attempt_at < NOW() - ($2::text || ' minutes')::interval))
     RETURNING lead_id`,
    [leadId, STALE_SYNC_MINUTES],
  );
  return rows.length === 1;
};

const markSync = async (leadId: string, result: { readonly status: 'synced'; readonly remoteLeadId: string } | { readonly status: 'failed'; readonly failureCode: string }): Promise<void> => {
  await transaction(async (client) => {
    if (result.status === 'synced') {
      await client.query(
        `UPDATE founding_partner_crm_syncs
         SET status = 'synced', remote_lead_id = $2, synced_at = NOW(), failure_code = NULL, updated_at = NOW()
         WHERE lead_id = $1`,
        [leadId, result.remoteLeadId],
      );
    } else {
      await client.query(
        `UPDATE founding_partner_crm_syncs
         SET status = 'failed', failure_code = $2, updated_at = NOW()
         WHERE lead_id = $1`,
        [leadId, result.failureCode],
      );
    }
  });
};

/**
 * Attempts a single server-side sync for a lead that has already supplied explicit
 * CRM consent. It is idempotent by email lookup and cannot affect public form success.
 */
export const syncConsentedLeadToCrm = async (lead: CrmSyncLead): Promise<void> => {
  let config: CrmConfig | undefined;
  try {
    config = configFrom();
  } catch {
    return;
  }
  if (!config) return;

  const request: CrmRequest = (method, uri, body) => requestJson(config, method, uri, body);
  await runCrmOutboxAttempt({
    claim: () => claimSync(lead.leadId),
    upsert: () => upsertCrmLead(lead, request),
    mark: (result) => markSync(lead.leadId, result),
  });
};
