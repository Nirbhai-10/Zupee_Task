# Phase 2 — Eight changes for live intelligence

Phase 1 shipped a passive demo (three static phones, pre-rendered voice). Phase 2 makes the intelligence visible, interactive, and undeniable. Three clicks now answer the evaluator's "real or video?" question.

## Live deploy

`https://saathi-tau.vercel.app` — production, served by Vercel. Aliased URL `bharosa-app.vercel.app` is also live but sits behind Vercel Hobby auth; use the canonical URL for sharing.

## What shipped

### 1. Floating chat widget (highest impact)
- `src/components/landing/{ChatWidget,ChatPanel,ChatBubble,ChatComposer}.tsx` — WhatsApp-faithful UI: green header with verified-business green tick, message bubbles with proper shadows + timestamps, composer with mic + textarea + send.
- `src/lib/chat/conversation-store.ts` — localStorage persistence keyed `bharosa_landing_chat_v1`. "Clear chat" in the header overflow menu.
- `src/app/api/chat/respond/route.ts` — single LLM call returning intent + text + CTA + Sarvam voice. Six intents: `scam-check`, `ulip-audit`, `investment-question`, `harassment-help`, `general-help`, `small-talk`. Heuristic fallback for production without an LLM key.
- `src/lib/llm/prompts/chat-respond.v1.ts` — versioned system prompt. Auto-detects user language. Strict JSON output. Disclosure stance preserved ("Bharosa, not impersonating Anjali").
- `src/hooks/use-voice-input.ts` — wraps SpeechRecognition with silence-timeout. Used by chat composer + (future) playground custom field + goal creator.
- Mounted globally via `Providers` in `src/app/providers.tsx`; auto-hides on `/(app)/*`, `/demo/simulator`, `/admin/*` via path check.

### 2. Live scam classifier playground
- `src/components/landing/ScamPlayground.tsx` — three preset scenario cards (KBC lottery, Digital arrest, Fake KYC) + custom textarea.
- Animated step reveal: pattern bank search (top-3 matches with similarity, computed client-side from `SCAM_PATTERNS_SEED`), AI verdict streaming in (verdict + confidence + risk + identifying signals), Hindi voice for the receiver.
- Calls the same `/api/defense/scam-check` endpoint that Phase 1 wired — no streaming in the API, but the client-side step reveal makes the intelligence layer visible.

### 3. Live ULIP audit demo
- `src/components/landing/UlipAuditDemo.tsx` — sample button + drag-drop file picker.
- Three-stage trace: parse (fee schedule table) → calculate (deterministic ULIP math) → 60-second Hindi voice audit.
- Reuses `/api/defense/document-audit` and the existing `ulip-math.ts`. Fee schedule rendered as a clean table with all charges. Comparison card shows ULIP vs term + SIP with the lifetime savings figure.

### 4. Demo as Anjali
- `src/app/api/demo/login/route.ts` — sets a `bharosa_demo` cookie + redirects to `/home?demo=1`.
- `src/components/app-shell/DemoBadge.tsx` — slim gold banner at the top of the (app) layout when the cookie or query param is present. "Reset" button clears localStorage + reloads.
- Hero CTA "See Anjali's dashboard" + "Open the dashboard" both route through `/api/demo/login`. The dashboard, family, goals, defenses, investments, timeline, and conversations pages all render with seeded Anjali data — the navigation is fully populated.

### 5. Twilio WhatsApp sandbox
- `src/app/api/webhooks/whatsapp/twilio/route.ts` — receives form-encoded inbound messages, runs `respondToChat` on them, replies via TwiML (Twilio relays it back to WhatsApp).
- `src/lib/whatsapp/twilio-provider.ts` — outbound helper for future server flows + `twilioSandboxJoinLink()` that builds the wa.me link with prefilled join code.
- `src/components/landing/WhatsAppHeroCta.tsx` — server component that reads env at SSR. If Twilio creds are configured, hero CTA opens WhatsApp with the prefilled join. Otherwise opens the in-app simulator.
- Vercel env vars set: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`. Set the Twilio sandbox webhook URL in Twilio console to `https://saathi-tau.vercel.app/api/webhooks/whatsapp/twilio` for the loop to close.

### 6. Vernacular voice input
- `src/components/voice/LanguagePickerPill.tsx` — compact picker, all 11 supported languages with endonym + ISO + active check.
- Wired into the chat composer's mic. Voice input language is independent of the global UI toggle, so a user can speak in Tamil while the chrome stays in English.
- Sarvam handles synthesis for all 11 languages; STT uses browser SpeechRecognition (Chrome / Safari iOS).

