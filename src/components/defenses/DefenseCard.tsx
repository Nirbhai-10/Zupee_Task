"use client";

import * as React from "react";
import { ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Currency } from "@/components/shared/Currency";
import { VoicePlayer } from "@/components/voice/VoicePlayer";
import type { ScamClassification } from "@/lib/llm/schemas";
import type { LanguageCode } from "@/lib/i18n/languages";
import { formatRelativeMinutes } from "@/lib/i18n/format";
import { cn } from "@/lib/utils/cn";

type DefenseCardProps = {
  classification: ScamClassification;
  receiverName: string;
  language: LanguageCode;
  voiceUrl?: string;
  matchedPatternName?: string;
  /** Minutes since the defense fired. Used for "just now / 4 min ago" line. */
  minutesAgo?: number;
  /** Show the voice player. Off in compact dashboard cards. */
  showVoice?: boolean;
  className?: string;
};

const VERDICT_TONE: Record<ScamClassification["verdict"], "scam" | "suspicious" | "legit" | "unclear"> = {
  SCAM: "scam",
  SUSPICIOUS: "suspicious",
  LEGITIMATE_BUT_LOW_QUALITY: "suspicious",
  LEGITIMATE: "legit",
  UNCLEAR: "unclear",
};

const VERDICT_LABEL: Record<ScamClassification["verdict"], string> = {
  SCAM: "स्कैम",
  SUSPICIOUS: "शक़ है",
  LEGITIMATE_BUT_LOW_QUALITY: "असली पर कमज़ोर",
  LEGITIMATE: "असली",
  UNCLEAR: "साफ़ नहीं",
};

const VERDICT_ICON: Record<ScamClassification["verdict"], React.ElementType> = {
  SCAM: ShieldAlert,
  SUSPICIOUS: ShieldAlert,
  LEGITIMATE_BUT_LOW_QUALITY: ShieldQuestion,
  LEGITIMATE: ShieldCheck,
  UNCLEAR: ShieldQuestion,
};

export function DefenseCard({
  classification,
  receiverName,
  language,
  voiceUrl,
  matchedPatternName,
  minutesAgo,
  showVoice = true,
  className,
}: DefenseCardProps) {
  const Icon = VERDICT_ICON[classification.verdict];
  return (
    <Card tone="paper" padding="md" className={cn("space-y-4", className)}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge tone={VERDICT_TONE[classification.verdict]}>
            <Icon className="h-3 w-3" />
            <span lang="hi" className="font-deva">{VERDICT_LABEL[classification.verdict]}</span>
          </Badge>
          {minutesAgo !== undefined ? (
            <span className="text-caption text-saathi-ink-quiet">
              {formatRelativeMinutes(minutesAgo, language)}
            </span>
          ) : null}
        </div>
        <CardTitle className="text-h3 capitalize">
          {classification.category.replace(/-/g, " ")}
        </CardTitle>
        <CardDescription>
          {receiverName} ke liye{matchedPatternName ? ` · ${matchedPatternName}` : ""}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <p lang="hi" className="font-deva text-body-sm text-saathi-ink-soft">
          {classification.primaryUserAlert}
        </p>

        <ul className="space-y-1 text-caption text-saathi-ink-quiet">
          {classification.identifyingSignals.slice(0, 3).map((signal) => (
            <li key={signal} className="flex items-start gap-1.5">
              <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-saathi-deep-green" />
              <span>{signal}</span>
            </li>
          ))}
        </ul>

        {showVoice && voiceUrl ? (
          <VoicePlayer
            src={voiceUrl}
            transcript={classification.receiverExplanation}
            language={language}
            size="sm"
          />
        ) : null}
      </CardContent>

      {classification.estimatedLossInr > 0 ? (
        <CardFooter className="!mt-2 justify-between rounded-card-sm bg-saathi-gold-tint p-3">
          <span className="text-caption text-saathi-ink-soft">Bachaaya iss case mein</span>
          <Currency amount={classification.estimatedLossInr} variant="compact" language={language} className="text-body font-semibold text-saathi-gold" />
        </CardFooter>
      ) : null}
    </Card>
  );
}
