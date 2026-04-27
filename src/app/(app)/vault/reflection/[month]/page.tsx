import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VoicePlayer } from "@/components/voice/VoicePlayer";
import { VaultPrivacyFooter } from "@/components/vault/VaultPrivacyFooter";
import { getMonthlyReflection, listVaultConfessions } from "@/domain/vault/store";

export const metadata = { title: "Vault reflection" };

export default async function VaultReflectionPage({ params }: { params: Promise<{ month: string }> }) {
  const { month } = await params;
  const [reflection, entries] = await Promise.all([
    getMonthlyReflection(month),
    listVaultConfessions(undefined, 80),
  ]);
  const monthLabel = new Date(`${month}-01T00:00:00+05:30`).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const monthEntries = entries.filter((entry) => entry.askedAt.startsWith(month));

  return (
    <main className="flex flex-1 flex-col gap-6 bg-[#F7F0E3] px-6 py-10">
      <header className="mx-auto w-full max-w-3xl space-y-4">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href="/vault">
            <ArrowLeft className="h-4 w-4" />
            Back to Vault
          </Link>
        </Button>
        <Badge tone="gold">
          <Sparkles className="h-3 w-3" />
          Monthly reflection
        </Badge>
        <h1 className="text-h2 font-semibold tracking-tight text-saathi-ink">
          {monthLabel}
        </h1>
      </header>

      <section className="mx-auto grid w-full max-w-3xl gap-4">
        <Card tone="paper" padding="lg">
          <CardHeader>
            <CardTitle>90-second Vault essay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reflection?.reflectionAudioUrl ? (
              <VoicePlayer
                src={reflection.reflectionAudioUrl}
                transcript={reflection.reflectionText}
                language="hi-IN"
              />
            ) : (
              <p className="text-body-lg text-saathi-ink-soft">
                {reflection?.reflectionText ??
                  "Reflection abhi generate nahi hui. Demo simulator mein monthly reflection trigger chalaaiye."}
              </p>
            )}
            <p className="text-caption text-saathi-ink-quiet">
              Based on {monthEntries.length || "demo"} private Vault entries.
            </p>
          </CardContent>
        </Card>
        <VaultPrivacyFooter />
      </section>
    </main>
  );
}
