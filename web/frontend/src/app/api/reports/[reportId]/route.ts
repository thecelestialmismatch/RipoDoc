import { loadManifest } from '@/lib/evidence/store.ts';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteContext {
  readonly params: Promise<{ readonly reportId: string }>;
}

export async function GET(_request: Request, { params }: RouteContext): Promise<Response> {
  const { reportId } = await params;
  const manifest = await loadManifest(reportId);

  if (!manifest) {
    return Response.json({ error: 'Report not found' }, { status: 404 });
  }

  return new Response(`${JSON.stringify(manifest, null, 2)}\n`, {
    headers: {
      'Content-Disposition': `attachment; filename="${manifest.reportId}-manifest.json"`,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
