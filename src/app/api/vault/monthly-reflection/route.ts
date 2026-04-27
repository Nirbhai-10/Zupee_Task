import { NextResponse } from "next/server";
import { z } from "zod";
import { getVoiceProvider } from "@/lib/voice";
import { DEMO_USER_ID } from "@/lib/db/server-anon";
import { generateMonthlyVaultEssay } from "@/domain/vault/reflection";
import { listVaultConfessions, upsertMonthlyReflection } from "@/domain/vault/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RequestBody = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  generateVoice: z.boolean().default(true),
});

export async function POST(req: Request) {
  const parsed = RequestBody.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", detail: parsed.error.message },
      { status: 400 },
    );
  }
  const month = parsed.data.month ?? new Date().toISOString().slice(0, 7);
  const monthLabel = new Date(`${month}-01T00:00:00+05:30`).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const entries = (await listVaultConfessions(DEMO_USER_ID, 80))
    .filter((entry) => entry.askedAt.startsWith(month))
    .map((entry) => ({
      questionText: entry.questionText,
      transcript: entry.responseTranscript ?? "",
      emotionTags: entry.emotionTags,
    }))
    .filter((entry) => entry.transcript);

  const essay = await generateMonthlyVaultEssay({
    monthLabel,
    entries: entries.length ? entries : fallbackEntries(),
  });

  let voice: { url: string; durationMs?: number; provider?: string } | null = null;
  if (parsed.data.generateVoice) {
    try {
      const synth = await getVoiceProvider().synthesize({
        text: essay.text,
        language: "hi-IN",
        timbre: "saathi-warm",
        speed: 0.92,
      });
      voice = { url: synth.audioUrl, durationMs: synth.durationMs, provider: synth.provider };
    } catch (error) {
      console.warn("[vault] monthly reflection voice failed:", (error as Error).message);
    }
  }

  const reflection = await upsertMonthlyReflection({
    userId: DEMO_USER_ID,
    month,
    reflectionText: essay.text,
    reflectionAudioUrl: voice?.url ?? null,
    source: essay.source,
  });

  return NextResponse.json({ reflection, voice, source: essay.source });
}

function fallbackEntries() {
  return [
    {
      questionText: "Aaj apne liye kuch lena chahti thi but nahi liya kyunki paisa?",
      transcript:
        "Sandal leni thi par Priya ka project yaad aa gaya. Apne liye kharcha karne mein guilt hota hai.",
      emotionTags: ["self-care-guilt", "kids-future"],
    },
  ];
}
