import "reflect-metadata";
import { validateEnv } from "@cryptopilot/config";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app.module";
import { ApiExceptionFilter } from "./modules/common/api-exception.filter";
import { PrismaService } from "./modules/prisma/prisma.service";

async function bootstrap() {
  validateEnv(process.env);
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new ApiExceptionFilter(app.get(PrismaService)));
  app.enableCors({
    origin: [
      process.env.APP_URL ?? "http://localhost:3000",
      process.env.ADMIN_URL ?? "http://localhost:3001"
    ],
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
