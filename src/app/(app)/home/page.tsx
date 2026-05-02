import Link from "next/link";
import type { ElementType } from "react";
import {
  ArrowRight,
  Banknote,
  CalendarClock,
  FileSearch,
  Mic2,
  Receipt,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/brand/Logo";
import { Currency } from "@/components/shared/Currency";
import { T } from "@/components/shared/T";
import { VoiceAgent } from "@/components/voice/VoiceAgent";
import { ANJALI, GOALS } from "@/lib/mocks/demo-personas";
import { SEEDED_ACTIVITY } from "@/lib/mocks/seeded-activity";

export const metadata = { title: "Home" };

const PROTECTED_THIS_YEAR = 47_200;
const RISKS_STOPPED = 13;
const GOALS_FUNDED = 4;

const TODAY_ACTIONS = [
  {
    href: "/demo/simulator",
    icon: ShieldCheck,
    title: { hi: "WhatsApp message check करें", en: "Check a WhatsApp message" },
    body: {
      hi: "Suspicious forward, fake KYC या digital arrest call — paste करके risk देखें.",
      en: "Paste a suspicious forward, fake KYC text, or digital-arrest message.",
    },
  },
  {
    href: "/demo/simulator",
    icon: FileSearch,
    title: { hi: "Policy audit करें", en: "Audit a policy" },
    body: {
      hi: "ULIP या endowment brochure से fees, lock-in और real return समझें.",
      en: "See fees, lock-ins, and real returns on a ULIP or endowment pitch.",
    },
  },
  {
    href: "/investments",
    icon: Banknote,
    title: { hi: "Salary plan review करें", en: "Review salary plan" },
    body: {
      hi: "इस महीने के ₹5,500 किस goal में जाएंगे — साफ़ line items.",
      en: "Clear line items for where this month's ₹5,500 will go.",
    },
  },
];

const GOAL_PROGRESS: Record<string, number> = {
  "g-wedding-priya": 18,
  "g-coaching-aarav": 12,
  "g-medical-mil": 31,
  "g-festival-diwali": 67,
};

const GOAL_LABELS: Record<string, { hi: string; en: string }> = {
  "g-wedding-priya": { hi: "Priya ki shaadi", en: "Priya's wedding" },
  "g-coaching-aarav": { hi: "Aarav ki coaching", en: "Aarav's coaching" },
  "g-medical-mil": { hi: "Mummy ka medical buffer", en: "Mother-in-law's medical buffer" },
  "g-festival-diwali": { hi: "Diwali fund", en: "Diwali fund" },
};

export default function HomePage() {
  const recentProof = SEEDED_ACTIVITY.filter((activity) =>
    ["scam_blocked", "ulip_audit", "bill_disputed"].includes(activity.kind),
  ).slice(0, 3);

  return (
    <main className="flex flex-1 flex-col gap-8 bg-saathi-cream px-6 py-10">
      <header className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Logo size={48} />
            <Badge tone="gold">
              <Sparkles className="h-3 w-3" />
              <T hi="Household Financial Memory" en="Household Financial Memory" />
            </Badge>
          </div>
          <div className="space-y-2">
            <h1 className="text-h1 font-semibold tracking-tight text-saathi-ink">
              <T
                hi={`आज ${ANJALI.name.split(" ")[0]} के घर का money system शांत है.`}
                en={`${ANJALI.name.split(" ")[0]}'s household money system is calm today.`}
              />
            </h1>
            <p className="max-w-2xl text-body-lg text-saathi-ink-soft">
              <T
                hi="Bharosa पहले risk रोकता है, फिर salary को family goals में safely move करता है. हर outcome आपकी private household memory बनता है."
                en="Bharosa stops risk first, then moves salary safely into family goals. Every outcome becomes private household memory."
              />
            </p>
          </div>
        </div>

        <Card tone="green" padding="lg" className="space-y-2">
          <div className="text-caption uppercase tracking-wide text-white/70">
            <T hi="Protected this year" en="Protected this year" />
          </div>
          <Currency amount={PROTECTED_THIS_YEAR} variant="full" language="en-IN" className="text-display font-semibold leading-none text-white" />
          <p className="text-body-sm text-white/80">
            <T
              hi={`${RISKS_STOPPED} risks stopped · ${GOALS_FUNDED} goals funded · advice based on household history`}
              en={`${RISKS_STOPPED} risks stopped · ${GOALS_FUNDED} goals funded · advice based on household history`}
            />
          </p>
        </Card>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card tone="paper" padding="lg" className="space-y-5">
          <CardHeader>
            <Badge tone="green">
              <CalendarClock className="h-3 w-3" />
              <T hi="Recommended today" en="Recommended today" />
            </Badge>
            <CardTitle className="mt-3 text-h2">
              <T hi="Diwali pressure शुरू होने से पहले ₹3,000 अलग रख दें." en="Set aside ₹3,000 before Diwali pressure starts." />
            </CardTitle>
          </CardHeader>
          <CardContent className="!mt-0 space-y-4">
            <p className="text-body text-saathi-ink-soft">
              <T
                hi="Bharosa ने पिछले साल के pattern से note किया: Diwali budget की चिंता festival से लगभग 11-12 दिन पहले शुरू होती है. अभी action लेने से panic spend नहीं होगा."
                en="Bharosa learned from last year's pattern: Diwali budget anxiety starts around 11-12 days before the festival. Acting now prevents panic spending."
              />
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="primary" size="md">
                <Link href="/investments">
                  <T hi="Salary plan review करें" en="Review salary plan" />
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="md">
                <Link href="/bachat">
                  <T hi="Proof ledger देखें" en="See proof ledger" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card tone="paper" padding="lg" className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-pill bg-saathi-gold-tint text-saathi-gold">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div>
              <div className="text-body font-semibold text-saathi-ink">
                <T hi="Similar households" en="Similar households" />
              </div>
              <p className="text-caption text-saathi-ink-soft">
                <T hi="Private benchmark · no leaderboard" en="Private benchmark · no leaderboard" />
              </p>
            </div>
          </div>
          <div className="grid gap-3">
            <BenchmarkRow label={{ hi: "Monthly bachat", en: "Monthly savings" }} mine="₹5,500" cohort="₹4,200" />
            <BenchmarkRow label={{ hi: "Emergency cover", en: "Emergency cover" }} mine="4.2 mo" cohort="1.8 mo" />
            <BenchmarkRow label={{ hi: "Scams stopped", en: "Scams stopped" }} mine="13" cohort="9" />
          </div>
        </Card>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-3 md:grid-cols-3">
        {TODAY_ACTIONS.map((action) => (
          <ActionCard key={action.title.en} {...action} />
        ))}
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card tone="paper" padding="lg">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-h3 font-semibold text-saathi-ink">
                <T hi="Recent proof" en="Recent proof" />
              </h2>
              <p className="text-body-sm text-saathi-ink-soft">
                <T hi="हर row household memory में save है." en="Every row is saved to household memory." />
              </p>
            </div>
            <Link href="/bachat" className="text-body-sm font-medium text-saathi-deep-green hover:underline">
              <T hi="Bachat Ledger →" en="Bachat Ledger →" />
            </Link>
          </div>
          <div className="grid gap-3">
            {recentProof.map((activity) => (
              <ProofRow key={activity.id} activity={activity} />
            ))}
          </div>
        </Card>

        <Card tone="paper" padding="lg">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-h3 font-semibold text-saathi-ink">
                <T hi="Goals funded" en="Goals funded" />
              </h2>
              <p className="text-body-sm text-saathi-ink-soft">
                <T hi="इस महीने का surplus goal-first तरीके से split होगा." en="This month's surplus is split goal-first." />
              </p>
            </div>
            <Link href="/goals" className="text-body-sm font-medium text-saathi-deep-green hover:underline">
              <T hi="Goals →" en="Goals →" />
            </Link>
          </div>
          <div className="grid gap-3">
            {GOALS.map((goal) => (
              <GoalRow
                key={goal.id}
                name={GOAL_LABELS[goal.id] ?? { hi: goal.name, en: goal.name }}
                target={goal.targetInr}
                progress={GOAL_PROGRESS[goal.id] ?? 8}
              />
            ))}
          </div>
        </Card>
      </section>

      <section className="mx-auto w-full max-w-6xl">
        <Card tone="cream" padding="lg" className="grid gap-5 lg:grid-cols-[280px_1fr] lg:items-start">
          <div className="space-y-2">
            <Badge tone="muted">
              <Mic2 className="h-3 w-3" />
              <T hi="Ask by voice" en="Ask by voice" />
            </Badge>
            <h2 className="text-h3 font-semibold text-saathi-ink">
              <T hi="आवाज़ assistive है, product नहीं." en="Voice is assistive, not the product." />
            </h2>
            <p className="text-body-sm text-saathi-ink-soft">
              <T
                hi="जब typing मुश्किल हो, mic दबाकर risk, policy या salary plan पूछ लें."
                en="When typing is harder, press the mic and ask about risk, policies, or salary planning."
              />
            </p>
          </div>
          <VoiceAgent compact />
        </Card>
      </section>
    </main>
  );
}

function ActionCard({
  href,
  icon: Icon,
  title,
  body,
}: {
  href: string;
  icon: ElementType;
  title: { hi: string; en: string };
  body: { hi: string; en: string };
}) {
  return (
    <Link href={href} className="group block">
      <Card tone="paper" padding="md" className="h-full transition-transform group-hover:-translate-y-0.5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-saathi-deep-green-tint text-saathi-deep-green">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 space-y-1">
            <h2 className="text-body font-semibold text-saathi-ink">
              <T hi={title.hi} en={title.en} />
            </h2>
            <p className="text-body-sm text-saathi-ink-soft">
              <T hi={body.hi} en={body.en} />
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function BenchmarkRow({ label, mine, cohort }: { label: { hi: string; en: string }; mine: string; cohort: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-card-sm bg-saathi-cream px-3 py-2 text-body-sm">
      <span className="text-saathi-ink-soft">
        <T hi={label.hi} en={label.en} />
      </span>
      <span className="font-mono font-semibold tabular-nums text-saathi-deep-green">{mine}</span>
      <span className="font-mono tabular-nums text-saathi-ink-quiet">{cohort}</span>
    </div>
  );
}

function ProofRow({ activity }: { activity: (typeof SEEDED_ACTIVITY)[number] }) {
  const icon = activity.kind === "ulip_audit" ? FileSearch : activity.kind === "bill_disputed" ? Receipt : ShieldCheck;
  const Icon = icon;
  return (
    <div className="flex items-start gap-3 rounded-card-sm border border-saathi-paper-edge bg-saathi-paper px-3 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-saathi-deep-green-tint text-saathi-deep-green">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-body-sm font-semibold text-saathi-ink">
          <T hi={activity.title.hi} en={activity.title.en} />
        </div>
        <p className="text-caption text-saathi-ink-soft">
          <T hi={activity.subtitle.hi} en={activity.subtitle.en} />
        </p>
      </div>
      {activity.amountInr ? (
        <Currency amount={activity.amountInr} variant="compact" language="en-IN" className="shrink-0 text-body-sm font-semibold text-saathi-gold" />
      ) : null}
    </div>
  );
}

function GoalRow({ name, target, progress }: { name: { hi: string; en: string }; target: number; progress: number }) {
  return (
    <div className="rounded-card-sm border border-saathi-paper-edge bg-saathi-paper px-3 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-body-sm font-semibold text-saathi-ink">
          <T hi={name.hi} en={name.en} />
        </div>
        <Currency amount={target} variant="compact" language="en-IN" className="text-body-sm font-semibold text-saathi-gold" />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-pill bg-saathi-paper-edge">
          <div className="h-full rounded-pill bg-saathi-deep-green" style={{ width: `${progress}%` }} />
        </div>
        <span className="font-mono text-[10px] tabular-nums text-saathi-ink-quiet">{progress}%</span>
      </div>
    </div>
  );
}
