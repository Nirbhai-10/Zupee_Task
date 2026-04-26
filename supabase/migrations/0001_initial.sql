-- =============================================================
-- Saathi · 0001_initial.sql
-- Core schema. Run before 0002_rls_policies.sql and 0003_pgvector.sql.
-- =============================================================

create extension if not exists "uuid-ossp";

-- ---------- Enums ---------------------------------------------

do $$ begin
  create type trust_level as enum (
    'new', 'first_defense', 'multiple_defenses', 'invested', 'seasoned'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type message_direction as enum ('inbound', 'outbound');
exception when duplicate_object then null; end $$;

do $$ begin
  create type message_modality as enum ('text', 'voice', 'image', 'document');
exception when duplicate_object then null; end $$;

do $$ begin
  create type defense_category as enum (
    'scam', 'mis_selling', 'harassment', 'overcharging', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type defense_verdict as enum (
    'SCAM', 'SUSPICIOUS', 'LEGITIMATE_BUT_LOW_QUALITY', 'LEGITIMATE', 'UNCLEAR'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type plan_status as enum (
    'draft', 'awaiting_confirmation', 'active', 'paused', 'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type goal_category as enum (
    'wedding', 'education', 'medical', 'festival', 'house', 'vehicle',
    'pilgrimage', 'general'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type instrument as enum (
    'gold', 'fd', 'rd', 'sukanya_samriddhi', 'ppf', 'short_debt_fund',
    'liquid_fund', 'large_cap_equity', 'index_fund', 'lic_term'
  );
exception when duplicate_object then null; end $$;

-- ---------- Users + family ------------------------------------

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid unique,
  phone text not null unique,
  name text not null,
  language text not null default 'hi-IN',
  city text,
  occupation text,
  monthly_income_inr numeric(12,2),
  monthly_surplus_inr numeric(12,2),
  trust_level trust_level not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_users_phone on users (phone);
create index if not exists idx_users_auth on users (auth_user_id);

create table if not exists family_members (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  phone text,
  relationship text not null,
  name text not null,
  language text not null default 'hi-IN',
  age_band text,
  visibility jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_family_members_user on family_members (user_id);

-- ---------- Conversations + messages --------------------------

create table if not exists conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  family_member_id uuid references family_members(id) on delete cascade,
  channel text not null default 'whatsapp',
  created_at timestamptz not null default now()
);
create index if not exists idx_conversations_user on conversations (user_id);

create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  direction message_direction not null,
  modality message_modality not null,
  content_text text,
  storage_path text,
  transcription text,
  language_detected text,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_messages_conversation on messages (conversation_id, created_at desc);

create table if not exists conversation_context (
  conversation_id uuid primary key references conversations(id) on delete cascade,
  rolling_summary text,
  key_facts jsonb default '{}'::jsonb,
  last_summarized_at timestamptz
);

-- ---------- Scam pattern bank ---------------------------------
-- Embedding column added in 0003_pgvector.sql once extension is enabled.

create table if not exists scam_patterns (
  id uuid primary key default uuid_generate_v4(),
  pattern_name text not null,
  category text not null,
  language text not null default 'hi-IN',
  representative_text text not null,
  identifying_phrases text[] not null default '{}',
  payload_type text not null,
  severity text not null default 'high',
  occurrence_count integer not null default 0,
  geographic_concentration jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_scam_patterns_category on scam_patterns (category);

-- ---------- Defenses ------------------------------------------

create table if not exists defenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  family_member_id uuid references family_members(id) on delete set null,
  category defense_category not null,
  type text,
  source_message_id uuid references messages(id) on delete set null,
  matched_pattern_id uuid references scam_patterns(id) on delete set null,
  verdict defense_verdict not null,
  scam_category text,
  confidence numeric(4,3),
  identifying_signals text[] default '{}',
  payload_type text,
  estimated_savings_inr numeric(12,2) default 0,
  voice_response_url text,
  text_response text,
  receiver_explanation text,
  primary_user_alert text,
  language_used text,
  created_at timestamptz not null default now()
);
create index if not exists idx_defenses_user on defenses (user_id, created_at desc);
create index if not exists idx_defenses_member on defenses (family_member_id, created_at desc);

-- ---------- Documents (ULIPs etc.) -----------------------------

create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  type text not null,
  storage_path text not null,
  language_detected text,
  ocr_text text,
  structured_analysis jsonb default '{}'::jsonb,
  audit_voice_url text,
  estimated_savings_inr numeric(12,2),
  created_at timestamptz not null default now()
);
create index if not exists idx_documents_user on documents (user_id, created_at desc);

-- ---------- Investment plan ------------------------------------

create table if not exists investment_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  monthly_allocation_inr numeric(12,2) not null,
  status plan_status not null default 'draft',
  rationale_voice_url text,
  rationale_text text,
  generated_at timestamptz not null default now(),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_investment_plans_user on investment_plans (user_id, created_at desc);

create table if not exists investment_goals (
  id uuid primary key default uuid_generate_v4(),
  plan_id uuid not null references investment_plans(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  category goal_category not null,
  target_inr numeric(12,2) not null,
  target_date date,
  current_value_inr numeric(12,2) not null default 0,
  monthly_contribution_inr numeric(12,2) not null,
  priority integer not null default 1,
  family_member_id uuid references family_members(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_investment_goals_plan on investment_goals (plan_id);

create table if not exists investment_allocations (
  id uuid primary key default uuid_generate_v4(),
  goal_id uuid not null references investment_goals(id) on delete cascade,
  instrument instrument not null,
  monthly_amount_inr numeric(12,2) not null,
  current_value_inr numeric(12,2) not null default 0,
  partner_name text,
  created_at timestamptz not null default now()
);
create index if not exists idx_investment_allocations_goal on investment_allocations (goal_id);

-- ---------- Salary executions ----------------------------------

create table if not exists salary_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  detected_at timestamptz not null default now(),
  amount_inr numeric(12,2) not null,
  plan_executed_at timestamptz,
  ritual_complete boolean not null default false,
  family_notifications jsonb default '[]'::jsonb,
  hisaab_voice_url text,
  hisaab_text text,
  created_at timestamptz not null default now()
);
create index if not exists idx_salary_events_user on salary_events (user_id, detected_at desc);

-- ---------- Family notifications -------------------------------

create table if not exists family_notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  family_member_id uuid not null references family_members(id) on delete cascade,
  trigger text not null,
  channel text not null default 'whatsapp',
  language text not null default 'hi-IN',
  content_text text not null,
  voice_url text,
  sent_at timestamptz,
  acknowledged_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- Observability + simulator --------------------------

create table if not exists llm_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete set null,
  feature text not null,
  provider text not null,
  model_id text not null,
  tier text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cost_paise integer not null default 0,
  latency_ms integer not null default 0,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_llm_events_created on llm_events (created_at desc);
create index if not exists idx_llm_events_feature on llm_events (feature, created_at desc);

create table if not exists simulator_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  family_member_id uuid references family_members(id) on delete cascade,
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_simulator_events_user on simulator_events (user_id, created_at desc);

create table if not exists demo_state (
  id integer primary key default 1,
  reset_at timestamptz not null default now(),
  notes text,
  constraint demo_state_singleton check (id = 1)
);

insert into demo_state (id, notes) values (1, 'initial')
on conflict (id) do nothing;

-- ---------- Updated-at triggers --------------------------------

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_users_updated_at on users;
create trigger trg_users_updated_at
  before update on users for each row execute function set_updated_at();

drop trigger if exists trg_scam_patterns_updated_at on scam_patterns;
create trigger trg_scam_patterns_updated_at
  before update on scam_patterns for each row execute function set_updated_at();
