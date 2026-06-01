import { IsOptional, IsString } from "class-validator";

export class TelegramWebhookDto {
  @IsOptional()
  message?: {
    message_id?: number;
    text?: string;
    chat?: { id?: number | string };
    from?: { id?: number | string; username?: string };
  };

  @IsOptional()
  @IsString()
  secret?: string;
}
