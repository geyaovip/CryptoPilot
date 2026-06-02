import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module";
import { PrismaModule } from "../prisma/prisma.module";
import { CoinGeckoPriceService } from "./coingecko-price.service";
import { IngestionService } from "./ingestion.service";

@Module({
  imports: [PrismaModule, AiModule],
  providers: [IngestionService, CoinGeckoPriceService],
  exports: [IngestionService, CoinGeckoPriceService]
})
export class IngestionModule {}
