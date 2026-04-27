"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Loader2, Phone, Search, ShieldAlert, Sparkles, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Currency } from "@/components/shared/Currency";
import { VoicePlayer } from "@/components/voice/VoicePlayer";
import { T } from "@/components/shared/T";
import { useLanguage, useT } from "@/lib/i18n/language-context";
import { SCAM_PATTERNS_SEED } from "@/lib/mocks/scam-patterns";
import { detectScript } from "@/lib/i18n/scripts";
import type { ScamClassification } from "@/lib/llm/schemas";
import { cn } from "@/lib/utils/cn";

type PatternMatch = {
  patternName: string;
  category: string;
  similarity: number;
};

const PRESETS = [
  {
    id: "kbc",
    title: { hi: "KBC लॉटरी स्कैम", en: "KBC lottery scam" },
    subtitle: { hi: "+92 number, 25 लाख का झांसा", en: "+92 number, ₹25L bait" },
    icon: ShieldAlert,
    text:
      "Mubarak ho! Aap KBC ke lottery mein 25,00,000 jeete hain. Apna lucky number 4509 confirm karne ke liye is number par WhatsApp call karein: +92 3XX XXXXXXX. Yeh offer 24 ghante mein expire ho jayega.",
  },
  {
    id: "digital-arrest",
    title: { hi: "डिजिटल अरेस्ट", en: "Digital arrest scam" },
    subtitle: { hi: "Skype call, fake CBI", en: "Skype call, fake CBI" },
    icon: Phone,
    text:
      "Yeh Mumbai Crime Branch hai. Aapke naam pe ek parcel pakda gaya hai jismein drugs hain. Aap ko abhi video call pe aana hoga warna gaiftari. Skype ID share kar rahe hain.",
  },
  {
    id: "kyc",
    title: { hi: "Fake KYC अपडेट", en: "Fake KYC update" },
    subtitle: { hi: "‘account band ho jaayega’", en: "‘account band ho jaayega’" },
    icon: Wand2,
    text:
      "Dear customer, aapka HDFC Bank account 24 ghante mein BAND ho jaayega. Tatkal KYC update karein: hdfc-update.online/verify. Customer Care: 8***-4567.",
  },
];

type ScamCheckResponse = {
  classification: ScamClassification;
  source: "llm" | "mock-heuristic";
  matchedPatternName?: string;
  voice?: { url: string; durationMs?: number; provider?: string } | null;
};

function findTopMatches(text: string, max = 3): PatternMatch[] {
  const lower = text.toLowerCase();
  const scored = SCAM_PATTERNS_SEED.map((p) => {
    let score = 0;
    for (const phrase of p.identifyingPhrases) {
      if (lower.includes(phrase.toLowerCase())) score += 1;
    }
    const repTokens = p.representativeText.toLowerCase().split(/\s+/).slice(0, 30);
    for (const token of repTokens) {
      if (token.length >= 4 && lower.includes(token)) score += 0.2;
    }
    // Cap to a 0..1 similarity proxy.
    const sim = Math.min(0.99, 0.55 + score * 0.05);
    return { patternName: p.patternName, category: p.category, similarity: sim, score };
  })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max);
  return scored.length > 0
    ? scored
    : [
        {
          patternName: "no-close-match",
          category: "other",
          similarity: 0.42,
        },
      ];
}

type StageState =
  | { kind: "idle" }
  | { kind: "searching"; text: string; matches: PatternMatch[] }
  | { kind: "classifying"; text: string; matches: PatternMatch[] }
  | {
      kind: "done";
      text: string;
      matches: PatternMatch[];
      response: ScamCheckResponse;
    }
  | { kind: "error"; message: string };

