"use client";

import * as React from "react";
import { ChevronDown, FileText, Phone, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VoicePlayer } from "@/components/voice/VoicePlayer";
import { T } from "@/components/shared/T";
import type { LanguageCode } from "@/lib/i18n/languages";
import { cn } from "@/lib/utils/cn";

type SachetDraft = {
  portal: string;
  referenceUrl: string;
  fields: Record<string, string>;
};

type HarassmentCardProps = {
  agentName: string;
  agencyName: string;
  letter: string;
  callScript: string;
  sachetDraft: SachetDraft;
  voiceUrl?: string;
  language?: LanguageCode;
  className?: string;
};

export function HarassmentCard({
  agentName,
  agencyName,
  letter,
  callScript,
  sachetDraft,
  voiceUrl,
  language = "hi-IN",
  className,
}: HarassmentCardProps) {
  const [showLetter, setShowLetter] = React.useState(false);
  const [showSachet, setShowSachet] = React.useState(false);

  return (
    <Card tone="paper" padding="md" className={cn("space-y-4", className)}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge tone="scam">
            <ShieldCheck className="h-3 w-3" />
            <T hi="हैरासमेंट · निपटाया" en="Harassment · handled" />
          </Badge>
          <span className="text-caption text-saathi-ink-quiet font-mono tabular-nums">
            <T hi="अभी" en="just now" />
          </span>
        </div>
        <CardTitle className="text-h3">
          {agentName}{" "}
          <span className="text-saathi-ink-quiet font-normal">·</span>{" "}
          <span className="text-body text-saathi-ink-soft font-normal">{agencyName}</span>
        </CardTitle>
        <CardDescription>
          <T
            hi="3 चीज़ें भेज दीं — cease-and-desist letter, RBI Sachet draft, और एजेंट को vernacular voice call।"
            en="Three things sent — cease-and-desist letter, RBI Sachet draft, and a vernacular voice call to the agent."
          />
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Voice call */}
        {voiceUrl ? (
          <div className="rounded-card-sm border border-saathi-paper-edge bg-saathi-cream-deep/60 p-3">
            <div className="mb-2 flex items-center gap-2 text-caption text-saathi-deep-green">
              <Phone className="h-3.5 w-3.5" />
              <T hi="एजेंट को निगोशिएटर कॉल" en="Negotiator call to the agent" />
            </div>
            <VoicePlayer
              src={voiceUrl}
              transcript={callScript}
              language={language}
              size="sm"
            />
          </div>
        ) : null}

        {/* Letter */}
        <button
          type="button"
          onClick={() => setShowLetter((v) => !v)}
          className="flex w-full items-center justify-between rounded-card-sm border border-saathi-paper-edge bg-saathi-paper px-3 py-2 text-body-sm transition-colors hover:bg-saathi-cream-deep"
        >
          <span className="flex items-center gap-2 text-saathi-ink">
            <FileText className="h-4 w-4 text-saathi-deep-green" />
            <T hi="Cease-and-desist letter" en="Cease-and-desist letter" />
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-saathi-ink-quiet transition-transform",
              showLetter && "rotate-180",
            )}
          />
        </button>
        {showLetter ? (
          <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-card-sm border border-saathi-paper-edge bg-saathi-paper p-3 font-mono text-[11px] leading-relaxed text-saathi-ink-soft">
            {letter}
          </pre>
        ) : null}

        {/* Sachet draft */}
        <button
          type="button"
          onClick={() => setShowSachet((v) => !v)}
          className="flex w-full items-center justify-between rounded-card-sm border border-saathi-paper-edge bg-saathi-paper px-3 py-2 text-body-sm transition-colors hover:bg-saathi-cream-deep"
        >
          <span className="flex items-center gap-2 text-saathi-ink">
            <ShieldCheck className="h-4 w-4 text-saathi-deep-green" />
            <T hi="RBI Sachet — pre-filled" en="RBI Sachet — pre-filled" />
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-saathi-ink-quiet transition-transform",
              showSachet && "rotate-180",
            )}
          />
        </button>
        {showSachet ? (
          <div className="space-y-2 rounded-card-sm border border-saathi-paper-edge bg-saathi-paper p-3 text-caption">
            <div className="flex items-center justify-between text-saathi-ink-quiet">
              <span className="uppercase tracking-wide">{sachetDraft.portal}</span>
              <a
                href={sachetDraft.referenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-saathi-deep-green hover:underline"
              >
                {sachetDraft.referenceUrl}
              </a>
            </div>
            <dl className="grid gap-1.5">
              {Object.entries(sachetDraft.fields).map(([k, v]) => (
                <div key={k} className="grid grid-cols-[1.2fr_2fr] gap-2 border-t border-saathi-paper-edge pt-1.5 first:border-t-0 first:pt-0">
                  <dt className="text-saathi-ink-quiet">{k}</dt>
                  <dd className="text-saathi-ink-soft">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
