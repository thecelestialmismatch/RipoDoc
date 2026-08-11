const appOrigin = (): string => {
  const configured = process.env.RIPODOC_APP_ORIGIN;
  if (!configured) throw new Error('RIPODOC_APP_ORIGIN is required for authentication email links.');
  const url = new URL(configured);
  if (url.protocol !== 'https:' && process.env.NODE_ENV === 'production') throw new Error('RIPODOC_APP_ORIGIN must use HTTPS in production.');
  return url.origin;
};

const send = async (to: string, subject: string, text: string): Promise<void> => {
  const apiKey = process.env.RIPODOC_RESEND_API_KEY;
  const from = process.env.RIPODOC_EMAIL_FROM;
  if (!apiKey || !from) throw new Error('RIPODOC_RESEND_API_KEY and RIPODOC_EMAIL_FROM are required for authentication email.');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, text }),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Authentication email delivery failed.');
};

const destination = (path: string): string => new URL(path, appOrigin()).toString();

/** The code is shown in the email body and is never placed in a URL, request log, or audit event. */
export const sendVerificationEmail = async (email: string, code: string): Promise<void> =>
  send(email, 'Verify your RipoDoc email address', `Verify your email to activate your RipoDoc workspace. Open ${destination('/verify-email')} and enter this one-time code:\n\n${code}\n\nThe code expires in 30 minutes. If you did not request this, you can ignore this email.`);

/** The code is shown in the email body and is never placed in a URL, request log, or audit event. */
export const sendPasswordResetEmail = async (email: string, code: string): Promise<void> =>
  send(email, 'Reset your RipoDoc password', `Open ${destination('/reset-password')} and enter this one-time code to reset your RipoDoc password:\n\n${code}\n\nThe code expires in 30 minutes. If you did not request a reset, you can ignore this email.`);

export const sendEvidenceAccessCode = async (email: string, code: string): Promise<void> =>
  send(email, 'Verify access to your RipoDoc evidence', `Open ${destination('/')} and enter this one-time evidence access code when prompted:\n\n${code}\n\nThe code expires in 15 minutes and is never placed in a URL.`);
