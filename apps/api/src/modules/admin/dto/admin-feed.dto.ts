import { IsIn, IsOptional, IsString, IsUrl, MaxLength } from "class-validator";

export class AdminFeedQueryDto {
  @IsOptional()
  @IsIn(["published", "hidden", "deleted"])
  status?: "published" | "hidden" | "deleted";

  @IsOptional()
  @IsString()
  source_id?: string;

  @IsOptional()
  @IsIn(["news", "narrative", "market_move", "social_trend", "breaking"])
  type?: "news" | "narrative" | "market_move" | "social_trend" | "breaking";

  @IsOptional()
  @IsString()
  published_from?: string;

  @IsOptional()
  @IsString()
  published_to?: string;
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
