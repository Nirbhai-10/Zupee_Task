import type { PhoneId, SimulatorMessage } from "./types";
import type { LanguageCode } from "@/lib/i18n/languages";

/**
 * Demo-day triggers fire pre-scripted message sequences against the
 * SimulatorProvider. Each trigger returns an iterable of timed steps
 * that the orchestrator (TriggerPanel) plays out with `await sleep(ms)`
 * between them.
 *
 * Day 2 ships only the KBC scam → MIL trigger. Days 3-5 add ULIP
 * upload, intake, and salary day.
 */

export type TriggerStep =
  | { kind: "message"; delayMs: number; message: Omit<SimulatorMessage, "id"> }
  | { kind: "typing"; phoneId: PhoneId; isTyping: boolean; delayMs: number }
  | { kind: "scam-check"; phoneId: PhoneId; delayMs: number; messageText: string }
  | { kind: "ulip-audit"; phoneId: PhoneId; delayMs: number }
  | { kind: "build-plan"; phoneId: PhoneId; delayMs: number }
  | { kind: "salary-day"; delayMs: number }
  | { kind: "harassment"; phoneId: PhoneId; delayMs: number }
  | { kind: "vault-evening"; phoneId: PhoneId; delayMs: number };

const KBC_SCAM_TEXT =
  "Mubarak ho! Aap KBC ke lottery mein 25,00,000 jeete hain. Apna lucky number 4509 confirm karne ke liye is number par WhatsApp call karein: +92 3XX XXXXXXX. Yeh offer 24 ghante mein expire ho jayega.";

export function salaryDaySequence(language: LanguageCode = "hi-IN"): TriggerStep[] {
  const isEnglish = language === "en-IN";
  return [
    {
      kind: "message",
      delayMs: 0,
      message: {
        phoneId: "anjali",
        direction: "inbound",
        timestamp: "9:00",
        highlight: "savings",
        variant: {
          kind: "text",
          text: "💰 SALARY CR — UP GOVT ₹38,000 to A/C XXXX9023",
          lang: "en-IN",
        },
      },
    },
    { kind: "typing", phoneId: "anjali", isTyping: true, delayMs: 600 },
    {
      kind: "message",
      delayMs: 700,
      message: {
        phoneId: "anjali",
        direction: "inbound",
        timestamp: "9:00",
        variant: {
          kind: "text",
          text: isEnglish ? "Salary has arrived. Executing the plan now." : "Salary aayi hai. Plan execute kar rahe hain.",
          lang: language,
        },
      },
    },
    { kind: "salary-day", delayMs: 700 },
  ];
}

export function vaultEveningQuestionSequence(language: LanguageCode = "hi-IN"): TriggerStep[] {
  const isEnglish = language === "en-IN";
  return [
    {
      kind: "message",
      delayMs: 0,
      message: {
        phoneId: "anjali",
        direction: "inbound",
        timestamp: "9:00",
        variant: {
          kind: "text",
          text: isEnglish
            ? "Your 9pm private Vault question is here. Family will not see this."
            : "Vault ka 9pm private sawaal aa gaya. Yeh family ko nahi dikhega.",
          lang: language,
        },
      },
    },
    { kind: "vault-evening", phoneId: "anjali", delayMs: 700 },
  ];
}

export function recoveryAgentSequence(language: LanguageCode = "hi-IN"): TriggerStep[] {
  const isEnglish = language === "en-IN";
  return [
    {
      kind: "message",
      delayMs: 0,
      message: {
        phoneId: "anjali",
        direction: "outbound",
        timestamp: "10:15",
        status: "delivered",
        variant: {
          kind: "text",
          text: isEnglish
            ? "Bharosa, a recovery agent is repeatedly calling at 9:45 PM about my brother-in-law's credit card and using threats."
            : "Bharosa, devar ke credit card pe recovery agent baar baar raat 9:45 ko phone kar raha hai, dhamkiyaan de raha hai.",
          lang: language,
        },
      },
    },
    { kind: "typing", phoneId: "anjali", isTyping: true, delayMs: 600 },
    {
      kind: "message",
      delayMs: 700,
      message: {
        phoneId: "anjali",
        direction: "inbound",
        timestamp: "10:15",
        variant: {
          kind: "text",
          text: isEnglish
            ? "This violates RBI recovery rules. I am preparing the letter, Sachet draft, and negotiator call."
            : "RBI Master Circular ke against hai. Letter, Sachet draft, aur agent ko negotiator call ready kar raha hoon.",
          lang: language,
        },
      },
    },
    { kind: "harassment", phoneId: "anjali", delayMs: 1200 },
  ];
}

