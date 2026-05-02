"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  Copy,
  Languages,
  Loader2,
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useT, useLanguage } from "@/lib/i18n/language-context";
import type { LanguageCode } from "@/lib/i18n/languages";
import { useVoiceAgent, type VoiceAgentState, type VoiceTurn } from "@/hooks/use-voice-agent";
import { cn } from "@/lib/utils/cn";

function appLangToCode(appLang: "hi" | "en"): LanguageCode {
  return appLang === "en" ? "en-IN" : "hi-IN";
}

/** All 11 voice-agent supported languages.
 *
 *  endonym renders in the speaker's native script so a Bengali user
 *  immediately recognises বাংলা rather than reading "Bengali" in English.
 *  All eleven map cleanly to Sarvam saarika:v2.5 STT + bulbul:v3 TTS
 *  with native speakers wired up in lib/voice/sarvam-voice.ts.
 */
const VOICE_LANGUAGES: {
  code: LanguageCode;
  endonym: string;
  english: string;
}[] = [
  { code: "hi-IN", endonym: "हिन्दी", english: "Hindi" },
  { code: "en-IN", endonym: "English", english: "English" },
  { code: "ta-IN", endonym: "தமிழ்", english: "Tamil" },
  { code: "te-IN", endonym: "తెలుగు", english: "Telugu" },
  { code: "mr-IN", endonym: "मराठी", english: "Marathi" },
  { code: "bn-IN", endonym: "বাংলা", english: "Bengali" },
  { code: "gu-IN", endonym: "ગુજરાતી", english: "Gujarati" },
  { code: "kn-IN", endonym: "ಕನ್ನಡ", english: "Kannada" },
  { code: "ml-IN", endonym: "മലയാളം", english: "Malayalam" },
  { code: "pa-IN", endonym: "ਪੰਜਾਬੀ", english: "Punjabi" },
  { code: "or-IN", endonym: "ଓଡ଼ିଆ", english: "Odia" },
];

/**
 * Per-language greeting + suggested-prompt chips.
 *
 * Hindi + English get full localisation. The other nine languages get
 * a short native greeting and the same scenario chips in their script
 * so the chip click sends a real, native-script question (the chat
 * model then replies in the same script — see chat-respond.v1.ts and
 * the per-language steering in domain/chat/respond.ts).
 */
type LangPack = {
  greeting: string;
  prompts: { label: string; text: string }[];
};

