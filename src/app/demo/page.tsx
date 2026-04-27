import Link from "next/link";
import { ArrowRight, Banknote, FileSearch, Play, ShieldAlert, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { T } from "@/components/shared/T";
import { MarketingNav } from "@/components/marketing/MarketingNav";

export const metadata = { title: "Demo" };

const FLOWS = [
  {
    icon: ShieldAlert,
    title: { hi: "1. Scam catch", en: "1. Scam catch" },
    body: {
      hi: "मम्मी को KBC scam आता है, Bharosa को forward करती हैं। 30 sec में Hindi voice reply।",
      en: "Mummy gets a KBC scam, forwards to Bharosa. 30-second Hindi voice reply.",
    },
    duration: "T+0 → T+28s",
    tone: "scam" as const,
  },
  {
    icon: FileSearch,
    title: { hi: "2. ULIP audit", en: "2. ULIP audit" },
    body: {
      hi: "ULIP brochure भेजते ही 60s voice audit — actual fees, lifetime savings figure।",
      en: "Send a ULIP brochure → 60-second voice audit with real fees + lifetime savings.",
    },
    duration: "T+28 → T+56s",
    tone: "savings" as const,
  },
  {
    icon: Wallet,
    title: { hi: "3. Plan generation", en: "3. Plan generation" },
    body: {
      hi: "‘Plan banwayein’ — ₹5,500 4 goals में split, motion animation।",
      en: "‘Plan banwayein’ — ₹5,500 split across 4 goals, animated cascade.",
    },
    duration: "T+56 → T+85s",
    tone: "investment" as const,
  },
  {
    icon: Banknote,
    title: { hi: "4. Salary day", en: "4. Salary day" },
    body: {
      hi: "Salary credit, 4 UPI debits, family fan-out, Hisaab voice — सब live।",
      en: "Salary credit, 4 UPI debits, family fan-out, Hisaab voice — end-to-end live.",
    },
    duration: "T+85 → T+95s",
    tone: "milestone" as const,
  },
];

const TONE_CLASS: Record<string, string> = {
  scam: "bg-saathi-danger-tint text-saathi-danger",
  savings: "bg-saathi-gold-tint text-saathi-gold",
  investment: "bg-saathi-deep-green-tint text-saathi-deep-green",
  milestone: "bg-saathi-success-tint text-saathi-success",
};

export default function DemoPage() {
  return (
    <>
      <MarketingNav />
      <main className="flex flex-1 flex-col bg-saathi-cream">
        <section className="border-b border-saathi-paper-edge bg-saathi-paper">
          <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 px-6 py-14">
            <Badge tone="green">
              <T hi="डेमो" en="Demo" />
            </Badge>
            <h1 className="text-h1 font-semibold tracking-tight text-saathi-ink">
              <T
                hi="90 second में पूरी कहानी।"
                en="The whole story in 90 seconds."
              />
            </h1>
            <p className="max-w-2xl text-body-lg text-saathi-ink-soft">
              <T
                hi="चार trigger buttons. Bharat-native LLM (Sarvam-M). असली Hindi voice (Sarvam bulbul:v3). असली ULIP math। Local Gemma 4 fallback. सब cloud-tested है।"
                en="Four trigger buttons. Bharat-native LLM (Sarvam-M). Real Hindi voice (Sarvam bulbul:v3). Real ULIP math. Local Gemma 4 fallback. Cloud-tested end to end."
              />
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="primary" size="lg">
                <Link href="/demo/simulator">
                  <Play className="h-4 w-4" />
                  <T hi="लाइव सिमुलेटर खोलें" en="Open live simulator" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/demo/presenter">
                  <T hi="Presenter panel" en="Presenter panel" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-saathi-cream">
          <div className="mx-auto grid max-w-5xl gap-4 px-6 py-12 md:grid-cols-2">
            {FLOWS.map((flow) => {
              const Icon = flow.icon;
              return (
                <Card key={flow.title.en} tone="paper" padding="md" className="space-y-3">
                  <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-pill ${TONE_CLASS[flow.tone]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-h3">
                        <T hi={flow.title.hi} en={flow.title.en} />
                      </CardTitle>
                      <CardDescription className="font-mono text-caption tabular-nums text-saathi-ink-quiet">
                        {flow.duration}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="text-body-sm text-saathi-ink-soft">
                    <T hi={flow.body.hi} en={flow.body.en} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="border-t border-saathi-paper-edge bg-saathi-paper">
          <div className="mx-auto max-w-5xl px-6 py-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="max-w-xl text-body text-saathi-ink-soft">
                <T
                  hi="भरोसा पहले रक्षा करता है, फिर निवेश। यह demo उसी sequence में चलता है।"
                  en="Bharosa defends first, then invests. The demo runs in that order."
                />
              </p>
              <Button asChild variant="primary" size="md">
                <Link href="/demo/simulator">
                  <T hi="शुरू करें" en="Run it" />
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
