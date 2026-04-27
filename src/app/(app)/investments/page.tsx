import Link from "next/link";
import type { ElementType } from "react";
import { Banknote, CalendarClock, CheckCircle2, Coins, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Currency } from "@/components/shared/Currency";
import { T } from "@/components/shared/T";
import { ANJALI, GOALS } from "@/lib/mocks/demo-personas";
import { INVESTMENT_PRODUCTS } from "@/lib/mocks/investment-products";
import { formatPercent } from "@/lib/i18n/format";

export const metadata = { title: "Investments" };

const MONTHLY_SPLIT = [
  {
    goalId: "g-medical-mil",
    goal: { hi: "Mummy ka medical buffer", en: "Mother-in-law's medical buffer" },
    amount: 2200,
    instrument: { hi: "Liquid fund", en: "Liquid fund" },
    reason: {
      hi: "Medical buffer में पैसा 24 घंटे में available रहना चाहिए.",
      en: "The medical buffer must stay available within 24 hours.",
    },
  },
  {
    goalId: "g-coaching-aarav",
    goal: { hi: "Aarav ki coaching", en: "Aarav's coaching" },
    amount: 1900,
    instrument: { hi: "Short-debt + FD", en: "Short debt + FD" },
    reason: {
      hi: "Coaching 2027 में है, इसलिए volatility कम रखी गई है.",
      en: "Coaching is due in 2027, so volatility stays low.",
    },
  },
  {
    goalId: "g-wedding-priya",
    goal: { hi: "Priya ki shaadi", en: "Priya's wedding" },
    amount: 800,
    instrument: { hi: "Sukanya + gold ladder", en: "Sukanya + gold ladder" },
    reason: {
      hi: "Long horizon है, पर family comfort FD/gold से शुरू होता है.",
      en: "The horizon is long, but family comfort starts with FD/gold.",
    },
  },
  {
    goalId: "g-festival-diwali",
    goal: { hi: "Diwali fund", en: "Diwali fund" },
    amount: 500,
    instrument: { hi: "Recurring deposit", en: "Recurring deposit" },
    reason: {
      hi: "Festival fund में fixed monthly discipline चाहिए, risk नहीं.",
      en: "The festival fund needs fixed monthly discipline, not risk.",
    },
  },
];

const PRODUCT_PITCH_EN: Record<string, string> = {
  gold: "Gold is familiar and culturally useful for a wedding goal.",
  fd: "FDs are already trusted; Bharosa only structures them into a ladder.",
  rd: "A recurring deposit keeps festival and school-fee savings disciplined.",
  sukanya_samriddhi: "Built by the government for daughters; tax-free, locked, and safe.",
  ppf: "A long-term, tax-free foundation for conservative savings.",
  liquid_fund: "For emergencies: money can usually come back within a day.",
  short_debt_fund: "A low-risk mutual fund option for near-term goals.",
  index_fund: "A gradual equity entry only when the user is comfortable.",
  large_cap_equity: "Equity exposure through larger companies, used only after trust is built.",
  lic_term: "Pure life cover, not an investment product.",
};