const LANG_PACK: Record<LanguageCode, LangPack> = {
  "hi-IN": {
    greeting:
      "नमस्ते, मैं Bharosa हूँ. Mic दबाइए — scam, ULIP, recovery agent, या salary plan, kuchh भी पूछिए.",
    prompts: [
      { label: "📞 KBC scam", text: "Mummy ko WhatsApp pe KBC 25 lakh lottery ka message aaya hai — sahi hai ya scam?" },
      { label: "🧾 ULIP audit", text: "Bank wale ek Wealth Plus policy bech rahe hain — kya yeh sahi hai?" },
      { label: "💼 Recovery agent", text: "Devar ke credit card pe recovery agent raat 9 baje threat de raha hai. Kya karein?" },
      { label: "💰 Salary plan", text: "Mera salary 38,000 hai, ghar ke kharch ke baad 5,500 bachte hain. Kaise plan karein?" },
    ],
  },
  "en-IN": {
    greeting:
      "Hi, I'm Bharosa. Press and hold the mic and ask in your own voice — scams, ULIPs, recovery agents, or salary planning.",
    prompts: [
      { label: "📞 KBC scam", text: "Mummy got a WhatsApp saying she won ₹25 lakh in a KBC lottery — is this real or a scam?" },
      { label: "🧾 ULIP audit", text: "The bank is pushing a Wealth Plus policy on me — should I take it?" },
      { label: "💼 Recovery agent", text: "A recovery agent is calling about my brother-in-law's credit card at 9 PM with threats. What can we do?" },
      { label: "💰 Salary plan", text: "My salary is ₹38,000 and after expenses I have ₹5,500 left. How should I plan it across 4 goals?" },
    ],
  },
  "ta-IN": {
    greeting:
      "வணக்கம், நான் Bharosa. Mic-ஐ அழுத்தி உங்கள் மொழியில் கேளுங்கள் — scam, ULIP, recovery agent, அல்லது சம்பளத் திட்டம்.",
    prompts: [
      { label: "📞 KBC scam", text: "அம்மாவுக்கு KBC ₹25 லட்சம் lottery WhatsApp வந்துள்ளது — இது உண்மையா அல்லது scam-ஆ?" },
      { label: "🧾 ULIP audit", text: "Bank ஒரு ULIP policy-ஐ தள்ளுகிறது — இதை வாங்கலாமா?" },
      { label: "💼 Recovery agent", text: "Recovery agent இரவு 9 மணிக்கு threat கொடுக்கிறார். என்ன செய்வது?" },
      { label: "💰 Salary plan", text: "என் salary ₹38,000, செலவுக்கு பிறகு ₹5,500 மிச்சம். எப்படி திட்டமிடுவது?" },
    ],
  },
  "te-IN": {
    greeting:
      "నమస్కారం, నేను Bharosa. Mic నొక్కి మీ భాషలో అడగండి — scam, ULIP, recovery agent, లేదా salary plan.",
    prompts: [
      { label: "📞 KBC scam", text: "అమ్మకు KBC ₹25 లక్షల lottery WhatsApp వచ్చింది — ఇది నిజమా లేదా scam-ఆ?" },
      { label: "🧾 ULIP audit", text: "Bank ఒక ULIP policy అమ్ముతోంది — తీసుకోవచ్చా?" },
      { label: "💼 Recovery agent", text: "Recovery agent రాత్రి 9 గంటలకు threat ఇస్తున్నాడు. ఏమి చేయాలి?" },
      { label: "💰 Salary plan", text: "నా salary ₹38,000, ఖర్చుల తర్వాత ₹5,500 మిగులు. ఎలా plan చేయాలి?" },
    ],
  },
  "mr-IN": {
    greeting:
      "नमस्कार, मी Bharosa आहे. Mic दाबा आणि तुमच्या भाषेत विचारा — scam, ULIP, recovery agent किंवा salary plan.",
    prompts: [
      { label: "📞 KBC scam", text: "आईला KBC ₹25 लाख lottery WhatsApp आला आहे — हे खरं आहे का scam आहे?" },
      { label: "🧾 ULIP audit", text: "Bank एक ULIP policy विकत आहे — घ्यावी का?" },
      { label: "💼 Recovery agent", text: "Recovery agent रात्री ९ वाजता धमकी देतो आहे. काय करावे?" },
      { label: "💰 Salary plan", text: "माझा salary ₹38,000, खर्चांनंतर ₹5,500 शिल्लक. कसा plan करू?" },
    ],
  },
  "bn-IN": {
    greeting:
      "নমস্কার, আমি Bharosa. Mic চেপে আপনার ভাষায় জিজ্ঞাসা করুন — scam, ULIP, recovery agent, অথবা salary plan.",
    prompts: [
      { label: "📞 KBC scam", text: "মা WhatsApp-এ KBC ₹25 লাখ lottery message পেয়েছেন — এটি সত্যি না scam?" },
      { label: "🧾 ULIP audit", text: "Bank একটি ULIP policy বিক্রি করছে — নেওয়া উচিত?" },
      { label: "💼 Recovery agent", text: "Recovery agent রাত ৯টায় threat দিচ্ছে। কী করব?" },
      { label: "💰 Salary plan", text: "আমার salary ₹38,000, খরচের পরে ₹5,500 থাকে। কীভাবে plan করব?" },
    ],
  },
  "gu-IN": {
    greeting:
      "નમસ્તે, હું Bharosa છું. Mic દબાવો અને તમારી ભાષામાં પૂછો — scam, ULIP, recovery agent અથવા salary plan.",
    prompts: [
      { label: "📞 KBC scam", text: "મમ્મીને KBC ₹25 લાખ lottery WhatsApp આવ્યો — શું આ સાચું છે કે scam?" },
      { label: "🧾 ULIP audit", text: "Bank એક ULIP policy વેચી રહી છે — લેવી જોઈએ?" },
      { label: "💼 Recovery agent", text: "Recovery agent રાત્રે 9 વાગ્યે threat આપે છે. શું કરવું?" },
      { label: "💰 Salary plan", text: "મારી salary ₹38,000, ખર્ચ પછી ₹5,500 બચે છે. કેવી રીતે plan કરું?" },
    ],
  },
  "kn-IN": {
    greeting:
      "ನಮಸ್ಕಾರ, ನಾನು Bharosa. Mic ಒತ್ತಿ ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಕೇಳಿ — scam, ULIP, recovery agent ಅಥವಾ salary plan.",
    prompts: [
      { label: "📞 KBC scam", text: "ಅಮ್ಮಗೆ KBC ₹25 ಲಕ್ಷ lottery WhatsApp ಬಂದಿದೆ — ಇದು ನಿಜವೋ scam-ಓ?" },
      { label: "🧾 ULIP audit", text: "Bank ಒಂದು ULIP policy ಮಾರುತ್ತಿದೆ — ತೆಗೆದುಕೊಳ್ಳಬಹುದಾ?" },
      { label: "💼 Recovery agent", text: "Recovery agent ರಾತ್ರಿ 9 ಗಂಟೆಗೆ ಬೆದರಿಕೆ ಹಾಕುತ್ತಿದ್ದಾನೆ. ಏನು ಮಾಡಬೇಕು?" },
      { label: "💰 Salary plan", text: "ನನ್ನ salary ₹38,000, ಖರ್ಚಿನ ನಂತರ ₹5,500 ಉಳಿಯುತ್ತದೆ. ಹೇಗೆ plan ಮಾಡಲಿ?" },
    ],
  },
  "ml-IN": {
    greeting:
      "നമസ്കാരം, ഞാൻ Bharosa ആണ്. Mic അമർത്തി നിങ്ങളുടെ ഭാഷയിൽ ചോദിക്കൂ — scam, ULIP, recovery agent അല്ലെങ്കിൽ salary plan.",
    prompts: [
      { label: "📞 KBC scam", text: "അമ്മയ്ക്ക് KBC ₹25 ലക്ഷം lottery WhatsApp വന്നു — ഇത് സത്യമോ scam-ഓ?" },
      { label: "🧾 ULIP audit", text: "Bank ഒരു ULIP policy വിൽക്കുന്നു — എടുക്കണോ?" },
      { label: "💼 Recovery agent", text: "Recovery agent രാത്രി 9 മണിക്ക് ഭീഷണിപ്പെടുത്തുന്നു. എന്ത് ചെയ്യണം?" },
      { label: "💰 Salary plan", text: "എന്റെ salary ₹38,000, ചെലവിന് ശേഷം ₹5,500 ബാക്കി. എങ്ങനെ plan ചെയ്യും?" },
    ],
  },
  "pa-IN": {
    greeting:
      "ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਮੈਂ Bharosa ਹਾਂ. Mic ਦਬਾਓ ਅਤੇ ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਪੁੱਛੋ — scam, ULIP, recovery agent ਜਾਂ salary plan.",
    prompts: [
      { label: "📞 KBC scam", text: "ਮਾਂ ਨੂੰ KBC ₹25 ਲੱਖ lottery WhatsApp ਆਇਆ — ਕੀ ਇਹ ਸੱਚ ਹੈ ਜਾਂ scam?" },
      { label: "🧾 ULIP audit", text: "Bank ਇੱਕ ULIP policy ਵੇਚ ਰਿਹਾ ਹੈ — ਕੀ ਲੈਣੀ ਚਾਹੀਦੀ?" },
      { label: "💼 Recovery agent", text: "Recovery agent ਰਾਤ 9 ਵਜੇ ਧਮਕੀ ਦੇ ਰਿਹਾ ਹੈ. ਕੀ ਕਰੀਏ?" },
      { label: "💰 Salary plan", text: "ਮੇਰੀ salary ₹38,000, ਖਰਚ ਤੋਂ ਬਾਅਦ ₹5,500 ਬਚਦੇ ਹਨ. ਕਿਵੇਂ plan ਕਰਾਂ?" },
    ],
  },
  "or-IN": {
    greeting:
      "ନମସ୍କାର, ମୁଁ Bharosa. Mic ଚାପନ୍ତୁ ଏବଂ ଆପଣଙ୍କ ଭାଷାରେ ପଚାରନ୍ତୁ — scam, ULIP, recovery agent କିମ୍ବା salary plan.",
    prompts: [
      { label: "📞 KBC scam", text: "ମା'ଙ୍କୁ KBC ₹25 ଲକ୍ଷ lottery WhatsApp ଆସିଛି — ଏହା ସତ କି scam?" },
      { label: "🧾 ULIP audit", text: "Bank ଗୋଟିଏ ULIP policy ବିକ୍ରୟ କରୁଛି — ନେବା ଉଚିତ?" },
      { label: "💼 Recovery agent", text: "Recovery agent ରାତି ୯ଟାରେ ଧମକ ଦେଉଛନ୍ତି. କଣ କରିବି?" },
      { label: "💰 Salary plan", text: "ମୋ salary ₹38,000, ଖର୍ଚ୍ଚ ପରେ ₹5,500 ବଚୁଛି. କିପରି plan କରିବି?" },
    ],
  },
};

