import { z } from "zod";
import {
  generateText as aiGenerateText,
  generateObject as aiGenerateObject,
  type LanguageModel,
} from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { openai, createOpenAI } from "@ai-sdk/openai";
import { logLLMEvent } from "@/lib/observability/llm-events";

/**
 * Single source for every LLM call. No direct SDK usage anywhere else.
 *
 *  - Auto-detects provider from env (LLM_PROVIDER=auto reads keys in
 *    priority order: anthropic → openai → grok).
 *  - Two tiers: "sonnet" for tone-sensitive flows (intake, planning,
 *    harassment letters), "haiku" for high-volume (scam classification,
 *    intent detection).
 *  - Every call gets logged to `llm_events` with cost in paise + latency.
 */

export type LLMTier = "sonnet" | "haiku";
export type LLMProvider = "anthropic" | "openai" | "grok";
export type LLMFeature =
  | "scam-classify"
  | "scam-explain"
  | "document-extract"
  | "document-audit"
  | "harassment-letter"
  | "intake-conversation"
  | "plan-explain"
  | "family-notify"
  | "intent-detect"
  | "voice-rewrite"
  | "salary-recap"
  | (string & {});

const PROVIDER_MODELS: Record<LLMProvider, Record<LLMTier, string>> = {
  anthropic: {
    sonnet: "claude-sonnet-4-6",
    haiku: "claude-haiku-4-5-20251001",
  },
  openai: {
    sonnet: "gpt-4o-2024-11-20",
    haiku: "gpt-4o-mini",
  },
  grok: {
    sonnet: "grok-4",
    haiku: "grok-4-fast-reasoning",
  },
};

/** Approximate paise per 1k tokens. Refresh when provider pricing shifts. */
const PROVIDER_PRICING: Record<
  LLMProvider,
  Record<LLMTier, { input: number; output: number }>
> = {
  anthropic: {
    sonnet: { input: 24.9, output: 124.5 },
    haiku: { input: 6.64, output: 33.2 },
  },
  openai: {
    sonnet: { input: 20.75, output: 83 },
    haiku: { input: 1.25, output: 4.98 },
  },
  grok: {
    sonnet: { input: 24.9, output: 124.5 },
    haiku: { input: 2.49, output: 4.15 },
  },
};

let grokProviderCache: ReturnType<typeof createOpenAI> | null = null;
function grokProvider() {
  if (!grokProviderCache) {
    grokProviderCache = createOpenAI({
      baseURL: "https://api.x.ai/v1",
      apiKey: process.env.GROK_API_KEY,
    });
  }
  return grokProviderCache;
}

export class MissingLLMCredentialsError extends Error {
  constructor(message?: string) {
    super(
      message ??
        "No LLM provider key configured. Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or GROK_API_KEY in .env.local.",
    );
    this.name = "MissingLLMCredentialsError";
  }
}

export type DetectedProvider = {
  provider: LLMProvider;
  source: "explicit" | "auto";
};

export function detectProvider(): DetectedProvider | null {
  const explicit = process.env.LLM_PROVIDER?.toLowerCase().trim();
  if (explicit && explicit !== "auto") {
    if (explicit === "anthropic" || explicit === "openai" || explicit === "grok") {
      const keyName = `${explicit.toUpperCase()}_API_KEY`;
      if (process.env[keyName]) {
        return { provider: explicit, source: "explicit" };
      }
    }
  }
  if (process.env.ANTHROPIC_API_KEY) return { provider: "anthropic", source: "auto" };
  if (process.env.OPENAI_API_KEY) return { provider: "openai", source: "auto" };
  if (process.env.GROK_API_KEY) return { provider: "grok", source: "auto" };
  return null;
}

export function listAvailableProviders(): LLMProvider[] {
  const out: LLMProvider[] = [];
  if (process.env.ANTHROPIC_API_KEY) out.push("anthropic");
  if (process.env.OPENAI_API_KEY) out.push("openai");
  if (process.env.GROK_API_KEY) out.push("grok");
  return out;
}

