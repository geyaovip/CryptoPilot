import { IsBoolean, IsIn, IsOptional } from "class-validator";

export class UpdateAdminUserDto {
  @IsOptional()
  @IsIn(["user", "admin"])
  role?: "user" | "admin";

  @IsOptional()
  @IsBoolean()
  disabled?: boolean;
}
