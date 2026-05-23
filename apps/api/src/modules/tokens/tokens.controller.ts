import { Controller, Get, Inject } from "@nestjs/common";
import { ok } from "../common/api-response";
import { TokensService } from "./tokens.service";

@Controller("tokens")
export class TokensController {
  constructor(@Inject(TokensService) private readonly tokensService: TokensService) {}

  @Get()
  async list() {
    return ok(await this.tokensService.list());
  }
}