function resolveModel(
  tier: LLMTier,
): { provider: LLMProvider; modelId: string; model: LanguageModel } {
  const detected = detectProvider();
  if (!detected) throw new MissingLLMCredentialsError();
  const modelId = PROVIDER_MODELS[detected.provider][tier];
  let model: LanguageModel;
  if (detected.provider === "anthropic") {
    model = anthropic(modelId);
  } else if (detected.provider === "openai") {
    model = openai(modelId);
  } else {
    model = grokProvider()(modelId);
  }
  return { provider: detected.provider, modelId, model };
}

function computeCostPaise(
  provider: LLMProvider,
  tier: LLMTier,
  inputTokens: number,
  outputTokens: number,
): number {
  const rates = PROVIDER_PRICING[provider][tier];
  return Math.round(
    (inputTokens / 1000) * rates.input + (outputTokens / 1000) * rates.output,
  );
}

type CommonArgs = {
  feature: LLMFeature;
  tier?: LLMTier;
  system?: string;
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  userId?: string;
  /** Free-form metadata persisted on the llm_events row. */
  meta?: Record<string, unknown>;
};

export type GenerateTextResult = {
  text: string;
  provider: LLMProvider;
  modelId: string;
  inputTokens: number;
  outputTokens: number;
  costPaise: number;
  latencyMs: number;
};

export async function generateText(args: CommonArgs): Promise<GenerateTextResult> {
  const tier = args.tier ?? "sonnet";
  const { provider, modelId, model } = resolveModel(tier);
  const started = Date.now();
  const result = await aiGenerateText({
    model,
    system: args.system,
    prompt: args.prompt,
    temperature: args.temperature ?? 0.4,
    ...(args.maxOutputTokens ? { maxOutputTokens: args.maxOutputTokens } : {}),
  });
  const latencyMs = Date.now() - started;
  const inputTokens = result.usage.inputTokens ?? 0;
  const outputTokens = result.usage.outputTokens ?? 0;
  const costPaise = computeCostPaise(provider, tier, inputTokens, outputTokens);

  await logLLMEvent({
    feature: args.feature,
    provider,
    modelId,
    tier,
    inputTokens,
    outputTokens,
    costPaise,
    latencyMs,
    userId: args.userId,
    meta: args.meta,
  });

  return { text: result.text, provider, modelId, inputTokens, outputTokens, costPaise, latencyMs };
}

export type GenerateObjectArgs<T extends z.ZodType> = CommonArgs & {
  schema: T;
  schemaName?: string;
  schemaDescription?: string;
};

export type GenerateObjectResult<T> = {
  object: T;
  provider: LLMProvider;
  modelId: string;
  inputTokens: number;
  outputTokens: number;
  costPaise: number;
  latencyMs: number;
};

export async function generateObject<T extends z.ZodType>(
  args: GenerateObjectArgs<T>,
): Promise<GenerateObjectResult<z.infer<T>>> {
  const tier = args.tier ?? "sonnet";
  const { provider, modelId, model } = resolveModel(tier);
  const started = Date.now();
  const result = await aiGenerateObject({
    model,
    schema: args.schema,
    schemaName: args.schemaName,
    schemaDescription: args.schemaDescription,
    system: args.system,
    prompt: args.prompt,
    temperature: args.temperature ?? 0.2,
    ...(args.maxOutputTokens ? { maxOutputTokens: args.maxOutputTokens } : {}),
  });
  const latencyMs = Date.now() - started;
  const inputTokens = result.usage.inputTokens ?? 0;
  const outputTokens = result.usage.outputTokens ?? 0;
  const costPaise = computeCostPaise(provider, tier, inputTokens, outputTokens);

  await logLLMEvent({
    feature: args.feature,
    provider,
    modelId,
    tier,
    inputTokens,
    outputTokens,
    costPaise,
    latencyMs,
    userId: args.userId,
    meta: args.meta,
  });

  return {
    object: result.object as z.infer<T>,
    provider,
    modelId,
    inputTokens,
    outputTokens,
    costPaise,
    latencyMs,
  };
}

export const ROUTER_DEBUG_INFO = {
  models: PROVIDER_MODELS,
  pricing: PROVIDER_PRICING,
};
