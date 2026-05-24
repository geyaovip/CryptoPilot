import { IsOptional, IsUUID, ValidateIf } from "class-validator";

export class CreateBookmarkDto {
  @ValidateIf((dto: CreateBookmarkDto) => !dto.insight_id)
  @IsUUID()
  feed_item_id?: string;

  @ValidateIf((dto: CreateBookmarkDto) => !dto.feed_item_id)
  @IsUUID()
  insight_id?: string;
}
