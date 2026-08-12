import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHmac } from 'node:crypto';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

const repositoryRoot = resolve(import.meta.dirname, '../..');
const port = 4987;
const baseUrl = `http://127.0.0.1:${port}/api/local`;
const workerSecret = 'worker-auth-secret-0123456789abcdef';

const issueCapability = (scope, draftId, tenantId = 'tenant-alpha', userId = 'user-author', expiryOffsetSeconds = 60) => {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: 'ripodoc-authoring-worker',
    v: 1,
    sub: userId,
    tid: tenantId,
    role: 'author',
    scope,
    ...(draftId ? { draftId } : {}),
    jti: `${scope}-${draftId ?? 'new'}-${tenantId}-${userId}-${Math.random().toString(36).slice(2)}`,
    iat: now,
    exp: now + expiryOffsetSeconds,
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = createHmac('sha256', workerSecret).update(encoded).digest('base64url');
  return `Bearer ${encoded}.${signature}`;
};

const capabilityFetch = (path, capability, draftId, init = {}) => {
  const headers = new Headers(init.headers);
  headers.set('Authorization', capability);
  headers.set('X-RipoDoc-Request-Id', 'request-id-worker-test');
  if (draftId) headers.set('X-RipoDoc-Draft-Id', draftId);
  return fetch(`${baseUrl}${path}`, { ...init, headers });
};

const workerFetch = (path, scope, draftId, init = {}, tenantId, userId, expiryOffsetSeconds) =>
  capabilityFetch(path, issueCapability(scope, draftId, tenantId, userId, expiryOffsetSeconds), draftId, init);

