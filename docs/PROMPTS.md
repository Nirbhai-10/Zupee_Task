# Saathi · LLM Prompts

Single source of truth for every system prompt that ships in production. Every prompt is **versioned**: a change to wording triggers a new entry, never an in-place edit. Day-2+ adds the actual prompt files under `src/lib/llm/prompts/`. This file is the index.

## Conventions

- One file per `(feature, version)` pair. Filename: `<feature>.v<n>.ts`.
- Each file exports `SYSTEM_PROMPT` (string) plus, where the feature uses `generateObject`, the matching Zod schema reference from `src/lib/llm/schemas.ts`.
- The router resolves prompts by feature key. The `feature` argument to `router.generateText` / `router.generateObject` is the same key the prompt file is named after.
- When a prompt produces user-facing language, the prompt itself is in English but the *output* register is constrained: "Respond in Hindi unless the user wrote in another Indian language. Use a respectful but warm register — younger sister-in-law to elders, peer to peers."

## Day 1 status

Stub. The first real prompts (`scam-classify.v1.ts`, `intent-detect.v1.ts`) land Day 2. Until then, this file documents the shape so the seed-script + classifier can wire to it without surprise.

## Planned prompts

| Feature              | Tier   | Schema                  | Day landing |
|----------------------|--------|-------------------------|-------------|
| `intent-detect`      | haiku  | `IntentDetection`       | Day 2       |
| `scam-classify`      | haiku  | `ScamClassification`    | Day 2       |
| `scam-explain`       | sonnet | _text_                  | Day 2       |
| `document-extract`   | sonnet | `ULIPFeeSchedule`       | Day 3       |
| `document-audit`     | sonnet | _text_ (60–90s voice)   | Day 3       |
| `harassment-letter`  | sonnet | _text_                  | Day 3       |
| `intake-conversation`| sonnet | per-turn schema TBD     | Day 4       |
| `plan-explain`       | sonnet | _text_                  | Day 4       |
| `family-notify`      | sonnet | per-recipient schema    | Day 5       |
| `salary-recap`       | sonnet | _text_                  | Day 5       |
