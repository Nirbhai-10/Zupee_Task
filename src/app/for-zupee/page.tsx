import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Cpu,
  Database,
  FileSearch,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Logo } from "@/components/brand/Logo";
import { ZupeeAttribution } from "@/components/brand/ZupeeAttribution";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { T } from "@/components/shared/T";

export const metadata = {
  title: "For Zupee · The thesis",
  description: "Bharosa for Zupee — AI × Investments for Bharat. The defense-first wedge for 100M+ Bharat households.",
};

const COMPETITIVE_LANDSCAPE = [
  { name: "Jar", lock: "Gold-only · brand-locked into a single product", color: "bg-yellow-100 text-yellow-900 border-yellow-200" },
  { name: "Groww", lock: "Mutual-fund-first · urban-English funnel", color: "bg-emerald-100 text-emerald-900 border-emerald-200" },
  { name: "FREED", lock: "Debt-only · single-vertical organisation", color: "bg-rose-100 text-rose-900 border-rose-200" },
  { name: "Cred", lock: "Urban premium · CIBIL aspiration funnel", color: "bg-purple-100 text-purple-900 border-purple-200" },
];

const ARCHITECTURE = [
  { icon: Cpu, title: { hi: "LLM router", en: "LLM router" }, body: { hi: "एक abstraction. Primary: Sarvam-M (Bharat-native). Fallbacks: Anthropic, OpenAI, Grok, local Gemma. हर call llm_events में log होती है, cost paise में.", en: "One abstraction. Primary: Sarvam-M (Bharat-native). Fallbacks: Anthropic, OpenAI, Grok, local Gemma. Every call logged to llm_events with cost in paise." } },
  { icon: Database, title: { hi: "Supabase + pgvector", en: "Supabase + pgvector" }, body: { hi: "16 tables, RLS, semantic search पर scam patterns, Realtime cross-phone events. Mumbai region.", en: "16 tables, RLS, semantic search on scam patterns, Realtime cross-phone events. Mumbai region." } },
  { icon: ShieldCheck, title: { hi: "Schema-validated", en: "Schema-validated" }, body: { hi: "हर LLM output Zod से validate होता है. Math deterministic, voice generative — एक भी number invented नहीं.", en: "Every LLM output Zod-validated. Math is deterministic, voice is generative — never an invented number." } },
];

const FLOWS = [
  { icon: ShieldCheck, title: { hi: "Scam classifier", en: "Scam classifier" }, count: "30s" },
  { icon: FileSearch, title: { hi: "ULIP audit", en: "ULIP audit" }, count: "60s" },
  { icon: Sparkles, title: { hi: "Goal-anchored plan", en: "Goal-anchored plan" }, count: "90s" },
  { icon: Banknote, title: { hi: "Salary-day cascade", en: "Salary-day cascade" }, count: "10s" },
  { icon: HeartHandshake, title: { hi: "Recovery-agent negotiator", en: "Recovery-agent negotiator" }, count: "60s" },
];

const MOAT_STACK = [
  {
    icon: ShieldCheck,
    title: { hi: "Outcome ledger", en: "Outcome ledger" },
    body: {
      hi: "हर blocked scam, refused ULIP और corrected charge एक household-specific proof history बनता है.",
      en: "Every blocked scam, refused ULIP, and corrected charge becomes household-specific proof history.",
    },
  },
  {
    icon: TrendingUp,
    title: { hi: "Salary-day behavior", en: "Salary-day behavior" },
    body: {
      hi: "Monthly execution creates a habit: money moves into goals before anxiety or mis-selling can intercept it.",
      en: "Monthly execution creates a habit: money moves into goals before anxiety or mis-selling can intercept it.",
    },
  },
  {
    icon: Database,
    title: { hi: "Personal timing data", en: "Personal timing data" },
    body: {
      hi: "Incidents, festivals, fees और remittance timing future nudges को one-household-specific बनाते हैं.",
      en: "Incidents, festivals, fees, and remittance timing make future nudges specific to one household.",
    },
  },
  {
    icon: HeartHandshake,
    title: { hi: "Private layer, not front door", en: "Private layer, not the front door" },
    body: {
      hi: "Vault emotional context देता है, पर customer story का front professional defense और execution है.",
      en: "Vault adds emotional context, but the customer story leads with professional defense and execution.",
    },
  },
];