const waitForHealth = async () => {
  const deadline = Date.now() + 12_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {
      // The worker is still starting.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  throw new Error('Local RipoDoc worker did not become healthy');
};

test('private worker rejects direct browser use and preserves tenant-bound reviewed publication', async (t) => {
  const dataDir = await mkdtemp(join(tmpdir(), 'ripodoc-worker-test-'));
  const worker = spawn('node', ['docker/local/server.mjs'], {
    cwd: repositoryRoot,
    env: {
      ...process.env,
      PORT: String(port),
      DATA_DIR: dataDir,
      RIPODOC_EVIDENCE_SECRET: '0123456789abcdef0123456789abcdef',
      RIPODOC_WORKER_AUTH_SECRET: workerSecret,
      RIPODOC_WORKER_MAX_CONCURRENT_JOBS: '1',
    },
    stdio: 'ignore',
  });
  t.after(async () => {
    worker.kill('SIGTERM');
    await rm(dataDir, { recursive: true, force: true });
  });

  await waitForHealth();
  const [pdfBytes, manifestText] = await Promise.all([
    readFile(join(repositoryRoot, 'tools/evidence-pdf/fixtures/sample-customer-report.pdf')),
    readFile(join(repositoryRoot, 'tools/evidence-pdf/fixtures/demo-report.json'), 'utf8'),
  ]);

  const directBrowser = await fetch(`${baseUrl}/upload-pdf`, { method: 'POST', headers: { Origin: 'https://untrusted.example' } });
  assert.equal(directBrowser.status, 403);
  assert.equal((await directBrowser.json()).error, 'Browser requests are not accepted by the private worker.');

  const unauthenticated = await fetch(`${baseUrl}/upload-pdf`, { method: 'POST' });
  assert.equal(unauthenticated.status, 401);

  const expired = await workerFetch('/upload-pdf', 'upload', undefined, { method: 'POST' }, undefined, undefined, -1);
  assert.equal(expired.status, 403, 'expired worker capabilities are rejected before request parsing');

  const invalidPdf = new FormData();
  invalidPdf.append('pdf', new Blob(['not a PDF'], { type: 'application/pdf' }), 'not-a-pdf.pdf');
  invalidPdf.append('manifest', manifestText);
  const invalidPdfResponse = await workerFetch('/upload-pdf', 'upload', undefined, { method: 'POST', body: invalidPdf });
  assert.equal(invalidPdfResponse.status, 400);
  assert.equal((await invalidPdfResponse.json()).error, 'The uploaded file is not an accepted PDF.');

  const upload = new FormData();
  upload.append('pdf', new Blob([pdfBytes], { type: 'application/pdf' }), 'report.pdf');
  upload.append('manifest', manifestText);
  const proposed = await workerFetch('/upload-pdf', 'upload', undefined, { method: 'POST', body: upload });
  assert.equal(proposed.status, 200);
  const proposalResult = await proposed.json();
  assert.match(proposalResult.draftId, /^draft-[a-f0-9]{16}$/);

  const draftId = proposalResult.draftId;
  const leakedAttempt = await workerFetch(`/download-placement/${draftId}`, 'proposal-download', draftId, { method: 'GET' }, 'tenant-bravo');
  assert.equal(leakedAttempt.status, 404, 'cross-tenant access does not disclose draft metadata');

  const replayCapability = issueCapability('proposal-download', draftId);
  const replayFirst = await capabilityFetch(`/download-placement/${draftId}`, replayCapability, draftId, { method: 'GET' });
  assert.equal(replayFirst.status, 200, 'a fresh artifact capability is accepted once');
  const replaySecond = await capabilityFetch(`/download-placement/${draftId}`, replayCapability, draftId, { method: 'GET' });
  assert.equal(replaySecond.status, 409, 'a replayed capability is rejected without artifact disclosure');

  const downloadedProposal = await workerFetch(`/download-placement/${draftId}`, 'proposal-download', draftId, { method: 'GET' });
  assert.equal(downloadedProposal.status, 200);
  const proposal = await downloadedProposal.json();
  assert.ok(Array.isArray(proposal.placements));
  assert.ok(proposal.placements.length > 0);

  const reviewed = {
    ...proposal,
    placements: proposal.placements.map((placement) => ({
      ...placement,
      approvedBy: 'Forged Browser String',
      approvedAt: '2020-01-01T00:00:00Z',
    })),
  };
  const reviewUpload = new FormData();
  reviewUpload.append('draftId', draftId);
  reviewUpload.append('proposal', new Blob([JSON.stringify(reviewed)], { type: 'application/json' }), 'reviewed-placements.json');
  const reviewedResponse = await workerFetch('/review-placement', 'review', draftId, { method: 'POST', body: reviewUpload });
  assert.equal(reviewedResponse.status, 200);

  const serverReviewed = await workerFetch(`/download-placement/${draftId}`, 'proposal-download', draftId, { method: 'GET' });
  const recordedProposal = await serverReviewed.json();
  assert.ok(recordedProposal.placements.every((placement) => placement.approvedBy === 'reviewer:user-author'));
  assert.ok(recordedProposal.placements.every((placement) => placement.approvedAt !== '2020-01-01T00:00:00Z'));

  const forgedScope = await workerFetch('/publish-pdf', 'review', draftId, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ draftId, origin: 'http://localhost:3000', ttlDays: 14 }),
  });
  assert.equal(forgedScope.status, 403);

  const published = await workerFetch('/publish-pdf', 'publish', draftId, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ draftId, origin: 'http://localhost:3000', ttlDays: 14 }),
  });
  assert.equal(published.status, 200);
  assert.equal((await published.json()).draftId, draftId);

  const downloadable = await workerFetch(`/download-pdf/${draftId}-clickable.pdf`, 'artifact-download', draftId, { method: 'GET' });
  assert.equal(downloadable.status, 200);
  const output = Buffer.from(await downloadable.arrayBuffer());
  assert.equal(output.subarray(0, 4).toString('ascii'), '%PDF');

  const badOrigin = await workerFetch('/publish-pdf', 'publish', draftId, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ draftId, origin: 'ftp://invalid.example', ttlDays: 14 }),
  });
  assert.equal(badOrigin.status, 404, 'published artifacts cannot be republished with a fresh capability');
  const safeError = await badOrigin.json();
  assert.equal('details' in safeError, false, 'worker responses never expose raw execution details');
});
