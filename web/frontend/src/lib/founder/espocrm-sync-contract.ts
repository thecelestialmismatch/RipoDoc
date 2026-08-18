import type { CrmSyncLead } from './espocrm-contract.ts';
import { espocrmLeadPayload } from './espocrm-contract.ts';

export type EspoCrmMethod = 'GET' | 'POST' | 'PUT';

export interface EspoCrmRequest {
  <T>(method: EspoCrmMethod, uri: string, body?: unknown): Promise<T>;
}

export interface EspoRecordList {
  readonly list?: ReadonlyArray<{ readonly id?: unknown }>;
}

/** A non-2xx response from the remote EspoCRM API. The message never contains remote response data. */
export class CrmRemoteError extends Error {
  public readonly status: number;

  public constructor(status: number) {
    super(`CRM request returned ${status}`);
    this.status = status;
  }
}

/** Produces the only two durable, recipient-safe CRM failure classes stored in the outbox. */
export const crmFailureCode = (error: unknown): 'remote_rejected' | 'transport_failed' =>
  error instanceof CrmRemoteError && error.status >= 400 && error.status < 500 ? 'remote_rejected' : 'transport_failed';

/**
 * Performs the EspoCRM email lookup followed by one create or update operation.
 * It accepts a narrow request transport so network and storage behavior remain outside this pure protocol flow.
 */
export const upsertEspoCrmLead = async (lead: CrmSyncLead, request: EspoCrmRequest): Promise<string> => {
  const searchParams = encodeURIComponent(JSON.stringify({
    maxSize: 1,
    select: ['id'],
    where: [{ type: 'equals', attribute: 'emailAddress', value: lead.email }],
  }));
  const existing = await request<EspoRecordList>('GET', `Lead?searchParams=${searchParams}`);
  const id = existing.list?.[0]?.id;
  const payload = espocrmLeadPayload(lead);
  if (typeof id === 'string' && id.length > 0) {
    await request('PUT', `Lead/${encodeURIComponent(id)}`, payload);
    return id;
  }
  const created = await request<{ readonly id?: unknown }>('POST', 'Lead', payload);
  if (typeof created.id !== 'string' || created.id.length === 0) throw new Error('EspoCRM did not return a lead id.');
  return created.id;
};

export interface CrmOutboxAttemptDependencies {
  readonly claim: () => Promise<boolean>;
  readonly upsert: () => Promise<string>;
  readonly mark: (result: { readonly status: 'synced'; readonly remoteLeadId: string } | { readonly status: 'failed'; readonly failureCode: 'remote_rejected' | 'transport_failed' }) => Promise<void>;
}

/**
 * Ensures an outbound CRM error never becomes a public lead-intake error.
 * A failed status is durable when possible, while a secondary outbox-write failure is intentionally swallowed.
 */
export const runCrmOutboxAttempt = async (dependencies: CrmOutboxAttemptDependencies): Promise<'not-claimed' | 'synced' | 'failed'> => {
  if (!(await dependencies.claim())) return 'not-claimed';
  try {
    const remoteLeadId = await dependencies.upsert();
    await dependencies.mark({ status: 'synced', remoteLeadId });
    return 'synced';
  } catch (error) {
    await dependencies.mark({ status: 'failed', failureCode: crmFailureCode(error) }).catch(() => undefined);
    return 'failed';
  }
};
