import { NextResponse } from "next/server";
import { z } from "zod";
import { isLanguageCode } from "@/lib/i18n/languages";
import { getVoiceProvider } from "@/lib/voice";
import type { VoiceTimbre } from "@/lib/voice/provider-interface";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Standalone Sarvam TTS endpoint. Used by the VoiceAgent's "speak this back"
 * step and by any client that needs to re-synthesise an existing message.
 *
 * Body: { text, language?, timbre?, speed? }
 * Returns: { audioUrl, durationMs, provider, costPaise }
 */

const TIMBRES: ReadonlyArray<VoiceTimbre> = [
  "saathi-female",
  "saathi-male",
  "saathi-warm",
  "saathi-elder",
];

const Body = z.object({
  text: z.string().min(1).max(2000),
  language: z.string().default("hi-IN"),
  timbre: z.enum(TIMBRES as unknown as [VoiceTimbre, ...VoiceTimbre[]]).default("saathi-female"),
  speed: z.number().min(0.5).max(2).default(1),
});

export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body", detail: (error as Error).message },
      { status: 400 },
    );
  }

  const language = isLanguageCode(body.language) ? body.language : "hi-IN";

  try {
    const provider = getVoiceProvider();
    const result = await provider.synthesize({
      text: body.text,
      language,
      timbre: body.timbre,
      speed: body.speed,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "TTS failed", detail: (error as Error).message },
      { status: 502 },
    );
  }
}
