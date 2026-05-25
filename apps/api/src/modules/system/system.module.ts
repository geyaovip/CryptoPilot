import { Global, Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { SystemConfigService } from "./system-config.service";
import { SystemPublicController } from "./system-public.controller";

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [SystemPublicController],
  providers: [SystemConfigService],
  exports: [SystemConfigService]
})
export class SystemModule {}
