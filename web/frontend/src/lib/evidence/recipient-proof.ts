import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { sendEvidenceAccessCode } from '@/lib/auth/email.ts';
import { query, transaction } from '@/lib/auth/database.ts';
import { authSecret, randomToken, safeCompare, tokenHash } from '@/lib/auth/primitives.ts';
import { createHmac } from 'node:crypto';

export const EVIDENCE_PROOF_COOKIE = 'ripodoc_evidence_proof';
const proofHash = (token: string): string => createHmac('sha256', authSecret()).update(`evidence-proof:${tokenHash(token)}`).digest('base64url');

export const issueRecipientProof = async (evidenceToken: string, email: string): Promise<void> => {
  const code = randomToken(32);
  await transaction(async (client) => {
    await client.query(`UPDATE evidence_recipient_challenges SET used_at = NOW() WHERE evidence_token_hash = $1 AND used_at IS NULL`, [tokenHash(evidenceToken)]);
    await client.query(`INSERT INTO evidence_recipient_challenges (id, evidence_token_hash, recipient_hash, code_hash, expires_at) VALUES ($1, $2, $3, $4, NOW() + INTERVAL '15 minutes')`, [randomUUID(), tokenHash(evidenceToken), tokenHash(email.trim().toLowerCase()), tokenHash(code)]);
  });
  await sendEvidenceAccessCode(email, code);
};

export const consumeRecipientProof = async (evidenceToken: string, code: string): Promise<boolean> => {
  const rows = await query<{ id: string }>(`UPDATE evidence_recipient_challenges SET used_at = NOW() WHERE evidence_token_hash = $1 AND code_hash = $2 AND used_at IS NULL AND expires_at > NOW() RETURNING id`, [tokenHash(evidenceToken), tokenHash(code)]);
  return rows.length === 1;
};

export const hasRecipientProof = async (evidenceToken: string): Promise<boolean> => {
  const store = await cookies();
  const supplied = store.get(EVIDENCE_PROOF_COOKIE)?.value;
  return typeof supplied === 'string' && safeCompare(supplied, proofHash(evidenceToken));
};

export const recipientProofValue = (evidenceToken: string): string => proofHash(evidenceToken);
