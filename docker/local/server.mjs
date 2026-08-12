/**
 * Private RipoDoc self-hosted authoring worker.
 *
 * This service is intentionally not a public browser API. It accepts only a
 * short-lived, single-use capability issued by the trusted Next.js server,
 * stores every draft under a tenant namespace, and publishes only after a
 * server-recorded review is bound to the exact source PDF and proposal.
 */

import http from 'node:http';
import { copyFile, mkdir, readFile, readdir, rm, stat, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile as execFileCb } from 'node:child_process';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { IncomingForm } from 'formidable';

const execFile = promisify(execFileCb);
const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OVERLAY_CLI = join(REPOSITORY_ROOT, 'tools', 'evidence-pdf', 'src', 'overlay-cli.ts');

const PORT = Number(process.env.PORT) || 4000;
const DATA_DIR = process.env.DATA_DIR || '/data';
const DRAFTS_DIR = join(DATA_DIR, 'drafts');
const MANIFESTS_DIR = join(DATA_DIR, 'manifests');
const UPLOADS_DIR = join(DATA_DIR, 'uploads');
const PLACEMENTS_DIR = join(DATA_DIR, 'placements');
const METADATA_DIR = join(DATA_DIR, 'metadata');

const MAX_PDF_BYTES = 50 * 1024 * 1024;
const MAX_REVIEW_BYTES = 5 * 1024 * 1024;
const MAX_JSON_BYTES = 1024 * 1024;
const MAX_ACTIVE_JOBS = Math.max(1, Math.min(Number(process.env.RIPODOC_WORKER_MAX_CONCURRENT_JOBS) || 2, 4));
const MAX_ARTIFACT_AGE_MS = 72 * 60 * 60 * 1000;
const CAPABILITY_MAX_AGE_SECONDS = 90;
const AUTH_SECRET = process.env.RIPODOC_WORKER_AUTH_SECRET;

if (!AUTH_SECRET || AUTH_SECRET.length < 32) {
  throw new Error('RIPODOC_WORKER_AUTH_SECRET must be configured with at least 32 characters.');
}

let activeJobs = 0;
const usedCapabilityIds = new Map();

const allowedScopes = new Set(['upload', 'proposal-download', 'review', 'publish', 'artifact-download', 'draft-read', 'draft-update', 'draft-delete']);
const authorRoles = new Set(['owner', 'admin', 'author']);

const safeId = (id) => typeof id === 'string' && /^draft-[a-f0-9]{16}$/.test(id) ? id : '';
const safeReportId = (id) => typeof id === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(id) ? id : '';
const safePath = (base, name, extension) => {
  const path = join(base, `${name}${extension}`);
  return normalize(path).startsWith(`${normalize(base)}${String.raw`/`}`) ? path : null;
};

const pathsFor = (draftId) => {
  const id = safeId(draftId);
  if (!id) return undefined;
  return {
    draft: safePath(DRAFTS_DIR, id, '.json'),
    manifest: safePath(MANIFESTS_DIR, id, '.json'),
    sourcePdf: safePath(UPLOADS_DIR, `${id}.source`, '.pdf'),
    placement: safePath(PLACEMENTS_DIR, id, '.placements.json'),
    artifact: safePath(UPLOADS_DIR, `${id}-clickable`, '.pdf'),
    metadata: safePath(METADATA_DIR, id, '.json'),
  };
};

const requestIdFor = (req) => {
  const supplied = req.headers['x-ripodoc-request-id'];
  return typeof supplied === 'string' && /^[A-Za-z0-9_-]{16,64}$/.test(supplied) ? supplied : randomBytes(12).toString('base64url');
};

const sendJson = (res, status, body, requestId) => {
  const data = body === null ? '' : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(data),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...(requestId ? { 'X-RipoDoc-Request-Id': requestId } : {}),
  });
  res.end(data);
};

const sendFailure = (res, status, code, requestId) => sendJson(res, status, { error: code, ...(requestId ? { requestId } : {}) }, requestId);

const log = (event, requestId, extra = {}) => {
  // Deliberately no raw errors, secrets, PDFs, tokens, recipient data, or manifests.
  console.log(JSON.stringify({ service: 'ripodoc-worker', event, requestId, at: new Date().toISOString(), ...extra }));
};

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const fileDigest = async (path) => sha256(await readFile(path));

const stableJson = (value) => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
};

const digestObject = (value) => sha256(Buffer.from(stableJson(value), 'utf8'));

const timingSafe = (left, right) => {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
};

const signCapability = (encoded) => createHmac('sha256', AUTH_SECRET).update(encoded).digest('base64url');

