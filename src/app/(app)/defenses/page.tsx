import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Currency } from "@/components/shared/Currency";
import { DefenseCard } from "@/components/defenses/DefenseCard";
import type { ScamClassification } from "@/lib/llm/schemas";

export const metadata = { title: "Defenses" };

type SeededDefense = {
  id: string;
  receiverName: string;
  matchedPatternName: string;
  minutesAgo: number;
  classification: ScamClassification;
};

const SEEDED_DEFENSES: SeededDefense[] = [
  {
    id: "d-kbc",
    receiverName: "Sushma Maaji",
    matchedPatternName: "kbc-lottery-A-hindi",
    minutesAgo: 65,
    classification: {
      verdict: "SCAM",
      category: "lottery",
      confidence: 0.92,
      identifyingSignals: [
        "+92 country code (Pakistan)",
        "'KBC lottery jeete' — KBC never DMs winners",
        "'24 ghante mein expire' urgency cue",
      ],
      payloadType: "money-transfer",
      estimatedLossInr: 8500,
      receiverExplanation:
        "Maaji, namaste. Yeh KBC lottery scam hai. KBC kabhi WhatsApp pe inaam nahi bhejta. Reply mat dijiye, message delete kar dijiye. Bahurani ko bhi inform kar diya hai. Thande dimaag se rahiye, sab theek hai.",
      primaryUserAlert:
        "Mummy ko KBC lottery scam aaya. Humne pakad liya, unko Hindi mein bata diya. Agar wo ₹8,500 'processing fee' bhej deti, woh paisa wapas nahi aata.",
    },
  },
  {
    id: "d-ulip",
    receiverName: "Anjali",
    matchedPatternName: "ulip-bank-rm-pitch",
    minutesAgo: 360,
    classification: {
      verdict: "LEGITIMATE_BUT_LOW_QUALITY",
      category: "ulip-misselling",
      confidence: 0.88,
      identifyingSignals: [
        "Premium allocation 10/8/5/3/3% — first 5 years are heavily front-loaded fees",
        "Lock-in 5 years, surrender before that loses principal",
        "FMC 1.35% + mortality charges erode return",
      ],
      payloadType: "premium-product",
      estimatedLossInr: 240000,
      receiverExplanation:
        "Anjali ji, yeh ULIP mahangi hai. Pehle 5 saal mein hi 29% premium fees mein chala jaata hai. 10 saal mein effective return ~4.8% hoga. Term insurance + direct mutual fund SIP karein toh ₹2,40,000 zyada bachaayenge.",
      primaryUserAlert:
        "Bank RM ne phir ULIP push ki. Audit dikhata hai 10 saal mein ₹2,40,000 ka loss agar yeh policy lo. Saathi ne haan na bolne ke liye script bhi taiyaar ki hai.",
    },
  },
  {
    id: "d-bank-freeze",
    receiverName: "Anjali",
    matchedPatternName: "bank-freeze-hdfc",
    minutesAgo: 1440,
    classification: {
      verdict: "SCAM",
      category: "banking-impersonation",
      confidence: 0.95,
      identifyingSignals: [
        "'.online' impersonation domain (hdfc-update.online)",
        "'24 ghante mein band' pressure cue",
        "Asks for KYC update via link — real banks never do this",
      ],
      payloadType: "credential-harvest",
      estimatedLossInr: 50000,
      receiverExplanation:
        "Anjali ji, yeh fake HDFC message hai. Asli bank kabhi link bhejke KYC nahi maangta. Click mat kijiye, message delete kar dijiye. Branch jaake confirm bhi kar sakte hain.",
      primaryUserAlert:
        "HDFC impersonation scam pakda. Agar wo link click karti, account credentials chura li jaati. Bachat: ₹50,000 ka risk.",
    },
  },
];

const totalSavings = SEEDED_DEFENSES.reduce(
  (acc, d) => acc + d.classification.estimatedLossInr,
  0,
);

export default function DefensesPage() {
  return (
    <main className="flex flex-1 flex-col gap-8 bg-saathi-cream px-6 py-10">
      <header className="mx-auto w-full max-w-3xl space-y-4">
        <Badge tone="green">Day 2</Badge>
        <h1 className="text-h1 font-semibold tracking-tight text-saathi-ink">
          Defenses feed
        </h1>
        <p className="text-body-lg text-saathi-ink-soft">
          Iss saal humne aapke{" "}
          <Currency amount={totalSavings} variant="compact" language="hi-IN" className="font-semibold text-saathi-gold" />{" "}
          bachaaye{" "}
          <span className="text-saathi-ink-quiet">
            ({SEEDED_DEFENSES.length} cases shown — seeded for the build week)
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="primary" size="sm">
            <Link href="/demo/simulator">Run a live trigger →</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/home">Dashboard</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-3xl gap-4">
        {SEEDED_DEFENSES.map((d) => (
          <DefenseCard
            key={d.id}
            classification={d.classification}
            receiverName={d.receiverName}
            language="hi-IN"
            matchedPatternName={d.matchedPatternName}
            minutesAgo={d.minutesAgo}
            showVoice={false}
          />
        ))}
      </section>

      <Card tone="cream" padding="md" className="mx-auto w-full max-w-3xl text-body-sm text-saathi-ink-soft">
        <CardContent className="!mt-0">
          Seeded data above. Trigger a fresh scam-check from the simulator to exercise the
          live LLM/voice pipeline; live defenses will replace this list once Supabase is wired.
        </CardContent>
      </Card>
    </main>
  );
}
