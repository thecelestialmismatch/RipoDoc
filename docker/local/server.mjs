/**
 * Local development server for the RipoDoc authoring studio.
 *
 * Zero-dependency Node.js HTTP server that persists drafts and published
 * manifests as JSON files under /data. The Next.js frontend talks to this
 * server via API proxy routes (see src/app/api/local/).
 *
 * This is NOT a production backend. It exists so a solo founder can develop
 * the full authoring flow end-to-end without standing up the Go + PostgreSQL
 * stack. The Go API is the production target (see architecture.md).
 */

import http from 'node:http';
import { copyFile, mkdir, readFile, readdir, writeFile, unlink } from 'node:fs/promises';
import { dirname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { json } from 'node:stream/consumers';
import { execFile as execFileCb } from 'node:child_process';
import { promisify } from 'node:util';
import { randomBytes } from 'node:crypto';
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

const ALLOWED_ORIGIN = process.env.RIPODOC_ALLOWED_ORIGIN || 'http://localhost:3000';
const corsHeaders = (origin) => ({
  ...(origin === ALLOWED_ORIGIN ? { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN, Vary: 'Origin' } : {}),
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
});

const sendJson = (res, status, body, origin = undefined) => {
  const data = body === null ? '' : JSON.stringify(body);
  res.writeHead(status, {
    ...corsHeaders(origin),
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  });
  res.end(data);
};

const safeId = (id) => {
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(id)) return '';
  return id;
};

const safePath = (base, id) => {
  const path = join(base, `${id}.json`);
  if (!normalize(path).startsWith(normalize(base))) return null;
  return path;
};

const listFiles = async (dir) => {
  try {
    return (await readdir(dir)).filter((f) => f.endsWith('.json'));
  } catch {
    return [];
  }
};

const firstField = (fields, name) => {
  const value = fields[name];
  return Array.isArray(value) ? value[0] : value;
};

