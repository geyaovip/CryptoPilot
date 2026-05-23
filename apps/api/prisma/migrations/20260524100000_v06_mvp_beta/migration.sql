-- V0.6 MVP Beta

CREATE TABLE "system_settings" (
    "key" VARCHAR(128) NOT NULL,
    "value_json" JSONB NOT NULL,
    "updated_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("key")
);

CREATE TABLE "api_error_logs" (
    "id" UUID NOT NULL,
    "method" VARCHAR(16) NOT NULL,
    "path" VARCHAR(512) NOT NULL,
    "status_code" INTEGER NOT NULL,
    "error_code" VARCHAR(64) NOT NULL,
    "message" TEXT NOT NULL,
    "request_id" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "api_error_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "api_error_logs_error_code_created_at_idx" ON "api_error_logs"("error_code", "created_at");
CREATE INDEX "api_error_logs_created_at_idx" ON "api_error_logs"("created_at");
