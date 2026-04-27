import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VoicePlayer } from "@/components/voice/VoicePlayer";
import { VaultPrivacyFooter } from "@/components/vault/VaultPrivacyFooter";
import { getVaultConfession } from "@/domain/vault/store";

export const metadata = { title: "Vault entry" };

export default async function VaultEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = await getVaultConfession(id);
  if (!entry) notFound();

  return (
    <main className="flex flex-1 flex-col gap-6 bg-[#F7F0E3] px-6 py-10">
      <header className="mx-auto w-full max-w-3xl space-y-4">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href="/vault">
            <ArrowLeft className="h-4 w-4" />
            Back to Vault
          </Link>
        </Button>
        <Badge tone="green">
          <Lock className="h-3 w-3" />
          Private entry
        </Badge>
        <h1 className="text-h2 font-semibold tracking-tight text-saathi-ink">
          {entry.questionText}
        </h1>
        <p className="text-body-sm text-saathi-ink-quiet">
          {new Date(entry.askedAt).toLocaleString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      </header>

      <section className="mx-auto grid w-full max-w-3xl gap-4">
        <Card tone="paper" padding="md">
          <CardHeader>
            <CardTitle>Your voice note</CardTitle>
            <CardDescription>Default: never shared.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {entry.responseAudioUrl ? (
              <VoicePlayer
                src={entry.responseAudioUrl}
                transcript={entry.responseTranscript ?? undefined}
                language="hi-IN"
              />
            ) : (
              <p className="rounded-card-sm bg-saathi-cream p-3 text-body-sm text-saathi-ink-soft">
                {entry.responseTranscript}
              </p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {entry.emotionTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-pill bg-saathi-cream-deep px-2 py-0.5 text-caption text-saathi-ink-soft"
                >
                  {tag.replace(/-/g, " ")}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card tone="cream" padding="md">
          <CardHeader>
            <CardTitle>Saathi ne kya suna</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {entry.saathiReflectionAudioUrl ? (
              <VoicePlayer
                src={entry.saathiReflectionAudioUrl}
                transcript={entry.saathiReflectionText ?? undefined}
                language="hi-IN"
              />
            ) : (
              <p className="text-body text-saathi-deep-green">{entry.saathiReflectionText}</p>
            )}
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
              Share explicitly
            </Button>
          </CardContent>
        </Card>

        <VaultPrivacyFooter />
      </section>
    </main>
  );
}
