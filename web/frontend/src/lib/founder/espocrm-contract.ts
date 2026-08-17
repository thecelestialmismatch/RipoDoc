import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';

/** The only lead shape permitted to cross from consented RipoDoc intake into CRM sync. */
export interface CrmSyncLead {
  readonly leadId: string;
  readonly contactName: string;
  readonly companyName: string;
  readonly email: string;
  readonly companySizeBand: string;
  readonly reportingToolBand: string;
  readonly interestMode: string;
  readonly source: string;
}

/** Reject origins that could reach local or private infrastructure. */
export const isBlockedCrmAddress = (address: string): boolean => {
  const family = isIP(address);
  if (family === 4) {
    const octets = address.split('.').map(Number);
    const first = octets[0];
    const second = octets[1];
    if (first === undefined || second === undefined || octets.length !== 4 || octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
    return first === 0 || first === 10 || first === 127 || first >= 224 ||
      (first === 100 && second >= 64 && second <= 127) ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && (second === 0 || second === 168)) ||
      (first === 198 && (second === 18 || second === 19 || second === 51)) ||
      (first === 203 && second === 0);
  }
  if (family === 6) {
    const normalized = address.toLowerCase();
    return normalized === '::' || normalized === '::1' || normalized.startsWith('fc') ||
      normalized.startsWith('fd') || normalized.startsWith('fe80:') || normalized.startsWith('::ffff:');
  }
  return true;
};

/** Official EspoCRM HMAC authorization format, scoped to one API request URI. */
export const espocrmAuthorization = (method: string, uri: string, apiKey: string, hmacSecret: string): string => {
  const signature = createHmac('sha256', hmacSecret).update(`${method.toUpperCase()} /${uri}`).digest('hex');
  return Buffer.from(`${apiKey}:${signature}`, 'utf8').toString('base64');
};

const safeName = (name: string): { readonly firstName?: string; readonly lastName: string } => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const lastName = parts.pop() || 'Prospect';
  const firstName = parts.join(' ');
  return firstName ? { firstName, lastName } : { lastName };
};

/** Maps only explicitly consented business-development fields to standard EspoCRM Lead attributes. */
export const espocrmLeadPayload = (lead: CrmSyncLead): Readonly<Record<string, string>> => {
  const name = safeName(lead.contactName);
  return {
    ...name,
    emailAddress: lead.email,
    accountName: lead.companyName,
    description: [
      'RipoDoc founding-partner request.',
      `Company size: ${lead.companySizeBand}.`,
      `Current reporting: ${lead.reportingToolBand}.`,
      `Preferred operating model: ${lead.interestMode}.`,
      `Acquisition source: ${lead.source}.`,
      `RipoDoc lead reference: ${lead.leadId}.`,
    ].join('\n'),
  };
};
