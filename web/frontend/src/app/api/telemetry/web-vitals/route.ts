import { NextRequest, NextResponse } from 'next/server';
import { parsePublicWebVital } from '@/lib/telemetry/web-vitals.ts';

const noStore = (status = 204): NextResponse => new NextResponse(null, {
  status,
  headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
});

/**
 * Field telemetry is intentionally opt-in. Logs contain only a named Core Web
 * Vital, its numeric value/rating, and navigation type—never a visitor id,
 * recipient, report identifier, evidence row, URL query, or token.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (process.env.RIPODOC_WEB_VITALS_LOG !== 'true') return noStore();
  const origin = request.headers.get('origin');
  const expectedOrigin = process.env.RIPODOC_APP_ORIGIN;
  if (!expectedOrigin || origin !== expectedOrigin) return noStore(403);
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/json') return noStore(415);
  const contentLength = Number(request.headers.get('content-length') ?? '0');
  if (!Number.isFinite(contentLength) || contentLength > 512) return noStore(413);
  const metric = parsePublicWebVital(await request.json().catch(() => undefined));
  if (!metric) return noStore(400);
  process.stdout.write(`${JSON.stringify({ type: 'web-vitals', ...metric, at: new Date().toISOString() })}\n`);
  return noStore();
}