export default function InvestmentsPage() {
  return (
    <main className="flex flex-1 flex-col gap-8 bg-saathi-cream px-6 py-10">
      <header className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.35fr_1fr] lg:items-end">
        <div className="space-y-4">
          <Badge tone="green">
            <Banknote className="h-3 w-3" />
            <T hi="Salary-Day Cockpit" en="Salary-Day Cockpit" />
          </Badge>
          <div className="space-y-2">
            <h1 className="text-h1 font-semibold tracking-tight text-saathi-ink">
              <T hi="इस महीने ₹5,500 कहाँ जाएगा." en="Where this month's ₹5,500 goes." />
            </h1>
            <p className="max-w-2xl text-body-lg text-saathi-ink-soft">
              <T
                hi="Bharosa investment catalogue नहीं दिखाता. पहले goal, फिर amount, फिर safest instrument. यही customer को समझ आता है."
                en="Bharosa does not start with an investment catalogue. First goal, then amount, then the safest suitable instrument. That is what the customer can act on."
              />
            </p>
          </div>
        </div>

        <Card tone="green" padding="lg" className="space-y-2">
          <div className="text-caption uppercase tracking-wide text-white/70">
            <T hi="Monthly surplus" en="Monthly surplus" />
          </div>
          <Currency amount={ANJALI.monthlySurplusInr} variant="full" language="en-IN" className="text-display font-semibold leading-none text-white" />
          <p className="text-body-sm text-white/80">
            <T hi="4 goals · 1 UPI Autopay · no product push" en="4 goals · 1 UPI Autopay · no product push" />
          </p>
        </Card>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card tone="paper" padding="lg">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-h3 font-semibold text-saathi-ink">
                <T hi="Approve before salary day" en="Approve before salary day" />
              </h2>
              <p className="text-body-sm text-saathi-ink-soft">
                <T
                  hi="Salary credit होते ही Bharosa यह split execute करेगा."
                  en="When salary lands, Bharosa executes this split."
                />
              </p>
            </div>
            <Badge tone="gold">
              <CalendarClock className="h-3 w-3" />
              <T hi="4 दिन बाकी" en="4 days left" />
            </Badge>
          </div>

          <div className="grid gap-3">
            {MONTHLY_SPLIT.map((row) => {
              const goal = GOALS.find((g) => g.id === row.goalId);
              return (
                <div key={row.goalId} className="grid gap-3 rounded-card-sm border border-saathi-paper-edge bg-saathi-paper px-4 py-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-body font-semibold text-saathi-ink">
                        <T hi={row.goal.hi} en={row.goal.en} />
                      </span>
                      <Badge tone="green">
                        <T hi={row.instrument.hi} en={row.instrument.en} />
                      </Badge>
                    </div>
                    <p className="mt-1 text-body-sm text-saathi-ink-soft">
                      <T hi={row.reason.hi} en={row.reason.en} />
                      {goal ? (
                        <span className="sr-only">{goal.name}</span>
                      ) : null}
                    </p>
                  </div>
                  <Currency amount={row.amount} variant="full" language="en-IN" className="text-h3 font-semibold text-saathi-gold" />
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild variant="primary" size="md">
              <Link href="/demo/simulator">
                <T hi="Salary-day flow देखें" en="See salary-day flow" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="md">
              <Link href="/bachat">
                <T hi="Ledger में proof देखें" en="See proof in ledger" />
              </Link>
            </Button>
          </div>
        </Card>

        <Card tone="paper" padding="lg" className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-saathi-deep-green-tint text-saathi-deep-green">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-h3 font-semibold text-saathi-ink">
                <T hi="Trust ladder" en="Trust ladder" />
              </h2>
              <p className="text-body-sm text-saathi-ink-soft">
                <T
                  hi="FD, gold, SSY और PPF को respect करके ही mutual funds तक graduate करते हैं."
                  en="Bharosa respects FD, gold, SSY, and PPF before graduating to mutual funds."
                />
              </p>
            </div>
          </div>
          <div className="space-y-3 text-body-sm">
            <TrustStep icon={ShieldCheck} title={{ hi: "Foundation", en: "Foundation" }} body={{ hi: "Gold, FD, RD — familiar instruments first.", en: "Gold, FD, RD — familiar instruments first." }} />
            <TrustStep icon={CheckCircle2} title={{ hi: "Trusted", en: "Trusted" }} body={{ hi: "SSY, PPF, liquid/debt funds for real goals.", en: "SSY, PPF, liquid/debt funds for real goals." }} />
            <TrustStep icon={Coins} title={{ hi: "Graduated", en: "Graduated" }} body={{ hi: "Equity only when comfort and timeline allow.", en: "Equity only when comfort and timeline allow." }} />
          </div>
        </Card>
      </section>

      <section className="mx-auto w-full max-w-6xl space-y-4">
        <div>
          <h2 className="text-h3 font-semibold text-saathi-ink">
            <T hi="Instrument details, after the plan" en="Instrument details, after the plan" />
          </h2>
          <p className="text-body-sm text-saathi-ink-soft">
            <T
              hi="Catalogue नीचे है ताकि user पहले action समझे, फिर details देखे."
              en="The catalogue sits lower so the user understands the action before the details."
            />
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {INVESTMENT_PRODUCTS.slice(0, 6).map((product) => (
            <Card key={product.instrument} tone="paper" padding="md">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-body font-semibold uppercase tracking-wide text-saathi-ink">
                    {product.instrument.replace(/_/g, " ")}
                  </div>
                  <div className="truncate text-caption text-saathi-ink-quiet">
                    {product.partnerName}
                  </div>
                </div>
                <Badge tone={product.trustRung === "foundation" ? "green" : product.trustRung === "trusted" ? "gold" : "muted"}>
                  {product.trustRung}
                </Badge>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-body-sm">
                <Stat label={{ hi: "Return", en: "Return" }} value={`${formatPercent(product.expectedAnnualReturn, 1)} p.a.`} />
                <Stat label={{ hi: "Liquidity", en: "Liquidity" }} value={`${Math.round(product.liquidity * 100)}%`} />
                <Stat label={{ hi: "Lock-in", en: "Lock-in" }} value={product.lockInYears > 0 ? `${product.lockInYears} yrs` : "0"} />
              </div>
              <p className="mt-3 text-caption text-saathi-ink-soft">
                <T
                  hi={product.vernacularPitch}
                  en={PRODUCT_PITCH_EN[product.instrument] ?? product.vernacularPitch}
                />
              </p>
              <p className="mt-1 text-[11px] text-saathi-ink-quiet">{product.taxNote}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

function TrustStep({
  icon: Icon,
  title,
  body,
}: {
  icon: ElementType;
  title: { hi: string; en: string };
  body: { hi: string; en: string };
}) {
  return (
    <div className="flex items-start gap-3 rounded-card-sm bg-saathi-cream px-3 py-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-saathi-deep-green" />
      <div>
        <div className="font-semibold text-saathi-ink">
          <T hi={title.hi} en={title.en} />
        </div>
        <p className="text-caption text-saathi-ink-soft">
          <T hi={body.hi} en={body.en} />
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: { hi: string; en: string }; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-saathi-ink-quiet">
        <T hi={label.hi} en={label.en} />
      </div>
      <div className="font-medium tabular-nums text-saathi-ink">{value}</div>
    </div>
  );
}
