import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';

export interface EncryptedLeadEmail {
  readonly ciphertext: string;
  readonly iv: string;
  readonly tag: string;
  readonly keyId: 'v1';
}

const leadEncryptionKey = (): Buffer => {
  const value = process.env.RIPODOC_LEAD_ENCRYPTION_KEY;
  if (!value) throw new Error('RIPODOC_LEAD_ENCRYPTION_KEY is required for founding-partner intake.');
  const key = Buffer.from(value, 'base64url');
  if (key.length !== 32) throw new Error('RIPODOC_LEAD_ENCRYPTION_KEY must decode to exactly 32 bytes.');
  return key;
};

export const leadIntakeConfigured = (): boolean => {
  try {
    leadEncryptionKey();
    return true;
  } catch {
    return false;
  }
};

export const encryptLeadEmail = (email: string): EncryptedLeadEmail => {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, leadEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(email, 'utf8'), cipher.final()]);
  return {
    ciphertext: ciphertext.toString('base64url'),
    iv: iv.toString('base64url'),
    tag: cipher.getAuthTag().toString('base64url'),
    keyId: 'v1',
  };
};

export const decryptLeadEmail = (encrypted: EncryptedLeadEmail): string => {
  if (encrypted.keyId !== 'v1') throw new Error('Unsupported founding-partner contact key version.');
  const decipher = createDecipheriv(ALGORITHM, leadEncryptionKey(), Buffer.from(encrypted.iv, 'base64url'));
  decipher.setAuthTag(Buffer.from(encrypted.tag, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(encrypted.ciphertext, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
};
