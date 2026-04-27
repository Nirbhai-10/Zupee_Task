"use client";

import * as React from "react";
import { Banknote, FileSearch, Gavel, Loader2, Lock, Play, RefreshCw, ShieldAlert, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSimulator } from "./SimulatorProvider";
import {
  kbcScamToMilSequence,
  ulipAuditToAnjaliSequence,
  intakeToPlanSequence,
  salaryDaySequence,
  recoveryAgentSequence,
  vaultEveningQuestionSequence,
  type TriggerStep,
} from "@/lib/simulator/triggers";
import type { ScamClassification } from "@/lib/llm/schemas";
import type { ULIPAuditResult } from "@/domain/investment/ulip-math";
import type { Plan } from "@/domain/investment/allocator";
import type {
  PhoneId,
  SimulatorDefense,
  SimulatorAudit,
  SimulatorPlan,
  SimulatorHarassment,
  SimulatorVaultConfession,
} from "@/lib/simulator/types";
import { createBrowserTTSUrl } from "@/lib/voice/browser-voice";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

type ScamCheckResponse = {
  classification: ScamClassification;
  source: "llm" | "mock-heuristic";
  matchedPatternName?: string;
  voice?: { url: string; durationMs?: number; provider?: string } | null;
};

type DocAuditResponse = {
  audit: ULIPAuditResult;
  voiceScript: string;
  source: "llm" | "mock-template";
  voice?: { url: string; durationMs?: number; provider?: string } | null;
};

type PlanResponse = {
  plan: Plan;
  voiceScript: string;
  source: "llm" | "mock-template";
  voice?: { url: string; durationMs?: number; provider?: string } | null;
};

type HarassmentResponse = {
  letter: string;
  callScript: string;
  sachetDraft: {
    portal: string;
    referenceUrl: string;
    fields: Record<string, string>;
  };
  source: "llm" | "mock-template";
  voice?: { url: string; durationMs?: number; provider?: string } | null;
};

type SalaryDayResponse = {
  plan: Plan;
  hisaab: { script: string; voice: { url: string; durationMs?: number } | null };
  familyNotifications: Array<{
    familyMemberId: string;
    channel: "voice" | "text";
    language: string;
    content: string;
    voiceUrl?: string;
    voiceDurationMs?: number;
  }>;
  monthName: string;
  yearNumber: number;
};

type VaultQuestionResponse = {
  confessionId: string | null;
  question: { id: string; text: string; language: "hi-IN"; category: string };
  voice: { url: string; durationMs?: number; provider?: string } | null;
};

type VaultRespondResponse = {
  confession: { id: string; questionText: string; responseTranscript: string | null };
  reflection: {
    text: string;
    responseMode: string;
    emotionTags: string[];
    source: string;
    voice: { url: string; durationMs?: number; provider?: string } | null;
  };
};

const FAMILY_TO_PHONE: Record<string, PhoneId> = {
  "22222222-2222-2222-2222-222222222201": "mil",
  "22222222-2222-2222-2222-222222222202": "husband",
  "22222222-2222-2222-2222-222222222203": "brother",
};

/**
 * Demo presenter strip — sits above the three phones on /demo/simulator.
 * Day 2 ships the KBC scam trigger; days 3-5 add ULIP, intake, salary.
 */