export function intakeToPlanSequence(language: LanguageCode = "hi-IN"): TriggerStep[] {
  const isEnglish = language === "en-IN";
  return [
    {
      kind: "message",
      delayMs: 0,
      message: {
        phoneId: "anjali",
        direction: "outbound",
        timestamp: "10:02",
        status: "delivered",
        variant: {
          kind: "text",
          text: isEnglish ? "Bharosa, what plan should we make for the money now?" : "Bharosa, ab paise ka kya plan banaaye?",
          lang: language,
        },
      },
    },
    { kind: "typing", phoneId: "anjali", isTyping: true, delayMs: 600 },
    {
      kind: "message",
      delayMs: 700,
      message: {
        phoneId: "anjali",
        direction: "inbound",
        timestamp: "10:02",
        variant: {
          kind: "text",
          text: isEnglish
            ? "Anjali, after household expenses you have ₹5,500 left. I have understood Priya's wedding in 2032, Aarav's coaching in 2027, mother's medical buffer, and Diwali fund. I will prepare the plan in a minute."
            : "Anjali ji, aapke ghar ke kharch ke baad ₹5,500 bachte hain. Beti ki shaadi 2032, bete ki coaching 2027, mummy ka medical, Diwali fund — yeh saare goals samajhe. Ek minute mein plan ready karta hoon.",
          lang: language,
        },
      },
    },
    { kind: "typing", phoneId: "anjali", isTyping: true, delayMs: 800 },
    { kind: "build-plan", phoneId: "anjali", delayMs: 1000 },
  ];
}

export function ulipAuditToAnjaliSequence(language: LanguageCode = "hi-IN"): TriggerStep[] {
  const isEnglish = language === "en-IN";
  return [
    {
      kind: "message",
      delayMs: 0,
      message: {
        phoneId: "anjali",
        direction: "outbound",
        timestamp: "9:45",
        status: "delivered",
        variant: {
          kind: "text",
          text: isEnglish
            ? "Bharosa, the bank is trying to sell me a policy. I am sending the brochure — can you check it?"
            : "Bharosa, ek policy bech rahe hain bank wale. Brochure bhej rahi hoon — dekh sakte ho?",
          lang: language,
        },
      },
    },
    {
      kind: "message",
      delayMs: 800,
      message: {
        phoneId: "anjali",
        direction: "outbound",
        timestamp: "9:45",
        status: "delivered",
        variant: {
          kind: "document",
          fileName: "SuperLife-Wealth-Plus-II.pdf",
          pages: 28,
        },
      },
    },
    { kind: "typing", phoneId: "anjali", isTyping: true, delayMs: 600 },
    {
      kind: "message",
      delayMs: 600,
      message: {
        phoneId: "anjali",
        direction: "inbound",
        timestamp: "9:45",
        variant: {
          kind: "text",
          text: isEnglish ? "Analyzing the document..." : "Document analyze ho raha hai…",
          lang: language,
        },
      },
    },
    { kind: "ulip-audit", phoneId: "anjali", delayMs: 1200 },
  ];
}

export function kbcScamToMilSequence(): TriggerStep[] {
  return [
    // Step 1: KBC scam arrives on MIL's phone (inbound from unknown number).
    {
      kind: "message",
      delayMs: 0,
      message: {
        phoneId: "mil",
        direction: "inbound",
        timestamp: "9:42",
        highlight: "scam",
        variant: { kind: "text", text: KBC_SCAM_TEXT, lang: "hi-IN" },
      },
    },
    // Step 2: MIL forwards to Bharosa — outbound from MIL.
    {
      kind: "message",
      delayMs: 2400,
      message: {
        phoneId: "mil",
        direction: "outbound",
        timestamp: "9:42",
        status: "delivered",
        variant: {
          kind: "text",
          text: "Bahurani, yeh kya aaya hai? Sahi hai ya nahi?",
          lang: "hi-IN",
        },
      },
    },
    // Step 3: Bharosa shows typing.
    { kind: "typing", phoneId: "mil", isTyping: true, delayMs: 600 },
    // Step 4: Run the actual scam-check API call. The orchestrator handles
    //          the response and pushes the resulting voice + text bubbles.
    { kind: "scam-check", phoneId: "mil", delayMs: 1200, messageText: KBC_SCAM_TEXT },
  ];
}
