import { IsEmail, IsOptional, IsString, Matches } from "class-validator";

export class MagicLinkDto {
  @IsEmail({}, { message: "请输入有效邮箱地址" })
  email!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\/(admin\/)?login$/, { message: "登录回跳路径无效" })
  redirect_path?: string;
}
