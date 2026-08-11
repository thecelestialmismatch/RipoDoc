import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

const repositoryRoot = resolve(import.meta.dirname, '../..');
const port = 4987;
const baseUrl = `http://127.0.0.1:${port}/api/local`;

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

test('local worker requires a manifest, accepts a reviewed proposal, and returns a downloadable clickable PDF', async (t) => {
  const dataDir = await mkdtemp(join(tmpdir(), 'ripodoc-worker-test-'));
  const worker = spawn('node', ['docker/local/server.mjs'], {
    cwd: repositoryRoot,
    env: {
      ...process.env,
      PORT: String(port),
      DATA_DIR: dataDir,
      RIPODOC_EVIDENCE_SECRET: '0123456789abcdef0123456789abcdef',
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

  const missingManifest = new FormData();
  missingManifest.append('pdf', new Blob([pdfBytes], { type: 'application/pdf' }), 'report.pdf');
  const rejected = await fetch(`${baseUrl}/upload-pdf`, { method: 'POST', body: missingManifest });
  assert.equal(rejected.status, 400);

  const upload = new FormData();
  upload.append('pdf', new Blob([pdfBytes], { type: 'application/pdf' }), 'report.pdf');
  upload.append('manifest', manifestText);
  const proposed = await fetch(`${baseUrl}/upload-pdf`, { method: 'POST', body: upload });
  assert.equal(proposed.status, 200);
  const proposalResult = await proposed.json();
  assert.equal(typeof proposalResult.draftId, 'string');
  assert.match(proposalResult.proposalUrl, /^\/api\/local\/download-placement\//);

  const downloadedProposal = await fetch(`http://127.0.0.1:${port}${proposalResult.proposalUrl}`);
  assert.equal(downloadedProposal.status, 200);
  const proposal = await downloadedProposal.json();
  assert.ok(Array.isArray(proposal.placements));
  assert.ok(proposal.placements.length > 0);
  const reviewed = {
    ...proposal,
    placements: proposal.placements.map((placement) => ({
      ...placement,
      approvedBy: 'Automated Release Reviewer',
      approvedAt: '2026-08-11T14:30:00Z',
    })),
  };

  const reviewUpload = new FormData();
  reviewUpload.append('draftId', proposalResult.draftId);
  reviewUpload.append('proposal', new Blob([JSON.stringify(reviewed)], { type: 'application/json' }), 'reviewed-placements.json');
  const reviewedResponse = await fetch(`${baseUrl}/review-placement`, { method: 'POST', body: reviewUpload });
  assert.equal(reviewedResponse.status, 200);

  const published = await fetch(`${baseUrl}/publish-pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ draftId: proposalResult.draftId, origin: 'http://localhost:3000', ttlDays: 14 }),
  });
  assert.equal(published.status, 200);
  const publishedResult = await published.json();
  assert.match(publishedResult.downloadUrl, /^\/api\/local\/download-pdf\//);

  const downloadable = await fetch(`http://127.0.0.1:${port}${publishedResult.downloadUrl}`);
  assert.equal(downloadable.status, 200);
  const output = Buffer.from(await downloadable.arrayBuffer());
  assert.equal(output.subarray(0, 4).toString('ascii'), '%PDF');
});
