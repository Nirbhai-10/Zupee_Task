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
  | { kind: "scam-check"; phoneId: PhoneId; delayMs: number; messageText: string };

const KBC_SCAM_TEXT =
  "Mubarak ho! Aap KBC ke lottery mein 25,00,000 jeete hain. Apna lucky number 4509 confirm karne ke liye is number par WhatsApp call karein: +92 3XX XXXXXXX. Yeh offer 24 ghante mein expire ho jayega.";

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
