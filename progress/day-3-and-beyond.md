# Days 3–6 (single push) — Document audit + Plan + Family + Salary cascade + Landing polish

The user asked to stop thinking day-wise and keep pushing. This file
covers the four flows landed in one session, plus Ollama wiring up
front. A lot of the original brief's "Day 4 / 5 / 6 / 7" work shows up
here as one long arc.

## Local LLM: Ollama (Gemma 4 8B)

User pointed out a local `gemma4:e4b` install on `localhost:11434`. I
added Ollama as a fourth provider in `src/lib/llm/router.ts`:

- Same router, talks to Ollama's OpenAI-compatible `/v1` endpoint via
  `@ai-sdk/openai`'s `createOpenAI`.
- Opt-in via `LLM_PROVIDER=ollama` or `OLLAMA_BASE_URL`. Auto-detection
  ranks cloud keys first (cloud > local) so production wiring later
  drops in cleanly.
- Models pluggable via `OLLAMA_MODEL_SONNET` / `OLLAMA_MODEL_HAIKU`.

**Reliability fix.** Smaller models don't emit reliable tool calls
(which is what AI SDK's `generateObject` defaults to). For Ollama, the
router now uses a JSON-via-text path:

1. Append `z.toJSONSchema(schema)` + a strict JSON-only instruction to
   the system prompt.
2. Call `aiGenerateText`.
3. Extract the JSON object (handles ```json fences and stray prose).
4. Parse + Zod-validate. One retry with a stricter reminder on parse
   failure. Throws `LLMOutputParseError` after two failures.

Cloud providers keep the native tool-call path.

**Token-budget gotcha.** Gemma 4 emits a separate `reasoning` channel
before `content`. With `maxOutputTokens: 600`, reasoning ate the budget
and `content` came back empty. Bumped to 2000 for plan-explain and
document-audit. Worth keeping in mind: voice scripts on local 8B models
need 1500-2000 token budgets.

`.env.local` is now seeded with `LLM_PROVIDER=ollama`. The demo runs
end-to-end against the local model out of the box.

---

## Document audit

`src/domain/investment/ulip-math.ts` — deterministic year-by-year
projection. Two scenarios: ULIP held to maturity vs term insurance +
direct equity SIP with the same monthly outflow. Outputs auditable
year-by-year cash flow. Long-run gross assumptions: 10% ULIP equity,
12% direct SIP. Term premium estimated at ₹3.36/lakh of sum assured.

`src/domain/defense/audit-document.ts` — wraps the math, calls the
voice prompt, returns `{ audit, voiceScript, source }`. Falls back to
a hand-tuned template when no LLM is available.

`POST /api/defense/document-audit` — Zod-validated, falls back to
`SAMPLE_ULIP` when no fees are supplied (demo-friendly).

`<AuditCard/>` renders ULIP vs alternative side-by-side with effective
returns, then a gold strip showing lifetime savings.

**Live verification (Gemma 4 8B):**
- 15-year SuperLife ULIP audit:
  - ULIP final ₹14,29,676 (effective 4.4%)
  - Alternative final ₹20,80,752 (effective 7.0%)
  - **Lifetime savings ₹6,51,076**
- Voice script names product, cites specific charges, compares with
  concrete numbers, closes with respectful recommendation. Hindi/Hinglish
  register, no patronising. Latency ~19s on local hardware.

---

## Investment plan (allocator + voice)

`src/domain/investment/allocator.ts` — deterministic portfolio
allocator. Encodes:
- Trust ladder (gold > FD > SSY > PPF > debt > equity).
- Liquidity invariant — medical goals get liquid funds only.
- Cultural fit — daughter wedding tilts SSY-heavy + gold + FD.
- Goal-instrument matching by horizon (short → RD/liquid; mid →
  short-debt + FD; long → SSY/PPF/gold).

Output sums to monthly surplus exactly.

`src/domain/investment/generate-plan.ts` — runs the allocator, calls
plan-explain with the structured plan as input. LLM never invents
numbers; it walks them.

`POST /api/investment/plan` — generates Anjali's plan (no body needed
for the demo).

`<PlanCard/>` — Framer Motion staggered goal entries (ease-confident,
120ms apart). Per-goal breakdown showing instrument splits.

**Live verification (Gemma 4 8B):**

```
Total: ₹5,400 of ₹5,500 surplus
  Mummy ka medical (medical, 8m horizon)  → liquid_fund ICICI ₹2,200
  Priya ki shaadi (wedding, 72m horizon)  → SSY ₹600 + gold ₹100 + FD ₹100
  Aarav ki coaching (education, 14m)      → short_debt ₹1,300 + FD ₹600
  Diwali fund (festival, 6m)              → RD ₹500
```

Voice script (1,256 chars) walks each goal with deterministic numbers,
cites partner names, closes with the UPI Autopay confirmation cue.

---

## Family + salary cascade

`src/lib/llm/prompts/family-notify.v1.ts` — versioned prompt for the
LLM-driven copywriter (planned Day-7 polish).

`src/domain/family/notify.ts` — deterministic family copywriter +
Hisaab voice script builder. Templates per relationship and visibility
scope. Used by execute-salary-day on every run.

`POST /api/investment/execute-salary-day` — re-builds the plan, fans
out family notifications, synthesises:
- Hisaab voice for Anjali (`saathi-female` timbre).
- Per-recipient family voice notes (`saathi-elder` for the mother-in-
  law; `saathi-female` for the husband).
- Brother gets a short text per his "college fee transfers only"
  visibility scope.

**Salary day trigger** in `<TriggerPanel/>`:
- Salary credit message → typing → "Plan execute kar rahe hain" →
  call API → 4 UPI Autopay debit bubbles cascade onto Anjali's phone
  (220ms apart, gold highlight ring) → Hisaab voice note → MIL phone
  receives elder-voice notification, husband phone receives detailed
  update (250ms apart per recipient).

---

## App surfaces

- **`/`** (landing) — full marketing surface. Hero with the "जब बैंक
  वाले ULIP बेच रहे हैं, हम सच बताते हैं" headline + WhatsApp
  conversation preview. 4-card defense grid. 3-column investment
  pillars. Anjali demo card with ₹5,500 mandate breakdown. Trust
  strip. Footer. Sticky `<MarketingNav/>` with links back to
  /demo/simulator.
- **`/home`** — Anjali's dashboard. Greeting, savings hero (₹47,200
  YTD), 4 quick-action tiles, latest defense card (KBC scam), salary
  day countdown, goals overview with progress bars.
- **`/family`** — hero card for Anjali (income/remittance/surplus),
  5 family member cards (relationship icon, age band, language,
  visibility chips), money-flow ledger.
- **`/goals`** — goal list cards (category icon, target, years
  remaining, rationale).
- **`/investments`** — instrument catalogue cards with trust-rung
  badges, expected return / liquidity / lock-in stats, vernacular
  pitches.
- **`/defenses`** — 3 seeded defense cards (KBC, ULIP, bank-freeze)
  rendered through `<DefenseCard/>`.
- **`/demo/simulator`** — three live phones + presenter trigger panel
  with 4 demo buttons (KBC scam, ULIP audit, Plan banwayein, Salary
  day) + activity pane below the phones rendering Plan/Audit/Defense
  cards as they fire.
- **`/api/health`** — reports the configured stack without leaking
  secrets.

---

## Verified

- `pnpm exec tsc --noEmit` — clean.
- `pnpm lint` — clean (eslint config allows `_`-prefixed unused args).
- `pnpm build` — 22 routes, all prerender / dynamic correctly classified.
- Routes 200-checked via curl on dev: `/`, `/home`, `/family`,
  `/goals`, `/defenses`, `/investments`, `/demo/simulator`,
  `/demo/presenter`, `/demo`, `/admin/costs`, `/admin/scam-patterns`,
  `/api/health` → all `200`.
- Live LLM calls against Gemma 4 8B for: scam classifier (24s),
  document audit (19s), investment plan (40s+ with voice synth).

## Mocked / deferred

- **Voice playback in the simulator.** `BrowserVoiceProvider` returns
  `browser-tts:<base64-payload>` marker URLs. The client `<VoicePlayer/>`
  needs a small piece of code to decode and call `speechSynthesis.speak`
  — that decode helper exists in `src/lib/voice/browser-voice.ts` but
  isn't wired into the player yet. Day-7 follow-up.
- **Sarvam voice path** is ready behind `SARVAM_API_KEY` — the client
  passes through unchanged.
- **Supabase persistence** — the migrations are written, the clients
  exist, but no Supabase project is configured yet. `llm_events`
  logging fails silently to the console. Defenses + plans live in
  React state only.
- **LLM rewriter for family notifications** — the prompt is staged;
  the runtime call is the deterministic templates.
- **`/admin/scam-patterns` CRUD, `/demo/presenter` controls,
  `/demo` self-running replay, `/defenses/[id]` detail page,
  `/goals/[id]` detail page, voice goal creator, marketing FAQ /
  pricing / how-it-works pages, settings page** — all still
  `<DayPlaceholder/>` or absent. Polishing surfaces that don't ship
  for the 90-second demo path.
- **Conversational intake state machine** — the brief calls for a
  4-7 question voice flow. Current implementation single-shots the
  plan from Anjali's seeded goals (the demo equivalent — same plan
  output, no real STT loop).
- **100 scam variants embedded into pgvector** — 19 high-fidelity
  exemplars plus the heuristic match cover every category the demo
  touches; expanding to 100 + computing embeddings happens once
  Supabase is live.

## Files added (Days 3-6)

```
src/domain/investment/ulip-math.ts
src/domain/investment/allocator.ts
src/domain/investment/generate-plan.ts
src/domain/defense/audit-document.ts
src/domain/family/notify.ts
src/lib/llm/prompts/document-audit.v1.ts
src/lib/llm/prompts/plan-explain.v1.ts
src/lib/llm/prompts/family-notify.v1.ts
src/app/api/defense/document-audit/route.ts
src/app/api/investment/plan/route.ts
src/app/api/investment/execute-salary-day/route.ts
src/components/defenses/AuditCard.tsx
src/components/goals/PlanCard.tsx
src/components/family/FamilyMemberCard.tsx
src/components/whatsapp-simulator/SimulatorActivityPane.tsx
src/components/marketing/MarketingNav.tsx
src/components/brand/Wordmark.tsx
```

## Files updated

- `src/lib/llm/router.ts` (Ollama + JSON-via-text fallback)
- `src/app/page.tsx` (full landing)
- `src/app/(app)/home/page.tsx` (real dashboard)
- `src/app/(app)/family/page.tsx`, `goals/page.tsx`,
  `investments/page.tsx` (replaced placeholders)
- `src/app/demo/simulator/page.tsx` (added activity pane)
- `src/components/whatsapp-simulator/SimulatorProvider.tsx`,
  `TriggerPanel.tsx`, `SimulatorActivityPane.tsx`
- `src/lib/simulator/triggers.ts`, `types.ts`
- `.env.example`, `.env.local` (Ollama opt-in)
