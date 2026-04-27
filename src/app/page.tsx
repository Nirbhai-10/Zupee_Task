import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileSearch,
  Phone,
  Receipt,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Logo } from "@/components/brand/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Currency } from "@/components/shared/Currency";
import { T } from "@/components/shared/T";
import { ScamPlayground } from "@/components/landing/ScamPlayground";
import { UlipAuditDemo } from "@/components/landing/UlipAuditDemo";
import { WhatsAppHeroCta } from "@/components/landing/WhatsAppHeroCta";
import { LiveTrustCounter } from "@/components/landing/LiveTrustCounter";
import { ZupeeAttribution } from "@/components/brand/ZupeeAttribution";
import { VoiceAgent } from "@/components/voice/VoiceAgent";

const DEFENSE_CARDS = [
  {
    title: { hi: "मम्मी के फ़ोन पर scam", en: "Scams on Mummy's phone" },
    body: {
      hi: "WhatsApp KYC scam. Fake bank calls. Digital arrest. हम 30 second में पकड़ लेते हैं — उनकी भाषा में समझाते हैं, और आपको भी inform करते हैं।",
      en: "WhatsApp KYC. Fake bank calls. Digital arrest. We catch them in 30 seconds — explain in her language, and loop you in.",
    },
    stat: { hi: "इस साल 12,400 scams रोके", en: "12,400 scams blocked this year" },
    icon: ShieldAlert,
  },
  {
    title: { hi: "Bank का ULIP push", en: "The bank's ULIP pitch" },
    body: {
      hi: "ULIP brochure भेजिए। 60 second में दिखाएँगे real fees, lock-in, और term + SIP से कितना ज़्यादा बनेगा — actual numbers के साथ।",
      en: "Send us the ULIP brochure. In 60 seconds we show the real fees, lock-in, and how much a term + SIP alternative would build — with real numbers.",
    },
    stat: { hi: "औसत बचत: ₹2.4 लाख", en: "Average user saves ₹2.4 lakh" },
    icon: FileSearch,
  },
  {
    title: { hi: "Recovery agent की धमकी", en: "Recovery-agent harassment" },
    body: {
      hi: "RBI rules के against हैं। हम lawyer-grade letter, RBI Sachet draft, और एजेंट को vernacular voice call ready करते हैं।",
      en: "These calls violate RBI rules. We draft a cease-and-desist letter, an RBI Sachet complaint, and a vernacular voice call to the agent.",
    },
    stat: { hi: "94% cases में 7 दिन में बंद", en: "Stopped in 7 days in 94% of cases" },
    icon: Phone,
  },
  {
    title: { hi: "ग़लत bills और charges", en: "Wrong bills and charges" },
    body: {
      hi: "Bill की photo भेजिए। हम company को call करते हैं — आपकी तरफ़ से, आपकी भाषा में। Refund आता है।",
      en: "Send a photo of the bill. We call the company on your behalf, in your language. Refunds get issued.",
    },
    stat: { hi: "औसत refund: ₹1,840 / केस", en: "Average refund: ₹1,840 per case" },
    icon: Receipt,
  },
];

const INVESTMENT_PILLARS = [
  {
    title: { hi: "वो लक्ष्य जो आपके वाक़ई हैं", en: "Goals you actually have" },
    body: {
      hi: "बेटी की शादी 2032 में 8 लाख। बेटे की coaching 2027 तक 3 लाख। Diwali fund. माँ का medical buffer. Bharosa यह सब समझता है — क्योंकि यह आपके real goals हैं, retirement नहीं।",
      en: "Daughter's wedding 2032: ₹8L. Son's coaching by 2027: ₹3L. Diwali fund. Medical buffer for an elder. Bharosa understands these as goals, not abstract retirement targets.",
    },
  },
  {
    title: { hi: "Trusted instruments first", en: "Trusted instruments first" },
    body: {
      hi: "आपके FD और gold को respect करते हैं। Mutual fund में पैसा तब डालते हैं जब आप comfortable हों — 6 महीने बाद, या साल बाद, या कभी नहीं। आपकी मर्ज़ी।",
      en: "We respect your FDs and gold. Mutual funds enter only when you're comfortable — six months later, a year later, or never. Your call.",
    },
  },
  {
    title: { hi: "परिवार जुड़ा रहता है", en: "Family stays in the loop" },
    body: {
      hi: "पति को goal progress, मम्मी को protection alerts, बच्चों को उनकी savings। Privacy आपके control में।",
      en: "Husband gets goal progress, your mother-in-law sees protection alerts, kids see their own savings. Privacy stays in your hands.",
    },
  },
];