const consumeCapability = (req, res, scope, draftId, requestId) => {
  const authorization = req.headers.authorization;
  if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ')) {
    sendFailure(res, 401, 'Authoring authorization is required.', requestId);
    return undefined;
  }
  const raw = authorization.slice('Bearer '.length);
  const [encoded, signature] = raw.split('.');
  if (!encoded || !signature || !timingSafe(signCapability(encoded), signature)) {
    sendFailure(res, 401, 'Authoring authorization is invalid.', requestId);
    return undefined;
  }
  let capability;
  try {
    capability = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  } catch {
    sendFailure(res, 401, 'Authoring authorization is invalid.', requestId);
    return undefined;
  }
  const now = Math.floor(Date.now() / 1000);
  const valid = capability && capability.aud === 'ripodoc-authoring-worker' && capability.v === 1 &&
    typeof capability.sub === 'string' && typeof capability.tid === 'string' && typeof capability.jti === 'string' &&
    typeof capability.role === 'string' && authorRoles.has(capability.role) && capability.scope === scope &&
    allowedScopes.has(capability.scope) && Number.isInteger(capability.iat) && Number.isInteger(capability.exp) &&
    capability.exp >= now && capability.iat <= now + 10 && capability.exp - capability.iat <= CAPABILITY_MAX_AGE_SECONDS &&
    (!draftId || capability.draftId === draftId);
  if (!valid) {
    sendFailure(res, 403, 'Authoring authorization is not permitted for this action.', requestId);
    return undefined;
  }
  for (const [jti, expires] of usedCapabilityIds.entries()) if (expires < now) usedCapabilityIds.delete(jti);
  if (usedCapabilityIds.has(capability.jti)) {
    sendFailure(res, 409, 'This authoring request has already been used.', requestId);
    return undefined;
  }
  usedCapabilityIds.set(capability.jti, capability.exp);
  return capability;
};

