import { NextResponse } from "next/server";
import { z } from "zod";
import { classifyScam } from "@/domain/defense/classify-scam";
import type { LanguageCode } from "@/lib/i18n/languages";
import { isLanguageCode } from "@/lib/i18n/languages";
import { getVoiceProvider } from "@/lib/voice";
import { persistScamDefense } from "@/lib/db/persist";

const RequestBody = z.object({
  message: z.string().min(2).max(8000),
  receiver: z.object({
    relationship: z.string().min(1),
    ageBand: z.string().min(1),
    language: z.string(),
    name: z.string().min(1),
  }),
  generateVoice: z.boolean().default(true),
  userId: z.string().uuid().optional(),
});

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: z.infer<typeof RequestBody>;
  try {
    body = RequestBody.parse(await req.json());
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body", detail: (error as Error).message },
      { status: 400 },
    );
  }

  if (!isLanguageCode(body.receiver.language)) {
    return NextResponse.json(
      { error: `Unsupported language: ${body.receiver.language}` },
      { status: 400 },
    );
  }

  const language = body.receiver.language as LanguageCode;

  const result = await classifyScam({
    message: body.message,
    receiver: { ...body.receiver, language },
    userId: body.userId,
  });

  let voiceUrl: string | undefined;
  let voiceDurationMs: number | undefined;
  let voiceProvider: string | undefined;
  if (body.generateVoice && result.classification.receiverExplanation) {
    try {
      const provider = getVoiceProvider();
      const synth = await provider.synthesize({
        text: result.classification.receiverExplanation,
        language,
        timbre: body.receiver.ageBand.startsWith("60") || body.receiver.ageBand === "75+"
          ? "saathi-elder"
          : "saathi-female",
        speed: 1.0,
      });
      voiceUrl = synth.audioUrl;
      voiceDurationMs = synth.durationMs;
      voiceProvider = synth.provider;
    } catch (error) {
      // Voice synthesis is best-effort; the verdict still ships.
      console.warn("[scam-check] voice synth failed:", (error as Error).message);
    }
  }

  // Best-effort persistence; never blocks the response.
  await persistScamDefense({
    classification: result.classification,
    voiceUrl: voiceUrl ?? null,
    matchedPatternName: result.matchedPatternName ?? null,
    language,
    source: result.source,
  });

  return NextResponse.json({
    classification: result.classification,
    source: result.source,
    matchedPatternName: result.matchedPatternName,
    voice: voiceUrl
      ? { url: voiceUrl, durationMs: voiceDurationMs, provider: voiceProvider }
      : null,
  });
}
