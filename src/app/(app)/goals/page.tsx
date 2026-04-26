import Link from "next/link";
import { Coins, GraduationCap, HeartPulse, Lamp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Currency } from "@/components/shared/Currency";
import { GOALS, ANJALI } from "@/lib/mocks/demo-personas";
import { formatDate } from "@/lib/i18n/format";

export const metadata = { title: "Goals" };

const GOAL_ICON: Record<string, React.ElementType> = {
  wedding: Coins,
  education: GraduationCap,
  medical: HeartPulse,
  festival: Lamp,
};

export default function GoalsPage() {
  const totalTarget = GOALS.reduce((acc, g) => acc + g.targetInr, 0);
  return (
    <main className="flex flex-1 flex-col gap-8 bg-saathi-cream px-6 py-10">
      <header className="mx-auto w-full max-w-3xl space-y-4">
        <Badge tone="green">Goals</Badge>
        <h1 className="text-h1 font-semibold tracking-tight text-saathi-ink">
          Aapke {GOALS.length} active goals
        </h1>
        <p className="text-body-lg text-saathi-ink-soft">
          Total target:{" "}
          <Currency amount={totalTarget} variant="compact" language="hi-IN" className="font-semibold text-saathi-gold" />
          {"  ·  "}
          Monthly surplus:{" "}
          <Currency amount={ANJALI.monthlySurplusInr} variant="full" language="en-IN" className="font-semibold text-saathi-deep-green" />
        </p>
        <div className="flex gap-2">
          <Button asChild variant="primary" size="sm">
            <Link href="/demo/simulator">Run plan banwayein →</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/family">Family</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto w-full max-w-3xl space-y-3">
        {GOALS.map((g) => {
          const Icon = GOAL_ICON[g.category] ?? Coins;
          const yearsToTarget = Math.max(
            0,
            (new Date(g.targetDate).getFullYear() - new Date().getFullYear()),
          );
          return (
            <Card key={g.id} tone="paper" padding="md">
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-saathi-deep-green-tint">
                    <Icon className="h-5 w-5 text-saathi-deep-green" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-h3 font-semibold text-saathi-ink truncate">{g.name}</div>
                    <div className="text-caption text-saathi-ink-quiet">
                      Priority {g.priority} · target {formatDate(g.targetDate)}{" "}
                      ({yearsToTarget} saal baaki)
                    </div>
                  </div>
                </div>
                <Currency
                  amount={g.targetInr}
                  variant="compact"
                  language="hi-IN"
                  className="text-body font-semibold text-saathi-gold"
                />
              </CardHeader>
              <CardContent className="!mt-3 text-body-sm text-saathi-ink-soft">
                {g.rationale}
              </CardContent>
            </Card>
          );
        })}
      </section>
    </main>
  );
}
