import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { BookmarksController } from "./bookmarks.controller";
import { BookmarksService } from "./bookmarks.service";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [BookmarksController],
  providers: [BookmarksService]
})
export class BookmarksModule {}
