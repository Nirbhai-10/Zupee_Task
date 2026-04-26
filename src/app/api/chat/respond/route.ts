import { NextResponse } from "next/server";
import { z } from "zod";
import { respondToChat } from "@/domain/chat/respond";
import { isLanguageCode } from "@/lib/i18n/languages";
import { getVoiceProvider } from "@/lib/voice";
import type { ChatMessage } from "@/lib/chat/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RequestBody = z.object({
  messages: z
    .array(
      z.object({
        id: z.string(),
        role: z.enum(["user", "assistant"]),
        text: z.string(),
        language: z.string().optional(),
        audioUrl: z.string().optional(),
        cta: z
          .object({ label: z.string(), href: z.string() })
          .nullable()
          .optional(),
        intent: z.string().optional(),
        createdAt: z.string(),
      }),
    )
    .min(1)
    .max(50),
  preferredLanguage: z.string().default("hi-IN"),
  generateVoice: z.boolean().default(true),
});

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

  const preferredLang = isLanguageCode(body.preferredLanguage)
    ? body.preferredLanguage
    : "hi-IN";

  const result = await respondToChat(body.messages as ChatMessage[], preferredLang);

  let audioUrl: string | undefined;
  let audioDurationMs: number | undefined;
  if (body.generateVoice && result.text) {
    try {
      const provider = getVoiceProvider();
      const synth = await provider.synthesize({
        text: result.text,
        language: result.language,
        timbre: "saathi-female",
      });
      audioUrl = synth.audioUrl;
      audioDurationMs = synth.durationMs;
    } catch (error) {
      console.warn("[chat] voice synth failed:", (error as Error).message);
    }
  }

  return NextResponse.json({
    intent: result.intent,
    text: result.text,
    language: result.language,
    cta: result.cta ?? null,
    audioUrl,
    audioDurationMs,
    source: result.source,
  });
}
