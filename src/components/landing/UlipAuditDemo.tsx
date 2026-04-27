"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calculator,
  FileSearch,
  Loader2,
  Phone,
  Receipt,
  ShieldAlert,
  Sparkles,
  Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Currency } from "@/components/shared/Currency";
import { VoicePlayer } from "@/components/voice/VoicePlayer";
import { T } from "@/components/shared/T";
import { SAMPLE_ULIP } from "@/lib/mocks/ulip-sample";
import { formatPercent } from "@/lib/i18n/format";
import type { ULIPAuditResult } from "@/domain/investment/ulip-math";
import type { ULIPFeeSchedule } from "@/lib/llm/schemas";
import { cn } from "@/lib/utils/cn";

type AuditResponse = {
  audit: ULIPAuditResult;
  voiceScript: string;
  source: "llm" | "mock-template";
  voice?: { url: string; durationMs?: number; provider?: string } | null;
};

type Stage =
  | { kind: "idle" }
  | { kind: "extracting"; sourceLabel: string }
  | { kind: "calculating"; sourceLabel: string; fees: ULIPFeeSchedule }
  | {
      kind: "done";
      sourceLabel: string;
      fees: ULIPFeeSchedule;
      result: AuditResponse;
    }
  | { kind: "error"; message: string };

export function UlipAuditDemo() {
  const [stage, setStage] = React.useState<Stage>({ kind: "idle" });
  const [dragOver, setDragOver] = React.useState(false);

  async function runWithSample() {
    await runFor("SuperLife Wealth Plus II brochure");
  }

  async function runFor(sourceLabel: string) {
    setStage({ kind: "extracting", sourceLabel });
    // Simulated extraction reveal — the math + LLM are still real.
    await new Promise((r) => setTimeout(r, 900));
    setStage({ kind: "calculating", sourceLabel, fees: SAMPLE_ULIP });
    try {
      const response = await fetch("/api/defense/document-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver: { name: "Anjali", language: "hi-IN" },
          generateVoice: true,
        }),
      });
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const data = (await response.json()) as AuditResponse;
      setStage({ kind: "done", sourceLabel, fees: SAMPLE_ULIP, result: data });
    } catch (err) {
      setStage({ kind: "error", message: (err as Error).message });
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void runFor(file.name);
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void runFor(file.name);
  }

  return (
    <section id="ulip-audit" className="bg-saathi-cream">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-3xl space-y-3">
          <Badge tone="gold">
            <Receipt className="h-3 w-3" />
            <T hi="ULIP ऑडिट" en="ULIP audit" />
          </Badge>
          <h2 className="text-h1 font-semibold tracking-tight text-saathi-ink">
            <T
              hi="कोई भी ULIP brochure डालिए — असली numbers दिख जाएँगे।"
              en="Drop any ULIP brochure — see the real numbers."
            />
          </h2>
          <p className="text-body-lg text-saathi-ink-soft">
            <T
              hi="Vision LLM extract करता है fees, deterministic math 15-साल का comparison बनाता है, और Sarvam voice Hindi में audit सुनाता है।"
              en="Vision LLM extracts the fees, deterministic math projects 15 years, Sarvam reads the audit in Hindi."
            />
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]">
          {/* Sample CTA */}
          <Card tone="green" padding="lg" className="space-y-3 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-saathi-gold" />
              <span className="text-caption uppercase tracking-wide text-white/80">
                <T hi="ज़ीरो-friction" en="Zero friction" />
              </span>
            </div>
            <h3 className="text-h3 font-semibold">
              <T hi="Policy audit का guided example चलाइए" en="Run a guided policy audit example" />
            </h3>
            <p className="text-body-sm text-white/85">
              <T
                hi="SuperLife Wealth Plus II — एक typical mis-sold ULIP pitch. Bharosa fees, lock-in और better alternative साफ़ कर देता है."
                en="SuperLife Wealth Plus II — a typical mis-sold ULIP pitch. Bharosa makes fees, lock-ins, and the better alternative clear."
              />
            </p>
            <Button
              type="button"
              variant="gold"
              size="md"
              onClick={runWithSample}
              disabled={stage.kind === "extracting" || stage.kind === "calculating"}
            >
              {stage.kind === "extracting" || stage.kind === "calculating" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSearch className="h-4 w-4" />
              )}
              <T hi="Sample ULIP audit करें" en="Run sample audit" />
            </Button>
          </Card>

          {/* Drag-drop */}
          <Card tone="paper" padding="lg" className="space-y-3">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-saathi-deep-green" />
              <span className="text-caption uppercase tracking-wide text-saathi-ink-quiet">
                <T hi="अपना brochure डालिए" en="Drop your own brochure" />
              </span>
            </div>
            <label
              htmlFor="ulip-upload"
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed p-8 text-center text-body-sm transition-colors cursor-pointer",
                dragOver
                  ? "border-saathi-deep-green bg-saathi-deep-green-tint text-saathi-deep-green"
                  : "border-saathi-paper-edge bg-saathi-cream text-saathi-ink-soft hover:border-saathi-deep-green/60",
              )}
            >
              <Upload className="h-6 w-6" />
              <span>
                <T
                  hi="यहाँ PDF / image drag करें"
                  en="Drag a PDF or image here"
                />
              </span>
              <span className="text-caption text-saathi-ink-quiet">
                <T hi="या क्लिक करके चुनें" en="or click to pick" />
              </span>
              <input
                id="ulip-upload"
                type="file"
                accept="application/pdf,image/*"
                className="sr-only"
                onChange={handleFile}
              />
            </label>
            <p className="text-caption text-saathi-ink-quiet">
              <T
                hi="Prototype में uploaded file का naam दिखता है; extraction को production में document OCR से replace किया जाएगा."
                en="In this prototype, the uploaded file name is shown; production replaces this extraction step with document OCR."
              />
            </p>
          </Card>
        </div>

        <AnimatePresence>
          {stage.kind !== "idle" ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0.4, 1] }}
              className="mt-6"
            >
              <AuditTrace stage={stage} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}

