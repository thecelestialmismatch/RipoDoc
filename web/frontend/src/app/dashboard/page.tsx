import { redirect } from 'next/navigation';
import { WorkspaceCommandCenter } from '@/components/dashboard/WorkspaceCommandCenter.tsx';
import { currentSessionUser } from '@/lib/auth/server.ts';
import { listTenantReports } from '@/lib/workspace/reports.ts';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await currentSessionUser();
  if (!user) redirect('/login');

  // Tenant scoping remains server-side. The client command center receives only
  // manifests selected by this verified workspace identity.
  const reports = await listTenantReports(user.tenantId);

  return <WorkspaceCommandCenter user={user} reports={reports} />;
}
