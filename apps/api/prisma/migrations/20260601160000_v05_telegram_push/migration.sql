CREATE TYPE push_type AS ENUM ('daily_digest', 'market_alert', 'watchlist_alert', 'manual');
CREATE TYPE push_status AS ENUM ('pending', 'sent', 'failed', 'cancelled');
CREATE TYPE push_channel AS ENUM ('telegram');

CREATE TABLE telegram_bind_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  code varchar(16) NOT NULL UNIQUE,
  expires_at timestamp(3) NOT NULL,
  consumed_at timestamp(3),
  chat_id varchar(255),
  created_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX telegram_bind_codes_user_id_created_at_idx ON telegram_bind_codes(user_id, created_at);
CREATE INDEX telegram_bind_codes_expires_at_idx ON telegram_bind_codes(expires_at);

CREATE TABLE notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id),
  telegram_push_enabled boolean NOT NULL DEFAULT true,
  daily_digest_enabled boolean NOT NULL DEFAULT true,
  market_alert_enabled boolean NOT NULL DEFAULT true,
  watchlist_alert_enabled boolean NOT NULL DEFAULT true,
  timezone varchar(64) NOT NULL DEFAULT 'Asia/Shanghai',
  created_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE push_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  type push_type NOT NULL,
  status push_status NOT NULL DEFAULT 'pending',
  title varchar(255) NOT NULL,
  body text NOT NULL,
  detail_url text,
  related_feed_item_id uuid REFERENCES feed_items(id),
  metadata_json jsonb NOT NULL DEFAULT '{}',
  scheduled_at timestamp(3),
  sent_at timestamp(3),
  failed_at timestamp(3),
  error_message text,
  created_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX push_messages_user_id_related_feed_item_id_type_key
  ON push_messages(user_id, related_feed_item_id, type);
CREATE INDEX push_messages_user_id_status_scheduled_at_idx ON push_messages(user_id, status, scheduled_at);
CREATE INDEX push_messages_type_created_at_idx ON push_messages(type, created_at);

CREATE TABLE push_delivery_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  push_message_id uuid NOT NULL REFERENCES push_messages(id),
  user_id uuid NOT NULL REFERENCES users(id),
  channel push_channel NOT NULL DEFAULT 'telegram',
  status push_status NOT NULL,
  provider_message_id varchar(255),
  error_message text,
  created_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX push_delivery_logs_user_id_created_at_idx ON push_delivery_logs(user_id, created_at);
CREATE INDEX push_delivery_logs_push_message_id_idx ON push_delivery_logs(push_message_id);
CREATE INDEX push_delivery_logs_status_created_at_idx ON push_delivery_logs(status, created_at);
