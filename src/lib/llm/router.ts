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
export type LLMProvider = "sarvam" | "anthropic" | "openai" | "grok" | "ollama";
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

function ollamaModelId(): string {
  return process.env.OLLAMA_MODEL ?? "gemma4:e4b";
}

function sarvamModelId(): string {
  return process.env.SARVAM_MODEL ?? "sarvam-m";
}

const PROVIDER_MODELS: Record<LLMProvider, Record<LLMTier, string>> = {
  sarvam: {
    // Sarvam-M is currently the single chat model. Per-tier overrides
    // (`SARVAM_MODEL_SONNET` / `SARVAM_MODEL_HAIKU`) are honoured if Sarvam
    // ships additional models later.
    get sonnet() { return process.env.SARVAM_MODEL_SONNET ?? sarvamModelId(); },
    get haiku() { return process.env.SARVAM_MODEL_HAIKU ?? sarvamModelId(); },
  },
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
  ollama: {
    // Single local model for both tiers — `OLLAMA_MODEL` overrides per-tier
    // (`OLLAMA_MODEL_SONNET` / `OLLAMA_MODEL_HAIKU`) once we have multiple
    // local models worth swapping between.
    get sonnet() { return process.env.OLLAMA_MODEL_SONNET ?? ollamaModelId(); },
    get haiku() { return process.env.OLLAMA_MODEL_HAIKU ?? ollamaModelId(); },
  },
};

/** Approximate paise per 1k tokens. Refresh when provider pricing shifts.
 *  Ollama is local → 0. */
const PROVIDER_PRICING: Record<
  LLMProvider,
  Record<LLMTier, { input: number; output: number }>
> = {
  sarvam: {
    // Sarvam-M public pricing: ~₹2.5 per 1k input, ~₹10 per 1k output (paise).
    // These are conservative placeholders until Sarvam publishes a stable
    // pricing card; refresh when their billing dashboard locks numbers.
    sonnet: { input: 2.5, output: 10 },
    haiku: { input: 2.5, output: 10 },
  },
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
  ollama: {
    sonnet: { input: 0, output: 0 },
    haiku: { input: 0, output: 0 },
  },
};

let sarvamProviderCache: ReturnType<typeof createOpenAI> | null = null;
function sarvamProvider() {
  if (!sarvamProviderCache) {
    sarvamProviderCache = createOpenAI({
      baseURL: process.env.SARVAM_BASE_URL ?? "https://api.sarvam.ai/v1",
      apiKey: process.env.SARVAM_API_KEY,
    });
  }
  return sarvamProviderCache;
}

function sarvamConfigured(): boolean {
  return Boolean(process.env.SARVAM_API_KEY);
}

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

let ollamaProviderCache: ReturnType<typeof createOpenAI> | null = null;
function ollamaProvider() {
  if (!ollamaProviderCache) {
    ollamaProviderCache = createOpenAI({
      baseURL: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
      apiKey: process.env.OLLAMA_API_KEY ?? "ollama",
    });
  }
  return ollamaProviderCache;
}

/** Local Ollama is opted into either by setting LLM_PROVIDER=ollama or
 *  by setting OLLAMA_BASE_URL. We don't auto-discover by pinging localhost
 *  on every request — that would slow the cold path and make tests flaky. */
function ollamaConfigured(): boolean {
  return (
    process.env.LLM_PROVIDER?.toLowerCase().trim() === "ollama" ||
    Boolean(process.env.OLLAMA_BASE_URL)
  );
}

export class MissingLLMCredentialsError extends Error {
  constructor(message?: string) {
    super(
      message ??
        "No LLM provider key configured. Set SARVAM_API_KEY (preferred), ANTHROPIC_API_KEY, OPENAI_API_KEY, GROK_API_KEY, or OLLAMA_BASE_URL in .env.local.",
    );
    this.name = "MissingLLMCredentialsError";
  }
}

export class LLMTimeoutError extends Error {
  constructor(feature: LLMFeature, ms: number) {
    super(`LLM call for ${feature} timed out after ${ms}ms.`);
    this.name = "LLMTimeoutError";
  }
}

export type DetectedProvider = {
  provider: LLMProvider;
  source: "explicit" | "auto";
};

