import { NextResponse } from 'next/server';
import { authConfigured } from '@/lib/auth/primitives.ts';
import { verifyCaptcha } from '@/lib/auth/captcha.ts';
import { assertSameOriginAndCsrf, clientIp } from '@/lib/auth/server.ts';
import { leadIntakeConfigured } from '@/lib/founder/lead-crypto.ts';
import { submitFoundingPartnerLead } from '@/lib/founder/leads.ts';
import { syncConsentedLeadToCrm } from '@/lib/founder/crm.ts';
import { healthcareModeBEnabled } from '@/lib/launch/healthcare-webhooks.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const destination = (request: Request, status: 'received' | 'unavailable' | 'invalid'): NextResponse => {
  const url = new URL('/founding-partners', request.url);
  url.searchParams.set('status', status);
  return NextResponse.redirect(url, { status: 303 });
};

export async function POST(request: Request): Promise<Response> {
  const form = await request.formData().catch(() => undefined);
  if (!form) return destination(request, 'invalid');
  const csrf = form.get('csrf');
  if (!(await assertSameOriginAndCsrf(request, csrf))) return destination(request, 'invalid');
  if (healthcareModeBEnabled() || !authConfigured() || !leadIntakeConfigured()) return destination(request, 'unavailable');

  const ip = clientIp(request);
  if (!(await verifyCaptcha(form.get('captcha'), ip))) return destination(request, 'received');

  try {
    const consentedLead = await submitFoundingPartnerLead({
      contactName: String(form.get('contactName') ?? ''),
      companyName: String(form.get('companyName') ?? ''),
      email: String(form.get('email') ?? ''),
      companySizeBand: String(form.get('companySizeBand') ?? ''),
      reportingToolBand: String(form.get('reportingToolBand') ?? ''),
      interestMode: String(form.get('interestMode') ?? ''),
      source: String(form.get('source') ?? 'website'),
      crmSyncConsent: form.get('crmSyncConsent') === 'yes',
      ip,
    });
    if (consentedLead) await syncConsentedLeadToCrm(consentedLead);
  } catch {
    return destination(request, 'unavailable');
  }

  return destination(request, 'received');
}
