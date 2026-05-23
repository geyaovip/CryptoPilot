CREATE TYPE source_type AS ENUM ('rss', 'twitter', 'reddit', 'coingecko', 'manual');
CREATE TYPE source_status AS ENUM ('active', 'paused', 'error');
CREATE TYPE feed_type AS ENUM ('news', 'narrative', 'market_move', 'social_trend', 'breaking');
CREATE TYPE feed_status AS ENUM ('published', 'hidden', 'deleted');
CREATE TYPE sentiment AS ENUM ('bullish', 'neutral', 'bearish');
CREATE TYPE ingestion_status AS ENUM ('success', 'failed');

CREATE TABLE sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  type source_type NOT NULL,
  status source_status NOT NULL DEFAULT 'active',
  url text,
  source_weight integer NOT NULL DEFAULT 50,
  fetch_interval_seconds integer NOT NULL DEFAULT 300,
  last_success_at timestamp,
  last_error_at timestamp,
  error_message text,
  deleted_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX sources_status_idx ON sources(status);

CREATE TABLE tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol varchar(32) NOT NULL UNIQUE,
  name varchar(255) NOT NULL,
  coingecko_id varchar(255),
  price_usd numeric(18, 8),
  price_change_24h numeric(10, 4),
  deleted_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX tokens_symbol_idx ON tokens(symbol);

CREATE TABLE narratives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  slug varchar(255) NOT NULL UNIQUE,
  description text,
  deleted_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX narratives_slug_idx ON narratives(slug);

CREATE TABLE feed_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES sources(id),
  title varchar(500) NOT NULL,
  content text NOT NULL,
  ai_summary text NOT NULL,
  source_url text NOT NULL UNIQUE,
  type feed_type NOT NULL DEFAULT 'news',
  status feed_status NOT NULL DEFAULT 'published',
  sentiment sentiment NOT NULL DEFAULT 'neutral',
  heat_score integer NOT NULL DEFAULT 0,
  rank_score integer NOT NULL DEFAULT 0,
  publish_time timestamp NOT NULL,
  is_pinned boolean NOT NULL DEFAULT false,
  deleted_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX feed_items_source_id_idx ON feed_items(source_id);
CREATE INDEX feed_items_publish_time_idx ON feed_items(publish_time);
CREATE INDEX feed_items_rank_score_idx ON feed_items(rank_score);
CREATE INDEX feed_items_heat_score_idx ON feed_items(heat_score);
CREATE INDEX feed_items_status_idx ON feed_items(status);

CREATE TABLE feed_item_tokens (
  feed_item_id uuid NOT NULL REFERENCES feed_items(id),
  token_id uuid NOT NULL REFERENCES tokens(id),
  PRIMARY KEY (feed_item_id, token_id)
);

CREATE INDEX feed_item_tokens_token_id_idx ON feed_item_tokens(token_id);

CREATE TABLE feed_item_narratives (
  feed_item_id uuid NOT NULL REFERENCES feed_items(id),
  narrative_id uuid NOT NULL REFERENCES narratives(id),
  PRIMARY KEY (feed_item_id, narrative_id)
);

CREATE INDEX feed_item_narratives_narrative_id_idx ON feed_item_narratives(narrative_id);

CREATE TABLE bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  feed_item_id uuid NOT NULL REFERENCES feed_items(id),
  created_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT bookmarks_user_feed_unique UNIQUE (user_id, feed_item_id)
);

CREATE INDEX bookmarks_feed_item_id_idx ON bookmarks(feed_item_id);

CREATE TABLE ingestion_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES sources(id),
  started_at timestamp NOT NULL,
  finished_at timestamp,
  status ingestion_status NOT NULL,
  items_found integer NOT NULL DEFAULT 0,
  items_created integer NOT NULL DEFAULT 0,
  error_message text,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX ingestion_logs_source_id_created_at_idx ON ingestion_logs(source_id, created_at);

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid,
  action varchar(255) NOT NULL,
  entity_type varchar(255) NOT NULL,
  entity_id varchar(255),
  before_json jsonb,
  after_json jsonb,
  ip_address varchar(255),
  user_agent text,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_admin_user_id_created_at_idx ON audit_logs(admin_user_id, created_at);
