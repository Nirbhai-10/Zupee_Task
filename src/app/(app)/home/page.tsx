import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Currency } from "@/components/shared/Currency";
import { ANJALI, GOALS } from "@/lib/mocks/demo-personas";
import { trustLevelLabel } from "@/domain/trust-level";

export const metadata = { title: "Home" };

const SAVINGS_THIS_YEAR = 47_200;
const SCAMS_BLOCKED = 12;
const ULIPS_REFUSED = 1;
const BILLS_FIXED = 3;

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col gap-8 bg-saathi-cream px-6 py-10">
      <header className="mx-auto w-full max-w-5xl space-y-2">
        <Badge tone="green">{trustLevelLabel(ANJALI.trustLevel, "en-IN")}</Badge>
        <h1 className="text-h1 font-semibold tracking-tight text-saathi-ink">
          Suprabhat, {ANJALI.name.split(" ")[0]}
        </h1>
        <p className="text-body-sm text-saathi-ink-quiet">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </header>

      {/* Savings hero */}
      <section className="mx-auto w-full max-w-5xl">
        <Card tone="cream" padding="lg" className="space-y-3">
          <CardHeader>
            <CardDescription>Iss saal humne aapke bachaaye</CardDescription>
            <CardTitle className="!text-display !leading-none text-saathi-gold">
              <Currency amount={SAVINGS_THIS_YEAR} variant="full" language="en-IN" />
            </CardTitle>
            <CardDescription>
              {SCAMS_BLOCKED} scams roke · {ULIPS_REFUSED} ULIP refuse karwaaya · {BILLS_FIXED} bills sahi karwaaye
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* Quick actions */}
      <section className="mx-auto grid w-full max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction
          href="/demo/simulator"
          icon={ShieldCheck}
          label="Run a scam check"
          subLabel="Mummy ke phone par koi message? Forward kijiye."
        />
        <QuickAction
          href="/demo/simulator"
          icon={Sparkles}
          label="Document audit"
          subLabel="Brochure ki photo bhejiye, real cost dekhiye."
        />
        <QuickAction
          href="/demo/simulator"
          icon={Wallet}
          label="Plan banwayein"
          subLabel="Goals daliye, monthly mandate ban jayega."
        />
        <QuickAction
          href="/family"
          icon={ArrowUpRight}
          label="Family jodein"
          subLabel="Mummy, pati, bhai — sab safe."
        />
      </section>

      {/* Two-up: latest defense + salary day */}
      <section className="mx-auto grid w-full max-w-5xl gap-4 lg:grid-cols-2">
        <Card tone="paper" padding="md">
          <CardHeader>
            <Badge tone="scam">SCAM · KBC lottery</Badge>
            <CardTitle>Mummy ko abhi pakad liya</CardTitle>
            <CardDescription>1 ghanta pehle · WhatsApp forward → Bharosa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-body-sm text-saathi-ink-soft">
            <p>
              {`"Mubarak ho, KBC lottery mein 25,00,000 jeete hain… +92"`} — fake. Humne rok diya.
              Bachat:{" "}
              <Currency amount={8500} variant="full" language="en-IN" className="font-semibold text-saathi-gold" />.
            </p>
            <Link href="/defenses" className="text-body-sm text-saathi-deep-green hover:underline">
              Saari defenses dekhein →
            </Link>
          </CardContent>
        </Card>

        <Card tone="green" padding="md">
          <CardHeader>
            <Badge tone="gold">Salary day</Badge>
            <CardTitle className="text-white">4 din baaki</CardTitle>
            <CardDescription className="text-white/80">
              ₹5,500 6 instruments mein split hoga — auto-execute on salary credit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-body-sm text-white/85">
            <p>
              Mummy medical (₹2,200), coaching (₹1,900), Priya shaadi (₹800), Diwali (₹500).
            </p>
            <Button asChild variant="gold" size="sm">
              <Link href="/demo/simulator">Plan review karein</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Goals overview */}
      <section className="mx-auto w-full max-w-5xl space-y-3">
        <div className="flex items-end justify-between">
          <h2 className="text-h3 font-semibold text-saathi-ink">Aapke goals</h2>
          <Link href="/goals" className="text-body-sm text-saathi-deep-green hover:underline">
            Saare goals dekhein →
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {GOALS.slice(0, 4).map((g) => (
            <Card key={g.id} tone="paper" padding="md">
              <div className="flex items-baseline justify-between">
                <h3 className="text-body font-semibold text-saathi-ink">{g.name}</h3>
                <Currency
                  amount={g.targetInr}
                  variant="compact"
                  language="hi-IN"
                  className="text-body font-semibold text-saathi-gold"
                />
              </div>
              <p className="mt-1 text-caption text-saathi-ink-soft">{g.rationale}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-pill bg-saathi-paper-edge">
                <div
                  className="h-full rounded-pill bg-saathi-deep-green"
                  style={{ width: `${(g.priority === 1 ? 18 : g.priority === 2 ? 12 : 6)}%` }}
                />
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  subLabel,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  subLabel: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 rounded-card border border-saathi-paper-edge bg-saathi-paper p-4 shadow-soft transition-shadow hover:shadow-card"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-pill bg-saathi-deep-green-tint text-saathi-deep-green transition-colors group-hover:bg-saathi-deep-green group-hover:text-white">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-body font-medium text-saathi-ink">{label}</div>
        <div className="text-caption text-saathi-ink-soft">{subLabel}</div>
      </div>
    </Link>
  );
}
