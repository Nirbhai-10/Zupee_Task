import Link from "next/link";
import type { ElementType } from "react";
import { Banknote, Database, FileSearch, Lock, ShieldCheck, TrendingUp, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Currency } from "@/components/shared/Currency";
import { T } from "@/components/shared/T";
import { ANJALI, GOALS } from "@/lib/mocks/demo-personas";
import { trustLevelLabel } from "@/domain/trust-level";
import { getVaultStreak } from "@/domain/vault/store";

export const metadata = { title: "Home" };

const SAVINGS_THIS_YEAR = 47_200;
const SCAMS_BLOCKED = 12;
const ULIPS_REFUSED = 1;
const BILLS_FIXED = 3;

export default async function HomePage() {
  const vaultStreak = await getVaultStreak();
  const today = new Date();
  return (
    <main className="flex flex-1 flex-col gap-8 bg-saathi-cream px-6 py-10">
      <header className="mx-auto w-full max-w-5xl space-y-2">
        <Badge tone="green">{trustLevelLabel(ANJALI.trustLevel, "en-IN")}</Badge>
        <h1 className="text-h1 font-semibold tracking-tight text-saathi-ink">
          <T
            hi={`सुप्रभात, ${ANJALI.name.split(" ")[0]}`}
            en={`Good morning, ${ANJALI.name.split(" ")[0]}`}
          />
        </h1>
        <p className="text-body-sm text-saathi-ink-quiet">
          {today.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </header>

      {/* Savings hero */}
      <section className="mx-auto w-full max-w-5xl">
        <Card tone="cream" padding="lg" className="space-y-3">
          <CardHeader>
            <CardDescription>
              <T hi="इस साल हमने आपके बचाए" en="We've saved you this year" />
            </CardDescription>
            <CardTitle className="!text-display !leading-none text-saathi-gold">
              <Currency amount={SAVINGS_THIS_YEAR} variant="full" language="en-IN" />
            </CardTitle>
            <CardDescription>
              <T
                hi={`${SCAMS_BLOCKED} scams रोके · ${ULIPS_REFUSED} ULIP refuse करवाया · ${BILLS_FIXED} bills सही करवाए`}
                en={`${SCAMS_BLOCKED} scams blocked · ${ULIPS_REFUSED} ULIP refused · ${BILLS_FIXED} bills corrected`}
              />
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="mx-auto w-full max-w-5xl">
        <div className="grid gap-4 lg:grid-cols-3">
          <MoatCard
            icon={ShieldCheck}
            title={{ hi: "पहले risk रोकता है", en: "Stops risk first" }}
            body={{
              hi: "Scams, ULIPs, recovery calls और wrong bills — हर incident evidence के साथ record होता है।",
              en: "Scams, ULIPs, recovery calls, and wrong bills are handled with evidence, not vague advice.",
            }}
          />
          <MoatCard
            icon={TrendingUp}
            title={{ hi: "फिर पैसा move करता है", en: "Then moves money" }}
            body={{
              hi: "Salary day पर goals में split: medical, education, wedding, festival fund — UPI Autopay ready.",
              en: "On salary day it splits money into real goals: medical, education, wedding, festival fund.",
            }}
          />
          <MoatCard
            icon={Database}
            title={{ hi: "History moat बनती है", en: "Builds a history moat" }}
            body={{
              hi: "हर बचाया हुआ rupee, blocked scam और goal transfer future advice को ज्यादा personal बनाता है।",
              en: "Every saved rupee, blocked scam, and goal transfer makes future advice more personal.",
            }}
          />
        </div>
      </section>

      {/* Quick actions */}
      <section className="mx-auto grid w-full max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction
          href="/demo/simulator"
          icon={ShieldCheck}
          label={{ hi: "Scam check चलाइए", en: "Run a scam check" }}
          subLabel={{
            hi: "मम्मी के फ़ोन पर कोई message? Forward कीजिए।",
            en: "Got a suspicious message? Forward it for an instant check.",
          }}
        />
        <QuickAction
          href="/demo/simulator"
          icon={FileSearch}
          label={{ hi: "Document audit", en: "Document audit" }}
          subLabel={{
            hi: "Brochure की photo भेजिए, real cost देखिए।",
            en: "Send a brochure photo, see the real cost.",
          }}
        />
        <QuickAction
          href="/demo/simulator"
          icon={Wallet}
          label={{ hi: "Plan banwayein", en: "Build a plan" }}
          subLabel={{
            hi: "Goals डालिए, monthly mandate बन जाएगा।",
            en: "Add goals, generate a monthly mandate.",
          }}
        />
        <QuickAction
          href="/demo/simulator"
          icon={Banknote}
          label={{ hi: "Salary day देखें", en: "See salary day" }}
          subLabel={{
            hi: "Monthly money goals में अपने आप split होता है।",
            en: "Monthly money is split into goals automatically.",
          }}
        />
      </section>

      {/* Two-up: latest defense + salary day */}
      <section className="mx-auto grid w-full max-w-5xl gap-4 lg:grid-cols-2">
        <Card tone="paper" padding="md">
          <CardHeader>
            <Badge tone="scam">SCAM · KBC lottery</Badge>
            <CardTitle>
              <T hi="मम्मी को अभी पकड़ लिया" en="Caught one for Mummy a moment ago" />
            </CardTitle>
            <CardDescription>
              <T hi="1 घंटा पहले · WhatsApp forward → Bharosa" en="1 hour ago · WhatsApp forward → Bharosa" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-body-sm text-saathi-ink-soft">
            <p>
              <T
                hi={`"Mubarak ho, KBC lottery mein 25,00,000 jeete hain… +92" — fake. हमने रोक दिया। बचत: `}
                en={`"You won ₹25 lakh in the KBC lottery… +92" — fake. Blocked. Saved: `}
              />
              <Currency amount={8500} variant="full" language="en-IN" className="font-semibold text-saathi-gold" />.
            </p>
            <Link href="/defenses" className="text-body-sm text-saathi-deep-green hover:underline">
              <T hi="सारी defenses देखें →" en="See all defenses →" />
            </Link>
          </CardContent>
        </Card>

        <Card tone="green" padding="md">
          <CardHeader>
            <Badge tone="gold">
              <T hi="Salary day" en="Salary day" />
            </Badge>
            <CardTitle className="text-white">
              <T hi="4 दिन बाक़ी" en="4 days to go" />
            </CardTitle>
            <CardDescription className="text-white/85">
              <T
                hi="₹5,500, 4 instruments में split — auto-execute on salary credit।"
                en="₹5,500 split across 4 instruments — auto-executes on salary credit."
              />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-body-sm text-white/85">
            <p>
              <T
                hi="मम्मी का medical (₹2,200), Aarav coaching (₹1,900), Priya शादी (₹800), Diwali (₹500)."
                en="Mother's medical (₹2,200), Aarav's coaching (₹1,900), Priya's wedding (₹800), Diwali (₹500)."
              />
            </p>
            <Button asChild variant="gold" size="sm">
              <Link href="/demo/simulator">
                <T hi="Plan review करें" en="Review the plan" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Goals overview */}
      <section className="mx-auto w-full max-w-5xl space-y-3">
        <div className="flex items-end justify-between">
          <h2 className="text-h3 font-semibold text-saathi-ink">
            <T hi="आपके goals" en="Your goals" />
          </h2>
          <Link href="/goals" className="text-body-sm text-saathi-deep-green hover:underline">
            <T hi="सारे goals देखें →" en="See all goals →" />
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {GOALS.slice(0, 4).map((g) => {
            const pct = g.priority === 1 ? 18 : g.priority === 2 ? 12 : 6;
            return (
              <Link
                key={g.id}
                href={`/goals/${g.id}`}
                className="group block rounded-card transition-transform hover:-translate-y-0.5"
              >
                <Card
                  tone="paper"
                  padding="md"
                  className="h-full transition-shadow group-hover:shadow-card"
                >
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
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-pill bg-saathi-paper-edge">
                      <div
                        className="h-full rounded-pill bg-saathi-deep-green transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] tabular-nums text-saathi-ink-quiet">
                      {pct}%
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl">
        <Link href="/vault" className="group block">
          <Card
            tone="paper"
            padding="md"
            className="border-saathi-paper-edge bg-saathi-paper/80 transition-all group-hover:-translate-y-0.5 group-hover:shadow-card"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-saathi-cream text-saathi-gold">
                  <Lock className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-body font-semibold text-saathi-ink">
                    <T
                      hi={`${vaultStreak.currentStreak} दिन का private money journal`}
                      en={`${vaultStreak.currentStreak}-day private money journal`}
                    />
                  </div>
                  <div className="text-caption text-saathi-ink-soft">
                    <T
                      hi={`Quiet layer · रात ${vaultStreak.eveningQuestionTime} · optional, private, encrypted`}
                      en={`Quiet layer · ${vaultStreak.eveningQuestionTime} · optional, private, encrypted`}
                    />
                  </div>
                </div>
              </div>
              <span className="text-caption font-medium text-saathi-gold">
                <T hi="Vault खोलें →" en="Open Vault →" />
              </span>
            </div>
          </Card>
        </Link>
      </section>
    </main>
  );
}

function MoatCard({
  icon: Icon,
  title,
  body,
}: {
  icon: ElementType;
  title: { hi: string; en: string };
  body: { hi: string; en: string };
}) {
  return (
    <Card tone="paper" padding="md" className="h-full">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-saathi-deep-green-tint text-saathi-deep-green">
          <Icon className="h-5 w-5" />
        </span>
        <div className="space-y-1">
          <h2 className="text-body font-semibold text-saathi-ink">
            <T hi={title.hi} en={title.en} />
          </h2>
          <p className="text-body-sm text-saathi-ink-soft">
            <T hi={body.hi} en={body.en} />
          </p>
        </div>
      </div>
    </Card>
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
  label: { hi: string; en: string };
  subLabel: { hi: string; en: string };
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 rounded-card border border-saathi-paper-edge bg-saathi-paper p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-saathi-deep-green/30 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saathi-deep-green/30 focus-visible:ring-offset-2 focus-visible:ring-offset-saathi-cream"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-pill bg-saathi-deep-green-tint text-saathi-deep-green transition-colors group-hover:bg-saathi-deep-green group-hover:text-white">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <T as="div" hi={label.hi} en={label.en} className="text-body font-medium text-saathi-ink" />
        <T as="div" hi={subLabel.hi} en={subLabel.en} className="text-caption text-saathi-ink-soft" />
      </div>
    </Link>
  );
}
