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
import { mkdir, readFile, readdir, writeFile, unlink } from 'node:fs/promises';
import { join, normalize } from 'node:path';
import { json } from 'node:stream/consumers';

const PORT = Number(process.env.PORT) || 4000;
const DATA_DIR = process.env.DATA_DIR || '/data';
const DRAFTS_DIR = join(DATA_DIR, 'drafts');
const MANIFESTS_DIR = join(DATA_DIR, 'manifests');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

const sendJson = (res, status, body) => {
  const data = body === null ? '' : JSON.stringify(body);
  res.writeHead(status, {
    ...CORS_HEADERS,
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

const handler = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
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

    return sendJson(res, 404, { error: 'Not found' });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return sendJson(res, 500, { error: message });
  }
};

await mkdir(DRAFTS_DIR, { recursive: true });
await mkdir(MANIFESTS_DIR, { recursive: true });

const server = http.createServer(handler);
server.listen(PORT, () => {
  console.log(`[ripodoc-local] Dev server listening on port ${PORT}`);
  console.log(`[ripodoc-local] Data dir: ${DATA_DIR}`);
});
