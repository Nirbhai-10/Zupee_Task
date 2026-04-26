"use client";

import * as React from "react";
import { Loader2, Play, RefreshCw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSimulator } from "./SimulatorProvider";
import { kbcScamToMilSequence, type TriggerStep } from "@/lib/simulator/triggers";
import type { ScamClassification } from "@/lib/llm/schemas";
import type { SimulatorDefense } from "@/lib/simulator/types";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

type ScamCheckResponse = {
  classification: ScamClassification;
  source: "llm" | "mock-heuristic";
  matchedPatternName?: string;
  voice?: { url: string; durationMs?: number; provider?: string } | null;
};

/**
 * Demo presenter strip — sits above the three phones on /demo/simulator.
 * Day 2 ships the KBC scam trigger; days 3-5 add ULIP, intake, salary.
 */
export function TriggerPanel() {
  const { appendMessage, setTyping, appendDefense, reset } = useSimulator();
  const [running, setRunning] = React.useState(false);
  const [lastSource, setLastSource] = React.useState<"llm" | "mock-heuristic" | null>(null);

  async function runSequence(steps: TriggerStep[]) {
    setRunning(true);
    try {
      for (const step of steps) {
        if (step.delayMs > 0) await sleep(step.delayMs);
        if (step.kind === "message") {
          appendMessage({ id: crypto.randomUUID(), ...step.message });
        } else if (step.kind === "typing") {
          setTyping(step.phoneId, step.isTyping);
        } else if (step.kind === "scam-check") {
          await runScamCheck(step.phoneId, step.messageText);
        }
      }
    } finally {
      setRunning(false);
    }
  }

  async function runScamCheck(phoneId: "anjali" | "mil" | "husband" | "brother", messageText: string) {
    const response = await fetch("/api/defense/scam-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: messageText,
        receiver: {
          relationship: "mother-in-law",
          ageBand: "60-75",
          language: "hi-IN",
          name: "Mummy",
        },
        generateVoice: true,
      }),
    });
    if (!response.ok) {
      console.warn("[scam-check] non-2xx", response.status);
      setTyping(phoneId, false);
      return;
    }
    const data = (await response.json()) as ScamCheckResponse;
    setLastSource(data.source);

    setTyping(phoneId, false);

    // Voice reply from Saathi → MIL.
    if (data.voice?.url) {
      appendMessage({
        id: crypto.randomUUID(),
        phoneId,
        direction: "inbound",
        timestamp: "9:43",
        variant: {
          kind: "voice",
          audioUrl: data.voice.url,
          durationMs: data.voice.durationMs,
          transcript: data.classification.receiverExplanation,
          lang: "hi-IN",
        },
      });
    }
    // Text caption from Saathi (always present).
    appendMessage({
      id: crypto.randomUUID(),
      phoneId,
      direction: "inbound",
      timestamp: "9:43",
      variant: {
        kind: "text",
        text: "Yeh scam hai. Reply na karein, message delete kar dein.",
        lang: "hi-IN",
      },
    });

    // Notify Anjali.
    appendMessage({
      id: crypto.randomUUID(),
      phoneId: "anjali",
      direction: "inbound",
      timestamp: "9:43",
      highlight: "scam",
      variant: {
        kind: "text",
        text: data.classification.primaryUserAlert,
        lang: "hi-IN",
      },
    });

    // Persist defense to simulator state.
    const defense: SimulatorDefense = {
      id: crypto.randomUUID(),
      forPhoneId: phoneId,
      classification: data.classification,
      language: "hi-IN",
      voiceUrl: data.voice?.url,
      createdAt: new Date().toISOString(),
    };
    appendDefense(defense);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-card-sm border border-saathi-paper-edge bg-saathi-paper px-4 py-3 shadow-soft">
      <Badge tone="green">Presenter</Badge>
      <Button
        type="button"
        size="sm"
        variant="primary"
        disabled={running}
        onClick={() => void runSequence(kbcScamToMilSequence())}
      >
        {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        <span>KBC scam → Mummy</span>
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={running}
        onClick={() => reset()}
      >
        <RefreshCw className="h-4 w-4" />
        Reset
      </Button>
      <div className="ml-auto flex items-center gap-2 text-caption text-saathi-ink-quiet">
        <ShieldAlert className="h-3 w-3" />
        <span>
          {lastSource === "llm"
            ? "Live LLM classifier"
            : lastSource === "mock-heuristic"
              ? "Mock heuristic — set ANTHROPIC_API_KEY for live"
              : "Click a trigger to begin"}
        </span>
      </div>
    </div>
  );
}
