import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateNotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  telegram_push_enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  daily_digest_enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  market_alert_enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  watchlist_alert_enabled?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;
}