const readJsonBody = async (req, limit = MAX_JSON_BYTES) => {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    bytes += buffer.length;
    if (bytes > limit) throw new Error('request-too-large');
    chunks.push(buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
};

const loadMetadata = async (draftId) => {
  const paths = pathsFor(draftId);
  if (!paths?.metadata) return undefined;
  try {
    const parsed = JSON.parse(await readFile(paths.metadata, 'utf8'));
    return parsed && parsed.schemaVersion === 1 ? parsed : undefined;
  } catch {
    return undefined;
  }
};

const storeMetadata = async (draftId, metadata) => {
  const paths = pathsFor(draftId);
  if (!paths?.metadata) throw new Error('invalid-draft');
  await writeFile(paths.metadata, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');
};

const belongsTo = (metadata, capability) => metadata && metadata.tenantId === capability.tid;

const validPdf = async (path, maximum = MAX_PDF_BYTES) => {
  const info = await stat(path);
  if (info.size <= 8 || info.size > maximum) return false;
  const bytes = await readFile(path);
  return bytes.subarray(0, 5).toString('ascii') === '%PDF-' && bytes.subarray(Math.max(0, bytes.length - 4096)).includes(Buffer.from('%%EOF'));
};

const withJobSlot = async (requestId, operation) => {
  if (activeJobs >= MAX_ACTIVE_JOBS) {
    const error = new Error('worker-busy');
    error.code = 'worker-busy';
    throw error;
  }
  activeJobs += 1;
  try {
    return await operation();
  } finally {
    activeJobs -= 1;
    log('job-finished', requestId, { activeJobs });
  }
};

const removeDraftArtifacts = async (draftId) => {
  const paths = pathsFor(draftId);
  if (!paths) return;
  await Promise.all(Object.values(paths).map((path) => path ? rm(path, { force: true }).catch(() => undefined) : undefined));
};

const cleanupExpiredArtifact = async (draftId, metadata) => {
  if (!metadata?.artifactExpiresAt || Date.parse(metadata.artifactExpiresAt) > Date.now()) return false;
  await removeDraftArtifacts(draftId);
  return true;
};

const parseReviewedProposal = (reviewed, original, metadata, capability) => {
  if (!reviewed || typeof reviewed !== 'object' || !Array.isArray(reviewed.placements) || reviewed.placements.length === 0) throw new Error('invalid-review');
  if (reviewed.reportId !== metadata.reportId || reviewed.version !== metadata.version || reviewed.pdfSha256 !== metadata.sourcePdfSha256) throw new Error('review-mismatch');
  const originalByElement = new Map(original.placements.map((placement) => [placement.elementId, placement]));
  if (reviewed.placements.length !== originalByElement.size || reviewed.placements.some((placement) => !placement || typeof placement.elementId !== 'string' || !originalByElement.has(placement.elementId))) throw new Error('review-elements');
  return {
    ...reviewed,
    placements: reviewed.placements.map((placement) => ({
      ...placement,
      approvedBy: `reviewer:${capability.sub}`,
      approvedAt: new Date().toISOString(),
    })),
  };
};

const handler = async (req, res) => {
  const requestId = requestIdFor(req);
  const origin = req.headers.origin;
  if (origin) return sendFailure(res, 403, 'Browser requests are not accepted by the private worker.', requestId);
  if (req.method === 'OPTIONS') return sendFailure(res, 405, 'Method not allowed.', requestId);

  const url = new URL(req.url ?? '/', 'http://localhost');
  const path = url.pathname.replace(/^\/api\/local/, '');
  const segments = path.split('/').filter(Boolean);

  try {
    if (segments.length === 1 && segments[0] === 'health' && req.method === 'GET') {
      return sendJson(res, 200, { status: 'ok', service: 'ripodoc-private-worker' }, requestId);
    }

    if (segments.length === 1 && segments[0] === 'upload-pdf' && req.method === 'POST') {
      const capability = consumeCapability(req, res, 'upload', undefined, requestId);
      if (!capability) return;
      await mkdir(UPLOADS_DIR, { recursive: true });
      const form = new IncomingForm({ uploadDir: UPLOADS_DIR, keepExtensions: false, maxFiles: 1, maxFileSize: MAX_PDF_BYTES, allowEmptyFiles: false });
      const [fields, files] = await new Promise((resolveForm, rejectForm) => form.parse(req, (error, parsedFields, parsedFiles) => error ? rejectForm(error) : resolveForm([parsedFields, parsedFiles])));
      const pdfFile = files.pdf?.[0];
      const manifestText = Array.isArray(fields.manifest) ? fields.manifest[0] : fields.manifest;
      if (!pdfFile || typeof manifestText !== 'string' || Buffer.byteLength(manifestText, 'utf8') > MAX_JSON_BYTES) return sendFailure(res, 400, 'A valid PDF and report manifest are required.', requestId);
      let manifest;
      try {
        manifest = JSON.parse(manifestText);
      } catch {
        return sendFailure(res, 400, 'A valid PDF and report manifest are required.', requestId);
      }
      if (!safeReportId(manifest?.reportId)) return sendFailure(res, 400, 'A valid PDF and report manifest are required.', requestId);
      if (!(await validPdf(pdfFile.filepath))) {
        await unlink(pdfFile.filepath).catch(() => undefined);
        return sendFailure(res, 400, 'The uploaded file is not an accepted PDF.', requestId);
      }

      const draftId = `draft-${randomBytes(8).toString('hex')}`;
      const paths = pathsFor(draftId);
      await Promise.all([mkdir(DRAFTS_DIR, { recursive: true }), mkdir(MANIFESTS_DIR, { recursive: true }), mkdir(PLACEMENTS_DIR, { recursive: true }), mkdir(METADATA_DIR, { recursive: true })]);
      await copyFile(pdfFile.filepath, paths.sourcePdf);
      await unlink(pdfFile.filepath).catch(() => undefined);
      await writeFile(paths.draft, JSON.stringify(manifest, null, 2), 'utf8');
      await writeFile(paths.manifest, JSON.stringify(manifest, null, 2), 'utf8');
      const sourcePdfSha256 = await fileDigest(paths.sourcePdf);
      const manifestSha256 = digestObject(manifest);
      const metadata = { schemaVersion: 1, draftId, tenantId: capability.tid, creatorId: capability.sub, reportId: manifest.reportId, version: manifest.version, sourcePdfSha256, manifestSha256, status: 'proposed', createdAt: new Date().toISOString() };
      await storeMetadata(draftId, metadata);

      try {
        await withJobSlot(requestId, async () => execFile('node', ['--experimental-strip-types', OVERLAY_CLI, '--pdf', paths.sourcePdf, '--manifest', paths.manifest, '--propose', paths.placement], { cwd: REPOSITORY_ROOT, timeout: 30_000, maxBuffer: 1024 * 1024 }));
        const proposal = JSON.parse(await readFile(paths.placement, 'utf8'));
        metadata.proposalSha256 = digestObject(proposal);
        await storeMetadata(draftId, metadata);
        log('proposal-created', requestId, { draftId });
        return sendJson(res, 200, { draftId, message: 'Overlay proposal generated. An authorized reviewer must approve it before publication.' }, requestId);
      } catch (error) {
        await removeDraftArtifacts(draftId);
        log('proposal-failed', requestId, { reason: error?.code === 'worker-busy' ? 'busy' : 'processing' });
        return sendFailure(res, error?.code === 'worker-busy' ? 429 : 500, error?.code === 'worker-busy' ? 'The private worker is busy. Retry shortly.' : 'The private worker could not generate a proposal.', requestId);
      }
    }

    if (segments.length === 1 && segments[0] === 'review-placement' && req.method === 'POST') {
      const headerDraftId = safeId(req.headers['x-ripodoc-draft-id']);
      const capability = consumeCapability(req, res, 'review', headerDraftId, requestId);
      if (!headerDraftId || !capability) return;
      const form = new IncomingForm({ maxFiles: 1, maxFileSize: MAX_REVIEW_BYTES, allowEmptyFiles: false });
      const [fields, files] = await new Promise((resolveForm, rejectForm) => form.parse(req, (error, parsedFields, parsedFiles) => error ? rejectForm(error) : resolveForm([parsedFields, parsedFiles])));
      const draftId = Array.isArray(fields.draftId) ? fields.draftId[0] : fields.draftId;
      const id = safeId(draftId);
      if (id !== headerDraftId) return sendFailure(res, 403, 'Authoring authorization is not permitted for this action.', requestId);
      const metadata = await loadMetadata(id);
      const paths = pathsFor(id);
      const proposalFile = files.proposal?.[0];
      if (!metadata || !paths || !proposalFile || !belongsTo(metadata, capability) || metadata.status !== 'proposed') return sendFailure(res, 404, 'The requested authoring draft is unavailable.', requestId);
      try {
        const [original, reviewed] = await Promise.all([readFile(paths.placement, 'utf8').then(JSON.parse), readFile(proposalFile.filepath, 'utf8').then(JSON.parse)]);
        const serverReviewed = parseReviewedProposal(reviewed, original, metadata, capability);
        const reviewedProposalSha256 = digestObject(serverReviewed);
        await writeFile(paths.placement, `${JSON.stringify(serverReviewed, null, 2)}\n`, 'utf8');
        await storeMetadata(id, { ...metadata, status: 'reviewed', reviewedProposalSha256, reviewerId: capability.sub, reviewedAt: new Date().toISOString() });
        log('proposal-reviewed', requestId, { draftId: id });
        return sendJson(res, 200, { draftId: id, message: 'Reviewed placement proposal is recorded and ready for publication.' }, requestId);
      } catch {
        return sendFailure(res, 400, 'The reviewed placement proposal could not be validated.', requestId);
      } finally {
        await unlink(proposalFile.filepath).catch(() => undefined);
      }
    }

    if (segments.length === 1 && segments[0] === 'publish-pdf' && req.method === 'POST') {
      const headerDraftId = safeId(req.headers['x-ripodoc-draft-id']);
      const capability = consumeCapability(req, res, 'publish', headerDraftId, requestId);
      if (!headerDraftId || !capability) return;
      const payload = await readJsonBody(req);
      const draftId = safeId(payload?.draftId);
      if (draftId !== headerDraftId) return sendFailure(res, 403, 'Authoring authorization is not permitted for this action.', requestId);
      const metadata = await loadMetadata(draftId);
      const paths = pathsFor(draftId);
      if (!metadata || !paths || !belongsTo(metadata, capability) || metadata.status !== 'reviewed') return sendFailure(res, 404, 'The requested authoring draft is unavailable.', requestId);
      const ttlDays = [1, 7, 14, 30].includes(Number(payload.ttlDays)) ? Number(payload.ttlDays) : 14;
      let origin;
      try {
        origin = new URL(String(payload.origin));
      } catch {
        return sendFailure(res, 400, 'The configured report origin is invalid.', requestId);
      }
      const loopback = ['localhost', '127.0.0.1', '::1'].includes(origin.hostname);
      if (origin.protocol !== 'https:' && !(origin.protocol === 'http:' && loopback)) return sendFailure(res, 400, 'The configured report origin is invalid.', requestId);
      try {
        const [sourcePdfSha256, manifest, reviewed] = await Promise.all([fileDigest(paths.sourcePdf), readFile(paths.manifest, 'utf8').then(JSON.parse), readFile(paths.placement, 'utf8').then(JSON.parse)]);
        if (sourcePdfSha256 !== metadata.sourcePdfSha256 || digestObject(manifest) !== metadata.manifestSha256 || digestObject(reviewed) !== metadata.reviewedProposalSha256 || reviewed.reportId !== metadata.reportId || reviewed.version !== metadata.version || reviewed.pdfSha256 !== metadata.sourcePdfSha256) return sendFailure(res, 409, 'The reviewed authoring inputs no longer match the approved draft.', requestId);
        await withJobSlot(requestId, async () => execFile('node', ['--experimental-strip-types', OVERLAY_CLI, '--pdf', paths.sourcePdf, '--manifest', paths.manifest, '--placements', paths.placement, '--out', paths.artifact, '--origin', origin.origin, '--ttl-days', String(ttlDays), ...(loopback ? ['--allow-loopback-http', 'true'] : [])], { cwd: REPOSITORY_ROOT, timeout: 30_000, maxBuffer: 1024 * 1024 }));
        if (!(await validPdf(paths.artifact))) throw new Error('invalid-artifact');
        const artifactExpiresAt = new Date(Date.now() + MAX_ARTIFACT_AGE_MS).toISOString();
        await storeMetadata(draftId, { ...metadata, status: 'published', publishedBy: capability.sub, publishedAt: new Date().toISOString(), artifactExpiresAt, artifactSha256: await fileDigest(paths.artifact) });
        log('pdf-published', requestId, { draftId });
        return sendJson(res, 200, { draftId, message: 'Clickable PDF generated from an authenticated reviewed proposal.' }, requestId);
      } catch (error) {
        log('publish-failed', requestId, { reason: error?.code === 'worker-busy' ? 'busy' : 'processing' });
        return sendFailure(res, error?.code === 'worker-busy' ? 429 : 500, error?.code === 'worker-busy' ? 'The private worker is busy. Retry shortly.' : 'The private worker could not publish this PDF.', requestId);
      }
    }

    if (segments.length === 2 && segments[0] === 'download-placement' && req.method === 'GET') {
      const draftId = safeId(segments[1]);
      const capability = consumeCapability(req, res, 'proposal-download', draftId, requestId);
      if (!draftId || !capability) return;
      const metadata = await loadMetadata(draftId);
      const paths = pathsFor(draftId);
      if (!metadata || !paths || !belongsTo(metadata, capability) || !['proposed', 'reviewed', 'published'].includes(metadata.status)) return sendFailure(res, 404, 'The requested authoring artifact is unavailable.', requestId);
      try {
        const content = await readFile(paths.placement);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Disposition': `attachment; filename="${draftId}.placements.json"`, 'Content-Length': content.length, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-RipoDoc-Request-Id': requestId });
        res.end(content);
        log('proposal-downloaded', requestId, { draftId });
      } catch {
        sendFailure(res, 404, 'The requested authoring artifact is unavailable.', requestId);
      }
      return;
    }

    if (segments.length === 2 && segments[0] === 'download-pdf' && req.method === 'GET') {
      const filename = segments[1];
      const draftId = safeId(filename.replace(/-clickable\.pdf$/, ''));
      const capability = consumeCapability(req, res, 'artifact-download', draftId, requestId);
      if (!draftId || !capability || filename !== `${draftId}-clickable.pdf`) return;
      const metadata = await loadMetadata(draftId);
      const paths = pathsFor(draftId);
      if (!metadata || !paths || !belongsTo(metadata, capability) || metadata.status !== 'published' || await cleanupExpiredArtifact(draftId, metadata)) return sendFailure(res, 404, 'The requested authoring artifact is unavailable.', requestId);
      try {
        const content = await readFile(paths.artifact);
        if (metadata.artifactSha256 !== sha256(content)) return sendFailure(res, 409, 'The requested authoring artifact is unavailable.', requestId);
        res.writeHead(200, { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${filename}"`, 'Content-Length': content.length, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-RipoDoc-Request-Id': requestId });
        res.end(content);
        log('artifact-downloaded', requestId, { draftId });
      } catch {
        sendFailure(res, 404, 'The requested authoring artifact is unavailable.', requestId);
      }
      return;
    }

    return sendFailure(res, 404, 'Authoring endpoint not found.', requestId);
  } catch (error) {
    log('request-failed', requestId, { reason: error?.message === 'request-too-large' ? 'request-too-large' : 'unexpected' });
    return sendFailure(res, error?.message === 'request-too-large' ? 413 : 500, error?.message === 'request-too-large' ? 'The authoring request is too large.' : 'The private worker could not complete this request.', requestId);
  }
};

await Promise.all([DRAFTS_DIR, MANIFESTS_DIR, UPLOADS_DIR, PLACEMENTS_DIR, METADATA_DIR].map((directory) => mkdir(directory, { recursive: true })));

const server = http.createServer(handler);
server.listen(PORT, process.env.RIPODOC_BIND_HOST || '127.0.0.1', () => {
  log('started', 'startup', { port: PORT, maxActiveJobs: MAX_ACTIVE_JOBS });
});
