import Link from "next/link";
import { Banknote, FileSearch, Layers, Maximize, Play, ShieldAlert, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { T } from "@/components/shared/T";
import { MarketingNav } from "@/components/marketing/MarketingNav";

export const metadata = { title: "Presenter" };

export default function PresenterPage() {
  return (
    <>
      <MarketingNav />
      <main className="flex flex-1 flex-col bg-saathi-cream-deep">
        <section className="border-b border-saathi-paper-edge bg-saathi-paper">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-8">
            <div className="space-y-1">
              <Badge tone="green">
                <T hi="presenter mode" en="Presenter mode" />
              </Badge>
              <h1 className="text-h2 font-semibold tracking-tight text-saathi-ink">
                <T hi="डेमो कंट्रोल पैनल" en="Demo control panel" />
              </h1>
              <p className="text-body-sm text-saathi-ink-soft">
                <T
                  hi="सारे triggers, सारी buttons। सिमुलेटर embed नीचे है।"
                  en="All triggers, all buttons. Live simulator is embedded below."
                />
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="primary" size="sm">
                <Link href="/demo/simulator" target="_blank" rel="noopener">
                  <Maximize className="h-4 w-4" />
                  <T hi="नई tab में" en="Open in new tab" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-6 py-8">
          <h2 className="text-h3 font-semibold text-saathi-ink">
            <T hi="क्या-क्या trigger कर सकते हैं" en="What you can trigger" />
          </h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <TriggerSummary
              icon={ShieldAlert}
              title={{ hi: "KBC scam → मम्मी", en: "KBC scam → Mummy" }}
              body={{
                hi: "Sarvam-M classify करेगा, Sarvam bulbul Hindi voice भेजेगा।",
                en: "Sarvam-M classifies, Sarvam bulbul speaks the Hindi reply.",
              }}
              tone="scam"
            />
            <TriggerSummary
              icon={FileSearch}
              title={{ hi: "ULIP audit → अंजली", en: "ULIP audit → Anjali" }}
              body={{
                hi: "Deterministic ULIP math + LLM voice script — ₹6.51L savings figure।",
                en: "Deterministic ULIP math + LLM voice script — ₹6.51L savings headline.",
              }}
              tone="savings"
            />
            <TriggerSummary
              icon={Wallet}
              title={{ hi: "Plan banwayein", en: "Plan banwayein" }}
              body={{
                hi: "Allocator ₹5,500 surplus 4 goals में split करता है। Voice rationale।",
                en: "Allocator splits ₹5,500 surplus across 4 goals. Voice rationale.",
              }}
              tone="investment"
            />
            <TriggerSummary
              icon={Banknote}
              title={{ hi: "Salary day", en: "Salary day" }}
              body={{
                hi: "Salary credit → 4 UPI debits cascade → family fan-out → Hisaab voice।",
                en: "Salary credit → 4 UPI debits cascade → family fan-out → Hisaab voice.",
              }}
              tone="milestone"
            />
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-6 pb-12">
          <Card tone="paper" padding="none" className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-saathi-paper-edge bg-saathi-cream-deep px-4 py-3">
              <CardTitle className="text-body font-semibold">
                <T hi="Embedded simulator" en="Embedded simulator" />
              </CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/demo/simulator">
                  <Play className="h-3 w-3" />
                  <T hi="Full screen" en="Full screen" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="!mt-0 p-0">
              <iframe
                src="/demo/simulator"
                title="Bharosa simulator"
                className="h-[1200px] w-full border-0"
              />
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}

function TriggerSummary({
  icon: Icon,
  title,
  body,
  tone,
}: {
  icon: React.ElementType;
  title: { hi: string; en: string };
  body: { hi: string; en: string };
  tone: "scam" | "savings" | "investment" | "milestone";
}) {
  const toneClass: Record<typeof tone, string> = {
    scam: "bg-saathi-danger-tint text-saathi-danger",
    savings: "bg-saathi-gold-tint text-saathi-gold",
    investment: "bg-saathi-deep-green-tint text-saathi-deep-green",
    milestone: "bg-saathi-success-tint text-saathi-success",
  };
  return (
    <Card tone="paper" padding="md" className="flex items-start gap-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-pill ${toneClass[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-body font-medium text-saathi-ink">
          <T hi={title.hi} en={title.en} />
        </div>
        <div className="text-caption text-saathi-ink-soft">
          <T hi={body.hi} en={body.en} />
        </div>
      </div>
      <Layers className="ml-auto hidden h-4 w-4 shrink-0 text-saathi-ink-quiet sm:block" />
    </Card>
  );
}
