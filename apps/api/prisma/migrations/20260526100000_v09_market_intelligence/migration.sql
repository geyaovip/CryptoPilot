-- V0.9 Market Intelligence

CREATE TYPE heat_label AS ENUM ('heating_up', 'cooling', 'stable');

CREATE TABLE market_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_insight TEXT NOT NULL,
  ai_summary TEXT NOT NULL,
  type feed_type NOT NULL DEFAULT 'news',
  sentiment sentiment NOT NULL DEFAULT 'neutral',
  heat_score INTEGER NOT NULL DEFAULT 0,
  heat_velocity INTEGER NOT NULL DEFAULT 0,
  heat_label heat_label NOT NULL DEFAULT 'stable',
  primary_narrative_id UUID REFERENCES narratives(id),
  rank_score INTEGER NOT NULL DEFAULT 0,
  sources_json JSONB NOT NULL DEFAULT '[]',
  key_reasons JSONB NOT NULL DEFAULT '[]',
  market_impact TEXT,
  status feed_status NOT NULL DEFAULT 'published',
  published_at TIMESTAMPTZ NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX market_insights_status_rank_idx ON market_insights(status, rank_score DESC);
CREATE INDEX market_insights_primary_narrative_idx ON market_insights(primary_narrative_id);
CREATE INDEX market_insights_published_at_idx ON market_insights(published_at DESC);

ALTER TABLE feed_items ADD COLUMN insight_id UUID REFERENCES market_insights(id);
CREATE INDEX feed_items_insight_id_idx ON feed_items(insight_id);

ALTER TABLE bookmarks ADD COLUMN entity_type VARCHAR(64) NOT NULL DEFAULT 'feed_item';
ALTER TABLE bookmarks ADD COLUMN entity_id UUID;

UPDATE bookmarks SET entity_id = feed_item_id WHERE entity_id IS NULL;
ALTER TABLE bookmarks ALTER COLUMN entity_id SET NOT NULL;

ALTER TABLE bookmarks ALTER COLUMN feed_item_id DROP NOT NULL;

ALTER TABLE bookmarks DROP CONSTRAINT IF EXISTS bookmarks_user_id_feed_item_id_key;
CREATE UNIQUE INDEX bookmarks_user_entity_unique ON bookmarks(user_id, entity_type, entity_id);
