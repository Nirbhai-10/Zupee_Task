import { notFound } from "next/navigation";
import Link from "next/link";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PAGES = {
  privacy: {
    title: "Privacy notice",
    badge: "DPDP Act 2023",
    body: [
      "Bharosa runs on the principle of data minimisation. We store only what is needed to defend you and execute your goals — phone, name, language, family relationships you have explicitly added, and the structured outcomes of LLM analyses (verdicts, audit results, plan).",
      "Voice notes are processed via your configured provider (Sarvam in production; browser fallback in dev). Audio is stored only when you ask Bharosa to keep it; otherwise it is held just long enough to play it back.",
      "We do not sell data. We do not run ad networks. We do not enrich your profile from third-party data brokers. The only outbound data flows are: the LLM provider you have configured, your bank for UPI Autopay (when you authorise a mandate), and RBI Sachet (only when you file a harassment complaint).",
      "You can request deletion at any time. We honour grievance complaints under the DPDP Act timeline (30 days).",
    ],
  },
  disclosure: {
    title: "AI disclosure stance",
    badge: "Honest framing",
    body: [
      "Bharosa sometimes communicates on your authorised behalf — most notably in the harassment defense flow, where Bharosa places a recorded outbound call to a recovery agent to enforce RBI rules.",
      "When Bharosa makes such a communication, the script begins: \"Calling on Anjali Sharma's authorised behalf.\" We never say \"I am Anjali.\" This is a deliberate, conservative position that we believe is both legally defensible today and easy to evolve into explicit AI disclosure when regulation tightens.",
      "Inside the product, every voice and text message you receive is plainly attributed to Bharosa. There is no attempt to mimic a human counsellor or hide the AI surface.",
    ],
  },
  grievance: {
    title: "Grievance officer",
    badge: "Reach us in 7 days",
    body: [
      "If something Bharosa did upset you — a wrong scam call, a notification you did not authorise, a billing dispute — write to our grievance officer at grievance@saathi.example. We respond within 7 working days under the DPDP Act.",
      "For complaints about how Bharosa handles your data specifically, you may also escalate to the Data Protection Board of India once it is operational.",
    ],
  },
  "rbi-sachet": {
    title: "RBI Sachet integration",
    badge: "In process",
    body: [
      "RBI's Sachet portal (sachet.rbi.org.in) is the official complaint channel for harassment by recovery agents and other regulated-entity misconduct. Bharosa's harassment defense flow drafts a complaint based on the agent's behaviour you describe, and (with your consent) auto-files it on your behalf.",
      "Integration is in process. Until then, Bharosa generates the complaint document and shows you the Sachet form fields pre-filled — you submit the form yourself with one click of a Confirm button.",
    ],
  },
} as const;

type LegalSlug = keyof typeof PAGES;

export function generateStaticParams() {
  return (Object.keys(PAGES) as LegalSlug[]).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = (PAGES as Record<string, { title: string }>)[slug];
  if (!page) return { title: "Legal" };
  return { title: page.title };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = (PAGES as Record<string, (typeof PAGES)[LegalSlug]>)[slug];
  if (!page) notFound();

  return (
    <>
      <MarketingNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <Badge tone="green">{page.badge}</Badge>
        <h1 className="mt-3 text-h1 font-semibold tracking-tight text-saathi-ink">
          {page.title}
        </h1>
        <div className="mt-8 space-y-5 text-body-lg text-saathi-ink-soft">
          {page.body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        <div className="mt-10 flex gap-2">
          <Button asChild variant="primary" size="sm">
            <Link href="/">Home par jaayein</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/demo/simulator">Live simulator</Link>
          </Button>
        </div>
      </main>
    </>
  );
}
