import { Type } from "class-transformer";
import { IsIn, IsOptional, IsString } from "class-validator";
import { AdminPaginationDto } from "./admin-pagination.dto";

export class AdminLogsQueryDto extends AdminPaginationDto {
  @IsOptional()
  @IsIn(["api", "ingestion", "llm", "audit", "push"])
  type?: "api" | "ingestion" | "llm" | "audit" | "push";

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;
}