export function detectProvider(): DetectedProvider | null {
  const explicit = process.env.LLM_PROVIDER?.toLowerCase().trim();
  if (explicit && explicit !== "auto") {
    if (explicit === "ollama") {
      return { provider: "ollama", source: "explicit" };
    }
    if (explicit === "sarvam") {
      if (sarvamConfigured()) return { provider: "sarvam", source: "explicit" };
    }
    if (explicit === "anthropic" || explicit === "openai" || explicit === "grok") {
      const keyName = `${explicit.toUpperCase()}_API_KEY`;
      if (process.env[keyName]) {
        return { provider: explicit, source: "explicit" };
      }
    }
  }
  // Auto-priority: Sarvam first (Bharat-native intelligence), then cloud, then local.
  if (sarvamConfigured()) return { provider: "sarvam", source: "auto" };
  if (process.env.ANTHROPIC_API_KEY) return { provider: "anthropic", source: "auto" };
  if (process.env.OPENAI_API_KEY) return { provider: "openai", source: "auto" };
  if (process.env.GROK_API_KEY) return { provider: "grok", source: "auto" };
  if (ollamaConfigured()) return { provider: "ollama", source: "auto" };
  return null;
}

export function listAvailableProviders(): LLMProvider[] {
  const out: LLMProvider[] = [];
  if (sarvamConfigured()) out.push("sarvam");
  if (process.env.ANTHROPIC_API_KEY) out.push("anthropic");
  if (process.env.OPENAI_API_KEY) out.push("openai");
  if (process.env.GROK_API_KEY) out.push("grok");
  if (ollamaConfigured()) out.push("ollama");
  return out;
}

