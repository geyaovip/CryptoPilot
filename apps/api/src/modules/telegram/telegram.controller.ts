import { Body, Controller, Inject, Post, Req, UseGuards } from "@nestjs/common";
import { UserGuard } from "../auth/user.guard";
import { ok } from "../common/api-response";
import { TelegramWebhookDto } from "./dto/telegram-webhook.dto";
import { TelegramService } from "./telegram.service";

@Controller("telegram")
export class TelegramController {
  constructor(@Inject(TelegramService) private readonly telegram: TelegramService) {}

  @Post("bind-code")
  @UseGuards(UserGuard)
  async bindCode(@Req() req: { user: { id: string } }) {
    return ok(await this.telegram.createBindCode(req.user.id));
  }

  @Post("unbind")
  @UseGuards(UserGuard)
  async unbind(@Req() req: { user: { id: string } }) {
    return ok(await this.telegram.unbind(req.user.id));
  }

  @Post("webhook")
  async webhook(@Body() dto: TelegramWebhookDto) {
    return ok(
      await this.telegram.handleWebhook({
        secret: dto.secret,
        text: dto.message?.text,
        chatId: dto.message?.chat?.id === undefined ? undefined : String(dto.message.chat.id)
      })
    );
  }
}
