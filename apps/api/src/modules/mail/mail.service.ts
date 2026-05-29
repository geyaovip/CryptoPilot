import { Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

type SendMagicLinkInput = {
  to: string;
  magicLinkUrl: string;
  expiresInMinutes: number;
};

type ResendEmailResponse = {
  id?: string;
  message?: string;
  name?: string;
};

@Injectable()
export class MailService {
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  isEnabled(): boolean {
    return Boolean(this.config.get<string>("RESEND_API_KEY"));
  }

  async sendMagicLink(input: SendMagicLinkInput): Promise<void> {
    const apiKey = this.config.get<string>("RESEND_API_KEY");
    if (!apiKey) return;

    const from = this.config.get<string>("MAIL_FROM") ?? "CryptoPilot <noreply@cryptopilot.chat>";
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: input.to,
        subject: "登录 CryptoPilot",
        text: this.buildMagicLinkText(input),
        html: this.buildMagicLinkHtml(input)
      })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as ResendEmailResponse;
      throw new ServiceUnavailableException(payload.message ?? "登录邮件发送失败，请稍后再试");
    }
  }

  private buildMagicLinkText(input: SendMagicLinkInput): string {
    return [
      "你好，",
      "",
      `点击下面的链接登录 CryptoPilot。该链接将在 ${input.expiresInMinutes} 分钟后失效：`,
      input.magicLinkUrl,
      "",
      "如果不是你本人操作，可以忽略这封邮件。",
      "",
      "CryptoPilot 团队"
    ].join("\n");
  }

  private buildMagicLinkHtml(input: SendMagicLinkInput): string {
    const safeUrl = escapeHtml(input.magicLinkUrl);
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #14201c; line-height: 1.6;">
        <h2 style="margin: 0 0 12px;">登录 CryptoPilot</h2>
        <p>点击下面的按钮完成登录。该链接将在 ${input.expiresInMinutes} 分钟后失效。</p>
        <p style="margin: 24px 0;">
          <a href="${safeUrl}" style="background: #123c35; color: #fff; padding: 12px 18px; border-radius: 999px; text-decoration: none; font-weight: 700;">进入 CryptoPilot</a>
        </p>
        <p style="font-size: 13px; color: #5b6763;">如果按钮无法打开，请复制此链接到浏览器：<br>${safeUrl}</p>
        <p style="font-size: 13px; color: #5b6763;">如果不是你本人操作，可以忽略这封邮件。</p>
      </div>
    `;
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
