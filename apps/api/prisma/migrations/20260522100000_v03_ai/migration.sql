CREATE TYPE prompt_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE llm_call_status AS ENUM ('success', 'failed');

ALTER TABLE feed_items
  ADD COLUMN ai_key_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN ai_market_impact TEXT,
  ADD COLUMN ai_generated_at TIMESTAMP,
  ADD COLUMN ai_generation_error TEXT;

CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_key VARCHAR(128) NOT NULL,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  status prompt_status NOT NULL DEFAULT 'draft',
  created_by UUID,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT prompts_prompt_key_version_unique UNIQUE (prompt_key, version)
);

CREATE INDEX prompts_prompt_key_status_idx ON prompts(prompt_key, status);

CREATE TABLE ai_search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  query TEXT NOT NULL,
  answer TEXT NOT NULL,
  sources_json JSONB NOT NULL,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  provider VARCHAR(64) NOT NULL,
  model VARCHAR(128) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX ai_search_history_user_id_created_at_idx ON ai_search_history(user_id, created_at);

CREATE TABLE llm_call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  prompt_key VARCHAR(128) NOT NULL,
  provider VARCHAR(64) NOT NULL,
  model VARCHAR(128) NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cost_usd DECIMAL(12, 6) NOT NULL DEFAULT 0,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  status llm_call_status NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX llm_call_logs_prompt_key_created_at_idx ON llm_call_logs(prompt_key, created_at);

CREATE TABLE content_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(64) NOT NULL,
  entity_id UUID NOT NULL,
  embedding vector(1536) NOT NULL,
  embedding_model VARCHAR(128) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT content_embeddings_entity_unique UNIQUE (entity_type, entity_id)
);

CREATE INDEX content_embeddings_entity_idx ON content_embeddings(entity_type, entity_id);
