CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE auth_provider AS ENUM ('google', 'email');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) UNIQUE,
  name varchar(255),
  avatar_url text,
  role user_role NOT NULL DEFAULT 'user',
  telegram_chat_id varchar(255),
  telegram_bound_at timestamp,
  daily_ai_search_count integer NOT NULL DEFAULT 0,
  last_ai_search_reset_at timestamp,
  disabled_at timestamp,
  deleted_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE auth_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  provider auth_provider NOT NULL,
  provider_account_id varchar(255) NOT NULL,
  access_token_encrypted text,
  refresh_token_encrypted text,
  expires_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT auth_accounts_provider_account_unique UNIQUE (provider, provider_account_id)
);

CREATE INDEX auth_accounts_user_id_idx ON auth_accounts(user_id);

CREATE TABLE magic_link_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) NOT NULL,
  token_hash varchar(255) NOT NULL UNIQUE,
  expires_at timestamp NOT NULL,
  consumed_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX magic_link_tokens_email_idx ON magic_link_tokens(email);
CREATE INDEX magic_link_tokens_expires_at_idx ON magic_link_tokens(expires_at);
