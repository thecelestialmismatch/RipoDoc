-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Tenants: users can only see their own tenant
CREATE POLICY tenant_isolation ON tenants
    FOR ALL TO PUBLIC
    USING (id = current_setting('app.current_tenant', true));

-- Users: users can only see users in their tenant
CREATE POLICY tenant_isolation ON users
    FOR ALL TO PUBLIC
    USING (tenant_id = current_setting('app.current_tenant', true));

-- Customers: users can only see customers in their tenant
CREATE POLICY tenant_isolation ON customers
    FOR ALL TO PUBLIC
    USING (tenant_id = current_setting('app.current_tenant', true));

-- Reports: users can only see reports in their tenant
CREATE POLICY tenant_isolation ON reports
    FOR ALL TO PUBLIC
    USING (tenant_id = current_setting('app.current_tenant', true));

-- Report elements: users can only see elements for reports in their tenant
CREATE POLICY tenant_isolation ON report_elements
    FOR ALL TO PUBLIC
    USING (report_id IN (
        SELECT id FROM reports 
        WHERE tenant_id = current_setting('app.current_tenant', true)
    ));

-- Share links: users can only see share links for reports in their tenant
CREATE POLICY tenant_isolation ON share_links
    FOR ALL TO PUBLIC
    USING (report_id IN (
        SELECT id FROM reports 
        WHERE tenant_id = current_setting('app.current_tenant', true)
    ));

-- Audit events: users can only see audit events in their tenant
CREATE POLICY tenant_isolation ON audit_events
    FOR ALL TO PUBLIC
    USING (tenant_id = current_setting('app.current_tenant', true));