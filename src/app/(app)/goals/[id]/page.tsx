import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Target, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Currency } from "@/components/shared/Currency";
import { T } from "@/components/shared/T";
import { GoalTrajectoryChart } from "@/components/goals/GoalTrajectoryChart";
import { GOALS } from "@/lib/mocks/demo-personas";
import { INVESTMENT_PRODUCTS } from "@/lib/mocks/investment-products";
import { formatDate, formatPercent } from "@/lib/i18n/format";

export const dynamic = "force-dynamic";

type GoalAllocation = {
  instrument: string;
  partnerName: string;
  monthlyInr: number;
  pct: number;
};

const ALLOCATION_BY_GOAL: Record<string, GoalAllocation[]> = {
  "g-wedding-priya": [
    { instrument: "sukanya_samriddhi", partnerName: "SBI Sukanya Samriddhi", monthlyInr: 1500, pct: 60 },
    { instrument: "gold", partnerName: "Sovereign Gold Bond / DigiGold", monthlyInr: 500, pct: 20 },
    { instrument: "fd", partnerName: "SBI / HDFC FD ladder", monthlyInr: 500, pct: 20 },
  ],
  "g-coaching-aarav": [
    { instrument: "short_debt_fund", partnerName: "Bharat Bond / HDFC Short Term", monthlyInr: 1000, pct: 67 },
    { instrument: "fd", partnerName: "SBI / HDFC FD ladder", monthlyInr: 500, pct: 33 },
  ],
  "g-medical-mil": [
    { instrument: "liquid_fund", partnerName: "ICICI Pru Liquid Fund (Direct)", monthlyInr: 1000, pct: 100 },
  ],
  "g-festival-diwali": [
    { instrument: "rd", partnerName: "SBI Recurring Deposit", monthlyInr: 500, pct: 100 },
  ],
};

