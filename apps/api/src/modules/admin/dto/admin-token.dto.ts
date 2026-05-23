import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

export class UpdateAdminTokenDto {
  @IsOptional()
  @IsString()
  symbol?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  coingecko_id?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsInt()
  display_order?: number;
}