export default function ForZupeePage() {
  return (
    <>
      <MarketingNav />
      <main className="flex flex-1 flex-col bg-saathi-cream">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-saathi-paper-edge bg-saathi-paper">
          {/* Yellow → indigo accent stripe — partner mark on every Zupee surface */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-zupee-yellow via-zupee-yellow to-zupee-indigo"
          />
          <div className="mx-auto max-w-5xl px-6 py-14">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-pill border border-zupee-indigo/20 bg-zupee-yellow-tint px-3 py-1 text-caption font-semibold text-zupee-indigo">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-zupee-yellow" />
                <T hi="AI × निवेश · Bharat के लिए" en="AI × Investments · for Bharat" />
              </span>
              <ZupeeAttribution variant="header" />
            </div>

            <T
              as="h1"
              hi="Bharat के 100M households के लिए, defense-first investment app।"
              en="A defense-first investment app for Bharat's next 100M households."
              className="mt-6 max-w-4xl text-h1 font-semibold tracking-tight text-saathi-ink"
            />
            <T
              as="p"
              hi="हर मौजूदा Indian fintech aspiration से शुरू करता है — returns दिखाता है, sign-up कराता है। यह urban English-first 60M पर काम करता है, अगले 300M पर नहीं — क्योंकि उन्हें scams, mis-selling, और recovery agents ने सिखाया है कि financial industry उनसे prey की तरह बात करती है। Bharosa यह funnel उल्टा करता है। पहले defend, फिर invest। Trust पहले, products बाद में।"
              en="Every existing Indian fintech starts with aspiration — show returns, get sign-ups. This works for the urban English-first 60M but fails for the next 300M, because scams, mis-selling, and recovery harassment have taught them the financial industry treats them as prey. Bharosa inverts the funnel. Defend first, invest second. Trust before products."
              className="mt-6 max-w-3xl text-body-lg text-saathi-ink-soft"
            />

            <div className="mt-8 flex flex-wrap items-center gap-2">
              <Button asChild variant="primary" size="lg">
                <Link href="/api/demo/login">
                  <T hi="Anjali का dashboard खोलें" en="Open Anjali's dashboard" />
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/demo/simulator">
                  <T hi="लाइव सिमुलेटर" en="Live simulator" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/#playground">
                  <T hi="Scam classifier playground" en="Scam classifier playground" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* The four numbers */}
        <section className="bg-saathi-cream">
          <div className="mx-auto max-w-5xl px-6 py-14">
            <T
              as="h2"
              hi="चार numbers जो thesis को define करते हैं।"
              en="The four numbers that define the thesis."
              className="text-h2 font-semibold text-saathi-ink"
            />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KeyStat
                kicker={{ hi: "Total addressable", en: "Total addressable" }}
                value="100M+"
                label={{ hi: "tier-2/3 भारतीय households · Hindi-first", en: "tier-2/3 households · Hindi-first" }}
              />
              <KeyStat
                kicker={{ hi: "Average loss caught", en: "Average loss caught" }}
                value="₹47k"
                label={{ hi: "हर household / साल — scams + mis-sold ULIPs", en: "per household / year — scams + mis-sold ULIPs" }}
              />
              <KeyStat
                kicker={{ hi: "ULIP audit savings", en: "ULIP audit savings" }}
                value="₹6.5L"
                label={{ hi: "एक brochure पर — actual math, hand-tuned", en: "on a single brochure — real math, hand-tuned" }}
              />
              <KeyStat
                kicker={{ hi: "Acquisition cost", en: "Acquisition cost" }}
                value="≈ ₹0"
                label={{ hi: "trust earned through scam catches, not ads", en: "trust earned through scam catches, not ads" }}
              />
            </div>
          </div>
        </section>

        {/* Why incumbents can't copy */}
        <section className="border-y border-saathi-paper-edge bg-saathi-paper">
          <div className="mx-auto max-w-5xl px-6 py-14">
            <T
              as="h2"
              hi="Incumbents आसानी से इसे copy नहीं कर सकते।"
              en="Why incumbents can't easily copy this."
              className="text-h2 font-semibold text-saathi-ink"
            />
            <T
              as="p"
              hi="हर मौजूदा Indian fintech एक product distribution funnel पर organisationally aligned है। Defense-first wedge उनके distribution model को तोड़ता है। 18-24 महीने का साफ़ whitespace है जब तक scam pattern database, family network, और brand trust compound होते हैं।"
              en="Every existing Indian fintech is organisationally aligned around a product distribution funnel. A defense-first wedge breaks that funnel. Bharosa has 18-24 months of clean whitespace while the scam pattern database, family network, and brand trust compound into a structural moat."
              className="mt-3 max-w-3xl text-body-lg text-saathi-ink-soft"
            />

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {COMPETITIVE_LANDSCAPE.map((p) => (
                <div
                  key={p.name}
                  className={`rounded-card border p-4 ${p.color}`}
                >
                  <div className="text-h3 font-semibold">{p.name}</div>
                  <div className="mt-1 text-caption">{p.lock}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-saathi-cream">
          <div className="mx-auto max-w-5xl px-6 py-14">
            <T
              as="h2"
              hi="Real moat — feature list नहीं, compounding history।"
              en="The real moat — compounding history, not a feature list."
              className="text-h2 font-semibold text-saathi-ink"
            />
            <T
              as="p"
              hi="Bharosa का front-door promise professional है: risk रोकना, product truth दिखाना, और salary-day execution. Private reflection पीछे की signal layer है; customer को overwhelm नहीं करती."
              en="Bharosa's front-door promise is professional: stop risk, reveal product truth, and execute on salary day. Private reflection stays as a background signal layer; it does not overwhelm the customer."
              className="mt-3 max-w-3xl text-body-lg text-saathi-ink-soft"
            />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {MOAT_STACK.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.title.en} tone="paper" padding="md" className="space-y-2">
                    <Icon className="h-5 w-5 text-saathi-deep-green" />
                    <T
                      as="h3"
                      hi={item.title.hi}
                      en={item.title.en}
                      className="text-body font-semibold text-saathi-ink"
                    />
                    <T
                      as="p"
                      hi={item.body.hi}
                      en={item.body.en}
                      className="text-body-sm text-saathi-ink-soft"
                    />
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* The five flows */}
        <section className="bg-saathi-cream">
          <div className="mx-auto max-w-5xl px-6 py-14">
            <T
              as="h2"
              hi="पाँच इंटेलिजेंस flows — सब live चलते हैं।"
              en="Five intelligence flows — all live."
              className="text-h2 font-semibold text-saathi-ink"
            />
            <T
              as="p"
              hi="हर flow एक Zod-validated LLM call + एक deterministic engine + Sarvam voice = एक मिनट से कम में real outcome।"
              en="Each flow combines a Zod-validated LLM call + a deterministic engine + Sarvam voice = a real outcome in under a minute."
              className="mt-3 max-w-3xl text-body-lg text-saathi-ink-soft"
            />
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {FLOWS.map((f) => {
                const Icon = f.icon;
                return (
                  <Card key={f.title.en} tone="paper" padding="md" className="space-y-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-pill bg-saathi-deep-green-tint text-saathi-deep-green">
                      <Icon className="h-4 w-4" />
                    </div>
                    <T
                      as="div"
                      hi={f.title.hi}
                      en={f.title.en}
                      className="text-body-sm font-semibold text-saathi-ink"
                    />
                    <div className="font-mono text-caption tabular-nums text-saathi-deep-green">
                      {f.count}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Architecture */}
        <section className="border-y border-saathi-paper-edge bg-saathi-paper">
          <div className="mx-auto max-w-5xl px-6 py-14">
            <T
              as="h2"
              hi="आर्किटेक्चर — एक भी invented number नहीं।"
              en="Architecture — never an invented number."
              className="text-h2 font-semibold text-saathi-ink"
            />
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {ARCHITECTURE.map((a) => {
                const Icon = a.icon;
                return (
                  <Card key={a.title.en} tone="paper" padding="md" className="space-y-2">
                    <Icon className="h-5 w-5 text-saathi-deep-green" />
                    <T
                      as="h3"
                      hi={a.title.hi}
                      en={a.title.en}
                      className="text-body font-semibold text-saathi-ink"
                    />
                    <T
                      as="p"
                      hi={a.body.hi}
                      en={a.body.en}
                      className="text-caption text-saathi-ink-soft"
                    />
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* The disclosure stance */}
        <section className="bg-saathi-cream">
          <div className="mx-auto max-w-5xl px-6 py-14">
            <T
              as="h2"
              hi="Disclosure stance"
              en="Disclosure stance"
              className="text-h2 font-semibold text-saathi-ink"
            />
            <Card tone="paper" padding="lg" className="mt-6 space-y-3">
              <Badge tone="green">
                <ShieldCheck className="h-3 w-3" />
                <T hi="Option C — ambiguous-but-not-impersonating" en="Option C — ambiguous, never impersonating" />
              </Badge>
              <T
                as="p"
                hi='जब Bharosa किसी authorised communication में बोलता है — recovery-agent call की तरह — तो script start होता है: "Yeh call Anjali Sharma ki authorised behalf par hai." कभी भी "main Anjali hoon" नहीं। 18–30 महीने का regulatory window है, और product designed है explicit AI disclosure पर gracefully transition करने के लिए।'
                en={'When Bharosa makes any authorised communication — like the recovery-agent voice call — the script starts: "Yeh call Anjali Sharma ki authorised behalf par hai." Never "I am Anjali." This is a deliberate, conservative position with an 18–30 month regulatory window. The product is designed to transition gracefully to explicit AI disclosure when required.'}
                className="text-body-lg text-saathi-ink-soft"
              />
            </Card>
          </div>
        </section>

        {/* Wedge math */}
        <section className="border-y border-saathi-paper-edge bg-saathi-paper">
          <div className="mx-auto max-w-5xl px-6 py-14">
            <T
              as="h2"
              hi="Unit economics — defense पर loss, AUM पर profit।"
              en="Unit economics — loss-leader on defense, profit on AUM."
              className="text-h2 font-semibold text-saathi-ink"
            />
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <UnitBox
                kicker={{ hi: "Defense layer", en: "Defense layer" }}
                cost="₹3-7 / household / month"
                profit="₹0"
                note={{ hi: "Sarvam + LLM tokens. Free forever.", en: "Sarvam + LLM tokens. Free forever." }}
                tone="dim"
              />
              <UnitBox
                kicker={{ hi: "Investment layer", en: "Investment layer" }}
                cost="—"
                profit="0.5–1% AUM / yr"
                note={{ hi: "₹6,000 average AUM/user · year 2 → ₹30-60/user/year revenue.", en: "Average AUM ~₹6,000/user by year 2 → ₹30-60/user/year revenue." }}
                tone="bright"
              />
              <UnitBox
                kicker={{ hi: "Debt resolution", en: "Debt resolution (later)" }}
                cost="—"
                profit="12% of recovered savings"
                note={{ hi: "Sirf success के बाद। Counsellor-assisted, not pure AI.", en: "Only on success. Counsellor-assisted, not pure AI." }}
                tone="bright"
              />
            </div>
            <T
              as="p"
              hi="Year 2 cohort math (कंज़र्वेटिव): 5M users · 12% convert to investing · ₹50/यूज़र/साल revenue → ₹30Cr ARR। Year 3 तक 25M users → ₹150Cr+ ARR।"
              en="Year-2 cohort math (conservative): 5M users · 12% convert to investing · ₹50/user/year → ₹30Cr ARR. Scales to 25M users / ₹150Cr+ ARR by year 3."
              className="mt-6 text-body-sm text-saathi-ink-soft"
            />
          </div>
        </section>

        {/* CTA */}
        <section className="bg-saathi-cream">
          <div className="mx-auto max-w-5xl px-6 py-14">
            <Card tone="green" padding="lg" className="grid gap-4 md:grid-cols-[3fr_2fr] md:items-center">
              <div className="space-y-3 text-white">
                <Badge tone="gold">
                  <Sparkles className="h-3 w-3" />
                  <T hi="तीन क्लिक — असली intelligence दिखती है" en="Three clicks — the intelligence is undeniable" />
                </Badge>
                <T
                  as="h3"
                  hi="Live demo चलाकर देखिए।"
                  en="Run the live demo."
                  className="text-h2 font-semibold"
                />
                <T
                  as="p"
                  hi="चैट widget खोलें (bottom-right). Scam playground try करें. Anjali के dashboard में जाएँ. हर step पर real LLM, real math, real Sarvam voice."
                  en="Open the chat widget (bottom-right). Try the scam playground. Step into Anjali's dashboard. Real LLM, real math, real Sarvam voice at every step."
                  className="text-body-lg text-white/85"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button asChild variant="gold" size="lg">
                  <Link href="/api/demo/login">
                    <Wallet className="h-4 w-4" />
                    <T hi="Anjali का dashboard" en="Anjali's dashboard" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                  <Link href="/#playground">
                    <Sparkles className="h-4 w-4" />
                    <T hi="Scam playground" en="Scam playground" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                  <Link href="/demo/simulator">
                    <TrendingUp className="h-4 w-4" />
                    <T hi="Live simulator" en="Live simulator" />
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </section>

        <footer className="border-t border-saathi-paper-edge bg-saathi-cream-deep">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-caption text-saathi-ink-quiet">
            <div className="flex items-center gap-3">
              <Logo variant="lockup" size={28} />
            </div>
            <ZupeeAttribution variant="footer" />
          </div>
        </footer>
      </main>
    </>
  );
}

function KeyStat({
  kicker,
  value,
  label,
}: {
  kicker: { hi: string; en: string };
  value: string;
  label: { hi: string; en: string };
}) {
  return (
    <Card tone="paper" padding="md" className="space-y-1">
      <T
        as="div"
        hi={kicker.hi}
        en={kicker.en}
        className="text-[10px] uppercase tracking-wider text-saathi-ink-quiet"
      />
      <div className="text-display font-extrabold leading-none text-saathi-deep-green">
        {value}
      </div>
      <T
        as="div"
        hi={label.hi}
        en={label.en}
        className="text-caption text-saathi-ink-soft"
      />
    </Card>
  );
}

function UnitBox({
  kicker,
  cost,
  profit,
  note,
  tone,
}: {
  kicker: { hi: string; en: string };
  cost: string;
  profit: string;
  note: { hi: string; en: string };
  tone: "dim" | "bright";
}) {
  return (
    <Card
      tone="paper"
      padding="md"
      className={tone === "bright" ? "border-saathi-gold-line bg-saathi-gold-tint/30" : ""}
    >
      <T
        as="div"
        hi={kicker.hi}
        en={kicker.en}
        className="text-caption uppercase tracking-wide text-saathi-ink-quiet"
      />
      <div className="mt-2 flex items-baseline gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-saathi-ink-quiet">cost</div>
          <div className="text-body-sm font-mono tabular-nums text-saathi-danger">{cost}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-saathi-ink-quiet">revenue</div>
          <div className="text-body-sm font-mono tabular-nums text-saathi-success">{profit}</div>
        </div>
      </div>
      <T
        as="p"
        hi={note.hi}
        en={note.en}
        className="mt-2 text-caption text-saathi-ink-soft"
      />
    </Card>
  );
}
