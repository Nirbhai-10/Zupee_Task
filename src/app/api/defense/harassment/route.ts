import { NextResponse } from "next/server";
import { z } from "zod";
import { handleHarassment } from "@/domain/defense/handle-harassment";
import { isLanguageCode } from "@/lib/i18n/languages";
import { getVoiceProvider } from "@/lib/voice";
import { persistHarassmentDefense } from "@/lib/db/persist";

const RequestBody = z.object({
  agentName: z.string().min(1).default("Mr. Sharma"),
  agencyName: z.string().min(1).default("Default Recovery Pvt. Ltd."),
  bankNbfc: z.string().min(1).default("HDFC Credit Card"),
  borrowerName: z.string().min(1).default("Vikrant Sharma (devar)"),
  borrowerCity: z.string().min(1).default("Lucknow"),
  incidentSummary: z
    .string()
    .min(1)
    .default(
      "Recovery agent has been calling the borrower's brother (residing with Anjali) at 9:45 PM repeatedly, using threatening language about visiting the home, and has contacted multiple family members despite the borrower being reachable.",
    ),
  callTime: z.string().optional().default("21:45"),
  language: z.string().default("hi-IN"),
  generateVoice: z.boolean().default(true),
  userId: z.string().uuid().optional(),
});

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: z.infer<typeof RequestBody>;
  try {
    const raw = await req.json().catch(() => ({}));
    body = RequestBody.parse(raw);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body", detail: (error as Error).message },
      { status: 400 },
    );
  }

  if (!isLanguageCode(body.language)) {
    return NextResponse.json(
      { error: `Unsupported language: ${body.language}` },
      { status: 400 },
    );
  }

  const result = await handleHarassment({ ...body, language: body.language });

  let voice: { url: string; durationMs?: number; provider?: string } | null = null;
  if (body.generateVoice) {
    try {
      const provider = getVoiceProvider();
      const synth = await provider.synthesize({
        text: result.callScript,
        language: body.language,
        timbre: "saathi-female",
        speed: 1.0,
      });
      voice = { url: synth.audioUrl, durationMs: synth.durationMs, provider: synth.provider };
    } catch (error) {
      console.warn("[harassment] voice synth failed:", (error as Error).message);
    }
  }

  await persistHarassmentDefense({
    letter: result.letter,
    callScript: result.callScript,
    voiceUrl: voice?.url ?? null,
    agentName: body.agentName,
    agencyName: body.agencyName,
    language: body.language,
    source: result.source,
  });

  return NextResponse.json({
    letter: result.letter,
    callScript: result.callScript,
    sachetDraft: result.sachetDraft,
    source: result.source,
    voice,
  });
}
