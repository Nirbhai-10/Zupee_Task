import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Currency } from "@/components/shared/Currency";
import { FamilyMemberCard } from "@/components/family/FamilyMemberCard";
import { ANJALI, FAMILY } from "@/lib/mocks/demo-personas";

export const metadata = { title: "Family" };

const MONEY_FLOWS = [
  { from: "Husband (Dubai)", to: "Anjali", monthlyInr: 40_000, label: "Remittance" },
  { from: "Anjali", to: "Mother-in-law", monthlyInr: 5_000, label: "Mummy ka kharcha" },
  { from: "Anjali", to: "Brother", monthlyInr: 3_000, label: "Vikas college fees" },
];

export default function FamilyPage() {
  return (
    <main className="flex flex-1 flex-col gap-8 bg-saathi-cream px-6 py-10">
      <header className="mx-auto w-full max-w-5xl space-y-4">
        <Badge tone="green">Family</Badge>
        <h1 className="text-h1 font-semibold tracking-tight text-saathi-ink">
          Aapki family — {FAMILY.length} members
        </h1>
        <p className="text-body-lg text-saathi-ink-soft">
          Har member ko alag visibility milti hai. Aap control karti hain. Bharosa sirf
          information forward karta hai jo aap allow karein.
        </p>
        <div className="flex gap-2">
          <Button asChild variant="primary" size="sm">
            <Link href="/demo/simulator">Live simulator</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/home">Dashboard</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto w-full max-w-5xl space-y-3">
        <h2 className="text-h3 font-semibold text-saathi-ink">{ANJALI.name} (you)</h2>
        <Card tone="green" padding="md">
          <CardContent className="!mt-0 space-y-2">
            <div className="text-body-lg text-white/95">
              {ANJALI.occupation} · {ANJALI.city}
            </div>
            <div className="grid gap-3 sm:grid-cols-3 text-white/80 text-body-sm">
              <div>
                <div className="text-caption uppercase tracking-wide opacity-80">Income / mo</div>
                <Currency amount={ANJALI.monthlyIncomeInr} variant="compact" language="en-IN" className="block text-h3 font-semibold text-saathi-gold" />
              </div>
              <div>
                <div className="text-caption uppercase tracking-wide opacity-80">Remittance / mo</div>
                <Currency amount={ANJALI.monthlyRemittanceInr ?? 0} variant="compact" language="en-IN" className="block text-h3 font-semibold text-saathi-gold" />
              </div>
              <div>
                <div className="text-caption uppercase tracking-wide opacity-80">Surplus / mo</div>
                <Currency amount={ANJALI.monthlySurplusInr} variant="compact" language="en-IN" className="block text-h3 font-semibold text-saathi-gold" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto w-full max-w-5xl space-y-3">
        <h2 className="text-h3 font-semibold text-saathi-ink">Members</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FAMILY.map((member) => (
            <FamilyMemberCard key={member.id} member={member} />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl space-y-3">
        <h2 className="text-h3 font-semibold text-saathi-ink">Money flows</h2>
        <Card tone="paper" padding="md">
          <CardContent className="!mt-0 divide-y divide-saathi-paper-edge">
            {MONEY_FLOWS.map((flow) => (
              <div key={`${flow.from}-${flow.to}`} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <div className="text-body font-medium text-saathi-ink">
                    {flow.from} → {flow.to}
                  </div>
                  <div className="text-caption text-saathi-ink-quiet">{flow.label}</div>
                </div>
                <Currency
                  amount={flow.monthlyInr}
                  variant="full"
                  language="en-IN"
                  className="text-body font-semibold text-saathi-deep-green"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
