import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Public deployment liveness probe. Configuration posture belongs to authenticated
 * operator checks and the reviewed security ledger, never an anonymous endpoint.
 */
export async function GET(): Promise<NextResponse> {
  const body = {
    status: 'ok',
    service: 'ripodoc-web',
  };

  return NextResponse.json(body, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
