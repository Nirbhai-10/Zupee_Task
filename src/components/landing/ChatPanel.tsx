"use client";

import * as React from "react";
import Image from "next/image";
import { Eraser, MoreVertical, X } from "lucide-react";
import { conversationStore } from "@/lib/chat/conversation-store";
import type { ChatMessage } from "@/lib/chat/types";
import { useLanguage, useT } from "@/lib/i18n/language-context";
import type { LanguageCode } from "@/lib/i18n/languages";
import { ChatBubble } from "./ChatBubble";
import { ChatComposer } from "./ChatComposer";
import { cn } from "@/lib/utils/cn";

type ChatPanelProps = {
  open: boolean;
  onClose: () => void;
};

export function ChatPanel({ open, onClose }: ChatPanelProps) {
  const t = useT();
  const { lang } = useLanguage();
  const language: LanguageCode = lang === "hi" ? "hi-IN" : "en-IN";

  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [pending, setPending] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Hydrate from localStorage + subscribe.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages(conversationStore.read());
    return conversationStore.subscribe(() => setMessages(conversationStore.read()));
  }, []);

  // Seed greeting on first open if empty.
  React.useEffect(() => {
    if (!open) return;
    const existing = conversationStore.read();
    if (existing.length === 0) {
      const greeting: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text:
          language === "hi-IN"
            ? "Namaste — main Bharosa hoon. Scam pakadna, ULIP audit, recovery-agent harassment, ya investment plan — kis cheez mein madad chahiye?"
            : "Namaste — I'm Bharosa. Scam check, ULIP audit, recovery-agent harassment, or an investment plan — which one?",
        language,
        cta: {
          label: language === "hi-IN" ? "Anjali ka dashboard" : "Anjali's dashboard",
          href: "/api/demo/login",
        },
        intent: "general-help",
        createdAt: new Date().toISOString(),
      };
      const next = conversationStore.append(greeting);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessages(next);
    }
  }, [open, language]);

  // Auto-scroll on new messages or pending state.
  React.useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages.length, pending, open]);

  async function handleSend(text: string) {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text,
      language,
      createdAt: new Date().toISOString(),
    };
    let working = conversationStore.append(userMsg);
    setMessages(working);
    setPending(true);
    try {
      const response = await fetch("/api/chat/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: working,
          preferredLanguage: language,
          generateVoice: true,
        }),
      });
      if (!response.ok) throw new Error(`Bharosa server error ${response.status}`);
      const data = await response.json();
      const reply: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: data.text,
        language: data.language ?? language,
        audioUrl: data.audioUrl,
        cta: data.cta,
        intent: data.intent,
        createdAt: new Date().toISOString(),
      };
      working = conversationStore.append(reply);
      setMessages(working);
    } catch (err) {
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text:
          language === "hi-IN"
            ? "Maaf kijiye, main abhi reply nahi de paaya. Thodi der mein phir try kijiye."
            : "Sorry, I couldn't reply just now. Please try again in a moment.",
        language,
        createdAt: new Date().toISOString(),
      };
      working = conversationStore.append(errMsg);
      setMessages(working);
      console.warn("[chat]", (err as Error).message);
    } finally {
      setPending(false);
    }
  }

  function handleClear() {
    conversationStore.clear();
    setMessages([]);
    setMenuOpen(false);
  }

  return (
    <>
      <div
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity md:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-label="Bharosa chat"
        aria-hidden={!open}
        className={cn(
          "fixed z-50 flex flex-col overflow-hidden border border-saathi-paper-edge bg-saathi-paper shadow-lift transition-all",
          // Desktop: anchor bottom-right, fixed width.
          "md:bottom-24 md:right-6 md:h-[640px] md:w-[420px] md:rounded-card",
          // Mobile: full screen modal.
          "inset-x-0 bottom-0 top-14 rounded-t-3xl md:inset-auto",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        {/* Header */}
        <header className="flex min-h-[60px] items-center gap-3 border-b border-black/10 bg-[#064E45] px-3 py-3 text-white">
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-pill text-white/90 transition-colors hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-pill border border-white/20 bg-white shadow-soft">
            <Image
              src="/brand/logo.svg"
              alt="Bharosa"
              width={28}
              height={28}
              priority
            />
          </div>
          <div className="min-w-0 flex-1 py-0.5">
            <div className="flex items-center gap-1 text-sm font-semibold leading-tight text-white">
              Bharosa
              <span aria-hidden className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#22C55E] text-[8px] font-bold leading-none text-white">
                ✓
              </span>
            </div>
            <div className="mt-0.5 truncate text-[11px] leading-tight text-white/80">
              {t("ऑनलाइन · हिन्दी, English", "online · Hindi, English")}
            </div>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="More"
              className="flex h-9 w-9 items-center justify-center rounded-pill text-white/90 transition-colors hover:bg-white/10"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen ? (
              <div className="absolute right-0 top-10 w-44 overflow-hidden rounded-card-sm border border-saathi-paper-edge bg-saathi-paper shadow-lift">
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-body-sm text-saathi-ink-soft hover:bg-saathi-cream-deep"
                >
                  <Eraser className="h-3.5 w-3.5" />
                  {t("बातचीत मिटाएँ", "Clear chat")}
                </button>
              </div>
            ) : null}
          </div>
        </header>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-2 overflow-y-auto bg-[#ECE5DD]/60 px-3 py-3"
        >
          {messages.map((m) => (
            <ChatBubble key={m.id} message={m} />
          ))}
          {pending ? (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-white px-3 py-2 shadow-soft">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-saathi-ink-quiet [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-saathi-ink-quiet [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-saathi-ink-quiet [animation-delay:300ms]" />
              </div>
            </div>
          ) : null}
        </div>

        <ChatComposer language={language} onSend={handleSend} pending={pending} />

        <div className="border-t border-saathi-paper-edge bg-saathi-cream px-3 py-1.5 text-[10px] text-saathi-ink-quiet">
          {t(
            "यह असली Bharosa है, demo नहीं. Real LLM replies.",
            "This is the real Bharosa, not a demo. Real LLM replies.",
          )}
        </div>
      </div>
    </>
  );
}
