# Bharosa (भरोसा)

> **पहले हम आपको बचाते हैं। फिर आपके पैसे को बढ़ाते हैं।**
> *First we defend you. Then we grow your money.*

Bharosa is an **AI-native, defense-first, WhatsApp-native financial co-pilot for Bharat** — built for the 100M+ Hindi-first households that India's existing fintechs treat as either a fraud risk or a feature wishlist. Submitted for **Zupee's AI-Native Product Theme-3** brief.

The defense layer is **free for life**. It catches WhatsApp scams aimed at the family, audits mis-sold ULIPs/endowments, fights recovery-agent harassment using RBI Master Circular references, and prepares vernacular voice calls + cease-and-desist letters in seconds. Only after **trust is earned** do we graduate the household into goal-anchored investments — Sukanya Samriddhi, FDs, gold, and PPF first; mutual funds only when the family is ready.

The intelligence + voice layer runs on **[Sarvam.ai](https://www.sarvam.ai)** — Bharat-native LLM (`sarvam-m`), Indian-language TTS (`bulbul:v3`) and STT (`saaras:v3` / `saarika:v2.5`). Local **Ollama (Gemma 4 8B)** is the offline fallback.

🌐 **Live demo:** https://saathi-tau.vercel.app
🎙️ **Press-and-talk voice agent:** [/#voice](https://saathi-tau.vercel.app/#voice)
📦 **Repo:** https://github.com/Nirbhai-10/Zupee_Task

---

## Why Bharosa exists

Every Indian fintech sells a product. Anjali Sharma — a UP-government school teacher in Lucknow — has six product apps on her husband's phone, and zero of them help her when:

- Her **mother-in-law** forwards a "KBC ₹25,00,000 lottery winner" WhatsApp message
- Her **bank's RM** pushes a 28-page ULIP brochure with hidden 1.35% FMC + 10% first-year allocation charge
- A **recovery agent** for her brother-in-law's credit card calls at 9:45 PM with threats
- Her **₹38,000 salary** lands and four goals (daughter's wedding 2032, son's coaching 2027, mother-in-law's medical buffer, Diwali fund) need to be funded

Bharosa solves these four jobs end-to-end on WhatsApp, in her language, in her voice — then quietly compounds the trust into a small monthly investment plan she actually understands.

---

## Core product surfaces

### 1. Defense (free, forever)

| Feature | What it does | Tech |
|---|---|---|
| **WhatsApp scam catch** | MIL forwards suspicious message → Bharosa classifies (KBC / digital arrest / fake KYC / +92 numbers / fake bank) → replies in her language → loops you in | Sarvam-M classifier + pattern bank · Sarvam TTS reply |
| **ULIP / policy audit** | Drop a 28-page brochure → real fees extracted → 15-year wealth math vs. term + SIP alternative → "₹6.5 L lifetime savings" | PDF extract + Sarvam-M reasoning + `auditULIP()` math |
| **Recovery-agent defense** | Agent name + agency + threat log → cease-and-desist letter + RBI Sachet draft + vernacular voice call to the agent | Sarvam-M + Sarvam TTS in agent's language |
| **Wrong-bill / over-charge** | Photo of bill → company called on user's behalf → refund tracked | Sarvam-M + outbound voice (planned) |

### 2. Investment (goal-anchored, trust-graduated)

- **Goals you actually have**: Daughter's wedding 2032, son's coaching 2027, Diwali fund, mother-in-law's medical buffer
- **Trusted instruments first**: Sukanya Samriddhi → FD → Gold → PPF → debt MF → equity MF (only when comfortable)
- **Salary-day execution**: ₹5,500 mandate splits across 4 goals on a single UPI Autopay
- **Family stays in the loop**: Husband sees goal progress, MIL sees protection alerts, kids see their savings

### 3. Voice agent — "Press & Talk"

A **big mic button** on the landing page (and the home dashboard). Hold to record, release to send.

- **STT** → `POST /api/voice/stt` → Sarvam `saaras:v3`
- **Chat** → `POST /api/chat/respond` → Sarvam-M (`sarvam-m`)
- **TTS** → Sarvam `bulbul:v3` (speaker = `shreya` / `kavya` / `roopa` / `rahul`)
- **Spacebar = walkie-talkie**, fully accessible
- Continuous, multi-turn conversation in **Hindi or English** (auto-detects)

---

## Sarvam integration map

Sarvam is the **primary** intelligence + voice layer. Every Sarvam product has a specific job.

| Sarvam offering | Model | Where Bharosa uses it |
|---|---|---|
| **Chat completions** | `sarvam-m` (OpenAI-compatible at `https://api.sarvam.ai/v1`) | Scam classifier, ULIP audit reasoning, harassment letters, plan explanation, intake conversation, landing-page chat widget |
| **Text-to-speech** | `bulbul:v3` (24 kHz) / `bulbul:v2` fallback | Bharosa's voice replies, vernacular scam warnings, recovery-agent calls, voice agent speaking-back |
| **Speech-to-text** | `saaras:v3` (multilingual transcribe) / `saarika:v2.5` | Voice agent mic input, future WhatsApp voice-note transcription |
| **Translate** | `mayura:v1` *(planned wiring)* | Cross-language family notifications (Hindi message → English summary for spouse abroad) |

**Speakers** (auto-selected per persona): `shreya` (warm female default), `rahul` (male), `kavya` (warm narrator), `roopa` (elder).

**Fallback chain**: `Sarvam → Anthropic → OpenAI → Grok → Ollama (Gemma 4 8B local)` — controlled by `LLM_PROVIDER` env or auto-detected from which key is present.

---

## Tech stack

- **Framework**: Next.js 16 (App Router, Turbopack, React 19, RSC)
- **UI**: Tailwind CSS v4 (config-less, `@theme inline`), shadcn-derived primitives, Framer Motion, Recharts, Wavesurfer.js
- **Bilingual**: `<T hi="..." en="..." />` + `useT()` over `useSyncExternalStore` (zero hydration mismatch). 11 Indian languages registered.
- **AI SDK**: `ai` v6 + `@ai-sdk/openai` (used as the OpenAI-compatible client for Sarvam, Grok, Ollama) + `@ai-sdk/anthropic`. Single `src/lib/llm/router.ts` is the only place that touches a model SDK.
- **Voice**: Sarvam REST API + `MediaRecorder` (browser) + `SpeechSynthesis` fallback
- **Database**: Supabase (Postgres + pgvector + Realtime + Storage)
- **WhatsApp**: Twilio sandbox (`/api/webhooks/whatsapp/twilio` TwiML), parity with the in-app simulator
- **Observability**: Every LLM call logged to `llm_events` (provider, tier, tokens, cost in paise, latency)
- **Hosting**: Vercel (Fluid Compute, Node.js 24 LTS)

---

## Repository layout

```
src/
├─ app/
│  ├─ page.tsx                     ← landing (hero, voice agent, scam playground, ULIP audit)
│  ├─ (app)/                        ← Anjali's signed-in dashboard (home, goals, defenses, family, …)
│  ├─ (marketing)/                  ← how-it-works, pricing, trust
│  ├─ for-zupee/                    ← thesis page (moat stack, competitive landscape)
│  ├─ demo/simulator/               ← WhatsApp simulator with KBC / ULIP / harassment / salary triggers
│  └─ api/
│     ├─ voice/stt/route.ts         ← Sarvam STT (saaras:v3 / saarika:v2.5)
│     ├─ voice/tts/route.ts         ← Sarvam TTS (bulbul:v3)
│     ├─ chat/respond/route.ts      ← landing-page chat → Sarvam-M
│     ├─ defense/scam/, ulip/, harassment/
│     ├─ investment/plan/
│     ├─ webhooks/whatsapp/twilio/  ← Twilio inbound (TwiML)
│     └─ vault/                     ← private 9pm reflection (supporting role)
├─ components/
│  ├─ voice/VoiceAgent.tsx          ← BIG "press & talk" mic — Sarvam loop
│  ├─ voice/VoicePlayer.tsx         ← wavesurfer-rendered audio player
│  ├─ landing/                      ← ChatWidget, ScamPlayground, UlipAuditDemo, …
│  ├─ whatsapp-simulator/           ← phone frames + trigger panel
│  └─ shared/T.tsx                  ← bilingual primitive
├─ lib/
│  ├─ llm/
│  │  ├─ router.ts                  ← single-source LLM router (sarvam → anthropic → openai → grok → ollama)
│  │  └─ prompts/                   ← versioned prompts (chat-respond.v1, negotiator.v1, …)
│  ├─ voice/
│  │  ├─ sarvam-voice.ts            ← Sarvam TTS + STT REST client
│  │  └─ browser-voice.ts           ← Web Speech fallback
│  ├─ i18n/                         ← LanguageProvider, T component, scripts detector
│  └─ db/                           ← Supabase clients + types
└─ domain/                          ← chat, defense, investment, vault — pure business logic
```

---

## Quick start

```bash
git clone https://github.com/Nirbhai-10/Zupee_Task.git bharosa
cd bharosa
pnpm install
cp .env.example .env.local
# Fill SARVAM_API_KEY (primary) + Supabase URL/keys.
pnpm dev   # opens http://localhost:3000
```

### Environment variables

```bash
# LLM — primary: Sarvam (Bharat-native). Fallback: local Ollama.
LLM_PROVIDER=sarvam              # sarvam | anthropic | openai | grok | ollama | auto
SARVAM_API_KEY=sk_...            # https://dashboard.sarvam.ai
SARVAM_MODEL=sarvam-m
SARVAM_BASE_URL=https://api.sarvam.ai/v1
SARVAM_TTS_MODEL=bulbul:v3       # bulbul:v2 | bulbul:v3
SARVAM_STT_MODEL=saaras:v3       # saaras:v3 | saarika:v2.5

# Local fallback
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=gemma4:e4b

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=        # optional

# WhatsApp (Twilio sandbox)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=+14155238886

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Bharosa
NEXT_PUBLIC_DEFAULT_LANGUAGE=hi-IN
```

### Useful commands

```bash
pnpm dev                # next dev (Turbopack)
pnpm build              # next build
pnpm lint               # eslint
npx tsc --noEmit        # typecheck
```

### Deploy to Vercel

```bash
vercel link
vercel env add SARVAM_API_KEY production
# … add the rest from .env.local
vercel --prod --yes
```

The canonical production URL is **https://saathi-tau.vercel.app** (the project was originally named "saathi" before the rename to Bharosa). Set `LLM_PROVIDER=sarvam` in the Vercel environment to make Sarvam the primary chat + voice provider.

---

## WhatsApp parity

Twilio sandbox webhook is wired at `POST /api/webhooks/whatsapp/twilio`. Send a WhatsApp message to **+1 (978) 464-3769** with the join code, then text or voice-note Bharosa anything — same Sarvam stack as the web app, no code branches.

To go production: provision a WhatsApp Business number + Cloud API, point the webhook at `/api/webhooks/whatsapp/cloud/route.ts`, and the rest of the app runs unchanged.

---

## What makes the moat

(Detailed thesis at [/for-zupee](https://saathi-tau.vercel.app/for-zupee))

1. **Outcome ledger**: Every scam catch, ULIP refusal, refund recovered, and salary-day transfer is persisted with hard `paise_saved` numbers. After 12 months we know exactly which households we kept solvent — no other Indian fintech has this row.
2. **Salary-day behavior**: We see what each household actually spends on the 7th of every month. That's better behavioral data than 50 KYC fields.
3. **Personal timing data**: Recovery agents call at 9:45 PM. Festival cash flows at Karva Chauth. Diwali bonuses arrive on a specific Tuesday. We learn the *temporal* shape of each Bharat household.
4. **Private reflection layer (Vault) as a quiet back layer**, not the front door. Sensitive 9pm money questions are stored locally, family never sees them, and the data only feeds anonymised aggregate sentiment.

---

## Roadmap

- ✅ Sarvam as primary LLM (`sarvam-m`) + STT (`saaras:v3`) + TTS (`bulbul:v3`)
- ✅ Big "Press & Talk" voice agent on landing + dashboard (Spacebar walkie-talkie, multi-turn)
- ✅ WhatsApp parity via Twilio sandbox
- ✅ Defense flows: scam catch, ULIP audit, recovery-agent letter + voice
- ✅ Investment flow: 4-goal plan + UPI mandate modal
- ✅ Bilingual (Hindi-first, English fully translated, 9 more Indian languages stubbed)
- ⏳ Sarvam Translate (`mayura:v1`) for cross-language family notifications
- ⏳ WhatsApp voice-note ingestion (Twilio media → Sarvam STT)
- ⏳ Migrate to Vercel Functions Fluid Compute regions (BOM1)
- ⏳ Production WhatsApp Business API (Meta Cloud API)

---

## Credits

- Built for **Zupee's AI-Native Product Theme-3** brief.
- Persona: **Anjali Sharma**, UP government school teacher, Lucknow.
- Voice + LLM: **[Sarvam.ai](https://www.sarvam.ai)** — Bharat's foundation model lab.
- WhatsApp transport: **Twilio Programmable Messaging Sandbox**.
- Database + Storage: **Supabase** (Mumbai region).
- Hosting: **Vercel** (Fluid Compute, Node.js 24).

विश्वास, हमारे काम का पहला नियम है।
*Trust is the first rule of our work.*
