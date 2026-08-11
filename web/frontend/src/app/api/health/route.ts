import { NextResponse } from 'next/server';
import { authConfigured } from '@/lib/auth/primitives.ts';
import { getSecurityPosture } from '@/lib/evidence/security-status.ts';

export const dynamic = 'force-dynamic';

/**
 * Minimal deployment-health surface. It intentionally reports only service
 * readiness flags and never returns secrets, recipient identities, report ids,
 * session identifiers, audit events, or environment values.
 */
export async function GET(): Promise<NextResponse> {
  const posture = await getSecurityPosture();
  const body = {
    status: 'ok',
    service: 'ripodoc-web',
    auth: authConfigured() ? 'configured' : 'not-configured',
    evidenceSigning: posture.evidenceSecretConfigured ? 'configured' : 'not-configured',
    auditPersistence: posture.auditLog.mode,
  };

  return NextResponse.json(body, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
