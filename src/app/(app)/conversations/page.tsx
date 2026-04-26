"use client";

import * as React from "react";
import { CircleUser, MessageCircle, Mic, Send, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { T } from "@/components/shared/T";
import { useT } from "@/lib/i18n/language-context";
import { SEEDED_ANJALI_THREAD, type SeededMessage } from "@/lib/mocks/seeded-activity";
import { cn } from "@/lib/utils/cn";

export default function ConversationsPage() {
  const t = useT();
  const [draft, setDraft] = React.useState("");
  const [sentExtra, setSentExtra] = React.useState<SeededMessage[]>([]);

  const messages = React.useMemo(() => [...SEEDED_ANJALI_THREAD, ...sentExtra], [sentExtra]);

  function send() {
    if (!draft.trim()) return;
    const text = draft.trim();
    setDraft("");
    const newMsg: SeededMessage = {
      id: crypto.randomUUID(),
      phone: "anjali",
      direction: "outbound",
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }),
      textHi: text,
      textEn: text,
    };
    setSentExtra((prev) => [...prev, newMsg]);
    // Echo a reassurance after a small delay so the page feels alive.
    setTimeout(() => {
      setSentExtra((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          phone: "anjali",
          direction: "inbound",
          timestamp: new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }),
          textHi: "Mil gaya. Live LLM (Gemma) se response demo simulator pe milta hai — yahan chat history hai.",
          textEn: "Got it. Live LLM (Gemma) responses come through the demo simulator — this surface mirrors the chat history.",
        },
      ]);
    }, 700);
  }

  return (
    <main className="flex flex-1 flex-col px-6 py-8">
      <header className="mx-auto w-full max-w-2xl space-y-3 pb-4">
        <Badge tone="green">
          <T hi="बातचीत" en="Conversations" />
        </Badge>
        <h1 className="text-h2 font-semibold tracking-tight text-saathi-ink">
          <T hi="साथी से बातचीत" en="Your thread with Saathi" />
        </h1>
        <p className="text-body-sm text-saathi-ink-soft">
          <T
            hi="WhatsApp जो आप देखती हैं — वही यहाँ web पर। Live LLM responses simulator में run होते हैं।"
            en="A web mirror of your WhatsApp thread. Live LLM responses run in the demo simulator."
          />
        </p>
      </header>

      <Card tone="paper" padding="none" className="mx-auto flex w-full max-w-2xl flex-col overflow-hidden">
        <header className="flex items-center gap-3 border-b border-saathi-paper-edge bg-saathi-paper px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-pill bg-saathi-deep-green text-white">
            <CircleUser className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-body font-semibold text-saathi-ink">Saathi</div>
            <div className="text-caption text-saathi-success flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-saathi-success" />
              <T hi="online · हिन्दी, English" en="online · Hindi, English" />
            </div>
          </div>
          <Badge tone="green">
            <ShieldAlert className="h-3 w-3" />
            <T hi="सुरक्षित" en="Secure" />
          </Badge>
        </header>

        <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto bg-[#ECE5DD]/60 p-4">
          {messages.map((m) => (
            <Bubble key={m.id} m={m} t={t} />
          ))}
        </div>

        <footer className="flex items-end gap-2 border-t border-saathi-paper-edge bg-saathi-paper p-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={t("Saathi से कुछ पूछिए…", "Ask Saathi anything…")}
            rows={1}
            className="max-h-32 flex-1 resize-none rounded-card-sm border border-saathi-paper-edge bg-saathi-cream px-3 py-2 text-body-sm leading-snug outline-none placeholder:text-saathi-ink-quiet focus:border-saathi-deep-green/40"
          />
          <Button
            type="button"
            variant={draft.trim() ? "primary" : "ghost"}
            size="icon"
            onClick={send}
            aria-label={draft.trim() ? "Send" : "Mic"}
          >
            {draft.trim() ? <Send className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        </footer>
      </Card>

      <Card tone="cream" padding="md" className="mx-auto mt-4 w-full max-w-2xl">
        <div className="flex items-center gap-3 text-body-sm text-saathi-ink-soft">
          <MessageCircle className="h-4 w-4 text-saathi-deep-green" />
          <T
            hi="पूरा flow — scam catch, ULIP audit, plan generation, salary day cascade — demo simulator पर live करें।"
            en="Run the full flow — scam catch, ULIP audit, plan generation, salary day cascade — on the live simulator."
          />
        </div>
      </Card>
    </main>
  );
}

function Bubble({ m, t }: { m: SeededMessage; t: (hi: string, en: string) => string }) {
  const isOutbound = m.direction === "outbound";
  return (
    <div className={cn("flex w-full", isOutbound ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-snug shadow-soft",
          isOutbound ? "rounded-tr-sm bg-[#DCF8C6] text-saathi-ink" : "rounded-tl-sm bg-white text-saathi-ink",
          m.highlight === "scam" && "ring-2 ring-saathi-danger/40",
          m.highlight === "savings" && "ring-2 ring-saathi-gold/40",
        )}
      >
        {m.isVoice ? (
          <div className="mb-1 flex items-center gap-2 text-[11px] text-saathi-deep-green">
            <Mic className="h-3 w-3" />
            <T hi="वॉइस नोट" en="Voice note" />
          </div>
        ) : null}
        <p>{t(m.textHi, m.textEn)}</p>
        <div className="mt-0.5 text-[10px] text-right text-saathi-ink-quiet font-mono tabular-nums">
          {m.timestamp}
        </div>
      </div>
    </div>
  );
}
