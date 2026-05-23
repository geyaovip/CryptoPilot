import { IsBoolean } from "class-validator";

export class UpdateWatchlistNotificationDto {
  @IsBoolean()
  notifications_enabled!: boolean;
}
