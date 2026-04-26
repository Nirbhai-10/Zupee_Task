import { NextResponse } from "next/server";
import { detectProvider, listAvailableProviders } from "@/lib/llm/router";
import { getVoiceProvider } from "@/lib/voice";
import { isSupabaseConfigured } from "@/lib/db/supabase";

/**
 * /api/health
 *
 * Reports the configured providers without leaking keys. Useful both for
 * the demo team (smoke-test the deploy) and for the (admin)/costs page
 * to render a "what's wired up" panel later.
 */

export const dynamic = "force-dynamic";

export async function GET() {
  const llm = detectProvider();
  const voiceProvider = getVoiceProvider();

  return NextResponse.json(
    {
      app: "saathi",
      env: process.env.APP_ENV ?? "development",
      time: new Date().toISOString(),
      llm: {
        provider: llm?.provider ?? null,
        source: llm?.source ?? "missing",
        available: listAvailableProviders(),
      },
      voice: {
        provider: voiceProvider.name,
      },
      supabase: {
        configured: isSupabaseConfigured(),
      },
      build: {
        node: process.version,
      },
    },
    { status: 200 },
  );
}
