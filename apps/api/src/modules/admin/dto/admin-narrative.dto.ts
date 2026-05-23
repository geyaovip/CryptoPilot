import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Max, Min, Matches } from "class-validator";

export class CreateAdminNarrativeDto {
  @IsString()
  name!: string;

  @Matches(/^[a-z0-9-]+$/)
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  ai_summary?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  weight?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateAdminNarrativeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Matches(/^[a-z0-9-]+$/)
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  ai_summary?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  weight?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  sentiment?: "bullish" | "neutral" | "bearish";
}

export class MergeAdminNarrativeDto {
  @IsUUID()
  target_narrative_id!: string;
}