const STATE_LABEL: Record<VoiceAgentState, { hi: string; en: string }> = {
  idle: { hi: "दबाएँ और बोलिए", en: "Press & talk" },
  recording: { hi: "सुन रहा हूँ…", en: "Listening…" },
  transcribing: { hi: "समझ रहा हूँ…", en: "Transcribing…" },
  thinking: { hi: "सोच रहा हूँ…", en: "Thinking…" },
  speaking: { hi: "बोल रहा हूँ…", en: "Speaking…" },
};

/**
 * Big "Press & Talk" voice agent. Drives the Sarvam STT → Sarvam-M chat
 * → Sarvam bulbul TTS pipeline through the `useVoiceAgent` hook.
 *
 * Multi-language: 11-language dropdown selects the voice-session
 * language. The selected language is wired end-to-end:
 *   - STT: language_code passed to /api/voice/stt
 *   - chat: preferredLanguage passed to /api/chat/respond which forces
 *     native-script reply via the steering instruction in respond.ts
 *   - TTS: bulbul:v3 picks the matching native speaker via
 *     V3_SPEAKERS_BY_LANG in lib/voice/sarvam-voice.ts (so a Tamil
 *     reply is spoken by `ishita`, never the Hindi `priya`)
 */
export function VoiceAgent({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const t = useT();
  const { lang: appLang } = useLanguage();
  // Default voice-session language to whichever the global UI picker is
  // on; user can change it independently with the dropdown below.
  const [voiceLang, setVoiceLang] = useState<LanguageCode>(appLangToCode(appLang));

  // If the user toggles the global UI language while the voice agent
  // is open and they're still on the default Hindi/English voice, mirror
  // it. Wrapped in a no-op state-action to keep the linter happy
  // (calling setState directly inside useEffect triggers
  // react-hooks/set-state-in-effect — the queueMicrotask defers until
  // after the effect body returns).
  useEffect(() => {
    queueMicrotask(() => {
      setVoiceLang((prev) =>
        prev === "hi-IN" || prev === "en-IN" ? appLangToCode(appLang) : prev,
      );
    });
  }, [appLang]);

  const langPack = LANG_PACK[voiceLang] ?? LANG_PACK["en-IN"];

  const {
    state,
    turns,
    error,
    supported,
    startRecording,
    submitRecording,
    sendText,
    clear,
    isBusy,
  } = useVoiceAgent({ language: voiceLang, greeting: langPack.greeting });

  const onPressDown = useCallback(() => {
    void startRecording();
  }, [startRecording]);

  const onPressUp = useCallback(() => {
    void submitRecording();
  }, [submitRecording]);

  // Spacebar walkie-talkie.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let isHolding = false;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (state !== "idle") return;
      isHolding = true;
      e.preventDefault();
      onPressDown();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space" || !isHolding) return;
      isHolding = false;
      e.preventDefault();
      onPressUp();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [onPressDown, onPressUp, state]);

  if (!supported) {
    return (
      <div
        className={cn(
          "rounded-card border border-saathi-paper-edge bg-saathi-paper p-6 text-center text-saathi-ink-soft",
          className,
        )}
      >
        {t(
          "यह browser mic record नहीं कर सकता। Chrome / Safari पर खोलिए।",
          "This browser can't record from the mic. Please open in Chrome or Safari.",
        )}
      </div>
    );
  }

  const userTurnCount = turns.filter((t) => t.role === "user").length;
  const showSuggestions = userTurnCount === 0 && state === "idle";

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-card border border-saathi-deep-green-line bg-gradient-to-br from-saathi-deep-green via-[#0d4f3f] to-[#082f24] text-white shadow-lift",
        compact ? "p-6" : "p-8 sm:p-10",
        className,
      )}
      aria-label={t("Bharosa voice agent", "Bharosa voice agent")}
    >
      <Halos />

      <div className="relative grid items-stretch gap-8 lg:grid-cols-[auto_1fr]">
        {/* Mic + status */}
        <div className="flex flex-col items-center gap-4">
          <PressTalkButton
            state={state}
            compact={compact}
            onDown={onPressDown}
            onUp={onPressUp}
          />
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-h3 font-semibold tracking-tight">
              {t(STATE_LABEL[state].hi, STATE_LABEL[state].en)}
            </span>
            <span className="text-caption text-white/65">
              {t(
                "होल्ड करें · छोड़ें भेजने के लिए · SPACE = walkie-talkie",
                "Hold to record · release to send · SPACE = walkie-talkie",
              )}
            </span>
          </div>
        </div>

        {/* Conversation panel */}
        <div className="flex min-h-[300px] flex-col gap-3 rounded-card-sm bg-white/[0.06] p-4 backdrop-blur-sm">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-caption uppercase tracking-wide text-white/65">
            <div className="inline-flex items-center gap-2">
              <span>{t("बातचीत", "Conversation")}</span>
              <a
                href="https://sarvam.ai"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-100 transition hover:bg-emerald-400/25"
                title="Powered by Sarvam-M, bulbul:v3 TTS, saarika:v2.5 STT"
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full bg-zupee-yellow",
                    isBusy && "animate-pulse",
                  )}
                />
                Sarvam · Bharat-native
              </a>
            </div>
            <div className="inline-flex items-center gap-2">
              <VoiceLanguageSelect
                value={voiceLang}
                onChange={(next) => setVoiceLang(next)}
                disabled={isBusy}
              />
              <CopyTranscriptButton turns={turns} disabled={turns.length === 0} />
              <button
                type="button"
                onClick={clear}
                disabled={isBusy || turns.length <= 1}
                className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[11px] font-medium text-white/85 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                title={t("बातचीत reset करें", "Clear conversation")}
              >
                <RotateCcw className="h-3 w-3" />
                {t("Reset", "Clear")}
              </button>
            </div>
          </div>

          {/* Bubbles */}
          <div className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
            {turns.map((turn) => (
              <ConversationBubble key={turn.id} turn={turn} />
            ))}
            {state === "transcribing" && (
              <TypingHint label={t("समझ रहा हूँ…", "transcribing…")} />
            )}
            {state === "thinking" && (
              <TypingHint label={t("जवाब बना रहा हूँ…", "drafting reply…")} />
            )}
          </div>

          {/* Suggested-prompt chips — localised per voice language */}
          {showSuggestions && (
            <div className="flex flex-col gap-2 border-t border-white/10 pt-3">
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/55">
                <Sparkles className="h-3 w-3" />
                {t("कोशिश कीजिए", "Try one of these")}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {langPack.prompts.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => sendText(p.text)}
                    disabled={isBusy}
                    className="rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-caption text-white/85 transition hover:bg-white/[0.16] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-card-sm border border-saathi-danger/40 bg-saathi-danger/15 px-3 py-2 text-caption text-white">
              <span className="font-semibold text-saathi-danger-soft">
                {t("रुकिए — ", "Heads up — ")}
              </span>
              <span className="text-white/90">{error}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Halos() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-saathi-gold/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-300/15 blur-3xl"
      />
    </>
  );
}

