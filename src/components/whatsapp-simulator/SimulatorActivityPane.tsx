"use client";

import { useSimulator } from "./SimulatorProvider";
import { DefenseCard } from "@/components/defenses/DefenseCard";
import { AuditCard } from "@/components/defenses/AuditCard";
import { HarassmentCard } from "@/components/defenses/HarassmentCard";
import { PlanCard } from "@/components/goals/PlanCard";
import { Card, CardContent } from "@/components/ui/card";
import { Currency } from "@/components/shared/Currency";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

/**
 * Sits below the three phones on /demo/simulator. Renders the
 * structured cards (DefenseCard, AuditCard) that mirror what would
 * appear on Anjali's dashboard once Bharosa processes a forwarded
 * scam or document.
 */
export function SimulatorActivityPane() {
  const { state } = useSimulator();

  const totalSavings =
    state.defenses.reduce((acc, d) => acc + d.classification.estimatedLossInr, 0) +
    state.audits.reduce((acc, a) => acc + a.audit.lifetimeSavingsInr, 0);

  if (
    state.defenses.length === 0 &&
    state.audits.length === 0 &&
    state.plans.length === 0 &&
    state.harassments.length === 0 &&
    state.vaultConfessions.length === 0
  ) {
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
          {state.defenses.length + state.audits.length + state.vaultConfessions.length} actions
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
        {state.vaultConfessions.map((v) => (
          <Card key={v.id} tone="cream" padding="md" className="border-saathi-deep-green-line lg:col-span-2">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-pill bg-saathi-paper text-saathi-deep-green">
                <Lock className="h-5 w-5" />
              </div>
              <div className="min-w-0 space-y-2">
                <Badge tone="green">Vault saved · private</Badge>
                <h3 className="text-h3 font-semibold text-saathi-ink">{v.questionText}</h3>
                <p className="text-body-sm text-saathi-ink-soft">{v.responseTranscript}</p>
                <p className="rounded-card-sm bg-saathi-paper px-3 py-2 text-body-sm text-saathi-deep-green">
                  {v.reflectionText}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {v.emotionTags.map((tag) => (
                    <span key={tag} className="rounded-pill bg-saathi-paper px-2 py-0.5 text-caption text-saathi-ink-soft">
                      {tag.replace(/-/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
        {state.harassments.map((h) => (
          <HarassmentCard
            key={h.id}
            agentName={h.agentName}
            agencyName={h.agencyName}
            letter={h.letter}
            callScript={h.callScript}
            sachetDraft={h.sachetDraft}
            voiceUrl={h.voiceUrl}
            language={h.language}
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
