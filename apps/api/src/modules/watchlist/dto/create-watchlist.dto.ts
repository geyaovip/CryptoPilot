import { IsIn, IsUUID } from "class-validator";

export class CreateWatchlistDto {
  @IsIn(["token", "narrative", "kol"])
  target_type!: "token" | "narrative" | "kol";

  @IsUUID()
  target_id!: string;
}
