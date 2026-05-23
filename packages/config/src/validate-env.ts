import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET must be at least 16 characters"),
  APP_URL: z.string().url().optional(),
  ADMIN_URL: z.string().url().optional(),
  API_URL: z.string().url().optional()
});

export function validateEnv(env: Record<string, string | undefined>): void {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    const message = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    throw new Error(`Environment validation failed: ${message}`);
  }
}
