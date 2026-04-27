import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SimulatorProvider } from "@/components/whatsapp-simulator/SimulatorProvider";
import { SimulatorStage } from "@/components/whatsapp-simulator/SimulatorStage";
import { SimulatorActivityPane } from "@/components/whatsapp-simulator/SimulatorActivityPane";
import { TriggerPanel } from "@/components/whatsapp-simulator/TriggerPanel";
import { T } from "@/components/shared/T";
import { StatusPill } from "@/components/shared/StatusPill";
import { LanguageToggle } from "@/components/shared/LanguageToggle";

export const metadata = {
  title: "Simulator",
};

/**
 * /demo/simulator — guided WhatsApp-style proof flow.
 * The default path shows scam protection, policy truth, and salary-day execution.
 */
export default function SimulatorPage() {
  return (
    <main className="flex flex-1 flex-col bg-saathi-cream-deep">
      <div className="border-b border-saathi-paper-edge bg-saathi-paper/95 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-1.5">
            <Badge tone="green">
              <T hi="लाइव डेमो" en="Live demo" />
            </Badge>
            <h1 className="text-h3 font-semibold tracking-tight text-saathi-ink">
              <T hi="WhatsApp सिमुलेटर" en="WhatsApp simulator" />
            </h1>
            <p className="text-body-sm text-saathi-ink-soft">
              <T
                hi="एक guided flow में Bharosa का customer value दिखता है: risk रोकना, product truth, salary split."
                en="One guided flow shows Bharosa's customer value: stop risk, reveal product truth, split salary."
              />
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <StatusPill className="hidden lg:inline-flex" />
            <LanguageToggle />
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <T hi="Home" en="Home" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/bachat">
                <T hi="Bachat Ledger" en="Bachat Ledger" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/demo/presenter">
                <T hi="Presenter" en="Presenter" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <SimulatorProvider>
          <div className="mx-auto max-w-[1200px] space-y-8">
            <TriggerPanel />
            <SimulatorStage />
            <SimulatorActivityPane />
          </div>
        </SimulatorProvider>
      </div>
    </main>
  );
}
