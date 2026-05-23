import { IsString, MaxLength, MinLength } from "class-validator";

export class AiSearchDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  query!: string;
}
