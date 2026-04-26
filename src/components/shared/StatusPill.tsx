import { cn } from "@/lib/utils/cn";
import { detectProvider } from "@/lib/llm/router";
import { isSupabaseConfigured } from "@/lib/db/supabase";

type Status = {
  llm: { provider: string; ok: boolean; label: string };
  voice: { ok: boolean; label: string };
  supabase: { ok: boolean };
};

function readStatus(): Status {
  const detected = detectProvider();
  const llmOk = Boolean(detected);
  const llmLabel = detected
    ? detected.provider === "ollama"
      ? `Gemma · local`
      : detected.provider === "anthropic"
        ? "Claude · cloud"
        : detected.provider === "openai"
          ? "GPT · cloud"
          : "Grok · cloud"
    : "no LLM";

  const sarvamConfigured = Boolean(process.env.SARVAM_API_KEY);
  const voiceLabel = sarvamConfigured ? "Sarvam · हिन्दी" : "Browser TTS";

  return {
    llm: { provider: detected?.provider ?? "none", ok: llmOk, label: llmLabel },
    voice: { ok: sarvamConfigured, label: voiceLabel },
    supabase: { ok: isSupabaseConfigured() },
  };
}

export function StatusPill({ className }: { className?: string }) {
  const status = readStatus();
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-pill border border-saathi-paper-edge bg-saathi-paper px-2.5 py-1.5 text-caption text-saathi-ink-soft",
        className,
      )}
      title={`LLM: ${status.llm.label} · Voice: ${status.voice.label} · Supabase: ${status.supabase.ok ? "connected" : "off"}`}
    >
      <Dot ok={status.llm.ok} />
      <span className="hidden font-mono tabular-nums text-[10px] uppercase tracking-wider sm:inline">
        {status.llm.label}
      </span>
      <span className="hidden h-3 w-px bg-saathi-paper-edge sm:inline-block" />
      <Dot ok={status.voice.ok} />
      <span className="hidden font-mono tabular-nums text-[10px] uppercase tracking-wider sm:inline">
        {status.voice.label}
      </span>
      <span className="hidden h-3 w-px bg-saathi-paper-edge md:inline-block" />
      <Dot ok={status.supabase.ok} />
      <span className="hidden font-mono tabular-nums text-[10px] uppercase tracking-wider md:inline">
        Supabase
      </span>
    </div>
  );
}

function Dot({ ok }: { ok: boolean }) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full",
        ok ? "bg-saathi-success" : "bg-saathi-ink-whisper",
      )}
    />
  );
}
