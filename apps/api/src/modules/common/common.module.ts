import { Global, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "../prisma/prisma.module";
import { AuditService } from "./audit.service";
import { GlobalRateLimitGuard } from "./global-rate-limit.guard";

@Global()
@Module({
  imports: [PrismaModule],
  providers: [AuditService, { provide: APP_GUARD, useClass: GlobalRateLimitGuard }],
  exports: [AuditService]
})
export class CommonModule {}
