ALTER TABLE sources
ADD COLUMN IF NOT EXISTS consecutive_failures integer NOT NULL DEFAULT 0;
