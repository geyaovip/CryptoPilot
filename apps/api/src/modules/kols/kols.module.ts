import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { KolsController } from "./kols.controller";
import { KolsService } from "./kols.service";

@Module({
  imports: [PrismaModule],
  controllers: [KolsController],
  providers: [KolsService]
})
export class KolsModule {}
