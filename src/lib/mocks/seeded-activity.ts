/**
 * Seeded demo activity used by /timeline, /conversations, /home,
 * /defenses dashboard surfaces. Mirrors what the live LLM/simulator
 * pipeline will produce, so the moment Supabase persistence is wired
 * the same shapes flow through.
 */

export type SeededActivityKind =
  | "scam_blocked"
  | "ulip_audit"
  | "plan_generated"
  | "salary_executed"
  | "family_notified"
  | "goal_milestone"
  | "harassment_handled"
  | "bill_disputed";

export type SeededActivity = {
  id: string;
  kind: SeededActivityKind;
  /** ISO datetime when this happened. */
  at: string;
  /** Title shown on the row. */
  title: { hi: string; en: string };
  /** One-line subtitle. */
  subtitle: { hi: string; en: string };
  /** Optional rupee impact — savings caught or money invested. */
  amountInr?: number;
  /** Tag shown beside the title. */
  tag: { hi: string; en: string };
  tone: "scam" | "savings" | "investment" | "family" | "milestone";
};

const ANJALI_TIMELINE_BASE = new Date("2026-04-26T08:00:00.000Z");

function offsetIso(offsetHours: number) {
  return new Date(ANJALI_TIMELINE_BASE.getTime() - offsetHours * 3600 * 1000).toISOString();
}

export const SEEDED_ACTIVITY: SeededActivity[] = [
  {
    id: "act-mil-kbc",
    kind: "scam_blocked",
    at: offsetIso(1),
    title: {
      hi: "मम्मी को KBC scam आया — रोक दिया",
      en: "Caught a KBC lottery scam aimed at Mummy",
    },
    subtitle: {
      hi: "+92 नंबर से, ₹8,500 की 'processing fee' मांगी थी।",
      en: "From a +92 number; asked for ₹8,500 'processing fee'.",
    },
    amountInr: 8_500,
    tag: { hi: "स्कैम", en: "Scam" },
    tone: "scam",
  },
  {
    id: "act-ulip-audit",
    kind: "ulip_audit",
    at: offsetIso(6),
    title: {
      hi: "SuperLife ULIP audit किया — ₹6.51L saved",
      en: "Audited SuperLife ULIP — ₹6.51L saved",
    },
    subtitle: {
      hi: "15 साल में effective return 4.4% — हमने term + SIP plan recommend किया।",
      en: "15-yr effective return 4.4%. We recommended term + SIP instead.",
    },
    amountInr: 6_51_076,
    tag: { hi: "ऑडिट", en: "Audit" },
    tone: "savings",
  },
  {
    id: "act-plan-generated",
    kind: "plan_generated",
    at: offsetIso(8),
    title: {
      hi: "Investment plan ready",
      en: "Investment plan ready",
    },
    subtitle: {
      hi: "₹5,500 / mahina 4 goals में — Sukanya, short-debt, liquid, RD।",
      en: "₹5,500 / month split across 4 goals — Sukanya, short-debt, liquid, RD.",
    },
    amountInr: 5_500,
    tag: { hi: "निवेश", en: "Plan" },
    tone: "investment",
  },
  {
    id: "act-bill-uppcl",
    kind: "bill_disputed",
    at: offsetIso(72),
    title: {
      hi: "UPPCL का बिल ₹1,840 ज़्यादा था — refund आ गया",
      en: "UPPCL over-billed ₹1,840 — refund credited",
    },
    subtitle: {
      hi: "Saathi ने आपकी तरफ से कॉल किया, बिल correct हुआ।",
      en: "Saathi called UPPCL on your behalf; bill corrected.",
    },
    amountInr: 1_840,
    tag: { hi: "बिल", en: "Bill" },
    tone: "savings",
  },
  {
    id: "act-fil-bank-freeze",
    kind: "scam_blocked",
    at: offsetIso(96),
    title: {
      hi: "HDFC bank-freeze scam पकड़ा",
      en: "Caught HDFC bank-freeze impersonation scam",
    },
    subtitle: {
      hi: "Fake KYC link, .online domain — आपके credentials बच गए।",
      en: "Fake KYC link on a .online domain. Credentials safe.",
    },
    amountInr: 50_000,
    tag: { hi: "स्कैम", en: "Scam" },
    tone: "scam",
  },
  {
    id: "act-fam-husband-update",
    kind: "family_notified",
    at: offsetIso(120),
    title: {
      hi: "पति को मासिक update भेजा",
      en: "Sent the monthly update to your husband",
    },
    subtitle: {
      hi: "March में ₹5,500 invest हुआ। बेटी की शादी fund 14% पर।",
      en: "₹5,500 invested in March. Daughter's wedding fund at 14%.",
    },
    tag: { hi: "परिवार", en: "Family" },
    tone: "family",
  },
  {
    id: "act-mil-tax-refund",
    kind: "scam_blocked",
    at: offsetIso(150),
    title: {
      hi: "Income Tax refund scam — मम्मी सुरक्षित",
      en: "Income Tax refund scam — Mummy safe",
    },
    subtitle: {
      hi: "₹18,540 refund 'approve' हुआ था — fake था।",
      en: "Fake \"₹18,540 refund approved\" link.",
    },
    amountInr: 18_540,
    tag: { hi: "स्कैम", en: "Scam" },
    tone: "scam",
  },
  {
    id: "act-recovery-agent",
    kind: "harassment_handled",
    at: offsetIso(192),
    title: {
      hi: "देवर के क्रेडिट कार्ड पर recovery agent — chup कराया",
      en: "Brother-in-law's credit card recovery agent — silenced",
    },
    subtitle: {
      hi: "RBI rules cite किए, lawyer-grade letter और Sachet complaint भेजी।",
      en: "Cited RBI rules; sent lawyer-grade letter and Sachet complaint.",
    },
    tag: { hi: "हैरासमेंट", en: "Harassment" },
    tone: "scam",
  },
  {
    id: "act-goal-priya-1pct",
    kind: "goal_milestone",
    at: offsetIso(720),
    title: {
      hi: "बेटी की शादी fund — पहला 1% पूरा",
      en: "Daughter's wedding fund — first 1% complete",
    },
    subtitle: {
      hi: "Sukanya Samriddhi में पहला transfer।",
      en: "First Sukanya Samriddhi transfer cleared.",
    },
    amountInr: 8_000,
    tag: { hi: "मील का पत्थर", en: "Milestone" },
    tone: "milestone",
  },
];

