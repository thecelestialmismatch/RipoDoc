import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, validAdminSessionValue } from './session.ts';

/**
 * Request-bound administrator session verification. Keep this Next import out of
 * the pure session module so token validation can be tested with the standard
 * Node runtime.
 */
export const isAdminSession = async (): Promise<boolean> => {
  const cookieStore = await cookies();
  return validAdminSessionValue(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
};
