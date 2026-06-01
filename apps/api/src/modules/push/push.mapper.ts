import type { PushMessage, PushStatus, PushType } from "@prisma/client";

export function mapPushMessage(row: PushMessage) {
  return {
    id: row.id,
    user_id: row.userId,
    type: row.type.toLowerCase() as Lowercase<PushType>,
    status: row.status.toLowerCase() as Lowercase<PushStatus>,
    title: row.title,
    body: row.body,
    detail_url: row.detailUrl,
    related_feed_item_id: row.relatedFeedItemId,
    scheduled_at: row.scheduledAt?.toISOString() ?? null,
    sent_at: row.sentAt?.toISOString() ?? null,
    failed_at: row.failedAt?.toISOString() ?? null,
    error_message: row.errorMessage,
    created_at: row.createdAt.toISOString()
  };
}