function PressTalkButton({
  state,
  compact,
  onDown,
  onUp,
}: {
  state: VoiceAgentState;
  compact: boolean;
  onDown: () => void;
  onUp: () => void;
}) {
  const isBusy =
    state === "transcribing" || state === "thinking" || state === "speaking";

  return (
    <button
      type="button"
      onMouseDown={onDown}
      onMouseUp={onUp}
      onMouseLeave={state === "recording" ? onUp : undefined}
      onTouchStart={(e) => {
        e.preventDefault();
        onDown();
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        onUp();
      }}
      disabled={isBusy}
      aria-pressed={state === "recording"}
      className={cn(
        "group relative flex items-center justify-center rounded-full transition-all duration-300 ease-out",
        compact ? "h-32 w-32" : "h-44 w-44 sm:h-52 sm:w-52",
        state === "recording"
          ? "scale-105 bg-saathi-danger/95 shadow-[0_0_0_18px_rgba(229,72,77,0.18),0_0_0_36px_rgba(229,72,77,0.10)]"
          : isBusy
            ? "bg-saathi-gold/85 shadow-[0_0_0_14px_rgba(199,156,72,0.22)]"
            : "bg-white text-saathi-deep-green shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)] hover:scale-[1.03]",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-saathi-gold/60",
      )}
    >
      {state === "recording" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-saathi-danger/30"
        />
      )}
      <MicIcon state={state} compact={compact} />
    </button>
  );
}

