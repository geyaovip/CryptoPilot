import { IsString, MinLength } from "class-validator";

export class AuthCallbackDto {
  @IsString()
  @MinLength(16)
  token!: string;
}
