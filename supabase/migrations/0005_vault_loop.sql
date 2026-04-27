-- =============================================================
-- Saathi · 0005_vault_loop.sql
-- Phase 3 Loop 1: Private Confession Channel / Vault.
-- =============================================================

create table if not exists vault_questions (
  id text primary key,
  category text not null,
  language text not null default 'hi-IN',
  text text not null,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_vault_questions_category on vault_questions (category);

create table if not exists vault_confessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  asked_at timestamptz not null default now(),
  question_id text references vault_questions(id) on delete set null,
  question_text text not null,
  response_audio_url text,
  response_transcript text,
  saathi_reflection_audio_url text,
  saathi_reflection_text text,
  emotion_tags text[] not null default '{}',
  is_shared boolean not null default false,
  shared_with text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_vault_confessions_user_asked on vault_confessions (user_id, asked_at desc);
create index if not exists idx_vault_confessions_tags on vault_confessions using gin (emotion_tags);

create table if not exists vault_streaks (
  user_id uuid primary key references users(id) on delete cascade,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_confession_at timestamptz,
  total_confessions integer not null default 0,
  evening_question_time text not null default '21:00',
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists vault_monthly_reflections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  month text not null,
  reflection_text text not null,
  reflection_audio_url text,
  source text not null default 'mock-template',
  created_at timestamptz not null default now(),
  unique (user_id, month)
);
create index if not exists idx_vault_monthly_reflections_user on vault_monthly_reflections (user_id, month desc);

drop trigger if exists trg_vault_confessions_updated_at on vault_confessions;
create trigger trg_vault_confessions_updated_at
  before update on vault_confessions for each row execute function set_updated_at();

drop trigger if exists trg_vault_streaks_updated_at on vault_streaks;
create trigger trg_vault_streaks_updated_at
  before update on vault_streaks for each row execute function set_updated_at();

alter table vault_questions enable row level security;
alter table vault_confessions enable row level security;
alter table vault_streaks enable row level security;
alter table vault_monthly_reflections enable row level security;

drop policy if exists vault_questions_read_all on vault_questions;
create policy vault_questions_read_all on vault_questions for select using (true);

drop policy if exists vault_confessions_owner_all on vault_confessions;
create policy vault_confessions_owner_all on vault_confessions for all
  using (user_id = current_app_user_id())
  with check (user_id = current_app_user_id());

drop policy if exists vault_streaks_owner_all on vault_streaks;
create policy vault_streaks_owner_all on vault_streaks for all
  using (user_id = current_app_user_id())
  with check (user_id = current_app_user_id());

drop policy if exists vault_monthly_reflections_owner_all on vault_monthly_reflections;
create policy vault_monthly_reflections_owner_all on vault_monthly_reflections for all
  using (user_id = current_app_user_id())
  with check (user_id = current_app_user_id());
