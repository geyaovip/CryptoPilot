import { IsObject, IsOptional, IsString, MinLength } from "class-validator";
import type { MvpPromptKey } from "@cryptopilot/types";

export class CreatePromptDto {
  @IsString()
  prompt_key!: MvpPromptKey;

  @IsString()
  @MinLength(10)
  content!: string;
}

export class UpdatePromptDto {
  @IsString()
  @MinLength(10)
  content!: string;
}

export class TestPromptDto {
  @IsObject()
  variables!: Record<string, string>;
}

export class PromptQueryDto {
  @IsOptional()
  @IsString()
  prompt_key?: string;
}
