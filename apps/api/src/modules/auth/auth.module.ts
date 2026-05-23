import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AdminGuard } from "./admin.guard";
import { UserGuard } from "./user.guard";

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, AdminGuard, UserGuard],
  exports: [AuthService, AdminGuard, UserGuard]
})
export class AuthModule {}
