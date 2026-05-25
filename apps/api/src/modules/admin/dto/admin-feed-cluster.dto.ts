import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";

export class AdminFeedClusterQueryDto {
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

  @IsOptional()
  @IsUUID()
  cluster_id?: string;
}

export class SetClusterRepresentativeDto {
  @IsUUID()
  feed_item_id!: string;
}
