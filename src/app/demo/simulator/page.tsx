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
 * /demo/simulator — three live phones, presenter trigger, scam classifier.
 * Click any of the four trigger buttons to play a scripted sequence
 * against the live LLM (Gemma 4 8B local) and Sarvam voice.
 */
export default function SimulatorPage() {
  return (
    <main className="flex flex-1 flex-col bg-saathi-cream-deep">
      <div className="border-b border-saathi-paper-edge bg-saathi-paper px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <Badge tone="green">
              <T hi="लाइव डेमो" en="Live demo" />
            </Badge>
            <h1 className="text-h3 font-semibold tracking-tight text-saathi-ink">
              <T hi="WhatsApp सिमुलेटर" en="WhatsApp simulator" />
            </h1>
            <p className="text-body-sm text-saathi-ink-soft">
              <T
                hi="तीन phones, चार trigger buttons। LLM + voice आपके device पर local चल रहा है।"
                en="Three phones, four trigger buttons. LLM + voice run locally on your machine."
              />
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill className="hidden lg:inline-flex" />
            <LanguageToggle />
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <T hi="Home" en="Home" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/defenses">
                <T hi="Defenses feed" en="Defenses feed" />
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
