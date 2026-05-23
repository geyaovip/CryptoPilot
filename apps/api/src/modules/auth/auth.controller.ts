import { Body, Controller, Get, Headers, Inject, Post } from "@nestjs/common";
import { ok } from "../common/api-response";
import { AuthService } from "./auth.service";
import { AuthCallbackDto } from "./dto/auth-callback.dto";
import { LoginDto } from "./dto/login.dto";
import { MagicLinkDto } from "./dto/magic-link.dto";

@Controller("auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Get("me")
  async getMe(
    @Headers("authorization") authorization?: string,
    @Headers("x-user-id") legacyUserId?: string
  ) {
    return ok(await this.authService.getCurrentUser(authorization, legacyUserId));
  }

  @Post("login")
  async login(@Body() dto: LoginDto) {
    return ok(await this.authService.loginWithEmail(dto.email));
  }

  @Post("magic-link")
  async requestMagicLink(@Body() dto: MagicLinkDto) {
    return ok(await this.authService.requestMagicLink(dto));
  }

  @Post("callback")
  async callback(@Body() dto: AuthCallbackDto) {
    return ok(await this.authService.consumeMagicLink(dto.token));
  }

  @Post("logout")
  logout() {
    return ok(this.authService.logout());
  }
}
