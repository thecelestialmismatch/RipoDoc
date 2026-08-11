import { NextResponse } from 'next/server';
import { assertSameOriginAndCsrf } from '@/lib/auth/server.ts';
import { consumeRecipientProof, EVIDENCE_PROOF_COOKIE, issueRecipientProof, recipientProofValue } from '@/lib/evidence/recipient-proof.ts';
import { evidenceSecret, revokedTokenIds } from '@/lib/evidence/config.ts';
import { currentUnixSeconds } from '@/lib/evidence/clock.ts';
import { hashRecipient, verifyEvidenceToken } from '@/lib/evidence/token.ts';
import { loadManifest } from '@/lib/evidence/store.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const redirect = (request: Request, token: string, status: string) => {
  const url = new URL(`/e/${encodeURIComponent(token)}/access`, request.url);
  url.searchParams.set('status', status);
  return NextResponse.redirect(url, { status: 303 });
};

export async function POST(request: Request): Promise<Response> {
  const form = await request.formData().catch(() => undefined);
  const token = typeof form?.get('token') === 'string' ? String(form.get('token')) : '';
  if (!form || !(await assertSameOriginAndCsrf(request, form.get('csrf')))) return redirect(request, token, 'invalid');
  const verified = verifyEvidenceToken(token, evidenceSecret(), { now: await currentUnixSeconds(), revoked: revokedTokenIds() });
  if (!verified.ok) return redirect(request, token, 'invalid');
  const manifest = await loadManifest(verified.claims.reportId);
  if (!manifest || hashRecipient(manifest.recipient.email) !== verified.claims.recipientHash) return redirect(request, token, 'invalid');
  if (form.get('action') === 'send') {
    await issueRecipientProof(token, manifest.recipient.email).catch(() => undefined);
    return redirect(request, token, 'sent');
  }
  const accepted = await consumeRecipientProof(token, String(form.get('code') ?? ''));
  if (!accepted) return redirect(request, token, 'invalid');
  const response = NextResponse.redirect(new URL(`/e/${encodeURIComponent(token)}`, request.url), { status: 303 });
  response.cookies.set({ name: EVIDENCE_PROOF_COOKIE, value: recipientProofValue(token), httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/e', maxAge: 15 * 60 });
  return response;
}
