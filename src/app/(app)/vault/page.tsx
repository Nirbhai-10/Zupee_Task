import Link from "next/link";
import { CalendarClock, Lock, Search, Sparkles, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VaultEntryCard } from "@/components/vault/VaultEntryCard";
import { VaultPrivacyFooter } from "@/components/vault/VaultPrivacyFooter";
import { getVaultStreak, listVaultConfessions } from "@/domain/vault/store";

export const metadata = { title: "Vault" };

export default async function VaultPage() {
  const [entries, streak] = await Promise.all([listVaultConfessions(), getVaultStreak()]);
  const currentMonth = new Date().toISOString().slice(0, 7);

  return (
    <main className="flex flex-1 flex-col gap-6 bg-[#F7F0E3] px-6 py-10">
      <header className="mx-auto w-full max-w-5xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge tone="green">
            <Lock className="h-3 w-3" />
            Private Vault
          </Badge>
          <span className="rounded-pill border border-saathi-gold-line bg-saathi-gold-tint px-3 py-1 text-caption font-medium text-saathi-gold">
            🤫 {streak.currentStreak} din se aap Vault mein honest hain
          </span>
        </div>
        <div className="max-w-3xl space-y-3">
          <h1 className="text-h1 font-semibold tracking-tight text-saathi-ink">
            Vault
          </h1>
          <p className="text-body-lg text-saathi-ink-soft">
            Roz raat 9 baje ek private money sawaal. Aap voice mein bolti hain. Saathi sunta
            hai, judge nahi karta, aur family ko kabhi notify nahi karta.
          </p>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-5xl gap-4 lg:grid-cols-[2fr_1fr]">
        <Card tone="paper" padding="md" className="border-saathi-deep-green-line">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-h3">
              <CalendarClock className="h-5 w-5 text-saathi-deep-green" />
              Aaj raat ka rhythm
            </CardTitle>
            <CardDescription>
              Default time: {streak.eveningQuestionTime} · {streak.timezone}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild variant="primary" size="sm">
              <Link href="/demo/simulator">Trigger evening Vault question</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/vault/reflection/${currentMonth}`}>
                <Sparkles className="h-4 w-4" />
                Monthly reflection
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card tone="paper" padding="md" className="border-saathi-paper-edge">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-h3">
              <Search className="h-5 w-5 text-saathi-deep-green" />
              Vault search
            </CardTitle>
            <CardDescription>
              Find a moment by emotion or topic.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-card-sm border border-saathi-paper-edge bg-saathi-cream px-3 py-2 text-body-sm text-saathi-ink-quiet">
              Try: Diwali, pati, guilt, mummy, Priya
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto w-full max-w-5xl space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-h3 font-semibold text-saathi-ink">Private timeline</h2>
            <p className="text-body-sm text-saathi-ink-soft">
              {streak.totalConfessions} total confessions · longest streak {streak.longestStreak} days
            </p>
          </div>
          <Button variant="ghost" size="sm" className="text-saathi-danger hover:bg-saathi-danger-tint">
            <Trash2 className="h-4 w-4" />
            Vault delete karein
          </Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {entries.map((entry) => (
            <VaultEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl">
        <VaultPrivacyFooter />
      </section>
    </main>
  );
}