export function ScamPlayground() {
  const t = useT();
  const { lang } = useLanguage();
  const receiverLanguage = lang === "en" ? "en-IN" : "hi-IN";
  const [state, setState] = React.useState<StageState>({ kind: "idle" });
  const [custom, setCustom] = React.useState("");
  const [activePreset, setActivePreset] = React.useState<string | null>(null);

  async function run(text: string, presetId: string | null) {
    setActivePreset(presetId);
    const matches = findTopMatches(text, 3);
    setState({ kind: "searching", text, matches });
    // Step 1 visual delay: pattern search animation.
    await new Promise((r) => setTimeout(r, 700));
    setState({ kind: "classifying", text, matches });
    try {
      const response = await fetch("/api/defense/scam-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          receiver: {
            relationship: "mother-in-law",
            ageBand: "60-75",
            language: receiverLanguage,
            name: "Mummy",
          },
          generateVoice: true,
        }),
      });
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const data = (await response.json()) as ScamCheckResponse;
      setState({ kind: "done", text, matches, response: data });
    } catch (err) {
      setState({ kind: "error", message: (err as Error).message });
    }
  }

  return (
    <section id="playground" className="border-y border-saathi-paper-edge bg-saathi-paper">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-3xl space-y-3">
          <Badge tone="green">
            <T hi="लाइव डेमो" en="Live demo" />
          </Badge>
          <h2 className="text-h1 font-semibold tracking-tight text-saathi-ink">
            <T hi="Try करके देखिए — अभी।" en="Try it — right now." />
          </h2>
          <p className="text-body-lg text-saathi-ink-soft">
            <T
              hi="कोई preset चुनिए, या अपना scam paste कीजिए। Pattern search, AI verdict, और Hindi voice — सब live."
              en="Pick a preset, or paste your own scam. Pattern search, AI verdict, and a Hindi voice reply — all live."
            />
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PRESETS.map((p) => {
            const Icon = p.icon;
            const isActive = activePreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => void run(p.text, p.id)}
                disabled={state.kind === "searching" || state.kind === "classifying"}
                className={cn(
                  "group flex flex-col gap-3 rounded-card border bg-saathi-paper p-4 text-left shadow-soft transition-all",
                  "hover:-translate-y-0.5 hover:shadow-card disabled:cursor-not-allowed disabled:opacity-60",
                  isActive
                    ? "border-saathi-deep-green ring-2 ring-saathi-deep-green/20"
                    : "border-saathi-paper-edge",
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-pill bg-saathi-danger-tint text-saathi-danger">
                    <Icon className="h-4 w-4" />
                  </div>
                  <Badge tone="muted">scam</Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-body font-semibold text-saathi-ink">
                    <T hi={p.title.hi} en={p.title.en} />
                  </div>
                  <div className="text-caption text-saathi-ink-quiet">
                    <T hi={p.subtitle.hi} en={p.subtitle.en} />
                  </div>
                </div>
                <p className="line-clamp-3 text-caption text-saathi-ink-soft">
                  {p.text}
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-caption font-medium text-saathi-deep-green">
                  {state.kind !== "idle" && isActive ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="h-3.5 w-3.5" />
                  )}
                  <T hi="क्लासिफायर चलाएँ →" en="Run classifier →" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-card border border-saathi-paper-edge bg-saathi-cream p-4">
          <label className="block text-caption uppercase tracking-wide text-saathi-ink-quiet">
            <T hi="अपना scam यहाँ paste कीजिए" en="Or paste your own scam here" />
          </label>
          <textarea
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder={t(
              "उदाहरण: 'Apka HDFC account 24 ghante mein band ho jayega…'",
              "e.g. 'Your HDFC account will be blocked in 24 hours…'",
            )}
            rows={3}
            className="mt-2 w-full resize-none rounded-card-sm border border-saathi-paper-edge bg-saathi-paper px-3 py-2 text-body-sm leading-snug outline-none placeholder:text-saathi-ink-quiet focus:border-saathi-deep-green/40"
          />
          <div className="mt-2 flex justify-end">
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={
                custom.trim().length < 8 ||
                state.kind === "searching" ||
                state.kind === "classifying"
              }
              onClick={() => void run(custom.trim(), "custom")}
            >
              {state.kind === "searching" || state.kind === "classifying" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <T hi="क्लासिफायर चलाएँ" en="Run classifier" />
            </Button>
          </div>
        </div>

        <ResultPane state={state} />
      </div>
    </section>
  );
}

function ResultPane({ state }: { state: StageState }) {
  if (state.kind === "idle") return null;

  return (
    <Card tone="paper" padding="md" className="mt-6 space-y-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-h3">
          <Sparkles className="h-5 w-5 text-saathi-deep-green" />
          <T hi="क्लासिफायर steps" en="Classifier steps" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input echo */}
        <div className="rounded-card-sm border border-saathi-paper-edge bg-saathi-cream-deep p-3">
          <div className="text-[10px] uppercase tracking-wide text-saathi-ink-quiet">
            <T hi="इनपुट" en="Input" />
          </div>
          <p
            data-script={
              state.kind === "error" ? "latin" : detectScript(state.kind === "done" ? state.text : (state as { text?: string }).text ?? "")
            }
            className="mt-1 text-body-sm text-saathi-ink-soft"
          >
            {state.kind === "error" ? state.message : (state as { text?: string }).text ?? ""}
          </p>
        </div>

        {/* Step 1: pattern search */}
        <Step
          number={1}
          icon={Search}
          title={{ hi: "Pattern बैंक में search", en: "Pattern bank search" }}
          status={state.kind === "searching" ? "running" : "done"}
        >
          <AnimatePresence>
            {state.kind !== "error" ? (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-1"
              >
                {(state as { matches: PatternMatch[] }).matches.map((m) => (
                  <div
                    key={m.patternName}
                    className="flex items-center justify-between rounded-md bg-saathi-paper px-2.5 py-1.5 text-caption"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[10px] text-saathi-ink-quiet">
                        {m.patternName}
                      </span>
                      <span className="rounded bg-saathi-cream-deep px-1.5 py-0.5 text-[10px] text-saathi-ink-soft">
                        {m.category.replace(/-/g, " ")}
                      </span>
                    </div>
                    <span className="font-mono tabular-nums text-saathi-deep-green">
                      {m.similarity.toFixed(2)}
                    </span>
                  </div>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </Step>

        {/* Step 2: LLM verdict */}
        <Step
          number={2}
          icon={Wand2}
          title={{ hi: "AI classifier", en: "AI classifier" }}
          status={
            state.kind === "searching"
              ? "queued"
              : state.kind === "classifying"
                ? "running"
                : state.kind === "done"
                  ? "done"
                  : "error"
          }
        >
          {state.kind === "done" ? (
            <ClassificationDetail response={state.response} />
          ) : state.kind === "error" ? (
            <p className="text-caption text-saathi-danger">{state.message}</p>
          ) : null}
        </Step>

        {/* Step 3: voice reply */}
        {state.kind === "done" && state.response.voice?.url ? (
          <Step
            number={3}
            icon={Phone}
            title={{ hi: "Hindi voice reply for Maaji", en: "Hindi voice reply for the elder" }}
            status="done"
          >
            <VoicePlayer
              src={state.response.voice.url}
              transcript={state.response.classification.receiverExplanation}
              language="hi-IN"
              size="sm"
            />
          </Step>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Step({
  number,
  icon: Icon,
  title,
  status,
  children,
}: {
  number: number;
  icon: React.ElementType;
  title: { hi: string; en: string };
  status: "queued" | "running" | "done" | "error";
  children?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center pt-0.5">
        <div
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-pill border text-[11px] font-semibold tabular-nums",
            status === "done"
              ? "border-saathi-deep-green bg-saathi-deep-green text-white"
              : status === "running"
                ? "border-saathi-deep-green bg-saathi-deep-green-tint text-saathi-deep-green"
                : status === "error"
                  ? "border-saathi-danger bg-saathi-danger-tint text-saathi-danger"
                  : "border-saathi-paper-edge bg-saathi-paper text-saathi-ink-quiet",
          )}
        >
          {status === "running" ? <Loader2 className="h-3 w-3 animate-spin" /> : number}
        </div>
        <div className="mt-1 w-px flex-1 bg-saathi-paper-edge" />
      </div>
      <div className="min-w-0 flex-1 space-y-2 pb-2">
        <div className="flex items-center gap-2 text-body font-medium text-saathi-ink">
          <Icon className="h-3.5 w-3.5 text-saathi-deep-green" />
          <T hi={title.hi} en={title.en} />
          {status === "running" ? (
            <span className="text-caption font-normal text-saathi-ink-quiet">
              <T hi="चल रहा है…" en="running…" />
            </span>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}

function ClassificationDetail({ response }: { response: ScamCheckResponse }) {
  const c = response.classification;
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <Stat label={{ hi: "Verdict", en: "Verdict" }}>
          <Badge tone="scam">{c.verdict}</Badge>
        </Stat>
        <Stat label={{ hi: "Confidence", en: "Confidence" }}>
          <span className="font-mono tabular-nums text-body font-semibold text-saathi-ink">
            {c.confidence.toFixed(2)}
          </span>
        </Stat>
        <Stat label={{ hi: "Risk", en: "Risk if acted" }}>
          {c.estimatedLossInr > 0 ? (
            <Currency
              amount={c.estimatedLossInr}
              variant="compact"
              language="hi-IN"
              className="text-body font-semibold text-saathi-gold"
            />
          ) : (
            <span className="text-body text-saathi-ink-quiet">—</span>
          )}
        </Stat>
      </div>
      <details className="group rounded-card-sm border border-saathi-paper-edge bg-saathi-paper">
        <summary className="flex cursor-pointer items-center justify-between px-3 py-2 text-caption text-saathi-ink-soft">
          <span>
            <T hi="पहचान के signals" en="Identifying signals" /> ({c.identifyingSignals.length})
          </span>
          <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
        </summary>
        <ul className="space-y-1 px-4 pb-3 text-caption text-saathi-ink-soft">
          {c.identifyingSignals.map((s) => (
            <li key={s} className="flex gap-2">
              <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-saathi-deep-green" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </details>
      <div className="text-[10px] text-saathi-ink-quiet">
        <T hi="Source: " en="Source: " />
        <span className="font-mono">{response.source}</span>
      </div>
    </div>
  );
}

function Stat({
  label,
  children,
}: {
  label: { hi: string; en: string };
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-card-sm border border-saathi-paper-edge bg-saathi-paper px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-saathi-ink-quiet">
        <T hi={label.hi} en={label.en} />
      </div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}
