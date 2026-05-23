-- V0.8 Narrative Feed: Phase 2 types + optional narrative hook (Scheme A)

ALTER TYPE feed_type ADD VALUE IF NOT EXISTS 'narrative_shift';
ALTER TYPE feed_type ADD VALUE IF NOT EXISTS 'sentiment_spike';
ALTER TYPE feed_type ADD VALUE IF NOT EXISTS 'market_rotation';
ALTER TYPE feed_type ADD VALUE IF NOT EXISTS 'kol_signal';

ALTER TABLE feed_items ADD COLUMN IF NOT EXISTS narrative_hook VARCHAR(500);
