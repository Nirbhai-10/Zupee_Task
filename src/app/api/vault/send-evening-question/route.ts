import { NextResponse } from "next/server";
import { z } from "zod";
import { getVoiceProvider } from "@/lib/voice";
import { DEMO_USER_ID } from "@/lib/db/server-anon";
import { createEveningQuestion } from "@/domain/vault/store";
import { isLanguageCode, type LanguageCode } from "@/lib/i18n/languages";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RequestBody = z.object({
  preferredLanguage: z.string().optional().default("hi-IN"),
});

export async function POST(req: Request) {
  const parsed = RequestBody.safeParse(await req.json().catch(() => ({})));
  const preferredLanguage: LanguageCode =
    parsed.success && isLanguageCode(parsed.data.preferredLanguage)
      ? parsed.data.preferredLanguage
      : "hi-IN";
  const { confessionId, question } = await createEveningQuestion(DEMO_USER_ID);
  const questionForUser = {
    ...question,
    text: preferredLanguage === "en-IN" ? englishVaultQuestion(question.category) : question.text,
    language: preferredLanguage,
  };

  let voice: { url: string; durationMs?: number; provider?: string } | null = null;
  try {
    const synth = await getVoiceProvider().synthesize({
      text: questionForUser.text,
      language: questionForUser.language,
      timbre: "saathi-warm",
      speed: 0.95,
    });
    voice = { url: synth.audioUrl, durationMs: synth.durationMs, provider: synth.provider };
  } catch (error) {
    console.warn("[vault] evening question voice failed:", (error as Error).message);
  }

  return NextResponse.json({
    confessionId,
    question: questionForUser,
    voice,
    deliverAt: new Date().toISOString(),
    channel: "vault-evening-question",
  });
}

function englishVaultQuestion(category: string): string {
  const byCategory: Record<string, string> = {
    "hidden-spending": "Was there any spending today that you do not feel ready to explain at home? You can tell me; this stays private.",
    "financial-guilt": "Did any purchase make you feel guilty today, even if it was reasonable?",
    "family-money-tension": "Did anyone in the family ask for money today? Were you comfortable, or was there some quiet tension?",
    "hidden-generosity": "Did you help someone quietly today without telling the family? Secret kindness counts too.",
    "comparison-anxiety": "Did seeing someone else's life make you wonder whether your family is behind? Say it plainly; this feeling is normal.",
    "future-fear": "Did any money-related future worry come up today? Tell me, and we will turn it into a plan.",
    "aging-parents": "Did you notice any expense your parents may be hiding or reducing today?",
    "kids-future": "Did anything about the children's future and money sit in your mind today?",
    "husband-wife-asymmetry": "Did your husband make or mention a money decision today? Did you feel fully comfortable with it?",
    "self-care-guilt": "Was there something you wanted for yourself today but skipped because of money?",
    "festival-pressure": "Did festival spending come up today? What pressure are you carrying quietly?",
  };
  return byCategory[category] ?? "What money worry stayed in your mind today? Tell me in your own words.";
}
