"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Coins, GraduationCap, HeartPulse, Lamp, Home as HomeIcon, Plane, Car, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VoicePlayer } from "@/components/voice/VoicePlayer";
import { Currency } from "@/components/shared/Currency";
import type { Plan } from "@/domain/investment/allocator";
import type { GoalCategory } from "@/domain/types";
import type { LanguageCode } from "@/lib/i18n/languages";
import { cn } from "@/lib/utils/cn";

const CATEGORY_ICON: Record<GoalCategory, React.ElementType> = {
  wedding: Sparkles,
  education: GraduationCap,
  medical: HeartPulse,
  festival: Lamp,
  house: HomeIcon,
  vehicle: Car,
  pilgrimage: Plane,
  general: Coins,
};

type PlanCardProps = {
  plan: Plan;
  voiceUrl?: string;
  voiceTranscript?: string;
  language?: LanguageCode;
  className?: string;
};

export function PlanCard({
  plan,
  voiceUrl,
  voiceTranscript,
  language = "hi-IN",
  className,
}: PlanCardProps) {
  const funded = plan.goalAllocations.filter((g) => g.monthlyTotalInr > 0);
  return (
    <Card tone="paper" padding="md" className={cn("space-y-4", className)}>
      <CardHeader className="space-y-2">
        <Badge tone="green">Investment plan</Badge>
        <CardTitle className="text-h3 flex items-baseline gap-2">
          <Currency
            amount={plan.monthlyAllocationInr}
            variant="full"
            language={language}
            className="text-saathi-deep-green"
          />
          <span className="text-body-sm font-normal text-saathi-ink-soft">/ mahina</span>
        </CardTitle>
        <CardDescription lang="hi" className="font-deva">
          {plan.taglineHindi}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {funded.map((goal, idx) => {
          const Icon = CATEGORY_ICON[goal.category] ?? Coins;
          return (
            <motion.div
              key={goal.goalId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.12, duration: 0.35, ease: [0.32, 0.72, 0.4, 1] }}
              className="rounded-card-sm border border-saathi-paper-edge bg-saathi-cream-deep p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-saathi-deep-green-tint">
                    <Icon className="h-4 w-4 text-saathi-deep-green" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-body font-medium text-saathi-ink truncate">
                      {goal.goalName}
                    </div>
                    <div className="text-caption text-saathi-ink-quiet">
                      {goal.horizonMonths < 12
                        ? `${goal.horizonMonths} mahine`
                        : `${(goal.horizonMonths / 12).toFixed(1)} saal horizon`}
                    </div>
                  </div>
                </div>
                <Currency
                  amount={goal.monthlyTotalInr}
                  variant="full"
                  language={language}
                  className="text-body font-semibold text-saathi-deep-green"
                />
              </div>

              <div className="mt-2 grid gap-1">
                {goal.splits.map((split) => (
                  <div
                    key={split.instrument}
                    className="flex items-center justify-between rounded-md bg-saathi-paper px-2.5 py-1.5 text-caption"
                  >
                    <div className="min-w-0">
                      <span className="font-medium text-saathi-ink-soft uppercase tracking-wide">
                        {split.instrument.replace(/_/g, " ")}
                      </span>
                      <span className="ml-1.5 text-saathi-ink-quiet">
                        {split.partnerName}
                      </span>
                    </div>
                    <Currency
                      amount={split.monthlyAmountInr}
                      variant="full"
                      language={language}
                      className="text-saathi-ink"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}

        {plan.unallocatedInr > 0 ? (
          <p className="text-caption text-saathi-ink-quiet">
            ₹{plan.unallocatedInr.toLocaleString("en-IN")} unallocated this run — bumping it
            into the highest-priority underfunded goal.
          </p>
        ) : null}

        {voiceUrl ? (
          <VoicePlayer
            src={voiceUrl}
            transcript={voiceTranscript}
            language={language}
            size="sm"
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