const TRUST_BADGES = [
  { hi: "DPDP Act 2023 compliant", en: "DPDP Act 2023 compliant" },
  { hi: "Made in India", en: "Made in India" },
  { hi: "Zero ads · zero data sale", en: "Zero ads · zero data sale" },
  { hi: "11 भारतीय भाषाएं", en: "11 Indian languages" },
  { hi: "RBI Sachet integration *", en: "RBI Sachet integration *" },
];

const PRODUCT_STORY = [
  {
    icon: ShieldCheck,
    title: { hi: "1. Check risk", en: "1. Check risk" },
    body: {
      hi: "Suspicious WhatsApp, fake KYC, digital arrest और recovery threats — Bharosa पहले risk रोकता है.",
      en: "Suspicious WhatsApp forwards, fake KYC, digital arrest, and recovery threats — Bharosa stops risk first.",
    },
  },
  {
    icon: FileSearch,
    title: { hi: "2. Expose bad products", en: "2. Expose bad products" },
    body: {
      hi: "ULIP और policy brochures की real fees, lock-in और better alternative math सामने आती है.",
      en: "ULIP and policy brochures are audited for real fees, lock-ins, and better alternatives.",
    },
  },
  {
    icon: Target,
    title: { hi: "3. Move money safely", en: "3. Move money safely" },
    body: {
      hi: "Salary day पर पैसा बेटी की शादी, coaching, medical और festival funds में split होता है.",
      en: "On salary day, money moves into wedding, coaching, medical, and festival funds.",
    },
  },
  {
    icon: Sparkles,
    title: { hi: "4. Compounding moat", en: "4. Compounding moat" },
    body: {
      hi: "हर scam catch, audit और transfer household history बनाता है — अगली सलाह ज्यादा personal होती है.",
      en: "Every catch, audit, and transfer builds household history, so the next recommendation is more personal.",
    },
  },
];

