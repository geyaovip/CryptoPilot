-- Add composite indices for faster query of logs by status + created_at
CREATE INDEX IF NOT EXISTS "LlmCallLog_status_createdAt_idx" ON "llm_call_logs"("status", "created_at");
CREATE INDEX IF NOT EXISTS "IngestionLog_status_createdAt_idx" ON "ingestion_logs"("status", "created_at");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "audit_logs"("created_at");
