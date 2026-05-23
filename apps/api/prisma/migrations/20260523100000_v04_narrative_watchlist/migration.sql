-- V0.4 Narrative + Watchlist

CREATE TYPE "watchlist_target_type" AS ENUM ('token', 'narrative', 'kol');
CREATE TYPE "kol_platform" AS ENUM ('twitter', 'youtube', 'other');

ALTER TABLE "tokens" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "tokens" ADD COLUMN "display_order" INTEGER NOT NULL DEFAULT 0;
CREATE INDEX "tokens_is_active_idx" ON "tokens"("is_active");

ALTER TABLE "narratives" ADD COLUMN "ai_summary" TEXT;
ALTER TABLE "narratives" ADD COLUMN "sentiment" "sentiment" NOT NULL DEFAULT 'neutral';
ALTER TABLE "narratives" ADD COLUMN "heat_score" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "narratives" ADD COLUMN "trend_score_24h" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "narratives" ADD COLUMN "trend_score_7d" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "narratives" ADD COLUMN "feed_count_24h" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "narratives" ADD COLUMN "weight" INTEGER NOT NULL DEFAULT 50;
ALTER TABLE "narratives" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "narratives" ADD COLUMN "merged_into_id" UUID;
CREATE INDEX "narratives_is_active_heat_score_idx" ON "narratives"("is_active", "heat_score");
CREATE INDEX "narratives_merged_into_id_idx" ON "narratives"("merged_into_id");
ALTER TABLE "narratives" ADD CONSTRAINT "narratives_merged_into_id_fkey" FOREIGN KEY ("merged_into_id") REFERENCES "narratives"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "kols" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "handle" VARCHAR(255) NOT NULL,
    "platform" "kol_platform" NOT NULL DEFAULT 'twitter',
    "profile_url" TEXT,
    "influence_score" INTEGER NOT NULL DEFAULT 50,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "kols_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "kols_platform_handle_key" ON "kols"("platform", "handle");
CREATE INDEX "kols_is_active_idx" ON "kols"("is_active");

CREATE TABLE "watchlist_items" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "target_type" "watchlist_target_type" NOT NULL,
    "target_id" UUID NOT NULL,
    "notifications_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "watchlist_items_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "watchlist_items_user_id_target_type_target_id_key" ON "watchlist_items"("user_id", "target_type", "target_id");
CREATE INDEX "watchlist_items_user_id_target_type_idx" ON "watchlist_items"("user_id", "target_type");
ALTER TABLE "watchlist_items" ADD CONSTRAINT "watchlist_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "narrative_heat_snapshots" (
    "id" UUID NOT NULL,
    "narrative_id" UUID NOT NULL,
    "heat_score" INTEGER NOT NULL,
    "twitter_mentions" INTEGER NOT NULL DEFAULT 0,
    "feed_count" INTEGER NOT NULL DEFAULT 0,
    "token_volume_change" DECIMAL(10,4),
    "captured_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "narrative_heat_snapshots_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "narrative_heat_snapshots_narrative_id_captured_at_idx" ON "narrative_heat_snapshots"("narrative_id", "captured_at");
ALTER TABLE "narrative_heat_snapshots" ADD CONSTRAINT "narrative_heat_snapshots_narrative_id_fkey" FOREIGN KEY ("narrative_id") REFERENCES "narratives"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