export function TriggerPanel() {
  const {
    appendMessage,
    setTyping,
    appendDefense,
    appendAudit,
    appendPlan,
    appendHarassment,
    appendVaultConfession,
    reset,
  } = useSimulator();
  const [running, setRunning] = React.useState(false);
  const [lastSource, setLastSource] = React.useState<string | null>(null);

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
        } else if (step.kind === "ulip-audit") {
          await runUlipAudit(step.phoneId);
        } else if (step.kind === "build-plan") {
          await runBuildPlan(step.phoneId);
        } else if (step.kind === "salary-day") {
          await runSalaryDay();
        } else if (step.kind === "harassment") {
          await runHarassment(step.phoneId);
        } else if (step.kind === "vault-evening") {
          await runVaultEvening(step.phoneId);
        }
      }
    } finally {
      setRunning(false);
    }
  }

  async function runVaultEvening(phoneId: PhoneId) {
    const questionResponse = await fetch("/api/vault/send-evening-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!questionResponse.ok) {
      console.warn("[vault] question non-2xx", questionResponse.status);
      return;
    }
    const questionData = (await questionResponse.json()) as VaultQuestionResponse;
    setLastSource("vault");

    if (questionData.voice?.url) {
      appendMessage({
        id: crypto.randomUUID(),
        phoneId,
        direction: "inbound",
        timestamp: "9:00",
        variant: {
          kind: "voice",
          audioUrl: questionData.voice.url,
          durationMs: questionData.voice.durationMs,
          transcript: questionData.question.text,
          lang: "hi-IN",
        },
      });
    } else {
      appendMessage({
        id: crypto.randomUUID(),
        phoneId,
        direction: "inbound",
        timestamp: "9:00",
        variant: { kind: "text", text: questionData.question.text, lang: "hi-IN" },
      });
    }

    await sleep(1300);
    const transcript =
      "Aaj Priya ke school project ke liye extra kharcha hua. Sandal leni thi apne liye, purani toot rahi hai, par maine nahi li. Rajesh ko bataungi toh woh bolenge le lo, par mujhe guilt hota hai.";
    appendMessage({
      id: crypto.randomUUID(),
      phoneId,
      direction: "outbound",
      timestamp: "9:02",
      status: "delivered",
      variant: {
        kind: "voice",
        audioUrl: createBrowserTTSUrl({
          text: transcript,
          lang: "hi-IN",
          timbre: "saathi-female",
          speed: 1,
        }),
        durationMs: 18_000,
        transcript,
        lang: "hi-IN",
      },
    });

    setTyping(phoneId, true);
    const respondResponse = await fetch("/api/vault/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        confessionId: questionData.confessionId,
        questionId: questionData.question.id,
        questionText: questionData.question.text,
        responseTranscript: transcript,
        generateVoice: true,
      }),
    });
    setTyping(phoneId, false);
    if (!respondResponse.ok) {
      console.warn("[vault] response non-2xx", respondResponse.status);
      return;
    }
    const data = (await respondResponse.json()) as VaultRespondResponse;
    if (data.reflection.voice?.url) {
      appendMessage({
        id: crypto.randomUUID(),
        phoneId,
        direction: "inbound",
        timestamp: "9:03",
        variant: {
          kind: "voice",
          audioUrl: data.reflection.voice.url,
          durationMs: data.reflection.voice.durationMs,
          transcript: data.reflection.text,
          lang: "hi-IN",
        },
      });
    } else {
      appendMessage({
        id: crypto.randomUUID(),
        phoneId,
        direction: "inbound",
        timestamp: "9:03",
        variant: { kind: "text", text: data.reflection.text, lang: "hi-IN" },
      });
    }

    const record: SimulatorVaultConfession = {
      id: data.confession.id,
      questionText: questionData.question.text,
      responseTranscript: transcript,
      reflectionText: data.reflection.text,
      reflectionVoiceUrl: data.reflection.voice?.url,
      emotionTags: data.reflection.emotionTags,
      createdAt: new Date().toISOString(),
    };
    appendVaultConfession(record);
  }

  async function runHarassment(phoneId: PhoneId) {
    const response = await fetch("/api/defense/harassment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!response.ok) {
      console.warn("[harassment] non-2xx", response.status);
      setTyping(phoneId, false);
      return;
    }
    const data = (await response.json()) as HarassmentResponse;
    setLastSource(data.source);
    setTyping(phoneId, false);

    if (data.voice?.url) {
      appendMessage({
        id: crypto.randomUUID(),
        phoneId,
        direction: "inbound",
        timestamp: "10:16",
        variant: {
          kind: "voice",
          audioUrl: data.voice.url,
          durationMs: data.voice.durationMs,
          transcript: data.callScript,
          lang: "hi-IN",
        },
      });
    }
    appendMessage({
      id: crypto.randomUUID(),
      phoneId,
      direction: "inbound",
      timestamp: "10:16",
      highlight: "scam",
      variant: {
        kind: "text",
        text: "Negotiator call ho gayi. Cease-and-desist letter aur Sachet draft taiyaar hai — aapke dashboard pe.",
        lang: "hi-IN",
      },
    });

    const harassment: SimulatorHarassment = {
      id: crypto.randomUUID(),
      agentName: "Mr. Sharma",
      agencyName: "Default Recovery Pvt. Ltd.",
      letter: data.letter,
      callScript: data.callScript,
      voiceUrl: data.voice?.url,
      sachetDraft: data.sachetDraft,
      language: "hi-IN",
      createdAt: new Date().toISOString(),
    };
    appendHarassment(harassment);
  }

  async function runSalaryDay() {
    const response = await fetch("/api/investment/execute-salary-day", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monthName: "Apr", yearNumber: 2026, generateVoice: true }),
    });
    if (!response.ok) {
      console.warn("[salary-day] non-2xx", response.status);
      return;
    }
    const data = (await response.json()) as SalaryDayResponse;
    setLastSource("salary-day");

    const funded = data.plan.goalAllocations.filter((g) => g.monthlyTotalInr > 0);
    for (let i = 0; i < funded.length; i++) {
      const goal = funded[i];
      await sleep(220);
      appendMessage({
        id: crypto.randomUUID(),
        phoneId: "anjali",
        direction: "inbound",
        timestamp: "9:01",
        highlight: "savings",
        variant: {
          kind: "text",
          text: `✓ UPI Autopay · ${goal.goalName} · ${goal.splits[0]?.partnerName ?? goal.splits[0]?.instrument} · ₹${goal.monthlyTotalInr.toLocaleString("en-IN")}`,
          lang: "en-IN",
        },
      });
    }

    if (data.hisaab.voice?.url) {
      await sleep(500);
      appendMessage({
        id: crypto.randomUUID(),
        phoneId: "anjali",
        direction: "inbound",
        timestamp: "9:02",
        variant: {
          kind: "voice",
          audioUrl: data.hisaab.voice.url,
          durationMs: data.hisaab.voice.durationMs,
          transcript: data.hisaab.script,
          lang: "hi-IN",
        },
      });
    }

    // Family fan-out — 250ms apart per recipient.
    for (const notification of data.familyNotifications) {
      await sleep(250);
      const phoneId = FAMILY_TO_PHONE[notification.familyMemberId];
      if (!phoneId) continue;
      if (notification.channel === "voice" && notification.voiceUrl) {
        appendMessage({
          id: crypto.randomUUID(),
          phoneId,
          direction: "inbound",
          timestamp: "9:02",
          variant: {
            kind: "voice",
            audioUrl: notification.voiceUrl,
            durationMs: notification.voiceDurationMs,
            transcript: notification.content,
            lang: notification.language as "hi-IN",
          },
        });
      } else {
        appendMessage({
          id: crypto.randomUUID(),
          phoneId,
          direction: "inbound",
          timestamp: "9:02",
          variant: {
            kind: "text",
            text: notification.content,
            lang: notification.language as "hi-IN",
          },
        });
      }
    }
  }

  async function runBuildPlan(phoneId: PhoneId) {
    const response = await fetch("/api/investment/plan", { method: "POST" });
    if (!response.ok) {
      console.warn("[plan] non-2xx", response.status);
      setTyping(phoneId, false);
      return;
    }
    const data = (await response.json()) as PlanResponse;
    setLastSource(data.source);
    setTyping(phoneId, false);

    if (data.voice?.url) {
      appendMessage({
        id: crypto.randomUUID(),
        phoneId,
        direction: "inbound",
        timestamp: "10:03",
        variant: {
          kind: "voice",
          audioUrl: data.voice.url,
          durationMs: data.voice.durationMs,
          transcript: data.voiceScript,
          lang: "hi-IN",
        },
      });
    }
    appendMessage({
      id: crypto.randomUUID(),
      phoneId,
      direction: "inbound",
      timestamp: "10:03",
      variant: {
        kind: "text",
        text: `Plan ready hai — kul ₹${data.plan.monthlyAllocationInr.toLocaleString("en-IN")}/mahina, ${data.plan.goalAllocations.filter((g) => g.monthlyTotalInr > 0).length} goals. UPI Autopay authorize karenge?`,
        lang: "hi-IN",
      },
    });

    const planRecord: SimulatorPlan = {
      id: crypto.randomUUID(),
      forPhoneId: phoneId,
      plan: data.plan,
      voiceScript: data.voiceScript,
      voiceUrl: data.voice?.url,
      language: "hi-IN",
      createdAt: new Date().toISOString(),
    };
    appendPlan(planRecord);
  }

  async function runUlipAudit(phoneId: PhoneId) {
    const response = await fetch("/api/defense/document-audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receiver: { name: "Anjali", language: "hi-IN" },
        generateVoice: true,
      }),
    });
    if (!response.ok) {
      console.warn("[document-audit] non-2xx", response.status);
      setTyping(phoneId, false);
      return;
    }
    const data = (await response.json()) as DocAuditResponse;
    setLastSource(data.source);
    setTyping(phoneId, false);

    if (data.voice?.url) {
      appendMessage({
        id: crypto.randomUUID(),
        phoneId,
        direction: "inbound",
        timestamp: "9:46",
        variant: {
          kind: "voice",
          audioUrl: data.voice.url,
          durationMs: data.voice.durationMs,
          transcript: data.voiceScript,
          lang: "hi-IN",
        },
      });
    }
    appendMessage({
      id: crypto.randomUUID(),
      phoneId,
      direction: "inbound",
      timestamp: "9:46",
      highlight: "savings",
      variant: {
        kind: "text",
        text: `Audit complete. ${data.audit.termYears} saal mein ₹${data.audit.lifetimeSavingsInr.toLocaleString("en-IN")} bachayega ULIP nahi lene se.`,
        lang: "hi-IN",
      },
    });

    const audit: SimulatorAudit = {
      id: crypto.randomUUID(),
      forPhoneId: phoneId,
      audit: data.audit,
      voiceScript: data.voiceScript,
      voiceUrl: data.voice?.url,
      language: "hi-IN",
      createdAt: new Date().toISOString(),
    };
    appendAudit(audit);
  }

  async function runScamCheck(phoneId: PhoneId, messageText: string) {
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

    // Voice reply from Bharosa → MIL.
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
    // Text caption from Bharosa (always present).
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
        variant="gold"
        disabled={running}
        onClick={() => void runSequence(ulipAuditToAnjaliSequence())}
      >
        {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSearch className="h-4 w-4" />}
        <span>ULIP audit → Anjali</span>
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={running}
        onClick={() => void runSequence(intakeToPlanSequence())}
      >
        {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
        <span>Plan banwayein</span>
      </Button>
      <Button
        type="button"
        size="sm"
        variant="danger"
        disabled={running}
        onClick={() => void runSequence(recoveryAgentSequence())}
      >
        {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gavel className="h-4 w-4" />}
        <span>Recovery agent → silenced</span>
      </Button>
      <Button
        type="button"
        size="sm"
        variant="primary"
        disabled={running}
        onClick={() => void runSequence(vaultEveningQuestionSequence())}
      >
        {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
        <span>Evening Vault question</span>
      </Button>
      <Button
        type="button"
        size="sm"
        variant="primary"
        disabled={running}
        onClick={() => void runSequence(salaryDaySequence())}
      >
        {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Banknote className="h-4 w-4" />}
        <span>Salary day</span>
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
            ? "Live LLM (Gemma 4 8B local)"
            : lastSource === "mock-heuristic" || lastSource === "mock-template"
              ? "Mock fallback active"
              : "Click a trigger to begin"}
        </span>
      </div>
    </div>
  );
}
