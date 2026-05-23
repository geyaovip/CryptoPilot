import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { PromptService } from "./prompt.service";

@Module({
  imports: [PrismaModule],
  providers: [PromptService],
  exports: [PromptService]
})
export class PromptModule {}
