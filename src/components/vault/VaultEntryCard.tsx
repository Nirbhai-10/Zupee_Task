import Link from "next/link";
import { CalendarDays, Lock, Mic } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VoicePlayer } from "@/components/voice/VoicePlayer";
import type { VaultConfession } from "@/domain/vault/store";

export function VaultEntryCard({ entry, compact = false }: { entry: VaultConfession; compact?: boolean }) {
  const date = new Date(entry.askedAt);
  return (
    <Link href={`/vault/${entry.id}`} className="group block">
      <Card
        tone="paper"
        padding="md"
        className="h-full border-saathi-deep-green-line/70 transition-all group-hover:-translate-y-0.5 group-hover:shadow-card"
      >
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="green">
              <Lock className="h-3 w-3" />
              Private
            </Badge>
            <span className="inline-flex items-center gap-1 text-caption text-saathi-ink-quiet">
              <CalendarDays className="h-3 w-3" />
              {date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} ·{" "}
              {date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
            </span>
          </div>
          <CardTitle className="text-body font-semibold text-saathi-ink">
            {entry.questionText}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {entry.responseAudioUrl ? (
            <VoicePlayer
              src={entry.responseAudioUrl}
              transcript={entry.responseTranscript ?? undefined}
              language="hi-IN"
              size="sm"
            />
          ) : (
            <p className="line-clamp-3 text-body-sm text-saathi-ink-soft">
              {entry.responseTranscript}
            </p>
          )}
          {!compact && entry.saathiReflectionText ? (
            <div className="rounded-card-sm bg-saathi-deep-green-tint px-3 py-2 text-body-sm text-saathi-deep-green">
              {entry.saathiReflectionText}
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-1.5">
            <Mic className="h-3.5 w-3.5 text-saathi-ink-quiet" />
            {entry.emotionTags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-pill bg-saathi-cream-deep px-2 py-0.5 text-[11px] text-saathi-ink-soft"
              >
                {tag.replace(/-/g, " ")}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
