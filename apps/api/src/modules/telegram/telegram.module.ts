import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { SettingsModule } from "../settings/settings.module";
import { TelegramController } from "./telegram.controller";
import { TelegramProviderService } from "./telegram-provider.service";
import { TelegramService } from "./telegram.service";

@Module({
  imports: [AuthModule, PrismaModule, SettingsModule],
  controllers: [TelegramController],
  providers: [TelegramProviderService, TelegramService],
  exports: [TelegramProviderService, TelegramService]
})
export class TelegramModule {}
