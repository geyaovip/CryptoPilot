import { IsEmail } from "class-validator";

export class MagicLinkDto {
  @IsEmail({}, { message: "请输入有效邮箱地址" })
  email!: string;
}
