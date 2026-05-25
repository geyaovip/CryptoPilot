CREATE TYPE content_locale AS ENUM ('zh', 'en');

ALTER TABLE sources ADD COLUMN IF NOT EXISTS content_locale content_locale NOT NULL DEFAULT 'en';

CREATE INDEX IF NOT EXISTS sources_content_locale_idx ON sources (content_locale);
