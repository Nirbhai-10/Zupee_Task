import type { PhoneId, SimulatorMessage } from "./types";

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
  | { kind: "salary-day"; delayMs: number };

const KBC_SCAM_TEXT =
  "Mubarak ho! Aap KBC ke lottery mein 25,00,000 jeete hain. Apna lucky number 4509 confirm karne ke liye is number par WhatsApp call karein: +92 3XX XXXXXXX. Yeh offer 24 ghante mein expire ho jayega.";

export function salaryDaySequence(): TriggerStep[] {
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
          text: "Salary aayi hai. Plan execute kar rahe hain.",
          lang: "hi-IN",
        },
      },
    },
    { kind: "salary-day", delayMs: 700 },
  ];
}

export function intakeToPlanSequence(): TriggerStep[] {
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
          text: "Saathi, ab paise ka kya plan banaaye?",
          lang: "hi-IN",
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
          text: "Anjali ji, aapke ghar ke kharch ke baad ₹5,500 bachte hain. Beti ki shaadi 2032, bete ki coaching 2027, mummy ka medical, Diwali fund — yeh saare goals samajhe. Ek minute mein plan ready karta hoon.",
          lang: "hi-IN",
        },
      },
    },
    { kind: "typing", phoneId: "anjali", isTyping: true, delayMs: 800 },
    { kind: "build-plan", phoneId: "anjali", delayMs: 1000 },
  ];
}

export function ulipAuditToAnjaliSequence(): TriggerStep[] {
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
          text: "Saathi, ek policy bech rahe hain bank wale. Brochure bhej rahi hoon — dekh sakte ho?",
          lang: "hi-IN",
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
          text: "Document analyze ho raha hai…",
          lang: "hi-IN",
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
    // Step 2: MIL forwards to Saathi — outbound from MIL.
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
    // Step 3: Saathi shows typing.
    { kind: "typing", phoneId: "mil", isTyping: true, delayMs: 600 },
    // Step 4: Run the actual scam-check API call. The orchestrator handles
    //          the response and pushes the resulting voice + text bubbles.
    { kind: "scam-check", phoneId: "mil", delayMs: 1200, messageText: KBC_SCAM_TEXT },
  ];
}
