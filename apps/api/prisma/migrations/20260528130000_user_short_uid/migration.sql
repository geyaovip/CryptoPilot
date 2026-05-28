ALTER TABLE users ADD COLUMN IF NOT EXISTS short_uid varchar(11);

WITH RECURSIVE ordered_users AS (
  SELECT id, row_number() OVER (ORDER BY created_at, id) AS rn
  FROM users
  WHERE short_uid IS NULL
),
generated AS (
  SELECT
    id,
    'CP-' || upper(lpad(to_hex(((rn * 2654435761)::bigint % 4294967296)::bigint), 8, '0')) AS short_uid
  FROM ordered_users
)
UPDATE users
SET short_uid = generated.short_uid
FROM generated
WHERE users.id = generated.id;

ALTER TABLE users ALTER COLUMN short_uid SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_short_uid_unique ON users(short_uid);
