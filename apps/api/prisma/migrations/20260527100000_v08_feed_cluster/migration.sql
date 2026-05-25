ALTER TABLE feed_items ADD COLUMN IF NOT EXISTS cluster_id UUID;

CREATE INDEX IF NOT EXISTS feed_items_cluster_id_idx ON feed_items (cluster_id);
