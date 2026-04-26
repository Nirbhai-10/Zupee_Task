import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SimulatorProvider } from "@/components/whatsapp-simulator/SimulatorProvider";
import { SimulatorStage } from "@/components/whatsapp-simulator/SimulatorStage";
import { TriggerPanel } from "@/components/whatsapp-simulator/TriggerPanel";

export const metadata = {
  title: "Simulator",
};

/**
 * /demo/simulator — three live phones, presenter trigger, scam classifier.
 * Default demo flow on Day 2: click "KBC scam → Mummy" and watch the
 * MIL phone receive a scam, forward to Saathi, get a Hindi voice reply.
 */
export default function SimulatorPage() {
  return (
    <main className="flex flex-1 flex-col bg-saathi-cream-deep">
      <div className="border-b border-saathi-paper-edge bg-saathi-paper px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <Badge tone="green">Day 2 · Live</Badge>
            <h1 className="text-h3 font-semibold tracking-tight text-saathi-ink">
              WhatsApp simulator
            </h1>
            <p className="text-body-sm text-saathi-ink-soft">
              Three faithful phones. Real classifier (or mock heuristic if no LLM key). Hindi
              voice replies.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">Home</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/defenses">Defenses feed</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/demo/presenter">Presenter panel</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <SimulatorProvider>
          <div className="mx-auto max-w-[1200px] space-y-6">
            <TriggerPanel />
            <SimulatorStage />
          </div>
        </SimulatorProvider>
      </div>
    </main>
  );
}
