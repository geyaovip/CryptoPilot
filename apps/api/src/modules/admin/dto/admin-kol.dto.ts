import { IsBoolean, IsIn, IsInt, IsOptional, IsString, IsUrl, Max, Min } from "class-validator";

export class CreateAdminKolDto {
  @IsString()
  name!: string;

  @IsString()
  handle!: string;

  @IsIn(["twitter", "youtube", "other"])
  platform!: "twitter" | "youtube" | "other";

  @IsOptional()
  @IsUrl()
  profile_url?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  influence_score?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateAdminKolDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  handle?: string;

  @IsOptional()
  @IsIn(["twitter", "youtube", "other"])
  platform?: "twitter" | "youtube" | "other";

  @IsOptional()
  @IsUrl()
  profile_url?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  influence_score?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
