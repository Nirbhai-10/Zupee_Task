import Link from "next/link";
import {
  CheckCircle2,
  FileSearch,
  Phone,
  Receipt,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Wordmark } from "@/components/brand/Wordmark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Currency } from "@/components/shared/Currency";

const DEFENSE_CARDS = [
  {
    title: "Mummy ke phone par scam",
    body: "WhatsApp KYC scam. Fake bank calls. Digital arrest. Hum 30 second mein pakad lete hain — unki bhasha mein samjhaate hain, aur aapko bhi inform karte hain.",
    stat: "12,400 scams roke iss saal",
    icon: ShieldAlert,
    tone: "scam" as const,
  },
  {
    title: "Bank waale jo policy bech rahe hain",
    body: "Apna ULIP brochure bhejiye. 60 second mein bata denge real fees, lock-in, aur seedha mutual fund SIP se kitna bachega — actual numbers ke saath.",
    stat: "Average user ne ₹2.4L bachaaye",
    icon: FileSearch,
    tone: "suspicious" as const,
  },
  {
    title: "Recovery agents ki dhamki",
    body: "RBI rules ke khilaaf hain. Hum lawyer-grade letter bhejte hain, RBI Sachet pe complaint karte hain, aapke liye unko phone karte hain.",
    stat: "94% cases mein 7 din mein band",
    icon: Phone,
    tone: "scam" as const,
  },
  {
    title: "Galat bills aur charges",
    body: "Bill ki photo bhejiye. Hum company ko phone karte hain — aapki tarafse, aapki bhasha mein. Refund milta hai.",
    stat: "Average refund: ₹1,840 per case",
    icon: Receipt,
    tone: "suspicious" as const,
  },
];

const INVESTMENT_PILLARS = [
  {
    title: "Goals you actually have",
    body: "Beti ki shaadi 2032 mein 8 lakh. Bete ki coaching 2027 tak 3 lakh. Diwali fund. Maa ka medical buffer. Saathi yeh sab samjhta hai — kyunki yeh aapke real goals hain, retirement nahi.",
  },
  {
    title: "Trusted instruments first",
    body: "Aapke FD aur gold ko respect karte hain. Mutual fund mein paisa tab daalte hain jab aap comfortable ho — 6 mahine baad, ya saal baad, ya kabhi nahi. Aapki marzi.",
  },
  {
    title: "Family stays informed",
    body: "Pati ko goal progress milta hai. Mummy ko protection alerts. Bachhon ko unke savings dikhte hain. Aap sab kuch dekhti hain. Privacy aapke control mein.",
  },
];

const TRUST_BADGES = [
  "DPDP Act 2023 compliant",
  "Made in India",
  "Zero ads · Zero data sale",
  "11 भारतीय भाषाएं",
  "RBI Sachet integration *",
];

