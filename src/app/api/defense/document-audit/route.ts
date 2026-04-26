import { NextResponse } from "next/server";
import { z } from "zod";
import { auditDocument } from "@/domain/defense/audit-document";
import { ULIPFeeSchedule } from "@/lib/llm/schemas";
import { SAMPLE_ULIP } from "@/lib/mocks/ulip-sample";
import { isLanguageCode } from "@/lib/i18n/languages";
import { getVoiceProvider } from "@/lib/voice";
import { persistAuditDefense } from "@/lib/db/persist";

const RequestBody = z.object({
  /** When omitted, uses the seeded SAMPLE_ULIP. Useful for the demo's
   *  "Trigger ULIP audit" button which doesn't need a real upload. */
  fees: ULIPFeeSchedule.optional(),
  receiver: z.object({
    name: z.string().min(1),
    language: z.string(),
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
  const language = body.receiver.language;

  const fees = body.fees ?? SAMPLE_ULIP;
  const result = await auditDocument({
    fees,
    receiver: { name: body.receiver.name, language },
    userId: body.userId,
  });

  let voice: { url: string; durationMs?: number; provider?: string } | null = null;
  if (body.generateVoice) {
    try {
      const provider = getVoiceProvider();
      const synth = await provider.synthesize({
        text: result.voiceScript,
        language,
        timbre: "saathi-female",
        speed: 1.0,
      });
      voice = { url: synth.audioUrl, durationMs: synth.durationMs, provider: synth.provider };
    } catch (error) {
      console.warn("[document-audit] voice synth failed:", (error as Error).message);
    }
  }

  await persistAuditDefense({
    audit: result.audit,
    voiceUrl: voice?.url ?? null,
    voiceScript: result.voiceScript,
    language,
    source: result.source,
  });

  return NextResponse.json({
    audit: result.audit,
    voiceScript: result.voiceScript,
    source: result.source,
    voice,
  });
}
