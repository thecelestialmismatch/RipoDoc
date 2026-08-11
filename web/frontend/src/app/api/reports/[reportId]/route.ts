import { currentSessionUser } from '@/lib/auth/server.ts';
import { loadTenantReport } from '@/lib/workspace/reports.ts';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteContext { readonly params: Promise<{ readonly reportId: string }>; }

export async function GET(_request: Request, { params }: RouteContext): Promise<Response> {
  const user = await currentSessionUser();
  if (!user) return Response.json({ error: 'Not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  const { reportId } = await params;
  const manifest = await loadTenantReport(user.tenantId, reportId);
  if (!manifest) return Response.json({ error: 'Not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  return new Response(`${JSON.stringify(manifest, null, 2)}\n`, {
    headers: {
      'Content-Disposition': `attachment; filename="${manifest.reportId}-manifest.json"`,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
