import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

type TelegramSendResult = {
  message_id?: number;
};

@Injectable()
export class TelegramProviderService {
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  get botUsername(): string | null {
    return this.config.get<string>("TELEGRAM_BOT_USERNAME")?.trim() || null;
  }

  async sendMessage(chatId: string, text: string): Promise<TelegramSendResult> {
    const token = this.config.get<string>("TELEGRAM_BOT_TOKEN")?.trim();
    if (!token) {
      throw new Error("TELEGRAM_BOT_TOKEN missing");
    }
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true
      })
    });
    const body = (await response.json().catch(() => null)) as
      | { ok?: boolean; result?: TelegramSendResult; description?: string }
      | null;
    if (!response.ok || !body?.ok) {
      throw new Error(body?.description ?? "Telegram send failed");
    }
    return body.result ?? {};
  }
}