function MicIcon({ state, compact }: { state: VoiceAgentState; compact: boolean }) {
  const size = compact ? "h-12 w-12" : "h-16 w-16 sm:h-20 sm:w-20";
  if (state === "transcribing" || state === "thinking") {
    return <Loader2 className={cn(size, "animate-spin text-white")} aria-hidden />;
  }
  if (state === "speaking") {
    return <Volume2 className={cn(size, "text-white")} aria-hidden />;
  }
  if (state === "recording") {
    return <MicOff className={cn(size, "text-white")} aria-hidden />;
  }
  return <Mic className={cn(size)} aria-hidden />;
}

function ConversationBubble({ turn }: { turn: VoiceTurn }) {
  const isUser = turn.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[88%] rounded-2xl px-3 py-2 text-body-sm leading-relaxed shadow-soft",
          isUser
            ? "rounded-tr-sm bg-saathi-gold/95 text-saathi-deep-green"
            : "rounded-tl-sm bg-white text-saathi-ink",
        )}
        data-script={scriptForLang(turn.language)}
        lang={turn.language ?? undefined}
      >
        {turn.text}
      </div>
    </div>
  );
}

function TypingHint({ label }: { label: string }) {
  return (
    <div className="flex justify-start">
      <div className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-3 py-2 text-caption text-white/80">
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        {label}
      </div>
    </div>
  );
}

