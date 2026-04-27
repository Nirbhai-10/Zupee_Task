import { NextResponse } from "next/server";
import { getVoiceProvider } from "@/lib/voice";
import { DEMO_USER_ID } from "@/lib/db/server-anon";
import { createEveningQuestion } from "@/domain/vault/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const { confessionId, question } = await createEveningQuestion(DEMO_USER_ID);

  let voice: { url: string; durationMs?: number; provider?: string } | null = null;
  try {
    const synth = await getVoiceProvider().synthesize({
      text: question.text,
      language: question.language,
      timbre: "saathi-warm",
      speed: 0.95,
    });
    voice = { url: synth.audioUrl, durationMs: synth.durationMs, provider: synth.provider };
  } catch (error) {
    console.warn("[vault] evening question voice failed:", (error as Error).message);
  }

  return NextResponse.json({
    confessionId,
    question,
    voice,
    deliverAt: new Date().toISOString(),
    channel: "vault-evening-question",
  });
}
