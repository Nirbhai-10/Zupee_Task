"use client";

import { useSimulator } from "./SimulatorProvider";
import { DefenseCard } from "@/components/defenses/DefenseCard";
import { AuditCard } from "@/components/defenses/AuditCard";
import { PlanCard } from "@/components/goals/PlanCard";
import { Card, CardContent } from "@/components/ui/card";
import { Currency } from "@/components/shared/Currency";
import { Badge } from "@/components/ui/badge";

/**
 * Sits below the three phones on /demo/simulator. Renders the
 * structured cards (DefenseCard, AuditCard) that mirror what would
 * appear on Anjali's dashboard once Saathi processes a forwarded
 * scam or document.
 */
export function SimulatorActivityPane() {
  const { state } = useSimulator();

  const totalSavings =
    state.defenses.reduce((acc, d) => acc + d.classification.estimatedLossInr, 0) +
    state.audits.reduce((acc, a) => acc + a.audit.lifetimeSavingsInr, 0);

  if (state.defenses.length === 0 && state.audits.length === 0 && state.plans.length === 0) {
    return (
      <Card tone="cream" padding="md" className="text-body-sm text-saathi-ink-soft">
        <CardContent className="!mt-0">
          Trigger karke dekhiye — Anjali ka dashboard yahaan update hoga.
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <Badge tone="green">Anjali ka dashboard</Badge>
          <h2 className="mt-2 text-h3 font-semibold text-saathi-ink">
            Iss session mein humne aapke{" "}
            <Currency
              amount={totalSavings}
              variant="compact"
              language="hi-IN"
              className="font-semibold text-saathi-gold"
            />{" "}
            ka risk roka
          </h2>
        </div>
        <span className="text-caption text-saathi-ink-quiet">
          {state.defenses.length + state.audits.length} actions
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {state.plans.map((p) => (
          <PlanCard
            key={p.id}
            plan={p.plan}
            voiceUrl={p.voiceUrl}
            voiceTranscript={p.voiceScript}
            language={p.language}
            className="lg:col-span-2"
          />
        ))}
        {state.audits.map((a) => (
          <AuditCard
            key={a.id}
            audit={a.audit}
            voiceUrl={a.voiceUrl}
            voiceTranscript={a.voiceScript}
            language={a.language}
          />
        ))}
        {state.defenses.map((d) => (
          <DefenseCard
            key={d.id}
            classification={d.classification}
            receiverName={
              d.forPhoneId === "mil" ? "Sushma Maaji" : d.forPhoneId === "anjali" ? "Anjali" : "Family"
            }
            language={d.language}
            voiceUrl={d.voiceUrl}
            matchedPatternName={d.matchedPatternName}
            showVoice={false}
          />
        ))}
      </div>
    </section>
  );
}
