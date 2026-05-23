import { IsIn, IsOptional } from "class-validator";

export class NarrativeListQueryDto {
  @IsOptional()
  @IsIn(["hottest", "rising", "discussed"])
  sort?: "hottest" | "rising" | "discussed";
}
