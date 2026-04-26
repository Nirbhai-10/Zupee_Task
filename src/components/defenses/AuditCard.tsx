"use client";

import * as React from "react";
import { ArrowRight, Receipt, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Currency } from "@/components/shared/Currency";
import { VoicePlayer } from "@/components/voice/VoicePlayer";
import { formatPercent } from "@/lib/i18n/format";
import type { ULIPAuditResult } from "@/domain/investment/ulip-math";
import type { LanguageCode } from "@/lib/i18n/languages";
import { cn } from "@/lib/utils/cn";

type AuditCardProps = {
  audit: ULIPAuditResult;
  voiceUrl?: string;
  voiceTranscript?: string;
  language?: LanguageCode;
  className?: string;
};

export function AuditCard({
  audit,
  voiceUrl,
  voiceTranscript,
  language = "hi-IN",
  className,
}: AuditCardProps) {
  return (
    <Card tone="paper" padding="md" className={cn("space-y-4", className)}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge tone="suspicious">
            <Receipt className="h-3 w-3" />
            <span lang="hi" className="font-deva">मिस-सेलिंग</span>
          </Badge>
          <span className="text-caption text-saathi-ink-quiet">
            {audit.termYears} saal ka audit
          </span>
        </div>
        <CardTitle className="text-h3">{audit.productName}</CardTitle>
        <CardDescription>{audit.insurerName}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <ScenarioColumn
            label="Yeh ULIP"
            tone="danger"
            finalValue={audit.ulip.finalFundValue}
            effectiveReturn={audit.ulip.effectiveAnnualReturn}
            language={language}
            footnote={`Charges: ₹${audit.ulip.totalChargesPaid.toLocaleString("en-IN")}`}
          />
          <ScenarioColumn
            label="Term + SIP"
            tone="success"
            finalValue={audit.alternative.finalFundValue}
            effectiveReturn={audit.alternative.effectiveAnnualReturn}
            language={language}
            footnote={`Term ₹${audit.alternative.termInsuranceAnnualPremium.toLocaleString(
              "en-IN",
            )}/yr · SIP ₹${audit.alternative.monthlySIP.toLocaleString("en-IN")}/mo`}
          />
        </div>

        {voiceUrl ? (
          <VoicePlayer
            src={voiceUrl}
            transcript={voiceTranscript}
            language={language}
            size="sm"
          />
        ) : null}
      </CardContent>

      {audit.lifetimeSavingsInr > 0 ? (
        <CardFooter className="!mt-2 flex-wrap items-center gap-2 rounded-card-sm bg-saathi-gold-tint p-3">
          <TrendingUp className="h-4 w-4 text-saathi-gold" />
          <span className="text-caption text-saathi-ink-soft">
            Bachat agar ULIP nahi lete: alternative se {audit.termYears} saal mein
          </span>
          <ArrowRight className="h-3 w-3 text-saathi-ink-quiet" />
          <Currency
            amount={audit.lifetimeSavingsInr}
            variant="compact"
            language={language}
            className="ml-auto text-body font-semibold text-saathi-gold"
          />
        </CardFooter>
      ) : null}
    </Card>
  );
}

function ScenarioColumn({
  label,
  tone,
  finalValue,
  effectiveReturn,
  language,
  footnote,
}: {
  label: string;
  tone: "danger" | "success";
  finalValue: number;
  effectiveReturn: number;
  language: LanguageCode;
  footnote: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card-sm p-3",
        tone === "danger"
          ? "bg-saathi-danger-tint border border-saathi-danger/20"
          : "bg-saathi-success-tint border border-saathi-success/20",
      )}
    >
      <div className="text-caption uppercase tracking-wide text-saathi-ink-soft">
        {label}
      </div>
      <Currency
        amount={finalValue}
        variant="compact"
        language={language}
        className={cn(
          "mt-1 block text-h3 font-semibold",
          tone === "danger" ? "text-saathi-danger" : "text-saathi-success",
        )}
      />
      <div className="mt-1 text-caption text-saathi-ink-quiet tabular-nums">
        Effective {formatPercent(effectiveReturn, 1)} annual
      </div>
      <div className="mt-2 text-[10px] text-saathi-ink-quiet">{footnote}</div>
    </div>
  );
}
