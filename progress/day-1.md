# Day 1 — Foundation

**Goal:** Get a Next.js 16 + Tailwind v4 + Supabase + LLM-router + voice-provider stack booted with the Saathi design system applied, all six route groups stubbed, the four migrations written, and the Anjali persona seeded — so Day 2 can land scam defense end-to-end without re-debating any structural decision.

## Shipped

### Project
- Scaffolded with `create-next-app@latest`. Got **Next.js 16.2.4** (not 15 — the brief was written before 16 GA), React 19.2, Tailwind v4.2.4, Turbopack default for `dev` and `build`, pnpm.
- Read `node_modules/next/dist/docs/` (Next.js ships its own AGENTS.md telling agents to do this). Internalized the breaking changes that bite training data: `params`/`searchParams` are Promises, `cookies()`/`headers()` async, `middleware.ts` → `proxy.ts`, `'use cache'` directive replacing `unstable_cache`. **Cache Components / PPR intentionally NOT enabled** for the prototype — deferred until we have a concrete reason.
- Git initialised inside `/Users/nirbhaiverma/saathi/`. Initial commit on `main` = raw scaffold. Working branch is `day-1-foundation`.

### Design system
- Saathi tokens declared in `src/app/globals.css` via Tailwind v4 `@theme inline` — every brief color is a utility class (`bg-saathi-deep-green`, `text-saathi-cream`, etc.). Type scale (`text-display`, `text-h1`, …), radii (`rounded-card`, `rounded-pill`), shadows, and motion easings included.
- Fonts: **Manrope** (Latin), **Mukta** (Devanagari + Indic), **JetBrains Mono** (tabular numerals) loaded via `next/font/google` and exposed as `--font-manrope`, `--font-mukta`, `--font-jetbrains` CSS variables. Indic-script elements automatically pick up the Mukta stack with an 8% size bump via `:lang()` selectors in globals.
- Primitives written: `Button` (6 variants × 4 sizes), `Card` (5 tones × 4 paddings), `Badge` (verdict tones), `Currency` (Indian numbering, lakh/crore long form), `LanguageText` (pulls from `i18n/strings.ts`, sets correct `lang` attr), `VoicePlayer` (Wavesurfer-backed, gold progress + voice-tint waveform, transcript toggle, language pill).
- `prefers-reduced-motion` honoured globally.

### LLM router
- `src/lib/llm/router.ts` is the only place SDKs are imported. Auto-detects provider from `LLM_PROVIDER` env (defaulting to `auto`, then walks `ANTHROPIC_API_KEY → OPENAI_API_KEY → GROK_API_KEY`).
- Two tiers — `sonnet` (tone-sensitive) and `haiku` (high-volume) — mapped per provider:
  - Anthropic: `claude-sonnet-4-6` / `claude-haiku-4-5-20251001`
  - OpenAI:   `gpt-4o-2024-11-20` / `gpt-4o-mini`
  - Grok:     `grok-4` / `grok-4-fast-reasoning` (via OpenAI-compatible base URL)
- Exposes `generateText` and `generateObject` (Zod-validated) with consistent shape. Every call auto-logs to `llm_events` with cost-in-paise and latency.
- Zod schemas drafted for `ScamClassification`, `IntentDetection`, `ULIPFeeSchedule` in `src/lib/llm/schemas.ts`.

### Voice
- `VoiceProvider` interface in `src/lib/voice/provider-interface.ts`. Two implementations:
  - `SarvamVoiceProvider` — REST against `api.sarvam.ai`, speaker mapping (`anushka` warm female default, `vidya` for elder register, `abhilash` male for husband notifications). Real call shape ready; persistence to Supabase Storage is a Day-2 follow-up.
  - `BrowserVoiceProvider` — emits `browser-tts:<base64-payload>` marker URLs; the client `VoicePlayer` (Day 2) will decode and render via `SpeechSynthesisUtterance`.
- `getVoiceProvider()` auto-selects Sarvam when `SARVAM_API_KEY` is present, otherwise the browser fallback.

