import { redirect } from 'next/navigation';
import { UploadWorkspace } from '@/components/authoring/UploadWorkspace.tsx';
import { currentSessionUser } from '@/lib/auth/server.ts';

export const dynamic = 'force-dynamic';

/**
 * Authoring accepts customer report material only inside a verified workspace
 * session. Keep the route boundary server-side so an anonymous visitor never
 * begins a file-selection flow that the API will later reject.
 */
export default async function UploadPage() {
  const user = await currentSessionUser();
  if (!user?.emailVerifiedAt || user.disabledAt) redirect('/login?next=/upload');

  return <UploadWorkspace />;
}
