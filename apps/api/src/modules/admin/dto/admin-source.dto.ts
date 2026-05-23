import { IsIn, IsOptional } from "class-validator";

export class UpdateSourceDto {
  @IsOptional()
  @IsIn(["active", "paused", "error"])
  status?: "active" | "paused" | "error";
}
