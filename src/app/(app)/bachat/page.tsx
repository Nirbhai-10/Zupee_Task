import Link from "next/link";
import type { ElementType } from "react";
import {
  ArrowRight,
  Banknote,
  FileSearch,
  Gavel,
  Receipt,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Currency } from "@/components/shared/Currency";
import { T } from "@/components/shared/T";
import { SEEDED_ACTIVITY } from "@/lib/mocks/seeded-activity";
import { getSupabaseDemoClient, DEMO_USER_ID } from "@/lib/db/server-anon";
import type { ScamClassification } from "@/lib/llm/schemas";

export const metadata = { title: "Bachat Ledger" };
export const dynamic = "force-dynamic";

type LedgerTone = "risk" | "audit" | "refund" | "harassment" | "execution" | "milestone";

type LedgerEvent = {
  id: string;
  at: string;
  tone: LedgerTone;
  title: { hi: string; en: string };
  subtitle: { hi: string; en: string };
  protectedFor: { hi: string; en: string };
  proof: { hi: string; en: string };
  amountInr?: number;
  amountLabel: { hi: string; en: string };
};

type DefenseRow = {
  id: string;
  category: string;
  verdict: ScamClassification["verdict"];
  scam_category: string | null;
  confidence: number | null;
  identifying_signals: string[] | null;
  estimated_savings_inr: number | string | null;
  primary_user_alert: string | null;
  receiver_explanation: string | null;
  family_member_id: string | null;
  created_at: string;
};

const TONE_META: Record<
  LedgerTone,
  { icon: ElementType; badge: "scam" | "gold" | "green" | "muted"; label: { hi: string; en: string } }
> = {
  risk: {
    icon: ShieldAlert,
    badge: "scam",
    label: { hi: "Risk stopped", en: "Risk stopped" },
  },
  audit: {
    icon: FileSearch,
    badge: "gold",
    label: { hi: "Product truth", en: "Product truth" },
  },
  refund: {
    icon: Receipt,
    badge: "gold",
    label: { hi: "Money recovered", en: "Money recovered" },
  },
  harassment: {
    icon: Gavel,
    badge: "scam",
    label: { hi: "Harassment handled", en: "Harassment handled" },
  },
  execution: {
    icon: Banknote,
    badge: "green",
    label: { hi: "Salary moved", en: "Salary moved" },
  },
  milestone: {
    icon: TrendingUp,
    badge: "green",
    label: { hi: "Goal proof", en: "Goal proof" },
  },
};

const SEEDED_LEDGER: LedgerEvent[] = SEEDED_ACTIVITY.map((activity) => {
  if (activity.kind === "ulip_audit") {
    return {
      id: activity.id,
      at: activity.at,
      tone: "audit",
      title: activity.title,
      subtitle: activity.subtitle,
      protectedFor: { hi: "Anjali", en: "Anjali" },
      proof: {
        hi: "Fee math, lock-in और term + SIP comparison recorded",
        en: "Fee math, lock-in, and term + SIP comparison recorded",
      },
      amountInr: activity.amountInr,
      amountLabel: { hi: "Long-term loss avoided", en: "Long-term loss avoided" },
    };
  }
  if (activity.kind === "bill_disputed") {
    return {
      id: activity.id,
      at: activity.at,
      tone: "refund",
      title: activity.title,
      subtitle: activity.subtitle,
      protectedFor: { hi: "Household", en: "Household" },
      proof: { hi: "Bill dispute और refund outcome recorded", en: "Bill dispute and refund outcome recorded" },
      amountInr: activity.amountInr,
      amountLabel: { hi: "Cash recovered", en: "Cash recovered" },
    };
  }
  if (activity.kind === "harassment_handled") {
    return {
      id: activity.id,
      at: activity.at,
      tone: "harassment",
      title: activity.title,
      subtitle: activity.subtitle,
      protectedFor: { hi: "Family", en: "Family" },
      proof: { hi: "RBI rule references और Sachet draft saved", en: "RBI rule references and Sachet draft saved" },
      amountLabel: { hi: "Stress avoided", en: "Stress avoided" },
    };
  }
  if (activity.kind === "plan_generated" || activity.kind === "salary_executed") {
    return {
      id: activity.id,
      at: activity.at,
      tone: "execution",
      title: activity.title,
      subtitle: activity.subtitle,
      protectedFor: { hi: "4 family goals", en: "4 family goals" },
      proof: { hi: "Monthly split ready for salary day", en: "Monthly split ready for salary day" },
      amountInr: activity.amountInr,
      amountLabel: { hi: "Moved into goals", en: "Moved into goals" },
    };
  }
  if (activity.kind === "goal_milestone") {
    return {
      id: activity.id,
      at: activity.at,
      tone: "milestone",
      title: activity.title,
      subtitle: activity.subtitle,
      protectedFor: { hi: "Priya", en: "Priya" },
      proof: { hi: "Goal progress milestone recorded", en: "Goal progress milestone recorded" },
      amountInr: activity.amountInr,
      amountLabel: { hi: "Goal funded", en: "Goal funded" },
    };
  }
  return {
    id: activity.id,
    at: activity.at,
    tone: "risk",
    title: activity.title,
    subtitle: activity.subtitle,
    protectedFor: activity.title.en.toLowerCase().includes("mummy")
      ? { hi: "Mummy", en: "Mummy" }
      : { hi: "Anjali", en: "Anjali" },
    proof: { hi: "Signals, warning और family alert recorded", en: "Signals, warning, and family alert recorded" },
    amountInr: activity.amountInr,
    amountLabel: { hi: "Risk blocked", en: "Risk blocked" },
  };
});

