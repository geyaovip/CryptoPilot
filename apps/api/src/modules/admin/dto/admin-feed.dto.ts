import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, IsUrl, Max, MaxLength, Min } from "class-validator";

export class AdminFeedQueryDto {
  @IsOptional()
  @IsIn(["published", "hidden", "deleted"])
  status?: "published" | "hidden" | "deleted";

  @IsOptional()
  @IsString()
  source_id?: string;

  @IsOptional()
  @IsIn([
    "news",
    "narrative",
    "market_move",
    "social_trend",
    "breaking",
    "narrative_shift",
    "sentiment_spike",
    "market_rotation",
    "kol_signal"
  ])
  type?:
    | "news"
    | "narrative"
    | "market_move"
    | "social_trend"
    | "breaking"
    | "narrative_shift"
    | "sentiment_spike"
    | "market_rotation"
    | "kol_signal";

  @IsOptional()
  @IsString()
  published_from?: string;

  @IsOptional()
  @IsString()
  published_to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class CreateAdminFeedDto {
  @IsString()
  @MaxLength(500)
  title!: string;

  @IsString()
  content!: string;

  @IsUrl()
  source_url!: string;
}

export class UpdateAdminFeedDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @IsOptional()
  @IsString()
  ai_summary?: string;
}
