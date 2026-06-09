import { IsIn, IsOptional } from "class-validator";
import { AdminPaginationDto } from "../../admin/dto/admin-pagination.dto";

export class AdminPushListQueryDto extends AdminPaginationDto {
  @IsOptional()
  @IsIn(["daily_digest", "market_alert", "watchlist_alert", "manual"])
  type?: "daily_digest" | "market_alert" | "watchlist_alert" | "manual";

  @IsOptional()
  @IsIn(["pending", "sent", "failed", "cancelled"])
  status?: "pending" | "sent" | "failed" | "cancelled";
}
