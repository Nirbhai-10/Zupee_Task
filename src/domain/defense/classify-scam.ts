import { generateObject, isRecoverableLLMError } from "@/lib/llm/router";
import { ScamClassification } from "@/lib/llm/schemas";
import { SCAM_CLASSIFY_SYSTEM_V1 } from "@/lib/llm/prompts/scam-classify.v1";
import { SCAM_PATTERNS_SEED } from "@/lib/mocks/scam-patterns";
import type { LanguageCode } from "@/lib/i18n/languages";

/**
 * Classify a forwarded message for scam-likelihood. Returns a typed
 * ScamClassification.
 *
 * If no LLM key is configured, falls back to a deterministic heuristic
 * over the seeded pattern bank — useful for the demo to produce
 * believable output without credentials. The fallback is clearly tagged
 * via the `provider: "mock"` field so callers can surface "running in
 * mock mode" if relevant.
 */

export type ClassifyScamArgs = {
  message: string;
  receiver: {
    relationship: string;
    ageBand: string;
    language: LanguageCode;
    name: string;
  };
  /** Optional: nearest-neighbour matches from pgvector. Day 2 feeds at
   *  most 5; the prompt expects up to 5. */
  matches?: Array<{
    patternName: string;
    category: string;
    representativeText: string;
    identifyingPhrases: string[];
    payloadType: string;
    similarity: number;
  }>;
  userId?: string;
};

export type ClassifyScamResult = {
  classification: ScamClassification;
  source: "llm" | "mock-heuristic";
  matchedPatternName?: string;
};

export async function classifyScam(
  args: ClassifyScamArgs,
): Promise<ClassifyScamResult> {
  const matchesText = (args.matches ?? [])
    .map(
      (m, i) =>
        `Match ${i + 1} (similarity ${m.similarity.toFixed(2)}): ` +
        `${m.patternName} [${m.category}] — ${m.representativeText}`,
    )
    .join("\n");

  const userMessage = [
    `Receiver: ${args.receiver.name} (${args.receiver.relationship}, age ${args.receiver.ageBand}, language ${args.receiver.language}).`,
    matchesText ? `Pattern matches:\n${matchesText}` : "Pattern matches: none above similarity threshold.",
    `Message:\n"""\n${args.message}\n"""`,
  ].join("\n\n");

  try {
    const result = await generateObject({
      schema: ScamClassification,
      schemaName: "ScamClassification",
      schemaDescription: "Classification of a forwarded message for scam-likelihood.",
      feature: "scam-classify",
      tier: "haiku",
      system: SCAM_CLASSIFY_SYSTEM_V1,
      prompt: userMessage,
      temperature: 0.1,
      userId: args.userId,
      meta: { matchCount: args.matches?.length ?? 0 },
    });
    return {
      classification: result.object,
      source: "llm",
      matchedPatternName: args.matches?.[0]?.patternName,
    };
  } catch (error) {
    if (isRecoverableLLMError(error)) {
      return mockClassifyHeuristic(args);
    }
    throw error;
  }
}

/**
 * Deterministic fallback used when no LLM key is configured. Picks the
 * single best-matching seeded pattern by case-insensitive substring
 * frequency, then synthesises a plausible classification from it.
 *
 * Limited but works: catches the demo's KBC, ULIP, and bank-freeze
 * exemplars cleanly. Real production runs through the LLM path.
 */
