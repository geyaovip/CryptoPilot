import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

const FEED_TYPES = [
  "news",
  "narrative",
  "market_move",
  "social_trend",
  "breaking",
  "narrative_shift",
  "sentiment_spike",
  "market_rotation",
  "kol_signal"
] as const;

export class FeedQueryDto {
  @IsOptional()
  @IsIn(["for_you", "latest", "breaking"])
  tab?: "for_you" | "latest" | "breaking";

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @IsOptional()
  @IsString()
  narrative?: string;

  @IsOptional()
  @IsIn(FEED_TYPES)
  type?: (typeof FEED_TYPES)[number];
}
