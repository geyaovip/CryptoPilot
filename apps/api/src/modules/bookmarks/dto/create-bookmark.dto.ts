import { IsUUID } from "class-validator";

export class CreateBookmarkDto {
  @IsUUID()
  feed_item_id!: string;
}
