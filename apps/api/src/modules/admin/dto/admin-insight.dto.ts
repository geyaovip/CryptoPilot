import { IsOptional, IsString, MaxLength } from "class-validator";
import { AdminPaginationDto } from "./admin-pagination.dto";

export class AdminInsightQueryDto extends AdminPaginationDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}
