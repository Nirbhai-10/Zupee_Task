import { z } from "zod";
import { generateObject, generateText, isRecoverableLLMError } from "@/lib/llm/router";
import { VAULT_REFLECTION_SYSTEM } from "@/lib/llm/prompts/vault-reflection";
import { VAULT_MONTHLY_ESSAY_SYSTEM } from "@/lib/llm/prompts/vault-monthly-essay";
import type { LanguageCode } from "@/lib/i18n/languages";

const ReflectionSchema = z.object({
  reflectionText: z.string().min(1).max(260),
  responseMode: z.enum(["warm-reflection", "pattern-observation", "suggestion", "silent-heart"]),
  emotionTags: z.array(z.string()).min(1).max(5),
});

const REFLECTION_TIMEOUT_MS = 8_000;
const MONTHLY_ESSAY_TIMEOUT_MS = 10_000;

export type VaultReflection = z.infer<typeof ReflectionSchema> & {
  source: "llm" | "mock-template";
};

export async function generateVaultReflection(args: {
  questionText: string;
  responseTranscript: string;
  recentThemes?: string[];
  language?: LanguageCode;
}): Promise<VaultReflection> {
  try {
    const { object } = await withTimeout(
      generateObject({
        feature: "vault-reflection",
        tier: "haiku",
        schema: ReflectionSchema,
        schemaName: "VaultReflection",
        schemaDescription: "Private evening Vault reflection",
        system: VAULT_REFLECTION_SYSTEM,
        prompt: [
          `Evening question: ${args.questionText}`,
          `User voice transcript: ${args.responseTranscript}`,
        `Recent themes: ${(args.recentThemes ?? []).join(", ") || "none yet"}`,
        `Output language: ${args.language ?? "hi-IN"}`,
        "Return JSON only.",
        ].join("\n\n"),
        temperature: 0.45,
        maxOutputTokens: 700,
      }),
      REFLECTION_TIMEOUT_MS,
    );
    return {
      ...object,
      reflectionText: cleanVaultCopy(object.reflectionText),
      emotionTags: normalizeTags(object.emotionTags),
      source: "llm",
    };
  } catch (error) {
    if (shouldUseVaultFallback(error)) {
      return mockVaultReflection(args.responseTranscript, args.language);
    }
    throw error;
  }
}

export async function generateMonthlyVaultEssay(args: {
  monthLabel: string;
  entries: Array<{ questionText: string; transcript: string; emotionTags: string[] }>;
}): Promise<{ text: string; source: "llm" | "mock-template" }> {
  const entryText = args.entries
    .slice(0, 40)
    .map(
      (entry, index) =>
        `${index + 1}. Q: ${entry.questionText}\nA: ${entry.transcript}\nTags: ${entry.emotionTags.join(", ")}`,
    )
    .join("\n\n");

  try {
    const result = await withTimeout(
      generateText({
        feature: "vault-monthly-essay",
        tier: "sonnet",
        system: VAULT_MONTHLY_ESSAY_SYSTEM,
        prompt: `Month: ${args.monthLabel}\n\nVault entries:\n${entryText}\n\nWrite the 90-second Hindi/Hinglish voice essay.`,
        temperature: 0.45,
        maxOutputTokens: 1300,
      }),
      MONTHLY_ESSAY_TIMEOUT_MS,
    );
    return { text: cleanVaultCopy(result.text), source: "llm" };
  } catch (error) {
    if (shouldUseVaultFallback(error)) {
      return { text: mockMonthlyEssay(args.monthLabel, args.entries), source: "mock-template" };
    }
    throw error;
  }
}

function shouldUseVaultFallback(error: unknown) {
  return isRecoverableLLMError(error) || error instanceof VaultLLMTimeoutError;
}

class VaultLLMTimeoutError extends Error {
  constructor(ms: number) {
    super(`Vault LLM timed out after ${ms}ms`);
    this.name = "VaultLLMTimeoutError";
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new VaultLLMTimeoutError(ms)), ms);
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

function mockVaultReflection(transcript: string, language: LanguageCode = "hi-IN"): VaultReflection {
  const lower = transcript.toLowerCase();
  const emotionTags = [
    lower.includes("pati") || lower.includes("rajesh") ? "husband-money" : null,
    lower.includes("bach") || lower.includes("priya") || lower.includes("aarav") ? "kids-future" : null,
    lower.includes("mummy") || lower.includes("papa") ? "parents-care" : null,
    lower.includes("dar") || lower.includes("tension") ? "worry" : null,
    lower.includes("kharch") || lower.includes("paisa") ? "spending" : null,
  ].filter(Boolean) as string[];

  return {
    source: "mock-template",
    responseMode: "warm-reflection",
    emotionTags: emotionTags.length ? emotionTags.slice(0, 4) : ["private-money"],
    reflectionText:
      language === "en-IN"
        ? "I heard you. This is your private space and it will not go anywhere. I am only noting that this felt heavier than a normal expense."
        : "Suni. Yeh aapki private jagah hai — kahin nahi jaayegi. Bas itna note kar raha hoon ki yeh baat aapke liye halka nahi hai.",
  };
}

function cleanVaultCopy(text: string): string {
  return text
    .replace(/^\s*\*\*\([^)]*\)\*\*\s*/i, "")
    .replace(/^\s*\([^)]*tone:[^)]*\)\s*/i, "")
    .replace(/^tone:\s*.*$/gim, "")
    .replace(/\*\*/g, "")
    .trim();
}

function normalizeTags(tags: string[]): string[] {
  const normalized = tags
    .map((tag) =>
      tag
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    )
    .filter(Boolean);
  return [...new Set(normalized)].slice(0, 5);
}

function mockMonthlyEssay(
  monthLabel: string,
  entries: Array<{ transcript: string; emotionTags: string[] }>,
): string {
  const count = entries.length;
  const tags = entries.flatMap((entry) => entry.emotionTags);
  const kids = tags.filter((tag) => tag.includes("kids")).length;
  const spending = tags.filter((tag) => tag.includes("spending")).length;
  const parents = tags.filter((tag) => tag.includes("parents")).length;
  return [
    `${monthLabel} ka Vault reflection ready hai.`,
    `Is mahine aapne ${count} baar apne mann ki money wali baat seedhi boli. Yeh chhoti baat nahi hai.`,
    kids > 0
      ? "Bachhon ke future ka thought baar-baar aaya — Priya aur Aarav ke liye aap planning ko dil se pakad kar chal rahi hain."
      : null,
    spending > 0
      ? "Kharch aur guilt ka pattern bhi dikha. Iska matlab yeh nahi ki aap galat kar rahi hain; bas budget mein aapke liye bhi jagah chahiye."
      : null,
    parents > 0
      ? "Mummy-papa ke kharche par aapki nazar rehti hai, kabhi-kabhi unke bolne se pehle hi."
      : null,
    "Saathi ka simple note: aap paise ko sirf number ki tarah nahi, zimmedari ki tarah dekhti hain. Agle mahine hum isi zimmedari ko thoda halka banayenge.",
  ]
    .filter(Boolean)
    .join(" ");
}
