import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import test from 'node:test';
import { crmAuthorization, type CrmSyncLead } from '../../../web/frontend/src/lib/founder/crm-contract.ts';
import {
  CrmRemoteError,
  runCrmOutboxAttempt,
  upsertCrmLead,
  type CrmMethod,
  type CrmRequest,
} from '../../../web/frontend/src/lib/founder/crm-sync-contract.ts';

const apiKey = 'mock-api-key-that-is-long-enough';
const hmacSecret = 'mock-hmac-secret-that-is-long-enough-for-integration-tests';

const consentedLead: CrmSyncLead = {
  leadId: 'b415ad2e-761d-4636-8ec8-0e39004877aa',
  contactName: 'Ada Lovelace',
  companyName: 'Analytical MSP',
  email: 'ada@example.com',
  companySizeBand: '20-49',
  reportingToolBand: 'msp-reporting',
  interestMode: 'self-hosted',
  source: 'website',
};

interface RecordedRequest {
  readonly method: string;
  readonly uri: string;
  readonly authorization: string | undefined;
  readonly body: unknown;
}

const readBody = async (request: IncomingMessage): Promise<unknown> => {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : undefined;
};

const json = (response: ServerResponse, status: number, body: unknown): void => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify(body));
};

const startMockEspo = async (handler: (request: IncomingMessage, response: ServerResponse) => Promise<void>): Promise<{ readonly origin: string; readonly close: () => Promise<void> }> => {
  const server = createServer((request, response) => {
    void handler(request, response).catch(() => {
      response.statusCode = 500;
      response.end();
    });
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Mock RipoDoc CRM did not bind to TCP.');
  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: async () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
  };
};

const mockTransport = (origin: string, timeoutMs = 250): CrmRequest => async <T>(method: CrmMethod, uri: string, body?: unknown): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${origin}/api/v1/${uri}`, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Hmac-Authorization': crmAuthorization(method, uri, apiKey, hmacSecret),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) throw new CrmRemoteError(response.status);
    const raw = await response.text();
    return (raw ? JSON.parse(raw) : {}) as T;
  } finally {
    clearTimeout(timeout);
  }
};

const stringHeader = (value: string | string[] | undefined): string | undefined => Array.isArray(value) ? value[0] : value;

const assertAuthorized = (request: RecordedRequest): void => {
  assert.equal(request.authorization, crmAuthorization(request.method, request.uri, apiKey, hmacSecret));
};

test('mock RipoDoc CRM integration looks up then creates one least-data Lead with valid HMAC authorization', async () => {
  const requests: RecordedRequest[] = [];
  const mock = await startMockEspo(async (request, response) => {
    const uri = request.url?.replace('/api/v1/', '') ?? '';
    const recorded: RecordedRequest = {
      method: request.method ?? '',
      uri,
      authorization: stringHeader(request.headers['x-hmac-authorization']),
      body: await readBody(request),
    };
    requests.push(recorded);
    assertAuthorized(recorded);
    if (request.method === 'GET') return json(response, 200, { list: [] });
    if (request.method === 'POST') return json(response, 201, { id: 'lead-created-1' });
    return json(response, 405, {});
  });
  try {
    const remoteLeadId = await upsertCrmLead(consentedLead, mockTransport(mock.origin));
    assert.equal(remoteLeadId, 'lead-created-1');
    assert.equal(requests.length, 2);
    assert.equal(requests[0]?.method, 'GET');
    assert.match(requests[0]?.uri ?? '', /^Lead\?searchParams=/);
    assert.equal(requests[1]?.method, 'POST');
    assert.equal(requests[1]?.uri, 'Lead');
    assert.deepEqual(requests[1]?.body, {
      firstName: 'Ada',
      lastName: 'Lovelace',
      emailAddress: 'ada@example.com',
      accountName: 'Analytical MSP',
      description: [
        'RipoDoc founding-partner request.',
        'Company size: 20-49.',
        'Current reporting: msp-reporting.',
        'Preferred operating model: self-hosted.',
        'Acquisition source: website.',
        'RipoDoc lead reference: b415ad2e-761d-4636-8ec8-0e39004877aa.',
      ].join('\n'),
    });
    const serialized = JSON.stringify(requests[1]?.body);
    for (const forbidden of ['evidenceToken', 'recipientHash', 'reportId', 'sourceRows']) assert.equal(serialized.includes(forbidden), false, forbidden);
  } finally {
    await mock.close();
  }
});

test('mock RipoDoc CRM integration updates the existing Lead rather than creating a duplicate', async () => {
  const requests: RecordedRequest[] = [];
  const mock = await startMockEspo(async (request, response) => {
    const uri = request.url?.replace('/api/v1/', '') ?? '';
    const recorded: RecordedRequest = {
      method: request.method ?? '',
      uri,
      authorization: stringHeader(request.headers['x-hmac-authorization']),
      body: await readBody(request),
    };
    requests.push(recorded);
    assertAuthorized(recorded);
    if (request.method === 'GET') return json(response, 200, { list: [{ id: 'lead existing' }] });
    if (request.method === 'PUT') return json(response, 200, { id: 'lead existing' });
    return json(response, 405, {});
  });
  try {
    const remoteLeadId = await upsertCrmLead(consentedLead, mockTransport(mock.origin));
    assert.equal(remoteLeadId, 'lead existing');
    assert.deepEqual(requests.map((request) => [request.method, request.uri]), [
      ['GET', requests[0]?.uri],
      ['PUT', 'Lead/lead%20existing'],
    ]);
    assert.equal(requests.some((request) => request.method === 'POST'), false);
  } finally {
    await mock.close();
  }
});

test('a remote rejection is non-blocking, marked failed, and can be retried to a successful sync', async () => {
  let createAttempts = 0;
  const mock = await startMockEspo(async (request, response) => {
    if (request.method === 'GET') return json(response, 200, { list: [] });
    if (request.method === 'POST') {
      createAttempts += 1;
      return createAttempts === 1 ? json(response, 422, { error: 'rejected' }) : json(response, 201, { id: 'lead-recovered' });
    }
    return json(response, 405, {});
  });
  const marks: Array<unknown> = [];
  try {
    const request = mockTransport(mock.origin);
    const first = await runCrmOutboxAttempt({
      claim: async () => true,
      upsert: () => upsertCrmLead(consentedLead, request),
      mark: async (result) => { marks.push(result); },
    });
    const second = await runCrmOutboxAttempt({
      claim: async () => true,
      upsert: () => upsertCrmLead(consentedLead, request),
      mark: async (result) => { marks.push(result); },
    });
    assert.equal(first, 'failed');
    assert.equal(second, 'synced');
    assert.deepEqual(marks, [
      { status: 'failed', failureCode: 'remote_rejected' },
      { status: 'synced', remoteLeadId: 'lead-recovered' },
    ]);
  } finally {
    await mock.close();
  }
});

test('a mock timeout produces a transport failure without throwing through the outbox attempt', async () => {
  const mock = await startMockEspo(async (_request, response) => {
    await new Promise((resolve) => setTimeout(resolve, 80));
    json(response, 200, { list: [] });
  });
  const marks: Array<unknown> = [];
  try {
    const result = await runCrmOutboxAttempt({
      claim: async () => true,
      upsert: () => upsertCrmLead(consentedLead, mockTransport(mock.origin, 10)),
      mark: async (outcome) => { marks.push(outcome); },
    });
    assert.equal(result, 'failed');
    assert.deepEqual(marks, [{ status: 'failed', failureCode: 'transport_failed' }]);
  } finally {
    await mock.close();
  }
});

test('an unclaimed outbox row creates no remote request and makes no status transition', async () => {
  let upsertCalled = false;
  let markCalled = false;
  const result = await runCrmOutboxAttempt({
    claim: async () => false,
    upsert: async () => { upsertCalled = true; return 'unexpected'; },
    mark: async () => { markCalled = true; },
  });
  assert.equal(result, 'not-claimed');
  assert.equal(upsertCalled, false);
  assert.equal(markCalled, false);
});
