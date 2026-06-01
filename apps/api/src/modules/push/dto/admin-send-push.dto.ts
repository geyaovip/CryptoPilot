import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class AdminSendPushDto {
  @IsUUID()
  user_id!: string;

  @IsIn(["manual", "daily_digest", "market_alert", "watchlist_alert"])
  type!: "manual" | "daily_digest" | "market_alert" | "watchlist_alert";

  @IsString()
  @MaxLength(120)
  title!: string;

  @IsString()
  @MaxLength(2000)
  body!: string;

  @IsOptional()
  @IsString()
  detail_url?: string;

  @IsOptional()
  @IsUUID()
  related_feed_item_id?: string;
}
