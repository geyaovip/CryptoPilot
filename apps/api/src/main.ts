import "reflect-metadata";
import { validateEnv } from "@cryptopilot/config";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app.module";
import { ApiExceptionFilter } from "./modules/common/api-exception.filter";
import { PrismaService } from "./modules/prisma/prisma.service";

const DEFAULT_CORS_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://cryptopilot.chat",
  "https://admin.cryptopilot.chat"
];

function normalizeOrigin(origin?: string) {
  return origin?.trim().replace(/\/$/, "");
}

function corsOrigins() {
  const configured = [
    process.env.APP_URL,
    process.env.ADMIN_URL,
    process.env.ADMIN_APP_URL,
    ...(process.env.CORS_ORIGINS?.split(",") ?? [])
  ];
  return Array.from(new Set([...DEFAULT_CORS_ORIGINS, ...configured].map(normalizeOrigin).filter(Boolean)));
}

async function bootstrap() {
  validateEnv(process.env);
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new ApiExceptionFilter(app.get(PrismaService)));
  const allowedOrigins = new Set(corsOrigins());
  app.enableCors({
    origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]
  });
  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3002);
}

void bootstrap();
