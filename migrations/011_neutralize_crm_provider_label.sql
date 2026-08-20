-- Bring existing deployments to the neutral RipoDoc CRM provider label.
-- The CRM sync remains strictly consent-gated and separate from evidence data.

ALTER TABLE founding_partner_crm_syncs
    DROP CONSTRAINT IF EXISTS founding_partner_crm_syncs_provider_check;

UPDATE founding_partner_crm_syncs
    SET provider = 'ripodoc-crm'
    WHERE provider <> 'ripodoc-crm';

ALTER TABLE founding_partner_crm_syncs
    ALTER COLUMN provider SET DEFAULT 'ripodoc-crm';

ALTER TABLE founding_partner_crm_syncs
    ADD CONSTRAINT founding_partner_crm_syncs_provider_check
    CHECK (provider = 'ripodoc-crm');
