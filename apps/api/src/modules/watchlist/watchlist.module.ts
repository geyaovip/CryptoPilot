import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { SystemModule } from "../system/system.module";
import { WatchlistController } from "./watchlist.controller";
import { WatchlistService } from "./watchlist.service";

@Module({
  imports: [PrismaModule, AuthModule, SystemModule],
  controllers: [WatchlistController],
  providers: [WatchlistService],
  exports: [WatchlistService]
})
export class WatchlistModule {}
