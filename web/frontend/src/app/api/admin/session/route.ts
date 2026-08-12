import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const retired = () => NextResponse.json(
  { error: 'Shared administrator access has been retired. Sign in with a verified owner or admin workspace account.' },
  { status: 410, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } },
);

/** Individual workspace sessions now authorize /admin. This route mints no cookies. */
export async function POST(): Promise<Response> { return retired(); }
export async function DELETE(): Promise<Response> { return retired(); }
