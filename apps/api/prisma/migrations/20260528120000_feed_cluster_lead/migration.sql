ALTER TABLE feed_items ADD COLUMN IF NOT EXISTS is_cluster_lead BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS feed_items_cluster_lead_idx ON feed_items (cluster_id, is_cluster_lead)
  WHERE cluster_id IS NOT NULL AND is_cluster_lead = true;
