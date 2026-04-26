# Saathi

> Pehle hum aapko bachate hain. Phir aapke paise ko badhaate hain.
> *(First we defend you. Then we grow your money.)*

Saathi is an AI-native product for Bharat households — WhatsApp-native, voice-first, vernacular by default. The defense layer (free, forever) catches scams, audits mis-sold ULIPs, fights recovery agent harassment, and challenges over-charging. The investment layer (paid AUM) generates goal-anchored portfolios anchored in instruments Bharat already trusts — gold, FD, Sukanya Samriddhi, PPF — and only graduates to mutual funds when the family is ready.

Built as a thesis-style submission for Zupee's AI-native product brief.

## Status

This is the prototype. Day-by-day build per `progress/`.

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (Postgres + pgvector + Realtime + Storage), Mumbai region
- **LLM router**: AI SDK v6 with auto-detection across Anthropic / OpenAI / Grok
- **Voice**: Sarvam (when key present) → browser Web Speech API fallback
- **Hosting**: Vercel

## Quick start

```bash
pnpm install
cp .env.example .env.local
# Fill at least one LLM key + Supabase URL/keys.
pnpm dev
```

If credentials are missing the app boots with mocks and writes to
`MISSING_CREDENTIALS.md` so you know exactly what to fill.

## Important notes for AI agents working on this repo

- Next.js 16 has breaking changes from training data. Read
  `node_modules/next/dist/docs/` before writing route handlers, layouts,
  or middleware. Notably: `params`/`searchParams` are Promises;
  `cookies()`/`headers()` are async; middleware lives in `proxy.ts`, not
  `middleware.ts`.
- All LLM calls flow through `src/lib/llm/router.ts`. No direct SDK use
  outside the router. Every call is logged to the `llm_events` table.
- Disclosure stance for outbound communication: "calling on Anjali
  Sharma's authorized behalf." Never "I am Anjali."

## Core docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system map
- [`docs/DESIGN.md`](docs/DESIGN.md) — visual system spec
- [`docs/PROMPTS.md`](docs/PROMPTS.md) — versioned LLM system prompts
- [`docs/COPY.md`](docs/COPY.md) — every user-facing string
- [`DEMO.md`](DEMO.md) — demo-day runbook
