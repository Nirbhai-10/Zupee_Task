-- =============================================================
-- Saathi · 0004_seed.sql
-- Demo persona seed: Anjali Sharma + family. Run after 0001-0003.
-- Scam patterns and ULIP samples come from scripts/seed-database.ts so
-- that embeddings are computed via OpenAI before insert.
-- =============================================================

-- Anjali Sharma — government school teacher, Lucknow.
insert into users (
  id, phone, name, language, city, occupation,
  monthly_income_inr, monthly_surplus_inr, trust_level
) values (
  '11111111-1111-1111-1111-111111111111',
  '+919876500001',
  'Anjali Sharma',
  'hi-IN',
  'Lucknow',
  'Government School Teacher',
  38000,
  5500,
  'new'
)
on conflict (id) do update set
  name = excluded.name,
  language = excluded.language,
  city = excluded.city,
  occupation = excluded.occupation,
  monthly_income_inr = excluded.monthly_income_inr,
  monthly_surplus_inr = excluded.monthly_surplus_inr,
  trust_level = excluded.trust_level;

-- Family
insert into family_members (id, user_id, phone, relationship, name, language, age_band, visibility) values
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111111',
    '+919876500002', 'mother-in-law', 'Sushma Sharma', 'hi-IN', '60-75',
    '{"sees": ["protection_alerts"]}'::jsonb),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111111',
    '+971500000003', 'husband', 'Rajesh Sharma', 'hi-IN', '35-45',
    '{"sees": ["aggregate_goal_progress"]}'::jsonb),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111111',
    '+919876500004', 'brother', 'Vikas (brother)', 'hi-IN', '20-30',
    '{"sees": ["college_fee_transfers_only"]}'::jsonb),
  ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111111',
    null, 'daughter', 'Priya', 'hi-IN', '10-15',
    '{"sees": ["self_savings_only"]}'::jsonb),
  ('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111111',
    null, 'son', 'Aarav', 'hi-IN', '5-10',
    '{"sees": ["self_savings_only"]}'::jsonb)
on conflict (id) do update set
  relationship = excluded.relationship,
  name = excluded.name,
  language = excluded.language,
  age_band = excluded.age_band,
  visibility = excluded.visibility;

-- Conversation thread for Anjali
insert into conversations (id, user_id, channel) values
  ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111111', 'whatsapp')
on conflict (id) do nothing;

-- Conversation thread for mother-in-law (separate phone)
insert into conversations (id, user_id, family_member_id, channel) values
  ('33333333-3333-3333-3333-333333333302',
   '11111111-1111-1111-1111-111111111111',
   '22222222-2222-2222-2222-222222222201',
   'whatsapp')
on conflict (id) do nothing;