const handler = async (req, res) => {
  const origin = req.headers.origin;
  if (origin && origin !== ALLOWED_ORIGIN) return sendJson(res, 403, { error: 'Origin not allowed' }, origin);
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders(origin));
    res.end();
    return;
  }

  const url = new URL(req.url ?? '/', 'http://localhost');
  const path = url.pathname.replace(/^\/api\/local/, '');
  const segments = path.split('/').filter((s) => s.length > 0);

  try {
    if (segments.length === 1 && segments[0] === 'health') {
      return sendJson(res, 200, { status: 'ok', version: '1.0.0' });
    }

    if (segments.length === 1 && segments[0] === 'drafts') {
      if (req.method === 'GET') {
        const files = await listFiles(DRAFTS_DIR);
        const drafts = await Promise.all(
          files.map(async (f) => {
            try {
              const raw = await readFile(join(DRAFTS_DIR, f), 'utf8');
              return JSON.parse(raw);
            } catch {
              return null;
            }
          }),
        );
        return sendJson(res, 200, drafts.filter((d) => d !== null));
      }
      if (req.method === 'POST') {
        const draft = await json(req);
        if (!draft?.draftId || !safeId(draft.draftId)) {
          return sendJson(res, 400, { error: 'Invalid or missing draftId' });
        }
        await mkdir(DRAFTS_DIR, { recursive: true });
        const p = safePath(DRAFTS_DIR, draft.draftId);
        if (!p) return sendJson(res, 400, { error: 'Invalid draft id' });
        await writeFile(p, JSON.stringify(draft, null, 2), 'utf8');
        return sendJson(res, 201, { ok: true, draftId: draft.draftId });
      }
      return sendJson(res, 405, { error: 'Method not allowed' });
    }

    if (segments.length === 2 && segments[0] === 'drafts') {
      const id = safeId(segments[1]);
      if (!id) return sendJson(res, 400, { error: 'Invalid draft id' });
      const p = safePath(DRAFTS_DIR, id);
      if (!p) return sendJson(res, 400, { error: 'Invalid draft id' });

      if (req.method === 'GET') {
        try {
          const raw = await readFile(p, 'utf8');
          return sendJson(res, 200, JSON.parse(raw));
        } catch {
          return sendJson(res, 404, { error: 'Draft not found' });
        }
      }
      if (req.method === 'PUT') {
        const draft = await json(req);
        await writeFile(p, JSON.stringify(draft, null, 2), 'utf8');
        return sendJson(res, 200, { ok: true });
      }
      if (req.method === 'DELETE') {
        try {
          await unlink(p);
          return sendJson(res, 204, null);
        } catch {
          return sendJson(res, 404, { error: 'Draft not found' });
        }
      }
      return sendJson(res, 405, { error: 'Method not allowed' });
    }

    if (segments.length === 1 && segments[0] === 'publish' && req.method === 'POST') {
      const manifest = await json(req);
      if (!manifest?.reportId || !safeId(manifest.reportId)) {
        return sendJson(res, 400, { error: 'Invalid or missing reportId' });
      }
      await mkdir(MANIFESTS_DIR, { recursive: true });
      const manifestPath = safePath(MANIFESTS_DIR, manifest.reportId);
      if (!manifestPath) return sendJson(res, 400, { error: 'Invalid report id' });
      await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
      return sendJson(res, 201, { ok: true, reportId: manifest.reportId });
    }

    if (segments.length === 1 && segments[0] === 'upload-pdf' && req.method === 'POST') {
      await mkdir(UPLOADS_DIR, { recursive: true });
      const form = new IncomingForm({ uploadDir: UPLOADS_DIR, keepExtensions: true, maxFileSize: 50 * 1024 * 1024 });
      const [fields, files] = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => err ? reject(err) : resolve([fields, files]));
      });
      const pdfFile = files.pdf?.[0];
      const manifestText = firstField(fields, 'manifest');
      if (!pdfFile) return sendJson(res, 400, { error: 'No PDF file uploaded' });
      if (typeof manifestText !== 'string') return sendJson(res, 400, { error: 'A validated report manifest is required for PDF overlay proposals' });

      let manifest;
      try {
        manifest = JSON.parse(manifestText);
      } catch {
        return sendJson(res, 400, { error: 'The report manifest must be valid JSON' });
      }
      if (!manifest?.reportId || !safeId(manifest.reportId)) {
        return sendJson(res, 400, { error: 'The report manifest has an invalid reportId' });
      }

      const draftId = `draft-${randomBytes(8).toString('hex')}`;
      const sourcePdfPath = join(UPLOADS_DIR, `${draftId}.source.pdf`);
      const manifestPath = join(DRAFTS_DIR, `${draftId}.json`);
      const placementsPath = join(PLACEMENTS_DIR, `${draftId}.placements.json`);
      await copyFile(pdfFile.filepath, sourcePdfPath);
      await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

      try {
        await execFile(
          'node',
          ['--experimental-strip-types', OVERLAY_CLI, '--pdf', sourcePdfPath, '--manifest', manifestPath, '--propose', placementsPath],
          { cwd: REPOSITORY_ROOT },
        );
        await readFile(placementsPath, 'utf8');
        return sendJson(res, 200, {
          draftId,
          proposalUrl: `/api/local/download-placement/${draftId}`,
          message: 'Overlay proposal generated. Download it, review every zone, add approver details, and upload the reviewed proposal before publishing.',
        });
      } catch (error) {
        const details = error instanceof Error ? error.message : String(error);
        console.error(`Overlay CLI error: ${details}`);
        return sendJson(res, 500, { error: 'Failed to generate an overlay proposal', details });
      }
    }

    if (segments.length === 1 && segments[0] === 'review-placement' && req.method === 'POST') {
      const form = new IncomingForm({ maxFileSize: 5 * 1024 * 1024 });
      const [fields, files] = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => err ? reject(err) : resolve([fields, files]));
      });
      const draftId = firstField(fields, 'draftId');
      const proposalFile = files.proposal?.[0];
      if (typeof draftId !== 'string' || !safeId(draftId) || !proposalFile) {
        return sendJson(res, 400, { error: 'A valid draftId and reviewed placement file are required' });
      }
      try {
        const reviewed = JSON.parse(await readFile(proposalFile.filepath, 'utf8'));
        if (!Array.isArray(reviewed.placements) || reviewed.placements.length === 0) {
          return sendJson(res, 400, { error: 'The reviewed placement file must include at least one placement' });
        }
        if (reviewed.placements.some((placement) => typeof placement.approvedBy !== 'string' || typeof placement.approvedAt !== 'string')) {
          return sendJson(res, 400, { error: 'Every placement must include approvedBy and approvedAt before publication' });
        }
        await writeFile(join(PLACEMENTS_DIR, `${draftId}.placements.json`), `${JSON.stringify(reviewed, null, 2)}\n`, 'utf8');
        return sendJson(res, 200, { draftId, message: 'Reviewed placement proposal accepted and ready to publish.' });
      } catch (error) {
        const details = error instanceof Error ? error.message : String(error);
        return sendJson(res, 400, { error: 'Could not validate the reviewed placement file', details });
      }
    }

    if (segments.length === 1 && segments[0] === 'publish-pdf' && req.method === 'POST') {
      const { draftId, origin, ttlDays } = await json(req);
      if (typeof draftId !== 'string' || !safeId(draftId) || typeof origin !== 'string' || !ttlDays) {
        return sendJson(res, 400, { error: 'A valid draftId, origin, and expiry are required for publishing' });
      }
      const manifestPath = join(DRAFTS_DIR, `${draftId}.json`);
      const sourcePdfPath = join(UPLOADS_DIR, `${draftId}.source.pdf`);
      const placementsPath = join(PLACEMENTS_DIR, `${draftId}.placements.json`);
      const outPdfPath = join(UPLOADS_DIR, `${draftId}-clickable.pdf`);

      try {
        await execFile(
          'node',
          ['--experimental-strip-types', OVERLAY_CLI, '--pdf', sourcePdfPath, '--manifest', manifestPath, '--placements', placementsPath, '--out', outPdfPath, '--origin', origin, '--ttl-days', String(ttlDays), '--allow-loopback-http', 'true'],
          { cwd: REPOSITORY_ROOT },
        );
        return sendJson(res, 200, { downloadUrl: `/api/local/download-pdf/${draftId}-clickable.pdf`, message: 'Clickable PDF generated from reviewed placements.' });
      } catch (error) {
        const details = error instanceof Error ? error.message : String(error);
        console.error(`Overlay CLI error: ${details}`);
        return sendJson(res, 500, { error: 'Failed to publish PDF from reviewed placements', details });
      }
    }

    if (segments.length === 2 && segments[0] === 'download-placement' && req.method === 'GET') {
      const draftId = safeId(segments[1]);
      if (!draftId) return sendJson(res, 400, { error: 'Invalid draft id' });
      try {
        const content = await readFile(join(PLACEMENTS_DIR, `${draftId}.placements.json`));
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${draftId}.placements.json"`,
          'Content-Length': content.length,
          ...corsHeaders(origin),
        });
        res.end(content);
      } catch {
        return sendJson(res, 404, { error: 'Placement proposal not found' }, origin);
      }
      return;
    }

    if (segments.length === 2 && segments[0] === 'download-pdf' && req.method === 'GET') {
      const filename = segments[1];
      if (!/^draft-[a-f0-9]{16}-clickable\.pdf$/.test(filename)) return sendJson(res, 400, { error: 'Invalid file id' }, origin);
      const filePath = join(UPLOADS_DIR, filename);
      try {
        const fileContent = await readFile(filePath);
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`, 
          'Content-Length': fileContent.length,
          ...corsHeaders(origin),
        });
        res.end(fileContent);
      } catch {
        return sendJson(res, 404, { error: 'File not found' }, origin);
      }
      return;
    }

    return sendJson(res, 404, { error: 'Not found' });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return sendJson(res, 500, { error: message });
  }
};

await mkdir(DRAFTS_DIR, { recursive: true });
await mkdir(MANIFESTS_DIR, { recursive: true });
await mkdir(UPLOADS_DIR, { recursive: true });
await mkdir(PLACEMENTS_DIR, { recursive: true });

const server = http.createServer(handler);
server.listen(PORT, process.env.RIPODOC_BIND_HOST || '127.0.0.1', () => {
  console.log(`[ripodoc-local] Dev server listening on port ${PORT}`);
  console.log(`[ripodoc-local] Data dir: ${DATA_DIR}`);
});
