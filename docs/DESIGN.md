# Saathi · Visual Design System

The brief in `progress/day-0-brief.md` is the source-of-truth narrative. This file is the engineering reference — what's actually wired up in code.

## Influences (the why)

1. **Indian institutional dignity.** Senior bureaucrat's office, family doctor's clinic, heritage hotel reception. Calm authority. Restrained craft.
2. **Modern fintech craft.** Stripe's precision, Cred's restraint, Acorns's warmth. Type-driven hierarchy, generous whitespace, tabular numbers.
3. **Indian everyday warmth.** Cotton saree texture, haldi-doodh color, brass gleam, clay-lamp glow.

**What we explicitly avoid:** peacock feathers, rangoli backgrounds, mandala patterns. Saathi's Indianness lives in typography choice, color temperature, copywriting register, and user flow — not visual ornament.

## Color tokens

Declared in `src/app/globals.css` via Tailwind v4 `@theme inline` → utilities like `bg-saathi-deep-green`, `text-saathi-ink`, `border-saathi-paper-edge`.

| Token                          | Hex      | Use                                          |
|--------------------------------|----------|----------------------------------------------|
| `saathi-deep-green`            | #0F4D3F  | Primary actions, headlines, brand            |
| `saathi-deep-green-soft`       | #1B5C4D  | Hover state for primary buttons              |
| `saathi-deep-green-tint`       | #E5EFEB  | Subtle backgrounds for green badges/pills    |
| `saathi-gold`                  | #C8973F  | Money progress, currency stat highlights     |
| `saathi-gold-tint`             | #F8EFD9  | Stat strip backgrounds                       |
| `saathi-cream`                 | #FBF6EB  | Default page background                      |
| `saathi-cream-deep`            | #F4ECDA  | Section / hero backgrounds                   |
| `saathi-paper`                 | #FFFFFF  | Card surfaces                                |
| `saathi-paper-edge`            | #F2EBD9  | Card borders                                 |
| `saathi-ink`                   | #1A1A1A  | Default text                                 |
| `saathi-ink-soft`              | #4A4A4A  | Secondary text                               |
| `saathi-ink-quiet`             | #8A8A8A  | Tertiary text / metadata                     |
| `saathi-success` / `-tint`     | #2E7D5A  | Goal-on-track state                          |
| `saathi-warning` / `-tint`     | #B07A3F  | Suspicious / mid-trust state                 |
| `saathi-danger` / `-tint`      | #A33A3A  | Scam verdicts, harassment alerts             |
| `saathi-voice` / `-tint`       | #5C8A7F  | Voice waveform default; played portion → gold |

## Type stack

Loaded via `next/font/google` in `src/app/layout.tsx`. CSS variables `--font-manrope`, `--font-mukta`, `--font-jetbrains` are referenced from `globals.css` token aliases `--font-sans`, `--font-deva`, `--font-mono`.

| Family          | Weights       | Use                                              |
|-----------------|---------------|--------------------------------------------------|
| Manrope         | 400/500/600/700/800 | Latin headlines + UI                       |
| Mukta           | 400/500/600/700 | Devanagari + Indic scripts                     |
| JetBrains Mono  | 400/500       | Currency, transcripts, tabular metadata          |

Indic-script elements (`<span lang="hi">…`) automatically switch to the Mukta-led stack with an 8% size bump and a 5% tighter line-height — handled in `globals.css` via `:lang()` selectors. The `<LanguageText />` component sets the right `lang` attribute for free.

### Type scale

| Class             | Size      | Use                          |
|-------------------|-----------|------------------------------|
| `text-display`    | 4.5rem    | Hero headlines               |
| `text-h1`         | 3rem      | Page headlines               |
| `text-h2`         | 2.25rem   | Section headlines            |
| `text-h3`         | 1.5rem    | Card titles                  |
| `text-body-lg`    | 1.125rem  | Lede paragraphs              |
| `text-body`       | 1rem      | Default body                 |
| `text-body-sm`    | 0.875rem  | Secondary, captions in cards |
| `text-caption`    | 0.75rem   | Metadata, badges, footnotes  |

## Radii / shadow / motion

| Token              | Value                              | Use                          |
|--------------------|------------------------------------|------------------------------|
| `rounded-card`     | 1rem                               | Default card corner          |
| `rounded-card-sm`  | 0.75rem                            | Mobile cards, inner panels   |
| `rounded-pill`     | 9999px                             | Buttons, badges              |
| `shadow-soft`      | `0 1px 3px rgba(26,26,26,0.04)`    | Default card shadow          |
| `shadow-card`      | `0 2px 8px rgba(26,26,26,0.06)`    | Hover lift                   |
| `shadow-lift`      | `0 4px 16px rgba(26,26,26,0.08)`   | Modals, popovers             |
| `--ease-confident` | `cubic-bezier(0.32, 0.72, 0.4, 1)` | Default                      |
| `--ease-money`     | `cubic-bezier(0.45, 0, 0.55, 1)`   | Currency animations          |
| `--ease-voice`     | `cubic-bezier(0.4, 0, 0.2, 1)`     | Waveform breathing            |

`prefers-reduced-motion` is honored globally in `globals.css`.

## Component primitives

Lives under `src/components/`:

- **`ui/Button`** — variants `primary`, `secondary`, `ghost`, `gold`, `danger`, `outline`. Sizes `sm`, `md`, `lg`, `icon`. Supports `asChild` for `<Link>` composition.
- **`ui/Card`** — tones `paper`, `cream`, `green`, `gold`, `danger`. Padding `sm`/`md`/`lg`/`none`. Plus `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
- **`ui/Badge`** — verdict tones (`scam`, `suspicious`, `legit`, `unclear`, `gold`, `green`, `muted`).
- **`shared/Currency`** — variants `full` (₹2,40,000), `compact` (₹2.4 lakh), `precise` (₹2,40,000.50). Always tabular numerals.
- **`shared/LanguageText`** — pulls from `i18n/strings.ts`, sets `lang` attribute, applies the Indic font stack automatically.
- **`shared/DayPlaceholder`** — used by stub pages so the build week's navigation doesn't 404.
- **`voice/VoicePlayer`** — Wavesurfer-backed; gold progress on voice-tint waveform, transcript toggle, language pill, breathing-pulse loading state.

## Copy register

The voice of a competent younger sister-in-law who knows finance. Polite, direct, knowledgeable, occasionally dryly funny. Honest about uncertainty. Never patronizing. Numbers always explicit — "approximately ₹2-3 lakh" is wrong; "₹2,40,000 over 10 years assuming 12% returns on a direct equity SIP versus your ULIP's 4.8% effective return after charges" is right.

Wrong: `"Don't worry! We'll help you stay safe from scams! 🛡️"`
Right: `"Yeh scam hai. Mummy ko reply na karne dein, message delete kar dein."`

Strings live in `src/lib/i18n/strings.ts`, keyed by ID with one entry per supported language. The `<LanguageText id="…" />` component picks the right one. Missing translations fall back to `hi-IN` and warn in dev.