function projectGoal(targetInr: number, targetDate: string, monthlyInr: number) {
  const today = new Date();
  const target = new Date(targetDate);
  const months = Math.max(
    1,
    (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth()),
  );
  const monthlyRate = 0.07 / 12;
  const points: { month: string; expected: number }[] = [];
  for (let m = 0; m <= months; m++) {
    const fv = monthlyInr * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate);
    const date = new Date(today.getFullYear(), today.getMonth() + m, 1);
    points.push({
      month: date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      expected: Math.round(fv),
    });
  }
  return { points, targetInr, totalMonths: months };
}

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const goal = GOALS.find((g) => g.id === id);
  if (!goal) notFound();

  const allocations = ALLOCATION_BY_GOAL[goal.id] ?? [];
  const totalMonthly = allocations.reduce((sum, a) => sum + a.monthlyInr, 0);
  const projection = projectGoal(goal.targetInr, goal.targetDate, totalMonthly);
  const yearsRemaining = Math.max(
    0,
    new Date(goal.targetDate).getFullYear() - new Date().getFullYear(),
  );
  const progressPct = goal.priority === 1 ? 18 : goal.priority === 2 ? 12 : 6;
  const currentValue = Math.round((goal.targetInr * progressPct) / 100);

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <Button asChild variant="ghost" size="sm">
          <Link href="/goals">
            <ArrowLeft className="h-4 w-4" />
            <T hi="सभी goals" en="All goals" />
          </Link>
        </Button>
      </div>

      <header className="mx-auto w-full max-w-4xl space-y-3">
        <Badge tone="green">
          <Target className="h-3 w-3" />
          {goal.category.replace(/-/g, " ")}
        </Badge>
        <h1 className="text-h1 font-semibold tracking-tight text-saathi-ink">{goal.name}</h1>
        <div className="flex flex-wrap items-center gap-3 text-body-sm text-saathi-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(goal.targetDate)}
          </span>
          <span>·</span>
          <span>
            {yearsRemaining}
            <T hi=" साल baaki" en=" yrs to go" />
          </span>
          <span>·</span>
          <Currency
            amount={goal.targetInr}
            variant="compact"
            language="hi-IN"
            className="font-semibold text-saathi-gold"
          />
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-4xl gap-4 lg:grid-cols-[3fr_2fr]">
        {/* Trajectory chart */}
        <Card tone="paper" padding="md" className="space-y-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-h3">
              <TrendingUp className="h-5 w-5 text-saathi-deep-green" />
              <T hi="Trajectory" en="Trajectory" />
            </CardTitle>
          </CardHeader>
          <CardContent className="!mt-0">
            <GoalTrajectoryChart
              points={projection.points}
              targetInr={goal.targetInr}
              currentInr={currentValue}
              currentMonthIdx={Math.floor(projection.points.length * (progressPct / 100))}
            />
            <div className="mt-3 grid grid-cols-3 gap-2 text-body-sm">
              <Stat label={{ hi: "अब तक", en: "So far" }}>
                <Currency amount={currentValue} variant="compact" language="hi-IN" className="font-semibold text-saathi-deep-green" />
              </Stat>
              <Stat label={{ hi: "% पूरा", en: "% complete" }}>
                <span className="font-mono font-semibold text-saathi-deep-green">{formatPercent(progressPct / 100, 0)}</span>
              </Stat>
              <Stat label={{ hi: "मासिक", en: "Monthly" }}>
                <Currency amount={totalMonthly} variant="full" language="en-IN" className="font-semibold text-saathi-ink" />
              </Stat>
            </div>
          </CardContent>
        </Card>

        {/* Rationale */}
        <Card tone="cream" padding="md" className="space-y-3">
          <CardHeader>
            <CardTitle className="text-h3">
              <T hi="क्यों यह instrument mix" en="Why this instrument mix" />
            </CardTitle>
          </CardHeader>
          <CardContent className="!mt-0 space-y-2 text-body-sm text-saathi-ink-soft">
            <p>{goal.rationale}</p>
            <p>
              <T
                hi="Bharosa instrument सिर्फ़ trust ladder से चुनता है — gold, FD, SSY, PPF, debt — फिर equity जब आप ready हों।"
                en="Bharosa picks instruments only from the trust ladder — gold, FD, SSY, PPF, debt — equity only when you're ready."
              />
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Allocations */}
      <section className="mx-auto w-full max-w-4xl space-y-3">
        <h2 className="text-h3 font-semibold text-saathi-ink">
          <T hi="Instrument breakdown" en="Instrument breakdown" />
        </h2>
        <Card tone="paper" padding="none">
          <CardContent className="!mt-0 divide-y divide-saathi-paper-edge">
            {allocations.map((a) => {
              const product = INVESTMENT_PRODUCTS.find((p) => p.instrument === a.instrument);
              return (
                <div key={a.instrument} className="grid grid-cols-[2fr_1fr_1fr] items-center gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-body font-medium text-saathi-ink uppercase tracking-wide">
                      {a.instrument.replace(/_/g, " ")}
                    </div>
                    <div className="text-caption text-saathi-ink-quiet truncate">{a.partnerName}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-saathi-ink-quiet">monthly</div>
                    <Currency
                      amount={a.monthlyInr}
                      variant="full"
                      language="en-IN"
                      className="text-body font-semibold text-saathi-deep-green"
                    />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-saathi-ink-quiet">expected</div>
                    <span className="font-mono tabular-nums text-body-sm text-saathi-ink-soft">
                      {product ? formatPercent(product.expectedAnnualReturn, 1) : "—"}
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto w-full max-w-4xl">
        <Card tone="cream" padding="md" className="text-body-sm text-saathi-ink-soft">
          <T
            hi="हर महीने UPI Autopay execute होगा. Salary day पर simulator में पूरा cascade देखिए।"
            en="UPI Autopay runs each month. Watch the full cascade on simulator → Salary day."
          />
        </Card>
      </section>
    </main>
  );
}

function Stat({ label, children }: { label: { hi: string; en: string }; children: React.ReactNode }) {
  return (
    <div>
      <T as="div" hi={label.hi} en={label.en} className="text-[10px] uppercase tracking-wider text-saathi-ink-quiet" />
      <div className="mt-0.5">{children}</div>
    </div>
  );
}
