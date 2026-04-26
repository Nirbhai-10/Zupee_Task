import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Currency } from "@/components/shared/Currency";
import { DefenseCard } from "@/components/defenses/DefenseCard";
import { T } from "@/components/shared/T";
import type { ScamClassification } from "@/lib/llm/schemas";
import { getSupabaseDemoClient, DEMO_USER_ID } from "@/lib/db/server-anon";

export const metadata = { title: "Defenses" };
export const dynamic = "force-dynamic";

type DefenseRow = {
  id: string;
  category: string;
  verdict: ScamClassification["verdict"];
  scam_category: string | null;
  confidence: number | null;
  identifying_signals: string[] | null;
  payload_type: string | null;
  estimated_savings_inr: number | string | null;
  receiver_explanation: string | null;
  primary_user_alert: string | null;
  language_used: string | null;
  voice_response_url: string | null;
  family_member_id: string | null;
  created_at: string;
};

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
        "Bank RM ne phir ULIP push ki. Audit dikhata hai 10 saal mein ₹2,40,000 ka loss agar yeh policy lo. Bharosa ne haan na bolne ke liye script bhi taiyaar ki hai.",
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

async function fetchLiveDefenses(): Promise<{
  classification: ScamClassification;
  receiverName: string;
  matchedPatternName?: string;
  minutesAgo: number;
  voiceUrl?: string;
}[]> {
  const supabase = getSupabaseDemoClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("defenses")
    .select(
      "id, category, verdict, scam_category, confidence, identifying_signals, payload_type, estimated_savings_inr, receiver_explanation, primary_user_alert, language_used, voice_response_url, family_member_id, created_at",
    )
    .eq("user_id", DEMO_USER_ID)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) return [];
  const rows = (data ?? []) as unknown as DefenseRow[];
  return rows.map((row) => {
    const minutes = Math.max(
      0,
      Math.floor((Date.now() - new Date(row.created_at).getTime()) / 60_000),
    );
    return {
      classification: {
        verdict: row.verdict,
        category: (row.scam_category ?? "other") as ScamClassification["category"],
        confidence: Number(row.confidence ?? 0),
        identifyingSignals: row.identifying_signals ?? [],
        payloadType: (row.payload_type ?? "unknown") as ScamClassification["payloadType"],
        estimatedLossInr: Number(row.estimated_savings_inr ?? 0),
        receiverExplanation: row.receiver_explanation ?? "",
        primaryUserAlert: row.primary_user_alert ?? "",
      },
      receiverName: row.family_member_id ? "Sushma Maaji" : "Anjali",
      matchedPatternName: undefined,
      minutesAgo: minutes,
      voiceUrl: row.voice_response_url ?? undefined,
    };
  });
}

export default async function DefensesPage() {
  const live = await fetchLiveDefenses();

  // Compose: live first, then seeded fillers if we have fewer than 3.
  const composed =
    live.length >= 3
      ? live
      : [
          ...live,
          ...SEEDED_DEFENSES.slice(0, 3 - live.length).map((d) => ({
            classification: d.classification,
            receiverName: d.receiverName,
            matchedPatternName: d.matchedPatternName,
            minutesAgo: d.minutesAgo,
            voiceUrl: undefined as string | undefined,
          })),
        ];

  const totalSavings = composed.reduce(
    (acc, d) => acc + (d.classification.estimatedLossInr ?? 0),
    0,
  );

  return (
    <main className="flex flex-1 flex-col gap-8 bg-saathi-cream px-6 py-10">
      <header className="mx-auto w-full max-w-3xl space-y-4">
        <Badge tone="green">
          <T hi="सुरक्षा" en="Defenses" />
        </Badge>
        <h1 className="text-h1 font-semibold tracking-tight text-saathi-ink">
          <T hi="रोके गए हमले" en="Threats blocked" />
        </h1>
        <p className="text-body-lg text-saathi-ink-soft">
          <T
            hi="इस अकाउंट पर अब तक "
            en="This account has saved you "
          />
          <Currency amount={totalSavings} variant="compact" language="hi-IN" className="font-semibold text-saathi-gold" />
          <T hi=" बच चुके हैं · " en=" so far · " />
          <span className="text-saathi-ink-quiet">
            <T
              hi={`${live.length} लाइव · ${composed.length - live.length} seeded`}
              en={`${live.length} live · ${composed.length - live.length} seeded`}
            />
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="primary" size="sm">
            <Link href="/demo/simulator">
              <T hi="लाइव trigger चलाएँ →" en="Run a live trigger →" />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/home">
              <T hi="डैशबोर्ड" en="Dashboard" />
            </Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-3xl gap-4">
        {composed.map((d, i) => (
          <DefenseCard
            key={i}
            classification={d.classification}
            receiverName={d.receiverName}
            language="hi-IN"
            matchedPatternName={d.matchedPatternName}
            minutesAgo={d.minutesAgo}
            voiceUrl={d.voiceUrl}
            showVoice={Boolean(d.voiceUrl)}
          />
        ))}
      </section>

      <Card tone="cream" padding="md" className="mx-auto w-full max-w-3xl text-body-sm text-saathi-ink-soft">
        <CardContent className="!mt-0">
          <T
            hi="लाइव simulator से कोई trigger चलाइए — defense feed में नई entry यहीं Supabase से आ जाएगी।"
            en="Run a trigger from the live simulator — new entries flow into this feed straight from Supabase."
          />
        </CardContent>
      </Card>
    </main>
  );
}
