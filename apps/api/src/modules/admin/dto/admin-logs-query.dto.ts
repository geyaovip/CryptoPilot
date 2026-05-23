import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class AdminLogsQueryDto {
  @IsOptional()
  @IsIn(["api", "ingestion", "llm", "audit", "push"])
  type?: "api" | "ingestion" | "llm" | "audit" | "push";

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
