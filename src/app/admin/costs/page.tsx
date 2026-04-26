import { Cpu, IndianRupee, Timer, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { T } from "@/components/shared/T";
import { getSupabaseDemoClient } from "@/lib/db/server-anon";

export const metadata = { title: "Admin · Costs" };
export const dynamic = "force-dynamic";

type LlmEventRow = {
  id: string;
  feature: string;
  provider: string;
  model_id: string;
  tier: string;
  input_tokens: number;
  output_tokens: number;
  cost_paise: number;
  latency_ms: number;
  created_at: string;
};

async function fetchEvents(): Promise<LlmEventRow[]> {
  const supabase = getSupabaseDemoClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("llm_events")
    .select("id, feature, provider, model_id, tier, input_tokens, output_tokens, cost_paise, latency_ms, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return [];
  return (data ?? []) as unknown as LlmEventRow[];
}

export default async function CostsAdminPage() {
  const events = await fetchEvents();
  const totalPaise = events.reduce((sum, e) => sum + (e.cost_paise ?? 0), 0);
  const totalIn = events.reduce((sum, e) => sum + (e.input_tokens ?? 0), 0);
  const totalOut = events.reduce((sum, e) => sum + (e.output_tokens ?? 0), 0);
  const avgLatency = events.length > 0 ? Math.round(events.reduce((s, e) => s + e.latency_ms, 0) / events.length) : 0;

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10">
      <header className="mx-auto w-full max-w-5xl space-y-3">
        <Badge tone="green">
          <T hi="कॉस्ट डैशबोर्ड" en="Cost dashboard" />
        </Badge>
        <h1 className="text-h1 font-semibold tracking-tight text-saathi-ink">
          <T hi="LLM के events" en="LLM events" />
        </h1>
        <p className="text-body-lg text-saathi-ink-soft">
          <T
            hi="हर scam classifier, audit, plan call यहाँ log होती है — feature, model, tokens, latency, cost।"
            en="Every scam classifier, audit, and plan call lands here — feature, model, tokens, latency, cost."
          />
        </p>
      </header>

      <section className="mx-auto grid w-full max-w-5xl gap-3 sm:grid-cols-4">
        <Stat icon={Wand2} label={{ hi: "कुल calls", en: "Total calls" }} value={String(events.length)} />
        <Stat
          icon={IndianRupee}
          label={{ hi: "कुल खर्च", en: "Total spend" }}
          value={totalPaise === 0 ? "₹0 (local)" : `₹${(totalPaise / 100).toFixed(2)}`}
        />
        <Stat icon={Cpu} label={{ hi: "Tokens (in/out)", en: "Tokens (in/out)" }} value={`${formatTokens(totalIn)} / ${formatTokens(totalOut)}`} />
        <Stat icon={Timer} label={{ hi: "औसत latency", en: "Avg latency" }} value={`${avgLatency} ms`} />
      </section>

      <section className="mx-auto w-full max-w-5xl">
        <Card tone="paper" padding="none">
          <CardContent className="!mt-0">
            {events.length === 0 ? (
              <div className="px-5 py-10 text-center text-body-sm text-saathi-ink-soft">
                <T
                  hi="अभी कोई LLM event log नहीं हुआ। सिमुलेटर पर एक trigger चलाइए — service-role key set होते ही entries यहाँ दिखेंगी।"
                  en="No LLM events logged yet. Run a trigger from the simulator — entries will appear here once the service-role key is set."
                />
              </div>
            ) : (
              <table className="w-full text-body-sm">
                <thead>
                  <tr className="border-b border-saathi-paper-edge text-caption uppercase tracking-wide text-saathi-ink-quiet">
                    <th className="px-4 py-3 text-left">
                      <T hi="समय" en="Time" />
                    </th>
                    <th className="px-4 py-3 text-left">
                      <T hi="Feature" en="Feature" />
                    </th>
                    <th className="px-4 py-3 text-left">
                      <T hi="Model" en="Model" />
                    </th>
                    <th className="px-4 py-3 text-right">
                      <T hi="Tokens" en="Tokens" />
                    </th>
                    <th className="px-4 py-3 text-right">
                      <T hi="Latency" en="Latency" />
                    </th>
                    <th className="px-4 py-3 text-right">
                      <T hi="Cost" en="Cost" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-saathi-paper-edge">
                  {events.map((ev) => (
                    <tr key={ev.id}>
                      <td className="px-4 py-3 font-mono text-caption tabular-nums text-saathi-ink-quiet">
                        {new Date(ev.created_at).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
                      </td>
                      <td className="px-4 py-3 text-saathi-ink">{ev.feature}</td>
                      <td className="px-4 py-3 text-saathi-ink-soft">
                        <span className="font-mono text-caption">{ev.provider}/{ev.tier}</span>
                        <div className="text-[10px] text-saathi-ink-quiet">{ev.model_id}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">
                        {formatTokens(ev.input_tokens)}/{formatTokens(ev.output_tokens)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-saathi-ink-soft">
                        {ev.latency_ms} ms
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">
                        {ev.cost_paise === 0 ? "₹0" : `₹${(ev.cost_paise / 100).toFixed(2)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: { hi: string; en: string };
  value: string;
}) {
  return (
    <Card tone="paper" padding="md">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-pill bg-saathi-deep-green-tint text-saathi-deep-green">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-caption uppercase tracking-wide text-saathi-ink-quiet">
            <T hi={label.hi} en={label.en} />
          </div>
          <div className="text-body font-mono tabular-nums text-saathi-ink truncate">{value}</div>
        </div>
      </div>
    </Card>
  );
}

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