/** 11-language dropdown. Native script in the trigger, English name as
 *  the secondary hint. Standard <select> for keyboard accessibility +
 *  mobile native picker UX. */
function VoiceLanguageSelect({
  value,
  onChange,
  disabled,
}: {
  value: LanguageCode;
  onChange: (next: LanguageCode) => void;
  disabled?: boolean;
}) {
  const current = VOICE_LANGUAGES.find((l) => l.code === value) ?? VOICE_LANGUAGES[0];
  return (
    <label
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 pl-2 pr-7 py-1 text-[11px] font-semibold text-white/85",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-white/10",
      )}
      title={current.english}
    >
      <Languages className="h-3 w-3 shrink-0" aria-hidden />
      <span className="whitespace-nowrap">{current.endonym}</span>
      <ChevronDown className="absolute right-1.5 h-3 w-3 text-white/60" aria-hidden />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as LanguageCode)}
        disabled={disabled}
        aria-label="Voice language"
        className="absolute inset-0 cursor-pointer appearance-none bg-transparent text-transparent opacity-0"
      >
        {VOICE_LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} className="bg-saathi-deep-green text-white">
            {l.endonym} — {l.english}
          </option>
        ))}
      </select>
    </label>
  );
}

function CopyTranscriptButton({
  turns,
  disabled,
}: {
  turns: VoiceTurn[];
  disabled?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    const text = turns
      .map((t) => `${t.role === "user" ? "You" : "Bharosa"}: ${t.text}`)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard denied — silently no-op.
    }
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      disabled={disabled}
      className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[11px] font-medium text-white/85 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
      title="Copy transcript"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/** Map a language code to a script attribute so per-script CSS picks
 *  the right font stack (Devanagari, Tamil, Bengali, etc.). */
function scriptForLang(lang: LanguageCode | undefined): string | undefined {
  if (!lang) return undefined;
  if (lang.startsWith("hi") || lang.startsWith("mr")) return "devanagari";
  if (lang.startsWith("ta")) return "tamil";
  if (lang.startsWith("te")) return "telugu";
  if (lang.startsWith("bn")) return "bengali";
  if (lang.startsWith("gu")) return "gujarati";
  if (lang.startsWith("kn")) return "kannada";
  if (lang.startsWith("ml")) return "malayalam";
  if (lang.startsWith("pa")) return "gurmukhi";
  if (lang.startsWith("or")) return "odia";
  return undefined;
}
