import { NextResponse } from "next/server";
import { z } from "zod";
import { getVoiceProvider } from "@/lib/voice";
import { DEMO_USER_ID } from "@/lib/db/server-anon";
import { generateVaultReflection } from "@/domain/vault/reflection";
import { getVaultQuestionById } from "@/domain/vault/questions";
import { saveVaultResponse } from "@/domain/vault/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RequestBody = z.object({
  confessionId: z.string().nullable().optional(),
  questionId: z.string().nullable().optional(),
  questionText: z.string().min(1),
  responseTranscript: z.string().min(1).max(3000),
  responseAudioUrl: z.string().nullable().optional(),
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

  const resolvedQuestion = body.questionId ? getVaultQuestionById(body.questionId) : null;
  const questionText = resolvedQuestion?.text ?? body.questionText;

  const reflection = await generateVaultReflection({
    questionText,
    responseTranscript: body.responseTranscript,
  });

  let voice: { url: string; durationMs?: number; provider?: string } | null = null;
  if (body.generateVoice && reflection.reflectionText && reflection.responseMode !== "silent-heart") {
    try {
      const synth = await getVoiceProvider().synthesize({
        text: reflection.reflectionText,
        language: "hi-IN",
        timbre: "saathi-warm",
        speed: 0.95,
      });
      voice = { url: synth.audioUrl, durationMs: synth.durationMs, provider: synth.provider };
    } catch (error) {
      console.warn("[vault] reflection voice failed:", (error as Error).message);
    }
  }

  const confession = await saveVaultResponse({
    userId: DEMO_USER_ID,
    confessionId: body.confessionId ?? null,
    questionId: body.questionId ?? resolvedQuestion?.id ?? null,
    questionText,
    responseTranscript: body.responseTranscript,
    responseAudioUrl: body.responseAudioUrl ?? null,
    saathiReflectionText: reflection.reflectionText,
    saathiReflectionAudioUrl: voice?.url ?? null,
    emotionTags: reflection.emotionTags,
  });

  return NextResponse.json({
    confession,
    reflection: {
      text: reflection.reflectionText,
      responseMode: reflection.responseMode,
      emotionTags: reflection.emotionTags,
      source: reflection.source,
      voice,
    },
  });
}