export default function Home() {
  return (
    <>
      <MarketingNav />
      <main className="flex flex-1 flex-col bg-saathi-cream">
        {/* Hero */}
        <section className="saathi-paper-grain relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-[3fr_2fr]">
            <div className="space-y-6">
              <Badge tone="green">
                <Sparkles className="h-3 w-3" />
                AI-native · WhatsApp · Bharat
              </Badge>
              <p
                lang="hi"
                className="text-body-lg font-medium tracking-wide text-saathi-deep-green"
              >
                जब बैंक वाले ULIP बेच रहे हैं,
              </p>
              <h1
                lang="hi"
                className="text-display font-extrabold leading-[1.05] text-saathi-deep-green"
              >
                हम सच बताते हैं।
              </h1>
              <p className="max-w-xl text-body-lg text-saathi-ink-soft">
                Saathi is your AI advocate for Bharat. Free scam defense for your family.
                Honest investment plans for your money. Entirely on WhatsApp.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild variant="primary" size="lg">
                  <Link href="/demo/simulator">WhatsApp पर शुरू करें</Link>
                </Button>
                <Button asChild variant="ghost" size="lg">
                  <Link href="#defense">Dekhein kaise kaam karta hai</Link>
                </Button>
              </div>
              <p className="text-caption text-saathi-ink-quiet">
                Free for families · No app to download · No data sale · Made for Bharat.
              </p>
            </div>
            <ConversationPreview />
          </div>
        </section>

        {/* Differentiator section */}
        <section id="defense" className="border-y border-saathi-paper-edge bg-saathi-paper">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="max-w-3xl space-y-4">
              <Badge tone="green">Defense first</Badge>
              <h2
                lang="hi"
                className="text-h1 font-semibold tracking-tight text-saathi-ink"
              >
                पहले हम आपको बचाते हैं। फिर आपके पैसे को बढ़ाते हैं।
              </h2>
              <p className="text-body-lg text-saathi-ink-soft">
                Har Indian fintech aapko product bechta hai. Saathi pehle aapko products se
                bachata hai. Phir aapke paise ko sambhalta hai. Trust pehle, products baad mein.
              </p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {DEFENSE_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <Card key={card.title} tone="paper" padding="lg" className="group transition-transform hover:-translate-y-1">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-saathi-deep-green-tint text-saathi-deep-green">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 space-y-2">
                        <h3 className="text-h3 font-semibold text-saathi-ink">{card.title}</h3>
                        <p lang="hi" className="font-deva text-body-sm text-saathi-ink-soft">
                          {card.body}
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 rounded-card-sm bg-saathi-gold-tint px-3 py-2 text-caption font-medium text-saathi-gold">
                      {card.stat}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Investment side */}
        <section id="investments" className="bg-saathi-cream">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="max-w-3xl space-y-4">
              <Badge tone="gold">Investment</Badge>
              <h2
                lang="hi"
                className="text-h1 font-semibold tracking-tight text-saathi-ink"
              >
                फिर हम आपके पैसे को सम्हालते हैं।
              </h2>
              <p className="text-body-lg text-saathi-ink-soft">
                Aapke goals. Aapki bhasha. Real automation — UPI Autopay pe, har mahine.
              </p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {INVESTMENT_PILLARS.map((pillar) => (
                <Card key={pillar.title} tone="paper" padding="lg" className="space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-pill bg-saathi-gold-tint text-saathi-gold">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-h3 font-semibold text-saathi-ink">{pillar.title}</h3>
                  <p lang="hi" className="font-deva text-body-sm text-saathi-ink-soft">
                    {pillar.body}
                  </p>
                </Card>
              ))}
            </div>

            <Card tone="green" padding="lg" className="mt-10 grid gap-6 md:grid-cols-2 md:items-center">
              <div className="space-y-3 text-white">
                <Badge tone="gold">Anjali ka demo</Badge>
                <h3 className="text-h2 font-semibold">
                  ₹5,500 surplus, 4 goals, ek mandate.
                </h3>
                <p className="text-body-lg text-white/80">
                  {`Anjali Sharma — government school teacher, Lucknow. Hindi-first. Saathi ne uska plan banaaya: Sukanya Samriddhi for daughter's wedding, short-debt fund for son's coaching, liquid fund for mummy's medical buffer, RD for Diwali — sab ek hi UPI Autopay pe.`}
                </p>
                <Button asChild variant="gold" size="md">
                  <Link href="/demo/simulator">Live simulator chalayein →</Link>
                </Button>
              </div>
              <div className="space-y-3 rounded-card-sm bg-saathi-paper p-5 text-saathi-ink shadow-soft">
                <div className="flex items-baseline justify-between">
                  <span className="text-caption uppercase tracking-wide text-saathi-ink-quiet">Monthly mandate</span>
                  <Currency amount={5500} variant="full" language="en-IN" className="text-h3 font-semibold text-saathi-deep-green" />
                </div>
                {[
                  { label: "Mummy ka medical (liquid)", amount: 2200 },
                  { label: "Aarav coaching (debt + FD)", amount: 1900 },
                  { label: "Priya shaadi (SSY + gold + FD)", amount: 800 },
                  { label: "Diwali fund (RD)", amount: 500 },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-body-sm">
                    <span className="text-saathi-ink-soft">{row.label}</span>
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
              <span key={badge}>{badge}</span>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-saathi-cream-deep">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-4">
            <div className="space-y-2">
              <Wordmark className="text-h2" />
              <p className="text-caption text-saathi-ink-quiet">
                Made in Bengaluru with care. <br />For 100M+ Bharat households.
              </p>
            </div>
            <FooterColumn
              title="Product"
              links={[
                { label: "Live simulator", href: "/demo/simulator" },
                { label: "Defenses feed", href: "/defenses" },
                { label: "Goals", href: "/goals" },
                { label: "Family", href: "/family" },
                { label: "Investments", href: "/investments" },
              ]}
            />
            <FooterColumn
              title="System"
              links={[
                { label: "Health", href: "/api/health" },
                { label: "Admin · Costs", href: "/admin/costs" },
                { label: "Admin · Patterns", href: "/admin/scam-patterns" },
              ]}
            />
            <FooterColumn
              title="Legal"
              links={[
                { label: "Privacy (DPDP 2023)", href: "#" },
                { label: "Disclosure stance", href: "#" },
                { label: "Grievance officer", href: "#" },
                { label: "RBI Sachet (in process)", href: "#" },
              ]}
            />
          </div>
          <div className="border-t border-saathi-paper-edge py-4">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 text-caption text-saathi-ink-quiet">
              <span>© 2026 Saathi. Prototype — submission for Zupee.</span>
              <span lang="hi" className="font-deva">
                विश्वास, हमारे काम का पहला नियम है।
              </span>
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
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="space-y-2">
      <div className="text-caption uppercase tracking-wide text-saathi-ink-quiet">{title}</div>
      <ul className="space-y-1.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-body-sm text-saathi-ink-soft transition-colors hover:text-saathi-deep-green"
            >
              {l.label}
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
      <div className="flex flex-col gap-2 rounded-[22px] bg-[#ECE5DD] p-4">
        <Bubble inbound highlight>
          <span lang="hi" className="font-deva">
            Mummy ko KBC scam aaya — humne abhi pakad liya, unhe Hindi mein bata diya.
          </span>
        </Bubble>
        <Bubble outbound>
          <span lang="hi" className="font-deva">
            Bachaaya kitna?
          </span>
        </Bubble>
        <Bubble inbound>
          <span lang="hi" className="font-deva">
            ₹8,500 ka risk roka. Iss saal yeh 13th catch hai.
          </span>
        </Bubble>
        <Bubble outbound>
          <span lang="hi" className="font-deva">
            Saathi, ab paise ka kya plan banaaye?
          </span>
        </Bubble>
        <Bubble inbound voice>
          🎙️ Saathi · 0:48
        </Bubble>
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
          outbound ? "rounded-tr-sm bg-[#DCF8C6] text-saathi-ink" : "",
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