export const SEEDED_TOTAL_SAVINGS = SEEDED_ACTIVITY.reduce(
  (sum, a) => (a.tone === "scam" || a.tone === "savings" ? sum + (a.amountInr ?? 0) : sum),
  0,
);

export type SeededMessage = {
  id: string;
  /** Whose phone is this on. */
  phone: "anjali" | "mil";
  direction: "inbound" | "outbound";
  /** "9:42" — pre-formatted. */
  timestamp: string;
  textHi: string;
  textEn: string;
  highlight?: "scam" | "savings";
  isVoice?: boolean;
};

export const SEEDED_ANJALI_THREAD: SeededMessage[] = [
  {
    id: "m1",
    phone: "anjali",
    direction: "outbound",
    timestamp: "9:42",
    textHi: "Saathi, mummy ke phone par koi message aaya tha. Sahi nahi lag raha.",
    textEn: "Saathi, Mummy got a message that doesn't look right.",
  },
  {
    id: "m2",
    phone: "anjali",
    direction: "inbound",
    timestamp: "9:42",
    textHi: "Mummy ka KBC scam message dekha. Pakda gaya — unko Hindi mein bata diya. Aapko bhi inform kar raha hoon.",
    textEn: "Saw Mummy's KBC scam. Caught it — explained to her in Hindi. Looping you in too.",
    highlight: "scam",
  },
  {
    id: "m3",
    phone: "anjali",
    direction: "inbound",
    timestamp: "9:43",
    textHi: "Bachat: ₹8,500. Iss saal Mummy ke 4 scams aa chuke hain.",
    textEn: "Saved ₹8,500. That's 4 scams aimed at Mummy this year.",
  },
  {
    id: "m4",
    phone: "anjali",
    direction: "outbound",
    timestamp: "9:48",
    textHi: "Bank wale ek policy bech rahe hain. Brochure bhej rahi hoon.",
    textEn: "Bank is selling me a policy. Sending the brochure.",
  },
  {
    id: "m5",
    phone: "anjali",
    direction: "inbound",
    timestamp: "9:49",
    textHi: "Audit ho gaya. SuperLife ULIP — 15 saal mein effective return sirf 4.4%. Term insurance + direct mutual fund SIP karein toh ₹6,51,076 zyada banayenge. Decision aapka hai.",
    textEn: "Audited. SuperLife ULIP — 15-yr effective return only 4.4%. Term + direct mutual fund SIP would build ₹6,51,076 more. Your call.",
    highlight: "savings",
    isVoice: true,
  },
  {
    id: "m6",
    phone: "anjali",
    direction: "outbound",
    timestamp: "10:02",
    textHi: "Toh ab paise ka kya plan banaaye?",
    textEn: "So what plan should we make for the money?",
  },
  {
    id: "m7",
    phone: "anjali",
    direction: "inbound",
    timestamp: "10:02",
    textHi: "Aapke ₹5,500 surplus mein se 4 goals cover kar denge — Mummy ka medical, Aarav ki coaching, Priya ki shaadi, Diwali fund. Plan ready hai. Confirm karein?",
    textEn: "I'll cover 4 goals from your ₹5,500 surplus — Mummy's medical, Aarav's coaching, Priya's wedding, Diwali fund. Plan ready. Confirm?",
    isVoice: true,
  },
];
