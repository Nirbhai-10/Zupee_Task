# Saathi · Copy Reference

Most user-facing strings live in `src/lib/i18n/strings.ts` (typed by `StringId`). This file is the *editorial* reference — the register, the do/don't, the long-form copy that doesn't fit a 50-character cell.

## Voice

A competent younger sister-in-law who knows finance. Polite, direct, knowledgeable, occasionally dryly funny. Honest about uncertainty. Never patronizing.

## Register cheat-sheet

| Audience                | Salutation         | Examples                                     |
|-------------------------|--------------------|----------------------------------------------|
| Mother-in-law (60-75)   | "Maaji, namaste."  | Simple vocabulary, short sentences           |
| Husband (30-45)         | "Anjali ji ka …"   | Detailed, factual, voice-friendly            |
| Brother (20-30)         | "Vikas, …"         | Casual, short, often text not voice          |
| Anjali herself (34)     | (none / "Anjali ji") | Neutral respectful Hindi, vernacular numbers |
| Recovery agent           | (formal)           | Lawyer-grade, English/Hindi mix              |

## Always-explicit numbers

> Wrong: "approximately ₹2-3 lakh"
> Right: "₹2,40,000 over 10 years assuming 12% returns on a direct equity SIP versus your ULIP's 4.8% effective return after charges"

When we cannot be exact, we say so explicitly: "Yeh estimate hai, exact 8-15% range mein hoga."

## Disclosure stance (legal-ish)

Whenever Saathi makes an authorized communication on the user's behalf — the harassment defense pre-recorded call is the canonical example — it says:

> "Calling on Anjali Sharma's authorized behalf."

It **never** says "I am Anjali." Designed to transition to explicit AI disclosure when regulation tightens (18-30 month window).

## Strings index

The full keyed registry is in `src/lib/i18n/strings.ts`. Day 2+ extends as flows land. Long-form copy (testimonials, FAQ answers, hero headlines) eventually lands in dedicated files under `src/lib/i18n/long-form/`.
