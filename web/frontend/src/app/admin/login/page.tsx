import { redirect } from 'next/navigation';

/**
 * The deployment-wide administrator access-key flow has been retired. Private
 * operations now require an individually attributable, verified workspace
 * session with an owner or admin role.
 */
export default function AdminLoginPage() {
  redirect('/login');
}
