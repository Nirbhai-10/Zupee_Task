-- =============================================================
-- Saathi · 0002_rls_policies.sql
-- Row-level security. Service role bypasses; users see their own rows.
-- =============================================================

-- Helper: links auth.uid() back to our users table (auth_user_id).
create or replace function current_app_user_id() returns uuid
language sql stable as $$
  select id from users where auth_user_id = auth.uid() limit 1
$$;

-- Enable RLS on every user-data table.
alter table users enable row level security;
alter table family_members enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table defenses enable row level security;
alter table documents enable row level security;
alter table investment_plans enable row level security;
alter table investment_goals enable row level security;
alter table investment_allocations enable row level security;
alter table salary_events enable row level security;
alter table family_notifications enable row level security;
alter table conversation_context enable row level security;
alter table simulator_events enable row level security;
alter table llm_events enable row level security;

-- Reference data: scam_patterns is global (anyone signed in can read).
alter table scam_patterns enable row level security;
drop policy if exists scam_patterns_read_all on scam_patterns;
create policy scam_patterns_read_all on scam_patterns for select using (true);

-- Users: a user can read their own row.
drop policy if exists users_self_select on users;
create policy users_self_select on users for select
  using (auth_user_id = auth.uid());

drop policy if exists users_self_update on users;
create policy users_self_update on users for update
  using (auth_user_id = auth.uid());

-- Family members: belong to the owning user.
drop policy if exists family_members_owner_all on family_members;
create policy family_members_owner_all on family_members for all
  using (user_id = current_app_user_id())
  with check (user_id = current_app_user_id());

-- Generic owner policy template applied to the rest.
drop policy if exists conversations_owner_all on conversations;
create policy conversations_owner_all on conversations for all
  using (user_id = current_app_user_id())
  with check (user_id = current_app_user_id());

drop policy if exists messages_owner_all on messages;
create policy messages_owner_all on messages for all
  using (
    conversation_id in (select id from conversations where user_id = current_app_user_id())
  )
  with check (
    conversation_id in (select id from conversations where user_id = current_app_user_id())
  );

drop policy if exists defenses_owner_all on defenses;
create policy defenses_owner_all on defenses for all
  using (user_id = current_app_user_id())
  with check (user_id = current_app_user_id());

drop policy if exists documents_owner_all on documents;
create policy documents_owner_all on documents for all
  using (user_id = current_app_user_id())
  with check (user_id = current_app_user_id());

drop policy if exists investment_plans_owner_all on investment_plans;
create policy investment_plans_owner_all on investment_plans for all
  using (user_id = current_app_user_id())
  with check (user_id = current_app_user_id());

drop policy if exists investment_goals_owner_all on investment_goals;
create policy investment_goals_owner_all on investment_goals for all
  using (user_id = current_app_user_id())
  with check (user_id = current_app_user_id());

drop policy if exists investment_allocations_owner_all on investment_allocations;
create policy investment_allocations_owner_all on investment_allocations for all
  using (
    goal_id in (select id from investment_goals where user_id = current_app_user_id())
  )
  with check (
    goal_id in (select id from investment_goals where user_id = current_app_user_id())
  );

drop policy if exists salary_events_owner_all on salary_events;
create policy salary_events_owner_all on salary_events for all
  using (user_id = current_app_user_id())
  with check (user_id = current_app_user_id());

drop policy if exists family_notifications_owner_all on family_notifications;
create policy family_notifications_owner_all on family_notifications for all
  using (user_id = current_app_user_id())
  with check (user_id = current_app_user_id());

drop policy if exists conversation_context_owner_all on conversation_context;
create policy conversation_context_owner_all on conversation_context for all
  using (
    conversation_id in (select id from conversations where user_id = current_app_user_id())
  )
  with check (
    conversation_id in (select id from conversations where user_id = current_app_user_id())
  );

drop policy if exists simulator_events_owner_all on simulator_events;
create policy simulator_events_owner_all on simulator_events for all
  using (user_id = current_app_user_id())
  with check (user_id = current_app_user_id());

-- llm_events: users can see their own (admin/service role bypasses RLS).
drop policy if exists llm_events_owner_select on llm_events;
create policy llm_events_owner_select on llm_events for select
  using (user_id = current_app_user_id());