### 7. Script-aware typography
- `src/lib/i18n/scripts.ts` — script-family detector + `scriptForLanguage()` map.
- `src/app/globals.css` — per-script `[data-script="…"]` selectors with size, leading, and tracking metrics. Devanagari bumps 6%, line-height tightens to 1.42; Latin sits at 1em / 1.5; Tamil / Telugu / Kannada / Bengali / Oriya / Gujarati / Gurmukhi each get their own line.
- `src/components/shared/{T,LanguageText}.tsx` — apply `data-script` automatically. Toggling EN ↔ HI now stays visually level (no weight or rhythm jump).

### 8. Brand logo placeholder
- `public/brand/logo.svg` and `logo-white.svg` — shield + checkmark + भ glyph SVG placeholders.
- `src/app/icon.svg` — favicon (same shield, no card backing).
- `src/components/brand/Logo.tsx` — variants `mark`, `lockup`, `wordmark`; tones `default`, `light`. Used in the landing footer; ready to swap to the user's PNG by replacing `/public/brand/logo.svg`.

## Foundation sweep

- **EN strings sharpened.** En slot of every `<T/>` is now pure English — no romanised Hindi words, no "ji" / "Maaji" / "namaste" leaking into English mode. Brand name "Bharosa" is the only exception.
- **HI strings unchanged** — Hinglish remains the natural register; fintech terms (SIP, FD, ULIP, RBI) stay Latin script per Anjali's actual speech.
- **Twilio env added** to `.env.local` (rotate after this session — keys were shared in chat).
- **`package.json` name** is now `bharosa`.

## Verified

- `pnpm exec tsc --noEmit` clean.
- `pnpm lint` clean.
- `pnpm build` → 27 routes (added 3 new endpoints + 4 new landing components + favicon).
- `https://saathi-tau.vercel.app/api/chat/respond` POST returns intent + text + CTA in <1s on Vercel (heuristic mode without an LLM key set).
- `/api/health` reports `{ app: "bharosa", voice: "sarvam", supabase: configured }`.

## Mocked / deferred

- **Cloud LLM in production.** Without `ANTHROPIC_API_KEY` on Vercel, the chat / playground / audit / negotiator routes use heuristic templates. Outputs are believable but not as rich as live LLM. Adding the key in Project Settings → Environment Variables → redeploy lights everything up.
- **Document vision parse.** The ULIP audit demo's drag-drop currently captures the file name but math runs on the seeded fee schedule. A real Vision-LLM extraction wires when an LLM key is set.
- **Twilio webhook signature verification** is logged but not enforced. Production needs to verify `X-Twilio-Signature` against the auth token.
- **Custom Bharosa logo.** Placeholder SVG in place; awaiting the user's final PNG handoff at `/public/brand/logo.svg`.

## What to push on next

1. Cloud LLM key → richer chat replies + LLM voice scripts.
2. Bharosa logo PNG → finalises brand surface.
3. Real Vision-LLM document extraction in `/api/defense/document-audit`.
4. Twilio sandbox webhook URL configured in the Twilio console (one-off).

## Files changed

```
+ public/brand/{logo,logo-white}.svg
+ src/app/icon.svg
+ src/app/api/chat/respond/route.ts
+ src/app/api/demo/login/route.ts
+ src/app/api/webhooks/whatsapp/twilio/route.ts
+ src/components/app-shell/DemoBadge.tsx
+ src/components/brand/Logo.tsx
+ src/components/landing/ChatWidget.tsx
+ src/components/landing/ChatPanel.tsx
+ src/components/landing/ChatBubble.tsx
+ src/components/landing/ChatComposer.tsx
+ src/components/landing/ScamPlayground.tsx
+ src/components/landing/UlipAuditDemo.tsx
+ src/components/landing/WhatsAppHeroCta.tsx
+ src/components/voice/LanguagePickerPill.tsx
+ src/domain/chat/respond.ts
+ src/hooks/use-voice-input.ts
+ src/lib/chat/{types,conversation-store}.ts
+ src/lib/i18n/scripts.ts
+ src/lib/llm/prompts/chat-respond.v1.ts
+ src/lib/llm/prompts/negotiator.v1.ts (Phase 1 carry)
+ src/lib/whatsapp/twilio-provider.ts

* src/app/page.tsx (rewritten — minimal, EN-pure, mounts new sections)
* src/app/(app)/layout.tsx (DemoBadge mounted)
* src/app/globals.css (script-aware metrics)
* src/app/providers.tsx (mounts ChatWidget)
* src/components/{shared/T,shared/LanguageText,brand/Wordmark}.tsx
* src/components/landing/ChatComposer.tsx (LanguagePickerPill wired)
* package.json (name: "bharosa")
* .env.local (Twilio creds — rotate)
```
