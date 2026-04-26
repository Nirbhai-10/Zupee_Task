import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { INVESTMENT_PRODUCTS } from "@/lib/mocks/investment-products";
import { formatPercent } from "@/lib/i18n/format";

export const metadata = { title: "Investments" };

export default function InvestmentsPage() {
  return (
    <main className="flex flex-1 flex-col gap-8 bg-saathi-cream px-6 py-10">
      <header className="mx-auto w-full max-w-4xl space-y-4">
        <Badge tone="green">Investments</Badge>
        <h1 className="text-h1 font-semibold tracking-tight text-saathi-ink">
          Saathi ka instrument catalogue
        </h1>
        <p className="text-body-lg text-saathi-ink-soft">
          Trust-ladder pe arranged: foundation (gold, FD) → trusted (SSY, PPF, debt) →
          graduated (equity, sirf jab aap ready hon). Saathi sirf direct mutual funds use
          karta hai — koi commission nahi.
        </p>
        <div className="flex gap-2">
          <Button asChild variant="primary" size="sm">
            <Link href="/demo/simulator">Plan banwayein →</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/goals">Goals</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto w-full max-w-4xl grid gap-4 md:grid-cols-2">
        {INVESTMENT_PRODUCTS.map((p) => (
          <Card key={p.instrument} tone="paper" padding="md">
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
              <div className="min-w-0">
                <div className="text-body font-semibold text-saathi-ink uppercase tracking-wide">
                  {p.instrument.replace(/_/g, " ")}
                </div>
                <div className="text-caption text-saathi-ink-quiet truncate">{p.partnerName}</div>
              </div>
              <Badge tone={p.trustRung === "foundation" ? "green" : p.trustRung === "trusted" ? "gold" : "muted"}>
                {p.trustRung}
              </Badge>
            </CardHeader>
            <CardContent className="!mt-3 space-y-2">
              <div className="grid grid-cols-3 gap-2 text-body-sm">
                <Stat label="Return" value={formatPercent(p.expectedAnnualReturn, 1) + " p.a."} />
                <Stat label="Liquidity" value={`${Math.round(p.liquidity * 100)}%`} />
                <Stat label="Lock-in" value={p.lockInYears > 0 ? `${p.lockInYears} yrs` : "0"} />
              </div>
              <p lang="hi" className="font-deva text-caption text-saathi-ink-soft">
                {p.vernacularPitch}
              </p>
              <p className="text-[11px] text-saathi-ink-quiet">{p.taxNote}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-saathi-ink-quiet">{label}</div>
      <div className="text-saathi-ink font-medium tabular-nums">{value}</div>
    </div>
  );
}
