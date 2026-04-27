import { z } from "zod";
import { generateObject, isRecoverableLLMError } from "@/lib/llm/router";
import { CHAT_RESPOND_SYSTEM_V1 } from "@/lib/llm/prompts/chat-respond.v1";
import { detectScript } from "@/lib/i18n/scripts";
import { isLanguageCode, type LanguageCode } from "@/lib/i18n/languages";
import type { ChatMessage } from "@/lib/chat/types";

const ChatResponseSchema = z.object({
  intent: z.enum([
    "scam-check",
    "ulip-audit",
    "investment-question",
    "harassment-help",
    "general-help",
    "small-talk",
  ]),
  text: z.string().min(1).max(800),
  language: z.string(),
  cta: z
    .object({
      label: z.string(),
      href: z.string(),
    })
    .nullable()
    .optional(),
});

export type ChatResolved = {
  intent: z.infer<typeof ChatResponseSchema>["intent"];
  text: string;
  language: LanguageCode;
  cta: { label: string; href: string } | null;
  source: "llm" | "mock-template";
};

export async function respondToChat(
  history: ChatMessage[],
  preferredLanguage: LanguageCode = "hi-IN",
): Promise<ChatResolved> {
  const last = history[history.length - 1];
  if (!last || last.role !== "user") {
    return mockReply("namaste", preferredLanguage);
  }

  // Trim to last 8 turns so the prompt stays small.
  const trimmed = history.slice(-8);
  const transcriptForPrompt = trimmed
    .map((m) => `${m.role === "user" ? "User" : "Bharosa"}: ${m.text}`)
    .join("\n");

  try {
    const { object } = await generateObject({
      schema: ChatResponseSchema,
      schemaName: "BharosaChatResponse",
      schemaDescription: "Bharosa landing-page chat reply",
      feature: "chat-respond",
      tier: "haiku",
      system: CHAT_RESPOND_SYSTEM_V1,
      prompt: `Conversation so far:\n${transcriptForPrompt}\n\nReply to the user's latest message. JSON only.`,
      temperature: 0.5,
      maxOutputTokens: 2000,
    });
    const lang = isLanguageCode(object.language) ? object.language : preferredLanguage;
    return {
      intent: object.intent,
      text: object.text.trim(),
      language: lang,
      cta: object.cta ?? null,
      source: "llm",
    };
  } catch (error) {
    if (isRecoverableLLMError(error)) {
      return mockReply(last.text, preferredLanguage);
    }
    throw error;
  }
}

/**
 * Heuristic fallback used when no LLM key is configured (e.g. on Vercel
 * production without a cloud key). Routes by keyword to one of six
 * canned responses. Believable enough that the demo doesn't break.
 */
function mockReply(userText: string, preferredLanguage: LanguageCode): ChatResolved {
  const lower = userText.toLowerCase();
  const script = detectScript(userText);
  const lang: LanguageCode =
    script === "devanagari" ? "hi-IN" : script === "latin" ? preferredLanguage : preferredLanguage;
  const isHi = lang === "hi-IN" || /[ऀ-ॿ]/.test(userText);

  const matchScam =
    /\b(kbc|lottery|jeete|inaam|kyc|aadhaar|otp|tax\s*refund|\+92|bank\s*account|digital\s*arrest)\b/.test(
      lower,
    );
  const matchUlip = /\b(ulip|endowment|policy|brochure|wealth\s*\+)\b/.test(lower);
  const matchInvest = /\b(invest|sip|mutual\s*fund|goal|saving|bachat|nivesh)\b/.test(lower);
  const matchHarass = /\b(recovery|harass|harassment|agent|dhamki|threat|raat\s*ko)\b/.test(lower);

  if (matchScam) {
    return {
      intent: "scam-check",
      language: lang,
      cta: { label: isHi ? "Live simulator" : "Live simulator", href: "/demo/simulator" },
      source: "mock-template",
      text: isHi
        ? "Yeh classic scam pattern lag raha hai — KBC / fake bank / +92 number jaisa. Reply mat dijiye, link mat dabaayein, message delete kar dijiye. Detail audit ke liye live simulator try karein."
        : "This reads like a classic scam pattern — KBC / fake bank / unknown +92 number. Don't reply, don't click any link, delete it. Try the live simulator for a full audit.",
    };
  }
  if (matchUlip) {
    return {
      intent: "ulip-audit",
      language: lang,
      cta: { label: isHi ? "Sample audit" : "Sample audit", href: "/demo#ulip-audit" },
      source: "mock-template",
      text: isHi
        ? "ULIP brochure bhejein, ya seeded sample chala lijiye — 60 second mein actual fees, lock-in, aur term + SIP se kitna bachta hai dikha denge."
        : "Send the ULIP brochure, or run our seeded sample — in 60 seconds you'll see the actual fees, lock-in, and how much a term + SIP alternative would save.",
    };
  }
  if (matchHarass) {
    return {
      intent: "harassment-help",
      language: lang,
      cta: { label: isHi ? "See it run" : "See it run", href: "/demo/simulator" },
      source: "mock-template",
      text: isHi
        ? "3 cheezein chahiye — agent ka naam, agency ka naam, aur kab kya bola. Hum cease-and-desist letter, RBI Sachet draft, aur unko vernacular voice call ki script generate kar denge."
        : "I need three things — the agent's name, the agency, and what they said and when. I'll generate a cease-and-desist letter, an RBI Sachet draft, and a vernacular voice call to the agent.",
    };
  }
  if (matchInvest) {
    return {
      intent: "investment-question",
      language: lang,
      cta: { label: isHi ? "Plan banwayein" : "Build a plan", href: "/demo/simulator" },
      source: "mock-template",
      text: isHi
        ? "Bharosa goals-pehle approach use karta hai — gold, FD, Sukanya, PPF first; mutual funds tab jab aap comfortable hon. Apne real numbers daalkar plan banwayein."
        : "Bharosa is goals-first — gold, FD, Sukanya, PPF before mutual funds. Walk through a plan with your real numbers in the live simulator.",
    };
  }
  return {
    intent: "general-help",
    language: lang,
    cta: { label: isHi ? "Anjali ka dashboard" : "Anjali's dashboard", href: "/api/demo/login" },
    source: "mock-template",
    text: isHi
      ? "Main Bharosa hoon. Char cheezon mein madad karta hoon — scam pakadna, ULIP audit, recovery-agent harassment ka jawab, aur goals-pehle investment plan."
      : "I'm Bharosa. I help with four things — catching scams, auditing mis-sold ULIPs, fighting recovery-agent harassment, and building goal-anchored investment plans.",
  };
}
