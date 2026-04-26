# Day 2 — WhatsApp simulator + scam defense

**Goal:** Get the T+0–T+28s slice of the demo working end-to-end. A scam arrives on the mother-in-law's phone, she forwards to Saathi, Saathi catches it, replies with a Hindi voice note, and Anjali's phone gets a notification — visible across three live phone frames inside the browser.

## Shipped

### WhatsApp simulator UI
- `<PhoneFrame/>` — 320px iPhone-shaped frame with status bar, WhatsApp-green header (avatar + contact + status + call/menu icons), and a scrolling conversation pane on the WhatsApp wallpaper. Drops a caption strip below the device naming the owner ("Sushma Maaji · 68 · saas").
- `<MessageBubble/>` — faithful WhatsApp bubble. Outbound right (`#DCF8C6`), inbound left (white). Variants: text, image, voice (drives `<VoicePlayer/>` inline), document. Status checks (sent / delivered / read with the WhatsApp-blue double-tick). Optional `highlight` ring for scam / savings emphasis.
- `<TypingIndicator/>` — three pulsing dots, honors prefers-reduced-motion.
- `<Composer/>` — emoji + text + attachment + mic/send swap (mic when empty, send when text).
- `<SimulatorStage/>` — three phones side-by-side (MIL · Anjali · husband), each subscribed to its own slice of `SimulatorProvider` state. Auto-scrolls on new message or typing.

### State + transport
- `SimulatorProvider` (React Context + useReducer) holds messages, typing flags, and defenses. Selectors per phone.
- `src/lib/simulator/event-bus.ts` is a module-level pub/sub the provider bridges to. Same shape as the future Supabase Realtime channel — swapping is a single-file change. In-memory is enough for Day 2's single-tab demo.
- Triggers live in `src/lib/simulator/triggers.ts` as ordered `TriggerStep[]` arrays. Day 2 ships `kbcScamToMilSequence()`; days 3–5 add ULIP, intake, salary.

### Scam classifier
- `src/lib/llm/prompts/scam-classify.v1.ts` — versioned system prompt with the brief's decision rules (false negatives are worse than false positives; 0.85+ similarity defaults to SCAM; mis-sold ULIPs get LEGITIMATE_BUT_LOW_QUALITY; receiver register adapts by age band; numbers always explicit).
- `src/lib/llm/prompts/intent-detect.v1.ts` — versioned router prompt for the upstream "what does this user want" hop (hooked Day 4).
- `src/domain/defense/classify-scam.ts` — `classifyScam()` function. Calls `router.generateObject(ScamClassification, …)`. **If no LLM key is configured, falls back to a deterministic heuristic** that scores against the seeded pattern bank by phrase + token frequency, picks the best-matching pattern, and synthesises a believable classification (correct verdict, age-aware receiver script, primary-user alert, savings figure). Tagged `source: "mock-heuristic"` so the UI can render a "running offline" hint.
- `src/app/api/defense/scam-check/route.ts` — POST endpoint, Zod-validated request body. Runs the classifier, then optionally synthesises voice (Sarvam if configured, browser fallback otherwise). Returns `{ classification, source, matchedPatternName, voice }`.

### Surfaces wired
- `/demo/simulator` — full SimulatorProvider + TriggerPanel + SimulatorStage. Click "KBC scam → Mummy" to play the scripted sequence:
  1. KBC scam appears on MIL's phone (highlighted with the scam ring).
  2. After 2.4s MIL "forwards" to Saathi.
  3. Saathi shows typing.
  4. POST `/api/defense/scam-check` runs classifier + voice synthesis.
  5. Saathi voice reply + text caption land on MIL's phone.
  6. Anjali's phone gets a Hindi notification with the savings figure.
- `/defenses` — three seeded defenses (KBC, ULIP mis-selling, HDFC bank-freeze) rendered with the new `<DefenseCard/>` (verdict badge, identifying signals, primary alert, gold savings strip). Banner explains live triggers from the simulator extend the list once Supabase is wired.
- `<DefenseCard/>` — first-class component reused on `/defenses`, future dashboard card, future detail page.