async function fetchLiveLedger(): Promise<LedgerEvent[]> {
  const supabase = getSupabaseDemoClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("defenses")
    .select(
      "id, category, verdict, scam_category, confidence, identifying_signals, estimated_savings_inr, primary_user_alert, receiver_explanation, family_member_id, created_at",
    )
    .eq("user_id", DEMO_USER_ID)
    .order("created_at", { ascending: false })
    .limit(12);
  if (error || !data) return [];

  return (data as unknown as DefenseRow[]).map((row) => {
    const isAudit = row.category === "mis_selling" || row.scam_category === "ulip-misselling";
    const isHarassment = row.category === "harassment";
    const signals = (row.identifying_signals ?? []).slice(0, 2).join(" · ");
    return {
      id: row.id,
      at: row.created_at,
      tone: isHarassment ? "harassment" : isAudit ? "audit" : "risk",
      title: {
        hi: row.primary_user_alert || row.receiver_explanation || "Financial risk handled",
        en: englishTitleFor(row),
      },
      subtitle: {
        hi: signals || "Bharosa ने risk verify करके household memory में save किया.",
        en: signals || "Bharosa verified the risk and saved the outcome to household memory.",
      },
      protectedFor: row.family_member_id ? { hi: "Family member", en: "Family member" } : { hi: "Anjali", en: "Anjali" },
      proof: isAudit
        ? { hi: "Policy audit result saved", en: "Policy audit result saved" }
        : isHarassment
          ? { hi: "Letter और call script saved", en: "Letter and call script saved" }
          : { hi: "Signals, warning और alert saved", en: "Signals, warning, and alert saved" },
      amountInr: Number(row.estimated_savings_inr ?? 0) || undefined,
      amountLabel: isAudit
        ? { hi: "Long-term loss avoided", en: "Long-term loss avoided" }
        : isHarassment
          ? { hi: "Stress avoided", en: "Stress avoided" }
          : { hi: "Risk blocked", en: "Risk blocked" },
    };
  });
}

function englishTitleFor(row: DefenseRow): string {
  if (row.category === "mis_selling" || row.scam_category === "ulip-misselling") {
    return "Audited a low-quality policy pitch";
  }
  if (row.category === "harassment") return "Handled a recovery-agent threat";
  if (row.scam_category) return `Blocked ${row.scam_category.replace(/-/g, " ")} risk`;
  return "Financial risk handled";
}

function formatRelative(at: string): { hi: string; en: string } {
  const minutes = Math.max(1, Math.floor((Date.now() - new Date(at).getTime()) / 60_000));
  if (minutes < 60) return { hi: `${minutes} मिनट पहले`, en: `${minutes} min ago` };
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { hi: `${hours} घंटे पहले`, en: `${hours}h ago` };
  const days = Math.floor(hours / 24);
  if (days === 1) return { hi: "कल", en: "yesterday" };
  if (days < 7) return { hi: `${days} दिन पहले`, en: `${days}d ago` };
  return { hi: `${Math.floor(days / 7)} हफ़्ते पहले`, en: `${Math.floor(days / 7)}w ago` };
}