function mockClassifyHeuristic(args: ClassifyScamArgs): ClassifyScamResult {
  const text = args.message.toLowerCase();
  let best: { score: number; pattern: (typeof SCAM_PATTERNS_SEED)[number] | null } = {
    score: 0,
    pattern: null,
  };
  for (const pattern of SCAM_PATTERNS_SEED) {
    let score = 0;
    for (const phrase of pattern.identifyingPhrases) {
      if (text.includes(phrase.toLowerCase())) score += 1;
    }
    // Light weight from the representative text itself.
    const repTokens = pattern.representativeText.toLowerCase().split(/\s+/).slice(0, 30);
    for (const token of repTokens) {
      if (token.length >= 4 && text.includes(token)) score += 0.2;
    }
    if (score > best.score) best = { score, pattern };
  }

  if (!best.pattern || best.score < 1) {
    const isEnglish = args.receiver.language === "en-IN";
    return {
      source: "mock-heuristic",
      classification: {
        verdict: "UNCLEAR",
        category: "other",
        confidence: 0.4,
        identifyingSignals: ["No close match in pattern bank — unable to classify offline."],
        payloadType: "unknown",
        estimatedLossInr: 0,
        receiverExplanation: isEnglish
          ? "This message is unusual. Bharosa will confirm it with the full classifier soon. Until then, please do not click any link, reply, or send money."
          : "Yeh message thoda alag hai. Bharosa LLM se confirm karega jaldi. Tab tak link mat dabaayein, koi paisa mat bhejein.",
        primaryUserAlert: isEnglish
          ? "Anjali, this message did not clearly match the offline pattern bank. Please wait for the full classifier before acting."
          : "Anjali ji, ek message aaya hai jo humare pattern bank mein clearly match nahi hua. LLM se classify hone tak intezaar karein.",
      },
    };
  }

  const pattern = best.pattern;
  const verdict = pattern.severity === "high" ? "SCAM" : "SUSPICIOUS";
  const isElder = args.receiver.ageBand === "60-75" || args.receiver.ageBand === "75+";
  const isEnglish = args.receiver.language === "en-IN";
  const salutation = isEnglish ? (isElder ? "Namaste, Maaji." : "Namaste.") : isElder ? "Maaji, namaste." : "Namaste.";
  const receiverExplanation = buildReceiverExplanation(salutation, pattern, isEnglish);
  const primaryUserAlert = buildPrimaryAlert(args.receiver.name, pattern, isEnglish);

  return {
    source: "mock-heuristic",
    matchedPatternName: pattern.patternName,
    classification: {
      verdict,
      category: (pattern.category as ScamClassification["category"]) ?? "other",
      confidence: Math.min(0.95, 0.6 + best.score * 0.05),
      identifyingSignals: pattern.identifyingPhrases.slice(0, 5),
      payloadType: (pattern.payloadType as ScamClassification["payloadType"]) ?? "unknown",
      estimatedLossInr: estimateLoss(pattern.category),
      receiverExplanation,
      primaryUserAlert,
    },
  };
}

