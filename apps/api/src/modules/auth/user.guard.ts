import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { verifyAuthToken } from "./auth-token.util";

type RequestWithUser = {
  headers?: Record<string, string | string[] | undefined>;
  user?: { id: string; role: string; email: string | null };
};

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ConfigService) private readonly config: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = await this.resolveUser(request);
    if (!user || user.disabledAt) {
      throw new UnauthorizedException("需要登录");
    }
    request.user = { id: user.id, role: user.role.toLowerCase(), email: user.email };
    return true;
  }

  private async resolveUser(request: RequestWithUser) {
    const authHeader = String(request.headers?.authorization ?? "");
    const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const secret = this.config.get<string>("AUTH_SECRET") ?? "";
    if (bearer && secret) {
      const payload = verifyAuthToken(bearer, secret);
      if (payload) {
        return this.prisma.user.findUnique({ where: { id: payload.sub } });
      }
    }
    const legacyId = String(request.headers?.["x-user-id"] ?? "");
    if (legacyId) {
      return this.prisma.user.findUnique({ where: { id: legacyId } });
    }
    return null;
  }
}
