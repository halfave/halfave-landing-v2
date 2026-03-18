-- Run this in the Supabase SQL editor for project mjkkzniagexfooclqsjr
-- Creates a lead capture table for email gateway submissions

CREATE TABLE IF NOT EXISTS analytics.report_leads (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email          text NOT NULL,
  building_id    uuid REFERENCES analytics.buildings(id),
  building_address text,
  risk_bucket    text,
  risk_score     numeric,
  created_at     timestamptz DEFAULT now()
);

-- Index for deduplication queries
CREATE INDEX IF NOT EXISTS report_leads_email_idx ON analytics.report_leads(email);
CREATE INDEX IF NOT EXISTS report_leads_building_idx ON analytics.report_leads(building_id);
