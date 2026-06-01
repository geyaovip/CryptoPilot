import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { TelegramModule } from "../telegram/telegram.module";
import { PushService } from "./push.service";

@Module({
  imports: [PrismaModule, TelegramModule],
  providers: [PushService],
  exports: [PushService]
})
export class PushModule {}