function resolveModel(
  tier: LLMTier,
): { provider: LLMProvider; modelId: string; model: LanguageModel } {
  const detected = detectProvider();
  if (!detected) throw new MissingLLMCredentialsError();
  const modelId = PROVIDER_MODELS[detected.provider][tier];
  let model: LanguageModel;
  if (detected.provider === "sarvam") {
    // Sarvam exposes chat-completions only (no OpenAI Responses API).
    model = sarvamProvider().chat(modelId);
  } else if (detected.provider === "anthropic") {
    model = anthropic(modelId);
  } else if (detected.provider === "openai") {
    model = openai(modelId);
  } else if (detected.provider === "grok") {
    // Grok speaks chat-completions — bypass the Responses API.
    model = grokProvider().chat(modelId);
  } else {
    // Ollama exposes chat-completions only.
    model = ollamaProvider().chat(modelId);
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
  const result = await withLLMTimeout(
    aiGenerateText({
      model,
      system: args.system,
      prompt: args.prompt,
      temperature: args.temperature ?? 0.4,
      ...(args.maxOutputTokens ? { maxOutputTokens: args.maxOutputTokens } : {}),
    }),
    args.feature,
    provider,
  );
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

  // Smaller / non-tool-calling models don't produce reliable tool calls,
  // which is what aiGenerateObject defaults to. Use a JSON-via-text path
  // for Ollama and Sarvam: append the schema to the prompt, ask for
  // JSON-only output, parse + Zod-validate. One retry on parse failure with
  // a stricter prompt.
  if (provider === "ollama" || provider === "sarvam") {
    return generateObjectViaJsonText(args, { provider, modelId, model, tier });
  }

  const started = Date.now();
  const result = await withLLMTimeout(
    aiGenerateObject({
      model,
      schema: args.schema,
      schemaName: args.schemaName,
      schemaDescription: args.schemaDescription,
      system: args.system,
      prompt: args.prompt,
      temperature: args.temperature ?? 0.2,
      ...(args.maxOutputTokens ? { maxOutputTokens: args.maxOutputTokens } : {}),
    }),
    args.feature,
    provider,
  );
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

export class LLMOutputParseError extends Error {
  constructor(
    message: string,
    public readonly rawText: string,
  ) {
    super(message);
    this.name = "LLMOutputParseError";
  }
}

export function isRecoverableLLMError(error: unknown): boolean {
  return (
    error instanceof MissingLLMCredentialsError ||
    error instanceof LLMTimeoutError ||
    error instanceof LLMOutputParseError ||
    (error instanceof Error && error.name === "LLMOutputParseError")
  );
}

async function generateObjectViaJsonText<T extends z.ZodType>(
  args: GenerateObjectArgs<T>,
  resolved: { provider: LLMProvider; modelId: string; model: LanguageModel; tier: LLMTier },
): Promise<GenerateObjectResult<z.infer<T>>> {
  const { provider, modelId, model, tier } = resolved;
  let jsonSchemaText: string;
  try {
    // Zod 4 ships JSON Schema generation natively.
    jsonSchemaText = JSON.stringify(z.toJSONSchema(args.schema), null, 2);
  } catch {
    jsonSchemaText = "(JSON schema unavailable — infer fields from system prompt)";
  }

  const baseSystem = [
    args.system ?? "",
    "",
    "OUTPUT FORMAT — STRICT:",
    "Respond with ONLY a single valid JSON object. No prose, no markdown code fences, no commentary before or after.",
    "Match this JSON Schema exactly:",
    jsonSchemaText,
  ].join("\n");

  const started = Date.now();
  let lastError: unknown = null;
  let totalIn = 0;
  let totalOut = 0;

  for (let attempt = 0; attempt < 2; attempt++) {
    const system =
      attempt === 0
        ? baseSystem
        : baseSystem +
          "\n\nThe previous attempt did not return valid JSON. Try again. Output ONLY the JSON object, starting with `{` and ending with `}`. No other characters.";

    const result = await withLLMTimeout(
      aiGenerateText({
        model,
        system,
        prompt: args.prompt,
        temperature: args.temperature ?? 0.1,
        ...(args.maxOutputTokens ? { maxOutputTokens: args.maxOutputTokens } : {}),
      }),
      args.feature,
      provider,
    );
    totalIn += result.usage.inputTokens ?? 0;
    totalOut += result.usage.outputTokens ?? 0;

    try {
      const extracted = extractJsonObject(result.text);
      const parsed = JSON.parse(extracted);
      const validated = args.schema.parse(parsed);
      const latencyMs = Date.now() - started;
      const costPaise = computeCostPaise(provider, tier, totalIn, totalOut);
      await logLLMEvent({
        feature: args.feature,
        provider,
        modelId,
        tier,
        inputTokens: totalIn,
        outputTokens: totalOut,
        costPaise,
        latencyMs,
        userId: args.userId,
        meta: { ...args.meta, attempts: attempt + 1, mode: "json-via-text" },
      });
      return {
        object: validated as z.infer<T>,
        provider,
        modelId,
        inputTokens: totalIn,
        outputTokens: totalOut,
        costPaise,
        latencyMs,
      };
    } catch (error) {
      if (error instanceof LLMTimeoutError) throw error;
      lastError = error;
    }
  }

  throw new LLMOutputParseError(
    `Ollama (${modelId}) failed to produce valid JSON for ${args.feature} after 2 attempts: ${(lastError as Error).message}`,
    "",
  );
}

function llmTimeoutMs(provider: LLMProvider): number {
  const configured = Number(process.env.LLM_TIMEOUT_MS);
  if (Number.isFinite(configured) && configured > 0) return configured;
  return provider === "ollama" ? 4_000 : 20_000;
}

function withLLMTimeout<T>(promise: Promise<T>, feature: LLMFeature, provider: LLMProvider): Promise<T> {
  const ms = llmTimeoutMs(provider);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new LLMTimeoutError(feature, ms)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function extractJsonObject(text: string): string {
  // Reasoning models (Sarvam-M, Gemma) sometimes emit `<think>…</think>`
  // chain-of-thought before the final answer. Strip those blocks first so
  // the brace-scanner only sees the real payload.
  const stripped = text.replace(/<think[\s\S]*?<\/think>/gi, "").trim();

  if (stripped.startsWith("{") && stripped.endsWith("}")) return stripped;

  // Strip ```json … ``` fences.
  const fenceMatch = stripped.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch && fenceMatch[1]) {
    const inner = fenceMatch[1].trim();
    if (inner.startsWith("{")) return inner;
  }

  // Last-resort: take everything between the first "{" and the matching last "}".
  const firstBrace = stripped.indexOf("{");
  const lastBrace = stripped.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return stripped.slice(firstBrace, lastBrace + 1);
  }

  return stripped;
}

export const ROUTER_DEBUG_INFO = {
  models: PROVIDER_MODELS,
  pricing: PROVIDER_PRICING,
};
