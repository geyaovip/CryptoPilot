import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";
import { signAuthToken, verifyAuthToken } from "./auth-token.util";
import { createMagicLinkRawToken, hashMagicLinkToken } from "./magic-link.util";
import { MagicLinkDto } from "./dto/magic-link.dto";

const MAGIC_LINK_TTL_MS = 15 * 60 * 1000;
const SHORT_UID_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const SHORT_UID_LENGTH = 8;

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(MailService) private readonly mailService: MailService
  ) {}

  async getCurrentUser(authorization?: string, legacyUserId?: string) {
    const user = await this.resolveUser(authorization, legacyUserId);
    if (!user) throw new UnauthorizedException("需要登录");
    return {
      user: {
        id: user.id,
        uid: user.shortUid,
        email: user.email,
        name: user.name,
        role: user.role.toLowerCase() as "user" | "admin"
      }
    };
  }

  async loginWithEmail(email: string) {
    if (!this.isDevLoginAllowed()) {
      throw new UnauthorizedException("请使用邮箱登录链接登录");
    }
    const user = await this.findOrCreateUser(email);
    return this.issueSession(user);
  }

  async requestMagicLink(dto: MagicLinkDto) {
    const email = dto.email.trim().toLowerCase();
    await this.findOrCreateUser(email);

    const raw = createMagicLinkRawToken();
    const tokenHash = hashMagicLinkToken(raw);
    const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MS);

    await this.prisma.magicLinkToken.create({
      data: { email, tokenHash, expiresAt }
    });

    const appUrl = this.config.get<string>("APP_URL") ?? "http://localhost:3000";
    const redirectPath = dto.redirect_path ?? "/login";
    const magicLinkUrl = `${appUrl}${redirectPath}?token=${encodeURIComponent(raw)}`;
    const exposeLink = this.shouldExposeMagicLink();
    await this.mailService.sendMagicLink({
      to: email,
      magicLinkUrl,
      expiresInMinutes: Math.floor(MAGIC_LINK_TTL_MS / 60_000)
    });

    return {
      message: exposeLink
        ? "开发环境：点击下方链接完成登录；若已配置邮件服务，也会同步发送至邮箱。"
        : "若该邮箱已注册，登录链接已发送，请查收邮件。",
      ...(exposeLink ? { magic_link_url: magicLinkUrl } : {})
    };
  }

  async consumeMagicLink(rawToken: string) {
    const tokenHash = hashMagicLinkToken(rawToken.trim());
    const record = await this.prisma.magicLinkToken.findUnique({ where: { tokenHash } });
    if (!record || record.consumedAt || record.expiresAt < new Date()) {
      throw new UnauthorizedException("登录链接无效或已过期");
    }

    await this.prisma.magicLinkToken.update({
      where: { tokenHash },
      data: { consumedAt: new Date() }
    });

    const user = await this.findOrCreateUser(record.email);
    return this.issueSession(user);
  }

  logout() {
    return { success: true };
  }

  private async findOrCreateUser(email: string) {
    const normalized = email.trim().toLowerCase();
    let user = await this.prisma.user.findFirst({
      where: { email: normalized, deletedAt: null, disabledAt: null }
    });
    if (user) return user;

    if (!this.isBetaSignupAllowed(normalized)) {
      throw new UnauthorizedException("用户不存在或已禁用");
    }

    user = await this.createUserWithShortUid(normalized);
    return user;
  }

  private isBetaSignupAllowed(email: string): boolean {
    if (this.config.get<string>("BETA_ALLOW_SIGNUP") === "true") return true;
    return email.endsWith("@cryptopilot.local");
  }

  private shouldExposeMagicLink(): boolean {
    if (this.config.get<string>("MAGIC_LINK_EXPOSE") === "true") return true;
    return this.config.get<string>("NODE_ENV") !== "production";
  }

  private isDevLoginAllowed(): boolean {
    if (this.config.get<string>("BETA_DEV_LOGIN") === "true") return true;
    return this.config.get<string>("NODE_ENV") !== "production";
  }

  private issueSession(user: { id: string; shortUid: string; email: string | null; name: string | null; role: string }) {
    const secret = this.config.get<string>("AUTH_SECRET") ?? "";
    const access_token = signAuthToken({
      userId: user.id,
      role: user.role === "ADMIN" ? "admin" : "user",
      secret
    });
    return {
      access_token,
      user: {
        id: user.id,
        uid: user.shortUid,
        email: user.email,
        name: user.name,
        role: user.role.toLowerCase()
      }
    };
  }

  private async resolveUser(authorization?: string, legacyUserId?: string) {
    const bearer = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
    const secret = this.config.get<string>("AUTH_SECRET") ?? "";
    if (bearer && secret) {
      const payload = verifyAuthToken(bearer, secret);
      if (payload) return this.prisma.user.findUnique({ where: { id: payload.sub } });
    }
    if (legacyUserId) return this.prisma.user.findUnique({ where: { id: legacyUserId } });
    return null;
  }

  private async createUserWithShortUid(email: string) {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const shortUid = createShortUid();
      const existing = await this.prisma.user.findUnique({ where: { shortUid } });
      if (existing) continue;

      try {
        return await this.prisma.user.create({
          data: { email, shortUid, name: email.split("@")[0], role: "USER" }
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") continue;
        throw error;
      }
    }
    throw new UnauthorizedException("用户 UID 生成失败，请重试");
  }
}

export function createShortUid(): string {
  let value = "";
  for (let index = 0; index < SHORT_UID_LENGTH; index += 1) {
    value += SHORT_UID_ALPHABET[Math.floor(Math.random() * SHORT_UID_ALPHABET.length)];
  }
  return `CP-${value}`;
}
