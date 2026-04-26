import { NextResponse } from "next/server";
import { generatePlan } from "@/domain/investment/generate-plan";
import { ANJALI, FAMILY, GOALS } from "@/lib/mocks/demo-personas";
import { getVoiceProvider } from "@/lib/voice";
import { persistPlan } from "@/lib/db/persist";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * /api/investment/plan
 *
 * For the prototype demo this endpoint takes no body — it generates a
 * plan for the seeded Anjali persona. Day-5 wires the conversational
 * intake state machine that builds an AllocatorInput from a real user.
 */
export async function POST() {
  const result = await generatePlan({
    user: ANJALI,
    family: FAMILY,
    goals: GOALS,
    todayIso: new Date().toISOString().slice(0, 10),
  });

  let voice: { url: string; durationMs?: number; provider?: string } | null = null;
  try {
    const provider = getVoiceProvider();
    const synth = await provider.synthesize({
      text: result.voiceScript,
      language: ANJALI.language,
      timbre: "saathi-female",
      speed: 1.0,
    });
    voice = { url: synth.audioUrl, durationMs: synth.durationMs, provider: synth.provider };
  } catch (error) {
    console.warn("[plan] voice synth failed:", (error as Error).message);
  }

  await persistPlan({
    plan: result.plan,
    voiceUrl: voice?.url ?? null,
    voiceScript: result.voiceScript,
    source: result.source,
  });

  return NextResponse.json({
    plan: result.plan,
    voiceScript: result.voiceScript,
    source: result.source,
    voice,
  });
}
