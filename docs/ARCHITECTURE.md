# Saathi · Architecture

A short map of how the prototype's pieces fit together. Detailed flow diagrams arrive on the day each flow ships.

## Layers (bottom → top)

```
                     ┌─────────────────────────────────────┐
                     │    UI surfaces                      │
                     │    /(marketing) /(app) /(demo)      │
                     │    /(admin)  + WhatsApp simulator   │
                     └────────────────┬────────────────────┘
                                      │ React Server Components,
                                      │ Server Actions, Route Handlers
                     ┌────────────────▼────────────────────┐
                     │    Domain (framework-agnostic)      │
                     │    src/domain/{defense,investment,  │
                     │                family,trust-level}  │
                     └────────────────┬────────────────────┘
                                      │ Pure functions / state machines
                     ┌────────────────▼────────────────────┐
                     │    Infrastructure (`src/lib/`)      │
                     │  llm/    voice/   db/   simulator/  │
                     │  payments/  i18n/  observability/   │
                     └────────────────┬────────────────────┘
                                      │ Adapters
              ┌───────────────────────┼───────────────────────────┐
              ▼                       ▼                           ▼
    ┌──────────────────┐   ┌────────────────────┐    ┌──────────────────┐
    │   LLM provider   │   │   Voice provider   │    │     Supabase     │
    │ Anthropic /      │   │   Sarvam / Browser │    │ Postgres+pgvector│
    │ OpenAI / Grok    │   │   Web Speech       │    │ Realtime, Storage│
    └──────────────────┘   └────────────────────┘    └──────────────────┘
```

## Hard rules

1. **All LLM calls go through `src/lib/llm/router.ts`.** No direct SDK imports anywhere else. Every call writes a row to `llm_events` with cost-in-paise and latency.
2. **Domain is framework-agnostic.** No `next/headers`, `cookies()`, route handlers, or React imports inside `src/domain/`. Pure functions and types. This keeps the trust-ladder logic, allocator, ULIP math, and defense classifier portable.
3. **Provider abstractions are interfaces with multiple implementations.** Voice has Sarvam + Browser today, MockTTS for tests later. Payments will have Mock + Razorpay (post-prototype). WhatsApp simulator implements the same `WhatsAppProvider` interface a future Twilio/Meta adapter will.
4. **LLM outputs are Zod-validated.** Schemas live in `src/lib/llm/schemas.ts`. `generateObject({ schema, … })` returns a typed object or throws.

## Directory cheat-sheet

| Path                          | Responsibility                                          |
|-------------------------------|---------------------------------------------------------|
| `src/app/(marketing)/`        | Landing, how-it-works, trust, pricing                   |
| `src/app/(app)/`              | Authenticated dashboard                                 |
| `src/app/(demo)/`             | WhatsApp simulator + presenter panel + replay          |
| `src/app/(admin)/`            | Cost dashboard + scam-pattern admin                     |
| `src/app/api/`                | Route handlers — defense, investment, voice, demo       |
| `src/components/ui/`          | Primitives (Button, Card, Badge)                        |
| `src/components/voice/`       | Voice player, recorder, transcript                      |
| `src/components/whatsapp-simulator/` | Phone frames, message bubbles                    |
| `src/lib/llm/`                | Router + schemas + provider configs + prompt files      |
| `src/lib/voice/`              | Provider interface + Sarvam + browser fallback          |
| `src/lib/db/`                 | Supabase clients + queries                              |
| `src/lib/simulator/`          | Realtime event bus + message handler                    |
| `src/lib/payments/`           | UPI Autopay simulator                                   |
| `src/lib/i18n/`               | Languages, format (Indian numbering), strings registry  |
| `src/lib/mocks/`              | Anjali persona, scam patterns, ULIP sample, AA mock     |
| `src/lib/observability/`      | LLM event logger; Langfuse-shaped on Day 2 if requested |
| `src/domain/defense/`         | Scam classifier, document audit, harassment generator   |
| `src/domain/investment/`      | Allocator, ULIP math, goal anchor, salary executor      |
| `src/domain/family/`          | Visibility filter, notification copywriter              |
| `supabase/migrations/`        | SQL — schema, RLS, pgvector, seed                       |

## Data flow examples

### Scam defense (Day 2 target)

```
WhatsApp simulator inbound
  → /api/inbound/route.ts
  → src/lib/simulator/message-handler.ts
  → STT (browser or Sarvam)
  → src/lib/llm/router.ts (embedding via OpenAI)
  → match_scam_patterns SQL function (pgvector)
  → src/lib/llm/router.ts (generateObject with ScamClassification schema)
  → src/lib/voice/index.ts (synthesize Hindi voice reply)
  → Supabase: insert into defenses + messages
  → Supabase Realtime channel: broadcast to receiver phone + Anjali phone
  → both phones in simulator render the new message
```

### Salary day cascade (Day 5 target)

```
Presenter clicks "Trigger salary day"
  → /api/demo/trigger
  → src/domain/investment/salary-executor.ts
    → for each goal allocation: emit UPI debit event
  → simulator events broadcast
  → goal progress bars tick up (server actions revalidate)
  → src/domain/family/notify.ts
    → fan out per-member voice/text via copywriter
  → Hisaab voice update sent to Anjali
```

## What this prototype mocks (and what production replaces them with)

| Surface              | Prototype                                      | Production                     |
|----------------------|------------------------------------------------|--------------------------------|
| WhatsApp transport   | In-browser simulator + Supabase Realtime       | Meta WhatsApp Business API     |
| UPI Autopay          | In-app mandate flow simulator                  | Razorpay (or PhonePe/Cashfree) |
| Outbound voice call  | Pre-recorded audio + animated transcript       | Vapi or in-house dialer        |
| Account Aggregator   | `mocks/account-aggregator.ts` (realistic)      | Setu/Sahamati                  |
| Voice TTS            | Sarvam (when key present) / Web Speech         | Sarvam pinned                  |
| LLM                  | Anthropic / OpenAI / Grok via AI SDK v6        | Same; possibly Vercel AI Gateway in front |
