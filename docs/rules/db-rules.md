# CryptoPilot 数据库规则

本文件定义 CryptoPilot 的数据库建模、字段命名、约束、索引、迁移、软删除和审计规则。适用于 PostgreSQL、Prisma 和 pgvector。

---

## 1. 数据库原则

必须使用：

- PostgreSQL。
- Prisma。
- pgvector。

数据库设计必须保证：

- 业务数据可追溯。
- 去重依赖唯一约束。
- 列表查询有索引。
- AI 输出和 Admin 修改可审计。
- 未来版本可扩展。

禁止：

- 无约束地存 JSON 代替关系模型。
- 没有迁移记录地改表。
- 在数据库中明文存储 secret。
- 使用软删除数据参与正常展示。

---

## 2. 字段命名

字段使用 snake_case。

必须使用：

- `id`
- `created_at`
- `updated_at`
- `deleted_at`

禁止：

- `createdAt`
- `updatedAt`
- `isDeleted`
- `create_time`
- 同一含义多个命名。

TypeScript 层可使用 camelCase，但数据库字段必须保持 snake_case。

---

## 3. 核心字段

所有核心业务表必须包含：

- `id`: uuid primary key。
- `created_at`: timestamp。
- `updated_at`: timestamp。
- `deleted_at`: timestamp nullable。

日志表可不包含 `updated_at` 和 `deleted_at`，但必须包含 `created_at`。

---

## 4. 软删除

业务数据默认使用软删除：

- users
- feed_items
- sources
- narratives
- tokens
- kols
- watchlist_items
- bookmarks
- prompts

查询默认必须排除 `deleted_at is not null` 的记录。

禁止对核心业务数据直接物理删除，除非版本文档明确要求。

---

## 5. 枚举

枚举必须集中定义，并同步到 `/packages/types`。

必须包含：

- user role: `user`, `admin`
- feed type: `news`, `narrative`, `market_move`, `social_trend`, `breaking`
- sentiment: `bullish`, `neutral`, `bearish`
- source type: `rss`, `twitter`, `reddit`, `coingecko`, `manual`
- prompt status: `draft`, `active`, `archived`
- push status: `pending`, `sent`, `failed`, `cancelled`

禁止：

- 在代码里散落字符串枚举。
- AI 输出写入枚举以外的 sentiment。

---

## 6. 唯一约束

必须使用 unique constraint 保证关键去重：

- `users.email`
- `auth_accounts(provider, provider_account_id)`
- `magic_link_tokens.token_hash`
- `feed_items.source_url`
- `narratives.slug`
- `tokens.symbol`
- `bookmarks(user_id, feed_item_id)`
- `watchlist_items(user_id, target_type, target_id)`
- `prompts(prompt_key, version)`

同一个 `prompt_key` 只能有一个 active 版本。可通过业务事务或部分唯一索引实现。

---

## 7. 索引规则

必须为以下字段建立索引：

- 所有 foreign key。
- `feed_items.publish_time`
- `feed_items.rank_score`
- `feed_items.heat_score`
- `feed_items.status`
- `sources.status`
- `tokens.symbol`
- `narratives.slug`
- `ai_search_history(user_id, created_at)`
- `llm_call_logs(prompt_key, created_at)`
- `push_messages(user_id, status, scheduled_at)`
- `ingestion_logs(source_id, created_at)`
- `audit_logs(admin_user_id, created_at)`

禁止对高频写入表盲目创建过多索引。

---

## 8. JSON 字段

JSON 字段只用于：

- `metadata_json`
- `sources_json`
- `before_json`
- `after_json`
- `config_value_json`

禁止把核心可查询字段只放在 JSON 中。

例如：

- Token symbol 必须是独立字段。
- Narrative slug 必须是独立字段。
- Feed status 必须是独立字段。

---

## 9. Embedding

Embedding 必须使用 pgvector。

表名：

- `content_embeddings`

字段：

- `id`
- `entity_type`
- `entity_id`
- `embedding`
- `embedding_model`
- `created_at`

必须索引：

- `entity_type, entity_id`
- vector index，具体类型按 pgvector 支持选择。

V0.7–V0.8：主实体仍为 `feed_item`；`entity_type` 预留扩展，Bookmark 可继续用 `feed_item`。

V0.9 起扩展 `entity_type`（规划）：

- `feed_item`：原始信号（RSS 等）。
- `insight`：Phase 3 首页主实体（`market_insights` 表）。

Bookmark、RAG、审计等必须使用 `entity_type` + `entity_id`，禁止写死仅 `feed_item_id`。

---

## 10. 迁移规则

所有 schema 变化必须通过 migration。

禁止：

- 手工改生产数据库结构。
- 修改已执行 migration。
- 删除字段不做兼容处理。

破坏性变更必须：

1. 新增字段。
2. 回填数据。
3. 切换代码读取。
4. 后续版本再删除旧字段。

---

## 11. Seed 规则

Seed 数据必须支持 V0.6 MVP Beta：

- 1 个 admin 用户。
- 3 个普通用户。
- 4 个 RSS source。
- 10 个 Token。
- 8 个 Narrative。
- 20 条 Feed 示例。
- 5 个 KOL。
- 5 个 Prompt active 版本。

禁止在生产环境创建弱密码账号。

---

## 12. 审计规则

Admin 写操作必须写入 `audit_logs`。

必须记录：

- `admin_user_id`
- `action`
- `entity_type`
- `entity_id`
- `before_json`
- `after_json`
- `ip_address`
- `user_agent`
- `created_at`

---

## 13. 数据库测试

必须测试：

- unique constraint。
- soft delete 查询。
- feed source_url 去重。
- prompt active 唯一性。
- watchlist 重复添加。
- bookmark 重复添加。
- migration 可执行。

