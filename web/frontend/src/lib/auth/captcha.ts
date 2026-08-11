export const captchaSiteKey = (): string | undefined => process.env.NEXT_PUBLIC_RIPODOC_TURNSTILE_SITE_KEY;

const bypassAllowed = (): boolean => process.env.NODE_ENV !== 'production' && process.env.RIPODOC_ALLOW_DEV_AUTH_NO_CAPTCHA === 'true';

export const captchaConfigured = (): boolean => Boolean(captchaSiteKey() && process.env.RIPODOC_TURNSTILE_SECRET);

export const verifyCaptcha = async (token: unknown, ip: string): Promise<boolean> => {
  if (bypassAllowed()) return true;
  const secret = process.env.RIPODOC_TURNSTILE_SECRET;
  if (!secret || typeof token !== 'string' || token.length < 20) return false;
  try {
    const body = new URLSearchParams({ secret, response: token, remoteip: ip });
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    });
    const result: unknown = await response.json();
    return typeof result === 'object' && result !== null && 'success' in result && result.success === true;
  } catch {
    return false;
  }
};
