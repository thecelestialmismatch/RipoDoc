import { NextResponse } from 'next/server';

const retired = () => NextResponse.json(
  { error: 'The direct local draft proxy has been retired. Use the authenticated authoring workflow.' },
  { status: 410, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } },
);

/**
 * Draft data is no longer proxied by a browser-controlled identifier. The
 * private worker accepts only server-issued, short-lived tenant capabilities
 * through /api/authoring.
 */
export async function GET() { return retired(); }
export async function PUT() { return retired(); }
export async function DELETE() { return retired(); }
