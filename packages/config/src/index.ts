export type AppConfig = {
  databaseUrl: string;
  redisUrl: string;
  appUrl: string;
  adminUrl: string;
  apiUrl: string;
  authSecret: string;
  googleClientId: string;
  googleClientSecret: string;
};

export { validateEnv } from "./validate-env";

export function readConfig(env: Record<string, string | undefined>): AppConfig {
  return {
    databaseUrl: env.DATABASE_URL ?? "",
    redisUrl: env.REDIS_URL ?? "",
    appUrl: env.APP_URL ?? "http://localhost:3000",
    adminUrl: env.ADMIN_URL ?? "http://localhost:3001",
    apiUrl: env.API_URL ?? "http://localhost:3002",
    authSecret: env.AUTH_SECRET ?? "",
    googleClientId: env.GOOGLE_CLIENT_ID ?? "",
    googleClientSecret: env.GOOGLE_CLIENT_SECRET ?? ""
  };
}
