-- =============================================================
-- Saathi · 0003_pgvector.sql
-- Enable pgvector and attach the embedding column to scam_patterns.
-- 1536 dims matches OpenAI text-embedding-3-small (used to seed the
-- pattern bank). Switch to 768 if we move to Sarvam embeddings.
-- =============================================================

create extension if not exists vector;

alter table scam_patterns
  add column if not exists embedding vector(1536);

-- IVFFlat index. Tune `lists` once we have ~10k patterns; for the
-- prototype's 100 seeded variants, lists=10 is fine.
do $$ begin
  if not exists (
    select 1 from pg_indexes where indexname = 'idx_scam_patterns_embedding'
  ) then
    create index idx_scam_patterns_embedding
      on scam_patterns using ivfflat (embedding vector_cosine_ops)
      with (lists = 10);
  end if;
end $$;

-- Convenience search function used by the scam-classify flow.
create or replace function match_scam_patterns(
  query_embedding vector(1536),
  match_threshold float default 0.7,
  match_count integer default 5
)
returns table (
  id uuid,
  pattern_name text,
  category text,
  representative_text text,
  identifying_phrases text[],
  payload_type text,
  severity text,
  similarity float
)
language sql stable as $$
  select
    p.id,
    p.pattern_name,
    p.category,
    p.representative_text,
    p.identifying_phrases,
    p.payload_type,
    p.severity,
    1 - (p.embedding <=> query_embedding) as similarity
  from scam_patterns p
  where p.embedding is not null
    and 1 - (p.embedding <=> query_embedding) > match_threshold
  order by p.embedding <=> query_embedding
  limit match_count;
$$;
