import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { verifyAuthToken } from "./auth-token.util";

type RequestWithUser = {
  headers?: Record<string, string | string[] | undefined>;
  user?: { id: string; role: string };
};

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ConfigService) private readonly config: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = await this.resolveAdminUser(request);
    if (!user || user.role !== "ADMIN") {
      throw new ForbiddenException("需要管理员权限");
    }
    request.user = { id: user.id, role: "admin" };
    return true;
  }

  private async resolveAdminUser(request: RequestWithUser) {
    const authHeader = String(request.headers?.authorization ?? "");
    const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const secret = this.config.get<string>("AUTH_SECRET") ?? "";
    if (bearer && secret) {
      const payload = verifyAuthToken(bearer, secret);
      if (payload?.role === "admin") {
        return this.prisma.user.findUnique({ where: { id: payload.sub } });
      }
    }
    const userId = String(request.headers?.["x-user-id"] ?? "");
    if (userId) {
      return this.prisma.user.findUnique({ where: { id: userId } });
    }
    return null;
  }
}