### Supabase
- Three clients: `getSupabaseAdminClient()` (service role, server-only), `getSupabaseServerClient()` (per-request, async because Next.js 16 made `cookies()` async), `getSupabaseBrowserClient()` (browser).
- Four migrations in `supabase/migrations/`:
  - `0001_initial.sql` — 16 tables covering users, family, conversations, messages, scam patterns, defenses, documents, investment plan/goals/allocations, salary events, family notifications, conversation context, llm events, simulator events, demo state. Enums for verdicts, instruments, goal categories.
  - `0002_rls_policies.sql` — RLS on every user-data table. Helper `current_app_user_id()` joins `auth.uid()` to our `users` table.
  - `0003_pgvector.sql` — vector(1536) on scam_patterns, ivfflat index, `match_scam_patterns(query, threshold, count)` SQL function for the Day 2 classifier to call.
  - `0004_seed.sql` — Anjali + 5 family members + 2 conversation threads.
- Hand-stubbed `Database` type (only `users` and `llm_events` typed for now). Day 7 we regen via `supabase gen types typescript`.

### Mocks
- `lib/mocks/demo-personas.ts` — Anjali full context (income, surplus, fears, existing assets, four goals).
- `lib/mocks/scam-patterns.ts` — 19 high-fidelity exemplars across all categories. Day 2 expands to the 100 the brief calls for.
- `lib/mocks/ulip-sample.ts` — believable mis-sold ULIP fee schedule (10/8/5/3/3% allocation, 1.35% FMC, 5-yr lock-in). Numbers tuned so the Day-3 audit produces the "₹2.4L saved over 10 years" headline.
- `lib/mocks/investment-products.ts` — 10 instruments with vernacular pitches and trust-rung tags.
- `lib/mocks/account-aggregator.ts` — Mock AA response shape that mirrors what Setu/Sahamati return.

### Routes
- Stub pages under `(app)`, `(demo)`, `(admin)` route groups using a shared `<DayPlaceholder />` component so navigation works cleanly during the build week.
- `/api/health` returns `{ llm: { provider, available }, voice: { provider }, supabase: { configured } }` without leaking keys. Useful for the demo team to smoke-test deploys and for the Day-6 admin/costs page.

## Mocked / deferred

- **Real audio playback paths.** `BrowserVoiceProvider.synthesize` returns marker URLs the client side will decode on Day 2. Sarvam → Supabase Storage upload is Day 2.
- **Database actually live.** Migrations are written but not applied — running them requires `NEXT_PUBLIC_SUPABASE_URL`/keys we don't have yet. App falls through to `null` clients and logs to console only. Day 2 needs Supabase credentials.
- **shadcn CLI.** Skipped `pnpm dlx shadcn init`; the helpers it generates (`cn` + radix slot) are simple enough that we wrote them directly. Components added on demand.
- **Self-hosted font files.** Brief said `/public/fonts`; `next/font/google` already self-hosts at build time, so I went with that — no functional difference. If we ever need to bypass Google's CDN at build time, swap to `next/font/local` (already-downloaded woff2 files).
- **Documentation pages**: `/admin/scam-patterns` CRUD, `/demo/presenter` controls, full landing page — all Day-6 work.
- **100 scam variants.** 19 shipped now; the embedding-generation script and the remaining 81 land Day 2 inside the seed pipeline.

## Blocked

Nothing.

## What Day 2 needs from the user

- One LLM key (`ANTHROPIC_API_KEY` recommended — the demo runs Sonnet 4.6 / Haiku 4.5).
- A free-tier Supabase project (Mumbai region). Drop URL + anon + service-role keys into `.env.local`.

If both are present at Day-2 start, the scam defense flow lights up end-to-end without further setup.

## Verification

- `pnpm exec tsc --noEmit` → clean.
- `pnpm lint` → clean (config updated to allow `_`-prefixed unused args, standard TS convention).
- `pnpm build` → 18 routes, 3.5s compile, all pages prerender.
- `/api/health` reports the configured stack without leaking secrets.

## Files touched

- 17 files in `src/app/` (root layout, globals, placeholder landing, 12 stub pages, health endpoint).
- 9 files in `src/lib/` across `llm/`, `voice/`, `db/`, `i18n/`, `mocks/`, `observability/`, `utils/`.
- 5 files in `src/components/` (`ui/{button,card,badge}`, `shared/{LanguageText,Currency,DayPlaceholder}`, `voice/VoicePlayer`).
- 3 files in `src/domain/` (`types`, `trust-level`, plus the placeholder for Day-2 defense module).
- 4 SQL migrations in `supabase/migrations/`.
- Repo top-level: `README.md` (rewritten), `.env.example`, `next.config.ts` (replaced default), `eslint.config.mjs` (extended).