function buildReceiverExplanation(
  salutation: string,
  pattern: (typeof SCAM_PATTERNS_SEED)[number],
  isEnglish: boolean,
): string {
  if (isEnglish) {
    const blurb: Record<string, string> = {
      lottery:
        "This is a KBC lottery scam. KBC never sends prizes on WhatsApp. Do not reply, delete the message, and do not call the number.",
      "banking-impersonation":
        "This is a fake bank message. A real bank will not ask you to update KYC through a random WhatsApp link. Do not click it.",
      "kyc-update":
        "This is a fake KYC update. Real companies do not use WhatsApp links to force account updates. Please delete it.",
      "digital-arrest":
        "This is a digital-arrest scam. Indian police do not work this way. Disconnect the call and do not send money.",
      "investment-scheme":
        "This is a fake investment tip. A SEBI-registered adviser will not push guaranteed stock tips through public Telegram groups.",
      "tech-support-fraud":
        "This is a fake Microsoft support message. Microsoft does not call people like this. Please do not call the number.",
      "courier-scam":
        "This is a fake courier or customs scam. Real customs officers do not handle cases through WhatsApp.",
      "fake-refund":
        "This is a fake refund message. Do not share bank details and do not open the link.",
      "phishing-link":
        "This is a phishing link. Clicking it can put your account at risk. Please delete the message.",
      "ulip-misselling":
        "This policy is expensive and hides important charges. Bharosa can audit it in 60 seconds; please do not agree yet.",
      "tax-refund":
        "This is a fake income-tax refund message. The Income Tax Department does not send refund links like this.",
    };
    const body =
      blurb[pattern.category] ??
      "This message is suspicious. Please do not reply, click, or send money. Bharosa is watching this with you.";
    return `${salutation} ${body} Stay calm; nothing has gone from your account.`;
  }

  const blurb: Record<string, string> = {
    lottery:
      "Yeh KBC lottery scam hai. KBC kabhi WhatsApp pe inaam nahi bhejta. Reply mat dijiye, message delete kar dijiye. Aapki bahurani ko bhi inform kar diya hai.",
    "banking-impersonation":
      "Yeh fake bank message hai. Asli bank kabhi link bhejke KYC nahi maangta. Click mat kijiye, message delete kar dijiye.",
    "kyc-update":
      "Yeh fake KYC update message hai. Asli company kabhi WhatsApp pe link bhejke account update nahi karwati. Delete kar dijiye.",
    "digital-arrest":
      "Yeh 'digital arrest' scam hai — Indian police aisa kabhi nahi karti. Phone disconnect kar dijiye, kisi ko paisa mat bhejiye.",
    "investment-scheme":
      "Yeh fake stock tip hai. SEBI registered advisor public Telegram pe tips nahi dete. Aap join mat kijiye.",
    "tech-support-fraud":
      "Yeh fake Microsoft message hai. Microsoft aapko aise call nahi karta. Number mat lagayein.",
    "courier-scam":
      "Yeh fake FedEx/customs scam hai. Asli customs WhatsApp se contact nahi karta. Delete kar dijiye.",
    "fake-refund":
      "Yeh fake refund message hai. Apne bank details mat dijiye, link mat dabaayein.",
    "phishing-link":
      "Yeh phishing link hai. Click karne se aapka account hack ho sakta hai. Delete kar dijiye.",
    "ulip-misselling":
      "Yeh policy mahangi hai aur charges chhupaaye gaye hain. Bharosa 60 second mein full audit dikhayega — tab tak haan mat boliye.",
    "tax-refund":
      "Yeh fake Income Tax refund hai. Asli IT Department aise SMS nahi bhejta. Delete kar dijiye.",
  };
  const body =
    blurb[pattern.category] ??
    "Yeh suspicious message hai. Reply mat dijiye, message delete kar dijiye. Bharosa aapke saath hai.";
  return `${salutation} ${body} Thande dimaag se rahiye, sab theek hai.`;
}

function buildPrimaryAlert(receiverName: string, pattern: (typeof SCAM_PATTERNS_SEED)[number], isEnglish: boolean): string {
  const loss = estimateLoss(pattern.category);
  if (isEnglish) {
    const lossClause =
      loss > 0
        ? `If they had acted, the risk was ₹${loss.toLocaleString("en-IN")}.`
        : "No money has gone out.";
    return `${receiverName} received a ${pattern.category.replace(/-/g, " ")} scam. We caught it, explained it clearly, and blocked the risk. ${lossClause}`;
  }
  const lossClause =
    loss > 0
      ? `Agar wo act karte, ₹${loss.toLocaleString("en-IN")} ka risk tha.`
      : "Koi paisa nahi gaya.";
  return `${receiverName} ko ${pattern.category.replace(/-/g, " ")} scam aaya. Humne pakad liya, unko Hindi mein bata diya. ${lossClause}`;
}

function estimateLoss(category: string): number {
  switch (category) {
    case "lottery":
      return 8500;
    case "banking-impersonation":
      return 50_000;
    case "digital-arrest":
      return 1_50_000;
    case "investment-scheme":
      return 25_000;
    case "tech-support-fraud":
      return 15_000;
    case "courier-scam":
      return 12_000;
    case "fake-refund":
      return 2500;
    case "ulip-misselling":
      return 2_40_000;
    default:
      return 0;
  }
}