function AuditTrace({ stage }: { stage: Stage }) {
  if (stage.kind === "error") {
    return (
      <Card tone="paper" padding="md">
        <div className="flex items-start gap-2 text-saathi-danger">
          <ShieldAlert className="h-4 w-4 mt-0.5" />
          <span className="text-body-sm">{stage.message}</span>
        </div>
      </Card>
    );
  }

  return (
    <Card tone="paper" padding="md" className="space-y-5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-h3">
          <FileSearch className="h-5 w-5 text-saathi-deep-green" />
          <T hi="ऑडिट pipeline" en="Audit pipeline" />
        </CardTitle>
        <p className="text-caption text-saathi-ink-quiet">
          <T hi="स्रोत:" en="Source:" /> {(stage as { sourceLabel?: string }).sourceLabel ?? "—"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Step
          number={1}
          icon={FileSearch}
          title={{ hi: "Document parse", en: "Document parse" }}
          status={stage.kind === "extracting" ? "running" : "done"}
        >
          {(stage.kind === "calculating" || stage.kind === "done") ? (
            <FeesTable fees={stage.fees} />
          ) : null}
        </Step>

        <Step
          number={2}
          icon={Calculator}
          title={{ hi: "Lifetime cost calc", en: "Lifetime cost calc" }}
          status={
            stage.kind === "extracting"
              ? "queued"
              : stage.kind === "calculating"
                ? "running"
                : "done"
          }
        >
          {stage.kind === "done" ? <Comparison result={stage.result} /> : null}
        </Step>

        {stage.kind === "done" && stage.result.voice?.url ? (
          <Step
            number={3}
            icon={Phone}
            title={{ hi: "60-second Hindi voice audit", en: "60-second Hindi voice audit" }}
            status="done"
          >
            <VoicePlayer
              src={stage.result.voice.url}
              transcript={stage.result.voiceScript}
              language="hi-IN"
              size="sm"
            />
          </Step>
        ) : null}
      </CardContent>
    </Card>
  );
}

function FeesTable({ fees }: { fees: ULIPFeeSchedule }) {
  const allocSummary = fees.premiumAllocationByYear
    .filter((p) => p.pctOfPremium > 0)
    .map((p) => `Y${p.year} ${p.pctOfPremium}%`)
    .join(" · ");
  return (
    <div className="overflow-x-auto rounded-card-sm border border-saathi-paper-edge bg-saathi-paper">
      <table className="w-full text-body-sm">
        <tbody className="divide-y divide-saathi-paper-edge">
          <Row label="Product" value={fees.productNameRaw} />
          <Row label="Insurer" value={fees.insurerNameRaw} />
          <Row
            label="Annual premium"
            value={`₹${fees.premiumAnnualInr.toLocaleString("en-IN")}`}
          />
          <Row label="Term" value={`${fees.termYears} years`} />
          <Row label="Sum assured" value={`₹${fees.sumAssuredInr.toLocaleString("en-IN")}`} />
          <Row label="Premium allocation charge" value={allocSummary} />
          <Row label="Policy admin (monthly)" value={`₹${fees.policyAdminMonthlyInr}`} />
          <Row label="Fund management" value={`${fees.fundManagementPctAnnual}% p.a.`} />
          <Row label="Mortality charge" value={`${fees.mortalityChargePctAnnual}% p.a.`} />
          <Row label="Lock-in" value={`${fees.lockInYears} years`} />
        </tbody>
      </table>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="px-3 py-2 text-caption uppercase tracking-wide text-saathi-ink-quiet">
        {label}
      </td>
      <td className="px-3 py-2 font-mono tabular-nums text-saathi-ink-soft">{value}</td>
    </tr>
  );
}

function Comparison({ result }: { result: AuditResponse }) {
  const a = result.audit;
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <ScenarioBox
          label={{ hi: "ये ULIP", en: "This ULIP" }}
          tone="danger"
          finalValue={a.ulip.finalFundValue}
          effectiveReturn={a.ulip.effectiveAnnualReturn}
          footnote={`Charges: ₹${a.ulip.totalChargesPaid.toLocaleString("en-IN")}`}
        />
        <ScenarioBox
          label={{ hi: "Term + SIP alternative", en: "Term + SIP alternative" }}
          tone="success"
          finalValue={a.alternative.finalFundValue}
          effectiveReturn={a.alternative.effectiveAnnualReturn}
          footnote={`Term ₹${a.alternative.termInsuranceAnnualPremium.toLocaleString(
            "en-IN",
          )}/yr · SIP ₹${a.alternative.monthlySIP.toLocaleString("en-IN")}/mo`}
        />
      </div>
      {a.lifetimeSavingsInr > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-card-sm bg-saathi-gold-tint p-3">
          <span className="text-caption text-saathi-ink-soft">
            <T hi="Lifetime savings if you skip the ULIP" en="Lifetime savings if you skip the ULIP" />
          </span>
          <Currency
            amount={a.lifetimeSavingsInr}
            variant="compact"
            language="hi-IN"
            className="ml-auto text-h3 font-semibold text-saathi-gold"
          />
        </div>
      ) : null}
    </div>
  );
}

function ScenarioBox({
  label,
  tone,
  finalValue,
  effectiveReturn,
  footnote,
}: {
  label: { hi: string; en: string };
  tone: "danger" | "success";
  finalValue: number;
  effectiveReturn: number;
  footnote: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card-sm border p-3",
        tone === "danger"
          ? "border-saathi-danger/20 bg-saathi-danger-tint"
          : "border-saathi-success/20 bg-saathi-success-tint",
      )}
    >
      <div className="text-caption uppercase tracking-wide text-saathi-ink-soft">
        <T hi={label.hi} en={label.en} />
      </div>
      <Currency
        amount={finalValue}
        variant="compact"
        language="hi-IN"
        className={cn(
          "mt-1 block text-h3 font-semibold",
          tone === "danger" ? "text-saathi-danger" : "text-saathi-success",
        )}
      />
      <div className="text-caption text-saathi-ink-quiet tabular-nums">
        Effective {formatPercent(effectiveReturn, 1)} annual
      </div>
      <div className="mt-2 text-[10px] text-saathi-ink-quiet">{footnote}</div>
    </div>
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
