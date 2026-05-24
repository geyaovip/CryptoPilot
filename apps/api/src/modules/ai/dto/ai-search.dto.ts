import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class AiSearchDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  query!: string;

  @IsOptional()
  @IsUUID()
  insight_id?: string;
}