### Routes restructured (carried into Day 2)
- The original Day 1 `(demo)` and `(admin)` route groups left URLs flat (`/simulator`, `/costs`). Brief expects nested `/demo/simulator`, `/admin/costs`. Routes restructured before Day 2 work began. `(app)` is left as a route group — its flat URLs (`/home`, `/family`, `/goals`, …) are correct.

## Verified

- `pnpm exec tsc --noEmit` clean.
- `pnpm lint` clean.
- `pnpm build` → 19 routes, prerender + dynamic correctly classified.
- `POST /api/defense/scam-check` on the KBC sample returns:
  - verdict `SCAM`, category `lottery`, confidence 0.76
  - identifying signals from the seed pattern
  - "Maaji, namaste…" Hindi receiver explanation
  - Anjali alert: "Mummy ko lottery scam aaya … ₹8,500 ka risk tha."
  - source `mock-heuristic` (no LLM key set)
- `/demo/simulator` and `/defenses` both return 200.

## Mocked / deferred

- **Live LLM classifier** kicks in the moment `ANTHROPIC_API_KEY` (or OpenAI / Grok) is set. Until then the heuristic ships a believable verdict for every seeded pattern.
- **Real voice playback** uses the browser's Web Speech API by default (the `browser-tts:` marker URL the VoicePlayer decodes on the client). Sarvam takes over when `SARVAM_API_KEY` is set.
- **Supabase persistence** of defenses is wired in the API route shape but not actually called — the route currently just returns the classification. Day 3 onward, the defense row + the inbound message are persisted before the response goes out.
- **Cross-tab Realtime** is mocked with the in-memory bus. Same code shape as the Realtime adapter; swap when Supabase is configured.
- **The remaining ~80 scam variants.** 19 high-fidelity exemplars cover every category the demo touches; the heuristic resolves them cleanly. Expanding to 100 + computing embeddings lands when the seed-database script ships (deferred to a small Day 2.5 task or rolled into Day 3).
- **Defense detail page** (`/defenses/[id]`) — not built yet. The card is the surface; the detail page is a card with the original input + RBI Sachet reference + outbound call log, all of which need a live database round-trip.
- **Dashboard card.** The `<DefenseCard/>` component is ready; `/home` still renders the Day 1 `<DayPlaceholder/>`. Drop the card into `/home` when the dashboard layout lands (Day 2.5 / 6).

## What Day 3 needs

- Carry on with the document audit flow:
  - LLM vision extract → `ULIPFeeSchedule` (schema already drafted Day 1).
  - Deterministic ULIP math engine in `src/domain/investment/ulip-math.ts`.
  - 60–90s audit voice via Sarvam (or browser fallback).
  - Document upload UI in the simulator's composer.
  - Audit card variant of `<DefenseCard/>` showing the ₹2,40,000 lifetime-savings headline.

If the user provides `ANTHROPIC_API_KEY` + Supabase between Day 2 and Day 3, the classifier and persistence layers light up automatically without further code changes.

## Files added

```
src/components/whatsapp-simulator/PhoneFrame.tsx
src/components/whatsapp-simulator/MessageBubble.tsx
src/components/whatsapp-simulator/TypingIndicator.tsx
src/components/whatsapp-simulator/Composer.tsx
src/components/whatsapp-simulator/PhoneFooter.tsx
src/components/whatsapp-simulator/SimulatorProvider.tsx
src/components/whatsapp-simulator/SimulatorStage.tsx
src/components/whatsapp-simulator/TriggerPanel.tsx
src/components/defenses/DefenseCard.tsx
src/lib/llm/prompts/scam-classify.v1.ts
src/lib/llm/prompts/intent-detect.v1.ts
src/lib/simulator/types.ts
src/lib/simulator/event-bus.ts
src/lib/simulator/triggers.ts
src/domain/defense/classify-scam.ts
src/app/api/defense/scam-check/route.ts
```

## Files updated

```
src/app/demo/simulator/page.tsx     (replaced DayPlaceholder)
src/app/(app)/defenses/page.tsx     (replaced DayPlaceholder, seeded defenses)
```
