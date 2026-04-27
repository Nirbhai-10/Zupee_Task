import { NextResponse } from "next/server";
import { z } from "zod";
import { generatePlan } from "@/domain/investment/generate-plan";
import { ANJALI, FAMILY, GOALS } from "@/lib/mocks/demo-personas";
import {
  notifyFamilyForSalaryDay,
  buildHisaabScript,
  type SalaryDayContext,
} from "@/domain/family/notify";
import { getVoiceProvider } from "@/lib/voice";
import { isLanguageCode } from "@/lib/i18n/languages";

const RequestBody = z.object({
  monthName: z.string().default("Apr"),
  yearNumber: z.number().int().min(2024).max(2100).default(2026),
  generateVoice: z.boolean().default(true),
  preferredLanguage: z.string().optional().default(ANJALI.language),
});

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/investment/execute-salary-day
 *
 * The simulator's salary-day trigger calls this. We re-build the plan
 * (idempotent for Anjali — same surplus, same goals) so we have a fresh
 * SalaryDayContext to fan out, then synthesize:
 *  - the Hisaab voice for Anjali,
 *  - per-recipient family notifications (deterministic templates).
 *
 * The Day-7 LLM rewriter polishes the family copy for register variance.
 */
export async function POST(req: Request) {
  let body: z.infer<typeof RequestBody>;
  try {
    body = RequestBody.parse(await req.json().catch(() => ({})));
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body", detail: (error as Error).message },
      { status: 400 },
    );
  }

  const planResult = await generatePlan({
    user: {
      ...ANJALI,
      language: isLanguageCode(body.preferredLanguage) ? body.preferredLanguage : ANJALI.language,
    },
    family: FAMILY,
    goals: GOALS,
    todayIso: new Date().toISOString().slice(0, 10),
  });

  const context: SalaryDayContext = {
    plan: planResult.plan,
    monthName: body.monthName,
    yearNumber: body.yearNumber,
    primaryLanguage: isLanguageCode(body.preferredLanguage) ? body.preferredLanguage : ANJALI.language,
    yearProgress: { weddingPctComplete: 18 }, // demo placeholder
  };

  const familyNotifications = notifyFamilyForSalaryDay(FAMILY, context);
  const hisaabScript = buildHisaabScript(context);

  let hisaabVoice: { url: string; durationMs?: number } | null = null;
  const enriched: Array<{
    familyMemberId: string;
    channel: "voice" | "text";
    language: string;
    content: string;
    voiceUrl?: string;
    voiceDurationMs?: number;
  }> = familyNotifications.map((n) => ({ ...n }));

  if (body.generateVoice) {
    const provider = getVoiceProvider();
    try {
      const synth = await provider.synthesize({
        text: hisaabScript,
        language: context.primaryLanguage ?? ANJALI.language,
        timbre: "saathi-female",
      });
      hisaabVoice = { url: synth.audioUrl, durationMs: synth.durationMs };
    } catch (error) {
      console.warn("[salary-day] hisaab voice synth failed:", (error as Error).message);
    }

    for (const notification of enriched) {
      if (notification.channel !== "voice") continue;
      try {
        const member = FAMILY.find((m) => m.id === notification.familyMemberId);
        const synth = await provider.synthesize({
          text: notification.content,
          language: notification.language as
            | "hi-IN"
            | "en-IN"
            | "mr-IN"
            | "bn-IN"
            | "gu-IN"
            | "ta-IN"
            | "te-IN"
            | "kn-IN"
            | "ml-IN"
            | "pa-IN"
            | "or-IN",
          timbre:
            member?.relationship === "mother-in-law"
              ? "saathi-elder"
              : "saathi-female",
        });
        notification.voiceUrl = synth.audioUrl;
        notification.voiceDurationMs = synth.durationMs;
      } catch (error) {
        console.warn(
          "[salary-day] family voice synth failed:",
          (error as Error).message,
        );
      }
    }
  }

  return NextResponse.json({
    plan: planResult.plan,
    hisaab: { script: hisaabScript, voice: hisaabVoice },
    familyNotifications: enriched,
    monthName: body.monthName,
    yearNumber: body.yearNumber,
  });
}
