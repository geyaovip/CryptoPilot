import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module";
import { PrismaModule } from "../prisma/prisma.module";
import { IngestionService } from "./ingestion.service";

@Module({
  imports: [PrismaModule, AiModule],
  providers: [IngestionService],
  exports: [IngestionService]
})
export class IngestionModule {}
