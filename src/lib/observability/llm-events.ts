import { getSupabaseAdminClient } from "@/lib/db/supabase";

export type LLMEventInput = {
  feature: string;
  provider: string;
  modelId: string;
  tier: string;
  inputTokens: number;
  outputTokens: number;
  costPaise: number;
  latencyMs: number;
  userId?: string;
  meta?: Record<string, unknown>;
};

/**
 * Persists a single LLM call to `llm_events`. If Supabase isn't
 * configured, the event still prints to the dev console so we can audit
 * cost during local development.
 */
export async function logLLMEvent(event: LLMEventInput): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    console.info(
      `[llm] ${event.feature} · ${event.provider}/${event.tier} · in=${event.inputTokens} out=${event.outputTokens} · ${(
        event.costPaise / 100
      ).toFixed(2)}₹ · ${event.latencyMs}ms`,
    );
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) return; // Mock mode: stay silent (already logged above).

  const { error } = await supabase.from("llm_events").insert({
    feature: event.feature,
    provider: event.provider,
    model_id: event.modelId,
    tier: event.tier,
    input_tokens: event.inputTokens,
    output_tokens: event.outputTokens,
    cost_paise: event.costPaise,
    latency_ms: event.latencyMs,
    user_id: event.userId ?? null,
    meta: event.meta ?? null,
  });

  if (error && process.env.NODE_ENV === "development") {
    console.warn("[llm-events] failed to persist:", error.message);
  }
}
