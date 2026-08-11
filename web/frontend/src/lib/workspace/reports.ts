import { parseManifest } from '@/lib/evidence/manifest.ts';
import type { ReportManifest } from '@/lib/evidence/types.ts';
import { query } from '@/lib/auth/database.ts';

interface ReportRow { readonly manifest: unknown; }

export const listTenantReports = async (tenantId: string): Promise<readonly ReportManifest[]> => {
  const rows = await query<ReportRow>(`SELECT manifest FROM workspace_reports WHERE tenant_id = $1 ORDER BY published_at DESC`, [tenantId]);
  return rows.flatMap((row) => {
    try { return [parseManifest(row.manifest)]; } catch { return []; }
  });
};

export const loadTenantReport = async (tenantId: string, reportId: string): Promise<ReportManifest | undefined> => {
  const rows = await query<ReportRow>(`SELECT manifest FROM workspace_reports WHERE tenant_id = $1 AND report_id = $2 LIMIT 1`, [tenantId, reportId]);
  const row = rows[0];
  if (!row) return undefined;
  try { return parseManifest(row.manifest); } catch { return undefined; }
};