export default function Home() {
  return (
    <>
      <MarketingNav />
      <main className="flex flex-1 flex-col bg-saathi-cream">
        {/* Hero */}
        <section className="saathi-paper-grain relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-12 lg:grid-cols-[3fr_2fr] lg:pb-20 lg:pt-16">
            <div className="space-y-6">
              <Badge tone="green">
                <Sparkles className="h-3 w-3" />
                <T hi="AI-native · WhatsApp · Bharat" en="AI-native · WhatsApp · Bharat" />
              </Badge>

              <div className="space-y-1">
                <T
                  as="p"
                  hi="जब बैंक वाले ULIP बेच रहे हैं,"
                  en="When the bank is selling you a ULIP,"
                  className="text-body-lg font-medium tracking-wide text-saathi-deep-green"
                />
                <T
                  as="h1"
                  hi="हम सच बताते हैं।"
                  en="we tell you the truth."
                  className="text-h1 font-extrabold leading-[1.05] text-saathi-deep-green sm:text-display"
                />
              </div>

              <div className="flex flex-col gap-2 rounded-card border border-saathi-deep-green-line bg-saathi-deep-green-tint/70 p-4 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-saathi-deep-green" />
                  <T
                    hi="पहले हम आपको बचाते हैं।"
                    en="First we defend you."
                    className="text-body font-semibold text-saathi-deep-green"
                  />
                </div>
                <span aria-hidden className="hidden h-5 w-px bg-saathi-deep-green-line sm:inline-block" />
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 shrink-0 text-saathi-gold" />
                  <T
                    hi="फिर आपके पैसे को बढ़ाते हैं।"
                    en="Then we grow your money."
                    className="text-body font-semibold text-saathi-gold"
                  />
                </div>
              </div>

              <T
                as="p"
                hi="Bharosa आपका AI advocate है — Bharat के लिए। Family के लिए free scam defense. पैसे के लिए honest investment plans. WhatsApp pe — कोई app नहीं, कोई English form नहीं।"
                en="Bharosa is your AI advocate for Bharat. Free scam defense for your family. Honest investment plans for your money. On WhatsApp — no app, no English forms."
                className="max-w-xl text-body-lg text-saathi-ink-soft"
              />

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <WhatsAppHeroCta />
                <Button asChild variant="outline" size="md" className="h-12 px-5">
                  <Link href="/api/demo/login">
                    <T hi="Anjali का dashboard देखें" en="See Anjali's dashboard" />
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Link
                  href="#playground"
                  className="inline-flex h-12 items-center gap-1.5 rounded-pill px-2 text-body-sm font-medium text-saathi-deep-green transition-colors hover:text-saathi-deep-green-soft"
                >
                  <T hi="Live classifier try करें" en="Try the live classifier" />
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <T
                as="p"
                hi="Free for families · No app to download · No data sale · Made for Bharat."
                en="Free for families · No app to download · No data sale · Made for Bharat."
                className="text-caption text-saathi-ink-quiet"
              />
            </div>

            <ConversationPreview />
          </div>
        </section>

        <section className="border-y border-saathi-paper-edge bg-saathi-paper">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <div className="max-w-3xl space-y-3">
              <Badge tone="green">
                <T hi="To the point" en="To the point" />
              </Badge>
              <T
                as="h2"
                hi="तीन jobs, एक moat."
                en="Three jobs, one moat."
                className="text-h2 font-semibold tracking-tight text-saathi-ink"
              />
              <T
                as="p"
                hi="Customer को feature maze नहीं दिखता. पहले risk check, फिर product truth, फिर salary-day execution. Moat है household financial memory — private reflection पीछे की signal layer है."
                en="The customer does not see a maze of features. First risk checks, then product truth, then salary-day execution. The moat is household financial memory; private reflection stays as a quiet signal layer."
                className="text-body-lg text-saathi-ink-soft"
              />
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {PRODUCT_STORY.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.title.en} tone="paper" padding="md" className="h-full">
                    <div className="flex h-10 w-10 items-center justify-center rounded-pill bg-saathi-deep-green-tint text-saathi-deep-green">
                      <Icon className="h-5 w-5" />
                    </div>
                    <T
                      as="h3"
                      hi={item.title.hi}
                      en={item.title.en}
                      className="mt-4 text-body font-semibold text-saathi-ink"
                    />
                    <T
                      as="p"
                      hi={item.body.hi}
                      en={item.body.en}
                      className="mt-2 text-body-sm text-saathi-ink-soft"
                    />
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Voice agent — press & talk. Sarvam STT → Sarvam-M chat → Sarvam TTS. */}
        <section id="voice" className="border-y border-saathi-paper-edge bg-saathi-cream-deep">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <div className="mb-6 max-w-3xl space-y-3">
              <Badge tone="green">
                <T hi="आवाज़ से बात करें" en="Talk to Bharosa" />
              </Badge>
              <T
                as="h2"
                hi="Typing मुश्किल हो तो आवाज़ से पूछिए."
                en="When typing is hard, ask by voice."
                className="text-h1 font-semibold tracking-tight text-saathi-ink"
              />
              <T
                as="p"
                hi="Voice primary product नहीं है — यह assistive layer है. Mic दबाकर risk, policy audit या salary plan पूछिए."
                en="Voice is not the primary product — it is the assistive layer. Press the mic to ask about risk, policy audits, or salary planning."
                className="text-body-lg text-saathi-ink-soft"
              />
            </div>
            <VoiceAgent />
          </div>
        </section>

        {/* Live trust counter — animated scale numbers on scroll */}
        <LiveTrustCounter />

        {/* CHANGE 2: Live scam playground */}
        <ScamPlayground />

        {/* Defense cards */}
        <section id="defense" className="border-y border-saathi-paper-edge bg-saathi-paper">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="max-w-3xl space-y-3">
              <Badge tone="green">
                <T hi="Defense first" en="Defense first" />
              </Badge>
              <T
                as="h2"
                hi="हम जिन-जिन हमलों को रोकते हैं।"
                en="The four classes of harm we defend against."
                className="text-h1 font-semibold tracking-tight text-saathi-ink"
              />
              <T
                as="p"
                hi="हर Indian fintech आपको product बेचता है। Bharosa पहले आपको products से बचाता है। फिर आपके पैसे को सम्भालता है। Trust पहले, products बाद में।"
                en="Every Indian fintech sells you a product. Bharosa defends you from products first, then helps you grow money. Trust before products."
                className="text-body-lg text-saathi-ink-soft"
              />
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {DEFENSE_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <Card
                    key={card.title.en}
                    tone="paper"
                    padding="lg"
                    className="group transition-transform hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-saathi-deep-green-tint text-saathi-deep-green">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 space-y-2">
                        <T
                          as="h3"
                          hi={card.title.hi}
                          en={card.title.en}
                          className="text-h3 font-semibold text-saathi-ink"
                        />
                        <T
                          as="p"
                          hi={card.body.hi}
                          en={card.body.en}
                          className="text-body-sm text-saathi-ink-soft"
                        />
                      </div>
                    </div>
                    <div className="mt-5 rounded-card-sm bg-saathi-gold-tint px-3 py-2 text-caption font-medium text-saathi-gold">
                      <T hi={card.stat.hi} en={card.stat.en} />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CHANGE 3: ULIP audit demo */}
        <UlipAuditDemo />

        {/* Investment side */}
        <section id="investments" className="border-t border-saathi-paper-edge bg-saathi-cream">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="max-w-3xl space-y-3">
              <Badge tone="gold">
                <T hi="निवेश" en="Investments" />
              </Badge>
              <T
                as="h2"
                hi="फिर आपके पैसे को सम्भालते हैं।"
                en="Then we grow your money."
                className="text-h1 font-semibold tracking-tight text-saathi-ink"
              />
              <T
                as="p"
                hi="आपके goals. आपकी भाषा. Real automation — UPI Autopay पर, हर महीने।"
                en="Your goals. Your language. Real automation — UPI Autopay, every month."
                className="text-body-lg text-saathi-ink-soft"
              />
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {INVESTMENT_PILLARS.map((pillar) => (
                <Card key={pillar.title.en} tone="paper" padding="lg" className="space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-pill bg-saathi-gold-tint text-saathi-gold">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <T
                    as="h3"
                    hi={pillar.title.hi}
                    en={pillar.title.en}
                    className="text-h3 font-semibold text-saathi-ink"
                  />
                  <T
                    as="p"
                    hi={pillar.body.hi}
                    en={pillar.body.en}
                    className="text-body-sm text-saathi-ink-soft"
                  />
                </Card>
              ))}
            </div>

            <Card tone="green" padding="lg" className="mt-10 grid gap-6 md:grid-cols-2 md:items-center">
              <div className="space-y-3 text-white">
                <Badge tone="gold">
                  <T hi="Anjali का demo" en="Anjali's demo" />
                </Badge>
                <T
                  as="h3"
                  hi="₹5,500 surplus, 4 goals, एक mandate."
                  en="₹5,500 surplus, 4 goals, one mandate."
                  className="text-h2 font-semibold"
                />
                <T
                  as="p"
                  hi="Anjali Sharma — Lucknow की government school teacher. Bharosa ने plan बनाया: Sukanya Samriddhi बेटी की शादी के लिए, short-debt बेटे की coaching के लिए, liquid fund माँ के medical के लिए, RD Diwali के लिए — एक UPI Autopay पर."
                  en="Anjali Sharma — a government school teacher in Lucknow. Bharosa built her plan: Sukanya Samriddhi for her daughter's wedding, a short-debt fund for her son's coaching, a liquid fund for her mother-in-law's medical buffer, an RD for Diwali — all on a single UPI Autopay."
                  className="text-body-lg text-white/85"
                />
                <Button asChild variant="gold" size="md">
                  <Link href="/api/demo/login">
                    <T hi="Dashboard खोलें" en="Open the dashboard" />
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="space-y-3 rounded-card-sm bg-saathi-paper p-5 text-saathi-ink shadow-soft">
                <div className="flex items-baseline justify-between">
                  <T
                    hi="मासिक mandate"
                    en="Monthly mandate"
                    className="text-caption uppercase tracking-wide text-saathi-ink-quiet"
                  />
                  <Currency
                    amount={5500}
                    variant="full"
                    language="en-IN"
                    className="text-h3 font-semibold text-saathi-deep-green"
                  />
                </div>
                {[
                  { hi: "मम्मी का medical (liquid)", en: "Mother-in-law's medical (liquid)", amount: 2200 },
                  { hi: "Aarav coaching (debt + FD)", en: "Aarav's coaching (debt + FD)", amount: 1900 },
                  { hi: "Priya की शादी (SSY + gold + FD)", en: "Priya's wedding (SSY + gold + FD)", amount: 800 },
                  { hi: "Diwali fund (RD)", en: "Diwali fund (RD)", amount: 500 },
                ].map((row) => (
                  <div key={row.en} className="flex items-center justify-between text-body-sm">
                    <T hi={row.hi} en={row.en} className="text-saathi-ink-soft" />
                    <Currency amount={row.amount} variant="full" language="en-IN" className="font-medium" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-y border-saathi-paper-edge bg-saathi-paper">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-caption text-saathi-ink-quiet">
            {TRUST_BADGES.map((badge) => (
              <T key={badge.en} hi={badge.hi} en={badge.en} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-saathi-cream-deep">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-4">
            <div className="space-y-2">
              <Logo variant="lockup" size={32} />
              <T
                as="p"
                hi="Bengaluru में बना। 100M+ Bharat households के लिए।"
                en="Made in Bengaluru. For 100M+ Bharat households."
                className="text-caption text-saathi-ink-quiet"
              />
            </div>
            <FooterColumn
              title={{ hi: "Product", en: "Product" }}
              links={[
                { hi: "Live simulator", en: "Live simulator", href: "/demo/simulator" },
                { hi: "Defenses", en: "Defenses", href: "/defenses" },
                { hi: "Goals", en: "Goals", href: "/goals" },
                { hi: "Family", en: "Family", href: "/family" },
                { hi: "Investments", en: "Investments", href: "/investments" },
              ]}
            />
            <FooterColumn
              title={{ hi: "System", en: "System" }}
              links={[
                { hi: "Health", en: "Health", href: "/api/health" },
                { hi: "Costs admin", en: "Costs admin", href: "/admin/costs" },
                { hi: "Pattern bank", en: "Pattern bank", href: "/admin/scam-patterns" },
              ]}
            />
            <FooterColumn
              title={{ hi: "Legal", en: "Legal" }}
              links={[
                { hi: "Privacy (DPDP 2023)", en: "Privacy (DPDP 2023)", href: "/legal/privacy" },
                { hi: "AI disclosure", en: "AI disclosure", href: "/legal/disclosure" },
                { hi: "Grievance officer", en: "Grievance officer", href: "/legal/grievance" },
                { hi: "RBI Sachet", en: "RBI Sachet", href: "/legal/rbi-sachet" },
              ]}
            />
          </div>
          <div className="border-t border-saathi-paper-edge py-4">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 text-caption text-saathi-ink-quiet">
              <ZupeeAttribution variant="footer" />
              <T
                hi="विश्वास, हमारे काम का पहला नियम है।"
                en="Trust is the first rule of our work."
              />
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: { hi: string; en: string };
  links: { hi: string; en: string; href: string }[];
}) {
  return (
    <div className="space-y-2">
      <T
        hi={title.hi}
        en={title.en}
        className="text-caption uppercase tracking-wide text-saathi-ink-quiet"
      />
      <ul className="space-y-1.5">
        {links.map((l) => (
          <li key={l.en}>
            <Link
              href={l.href}
              className="text-body-sm text-saathi-ink-soft transition-colors hover:text-saathi-deep-green"
            >
              <T hi={l.hi} en={l.en} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConversationPreview() {
  return (
    <div className="relative mx-auto w-full max-w-sm rotate-1 rounded-[28px] bg-[#101820] p-2 shadow-lift transition-transform hover:rotate-0">
      <div className="overflow-hidden rounded-[22px] bg-[#ECE5DD]">
        <div className="flex items-center gap-2 bg-[#064E45] px-4 py-3 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/[0.15] text-[11px] font-semibold">
            भ
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold leading-tight text-white">Bharosa</div>
            <div className="mt-0.5 truncate text-[11px] leading-tight text-white/80">
              <T hi="ऑनलाइन · scam defense" en="online · scam defense" />
            </div>
          </div>
          <div className="h-2 w-2 rounded-full bg-[#22C55E]" />
        </div>
        <div className="flex flex-col gap-2 p-4">
          <Bubble inbound highlight>
            <T
              hi="मम्मी को KBC scam आया — अभी पकड़ लिया, उन्हें Hindi में बता दिया।"
              en="Caught a KBC scam aimed at Mummy — explained to her in Hindi."
            />
          </Bubble>
          <Bubble outbound>
            <T hi="कितना बचा?" en="How much did we save?" />
          </Bubble>
          <Bubble inbound>
            <T
              hi="₹8,500 का risk रोका. इस साल यह 13वाँ catch है।"
              en="Blocked ₹8,500 of risk. That's the 13th catch this year."
            />
          </Bubble>
          <Bubble outbound>
            <T
              hi="Bharosa, अब पैसे का क्या plan बनाएँ?"
              en="Bharosa, what's the plan for the money?"
            />
          </Bubble>
          <Bubble inbound voice>
            🎙️ Bharosa · 0:48
          </Bubble>
        </div>
      </div>
    </div>
  );
}

function Bubble({
  children,
  inbound,
  outbound,
  voice,
  highlight,
}: {
  children: React.ReactNode;
  inbound?: boolean;
  outbound?: boolean;
  voice?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={inbound ? "flex justify-start" : "flex justify-end"}>
      <div
        className={[
          "max-w-[85%] rounded-2xl px-3 py-2 text-body-sm shadow-soft",
          inbound ? "rounded-tl-sm bg-white text-saathi-ink" : "",
          outbound ? "rounded-tr-sm bg-[#E3FFD6] text-saathi-ink" : "",
          highlight ? "ring-2 ring-saathi-danger/40" : "",
          voice ? "bg-saathi-cream-deep text-saathi-ink-soft font-mono tabular-nums" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </div>
  );
}