export default async function BachatPage() {
  const liveLedger = await fetchLiveLedger();
  const ledger = [...liveLedger, ...SEEDED_LEDGER].slice(0, 12);
  const protectedTotal = ledger
    .filter((event) => event.tone === "risk" || event.tone === "audit" || event.tone === "refund")
    .reduce((sum, event) => sum + (event.amountInr ?? 0), 0);
  const cashEvents = ledger.filter((event) => event.tone === "risk" || event.tone === "refund").length;
  const longTermEvents = ledger.filter((event) => event.tone === "audit").length;

  return (
    <main className="flex flex-1 flex-col gap-8 bg-saathi-cream px-6 py-10">
      <header className="mx-auto w-full max-w-5xl space-y-4">
        <Badge tone="gold">
          <Sparkles className="h-3 w-3" />
          <T hi="Household Financial Memory" en="Household Financial Memory" />
        </Badge>
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-end">
          <div className="space-y-3">
            <h1 className="text-h1 font-semibold tracking-tight text-saathi-ink">
              <T hi="Bachat Ledger" en="Bachat Ledger" />
            </h1>
            <p className="max-w-2xl text-body-lg text-saathi-ink-soft">
              <T
                hi="यह Bharosa का असली moat है: हर बचाया हुआ रुपया, हर refused product, और हर salary split आपके household history में जुड़ता है."
                en="This is Bharosa's real moat: every rupee protected, every refused product, and every salary split becomes part of your household history."
              />
            </p>
          </div>
          <Card tone="green" padding="md" className="space-y-1">
            <div className="text-caption uppercase tracking-wide text-white/70">
              <T hi="Total protected" en="Total protected" />
            </div>
            <Currency amount={protectedTotal} variant="compact" language="en-IN" className="text-h1 font-semibold text-white" />
            <p className="text-caption text-white/75">
              <T
                hi={`${cashEvents} immediate risks · ${longTermEvents} product audits`}
                en={`${cashEvents} immediate risks · ${longTermEvents} product audits`}
              />
            </p>
          </Card>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-5xl gap-3 md:grid-cols-3">
        <SnapshotCard
          label={{ hi: "Last protected", en: "Last protected" }}
          value={{ hi: "Mummy का WhatsApp", en: "Mummy's WhatsApp" }}
          detail={{ hi: "KBC lottery scam रोका", en: "KBC lottery scam stopped" }}
        />
        <SnapshotCard
          label={{ hi: "Next pressure", en: "Next pressure" }}
          value={{ hi: "Diwali fund", en: "Diwali fund" }}
          detail={{ hi: "इस हफ्ते ₹3,000 अलग रखें", en: "Set aside ₹3,000 this week" }}
        />
        <SnapshotCard
          label={{ hi: "Why it compounds", en: "Why it compounds" }}
          value={{ hi: "6 महीने की memory", en: "6 months of memory" }}
          detail={{ hi: "Advice अब generic नहीं है", en: "Advice is no longer generic" }}
        />
      </section>

      <section className="mx-auto w-full max-w-5xl space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-h3 font-semibold text-saathi-ink">
              <T hi="Proof rows" en="Proof rows" />
            </h2>
            <p className="text-body-sm text-saathi-ink-soft">
              <T
                hi="हर row में incident, protected person, amount और proof saved है."
                en="Every row shows the incident, protected person, amount, and proof saved."
              />
            </p>
          </div>
          <Button asChild variant="primary" size="sm">
            <Link href="/demo/simulator">
              <T hi="नया risk check करें" en="Check a new risk" />
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-3">
          {ledger.map((event) => (
            <LedgerRow key={event.id} event={event} />
          ))}
        </div>
      </section>
    </main>
  );
}

function SnapshotCard({
  label,
  value,
  detail,
}: {
  label: { hi: string; en: string };
  value: { hi: string; en: string };
  detail: { hi: string; en: string };
}) {
  return (
    <Card tone="paper" padding="md" className="space-y-1">
      <div className="text-caption uppercase tracking-wide text-saathi-ink-quiet">
        <T hi={label.hi} en={label.en} />
      </div>
      <div className="text-body font-semibold text-saathi-ink">
        <T hi={value.hi} en={value.en} />
      </div>
      <p className="text-body-sm text-saathi-ink-soft">
        <T hi={detail.hi} en={detail.en} />
      </p>
    </Card>
  );
}

function LedgerRow({ event }: { event: LedgerEvent }) {
  const meta = TONE_META[event.tone];
  const Icon = meta.icon;
  const rel = formatRelative(event.at);
  return (
    <Card tone="paper" padding="md" className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-saathi-deep-green-tint text-saathi-deep-green">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={meta.badge}>
              <T hi={meta.label.hi} en={meta.label.en} />
            </Badge>
            <span className="text-caption text-saathi-ink-quiet">
              <T hi={rel.hi} en={rel.en} />
            </span>
          </div>
          <h3 className="text-body font-semibold text-saathi-ink">
            <T hi={event.title.hi} en={event.title.en} />
          </h3>
          <p className="text-body-sm text-saathi-ink-soft">
            <T hi={event.subtitle.hi} en={event.subtitle.en} />
          </p>
          <div className="flex flex-wrap gap-2 text-caption text-saathi-ink-quiet">
            <span className="rounded-pill bg-saathi-cream-deep px-2 py-1">
              <T hi="Protected: " en="Protected: " />
              <T hi={event.protectedFor.hi} en={event.protectedFor.en} />
            </span>
            <span className="rounded-pill bg-saathi-cream-deep px-2 py-1">
              <T hi={event.proof.hi} en={event.proof.en} />
            </span>
          </div>
        </div>
      </div>
      <div className="rounded-card-sm bg-saathi-gold-tint px-4 py-3 text-left md:text-right">
        <div className="text-caption uppercase tracking-wide text-saathi-gold">
          <T hi={event.amountLabel.hi} en={event.amountLabel.en} />
        </div>
        {event.amountInr ? (
          <Currency amount={event.amountInr} variant="compact" language="en-IN" className="text-h3 font-semibold text-saathi-gold" />
        ) : (
          <div className="text-body font-semibold text-saathi-gold">
            <T hi="Recorded" en="Recorded" />
          </div>
        )}
      </div>
    </Card>
  );
}
