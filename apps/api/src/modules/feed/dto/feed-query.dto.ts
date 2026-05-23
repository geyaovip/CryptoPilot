import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

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
}
