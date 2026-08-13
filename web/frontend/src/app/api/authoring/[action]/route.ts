import { NextRequest, NextResponse } from 'next/server';
import { assertSameOriginAndCsrf, currentSessionUser } from '@/lib/auth/server.ts';
import { authoringConfigured, canAuthorReports, opaqueWorkerError, workerRequest } from '@/lib/authoring/worker.ts';
import { healthcareModeBEnabled, modeBPrivateAuthoringAllowed } from '@/lib/launch/healthcare-webhooks.ts';

const noStore = (response: NextResponse): NextResponse => {
  response.headers.set('Cache-Control', 'no-store');
  return response;
};

const failure = (status: number, error: string, requestId?: string): NextResponse => noStore(NextResponse.json({ error, ...(requestId ? { requestId } : {}) }, { status }));

const requireAuthor = async (): Promise<{ user: NonNullable<Awaited<ReturnType<typeof currentSessionUser>>> } | NextResponse> => {
  const user = await currentSessionUser();
  if (!user?.emailVerifiedAt || user.disabledAt) return failure(401, 'A verified workspace session is required.');
  if (healthcareModeBEnabled() && !modeBPrivateAuthoringAllowed()) return failure(403, 'Healthcare Mode B does not permit public authoring in this deployment.');
  if (!authoringConfigured()) return failure(503, 'Private authoring is not configured for this deployment.');
  if (!canAuthorReports(user)) return failure(403, 'This workspace role cannot use private authoring.');
  return { user };
};

const workerJson = async (response: Response): Promise<NextResponse> => {
  if (!response.ok) {
    const safe = opaqueWorkerError(response);
    return failure(safe.status, safe.error, safe.requestId);
  }
  const data = await response.json().catch(() => ({}));
  return noStore(NextResponse.json(data, { status: response.status }));
};

const safeDraftId = (input: unknown): string | undefined => typeof input === 'string' && /^draft-[a-f0-9]{16}$/.test(input) ? input : undefined;

const csrfHeader = (request: NextRequest): string | undefined => request.headers.get('x-ripodoc-csrf') ?? undefined;

export async function POST(request: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  const principal = await requireAuthor();
  if (principal instanceof NextResponse) return principal;

  if (action === 'upload') {
    const form = await request.formData().catch(() => undefined);
    if (!form || !(await assertSameOriginAndCsrf(request, csrfHeader(request)))) return failure(403, 'This authoring request could not be verified.');
    const pdf = form.get('pdf');
    const manifest = form.get('manifest');
    if (!(pdf instanceof File) || typeof manifest !== 'string') return failure(400, 'A PDF and validated report manifest are required.');
    const response = await workerRequest(principal.user, 'upload', 'upload-pdf', { method: 'POST', body: form });
    return workerJson(response);
  }

  if (action === 'review') {
    const form = await request.formData().catch(() => undefined);
    const draftId = safeDraftId(form?.get('draftId'));
    if (!form || !draftId || !(await assertSameOriginAndCsrf(request, csrfHeader(request)))) return failure(403, 'This authoring request could not be verified.');
    if (!(form.get('proposal') instanceof File)) return failure(400, 'A reviewed placement proposal is required.');
    const response = await workerRequest(principal.user, 'review', 'review-placement', { method: 'POST', body: form }, draftId);
    return workerJson(response);
  }

  if (action === 'publish') {
    const body = await request.json().catch(() => ({}));
    const draftId = safeDraftId(body.draftId);
    if (!draftId || !(await assertSameOriginAndCsrf(request, body.csrf))) return failure(403, 'This authoring request could not be verified.');
    const requestedTtl = Number(body.ttlDays);
    const ttlDays = [1, 7, 14, 30].includes(requestedTtl) ? requestedTtl : 14;
    const origin = process.env.RIPODOC_APP_ORIGIN;
    if (!origin) return failure(503, 'Private authoring is not configured for this deployment.');
    const response = await workerRequest(
      principal.user,
      'publish',
      'publish-pdf',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ draftId, origin, ttlDays }) },
      draftId,
    );
    return workerJson(response);
  }

  return failure(404, 'Authoring action not found.');
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  const principal = await requireAuthor();
  if (principal instanceof NextResponse) return principal;
  const draftId = safeDraftId(request.nextUrl.searchParams.get('draftId'));
  if (!draftId) return failure(400, 'The authoring artifact reference is invalid.');

  const isProposal = action === 'proposal';
  const isArtifact = action === 'artifact';
  if (!isProposal && !isArtifact) return failure(404, 'Authoring action not found.');

  const path = isProposal ? `download-placement/${draftId}` : `download-pdf/${draftId}-clickable.pdf`;
  const scope = isProposal ? 'proposal-download' : 'artifact-download';
  const response = await workerRequest(principal.user, scope, path, { method: 'GET' }, draftId);
  if (!response.ok) {
    const safe = opaqueWorkerError(response);
    return failure(safe.status, safe.error, safe.requestId);
  }

  const contentType = isProposal ? 'application/json; charset=utf-8' : 'application/pdf';
  const filename = isProposal ? `${draftId}.placements.json` : `${draftId}-clickable.pdf`;
  const bytes = await response.arrayBuffer();
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
