import {
  Banknote,
  Coins,
  HeartHandshake,
  Receipt,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Currency } from "@/components/shared/Currency";
import { T } from "@/components/shared/T";
import { SEEDED_ACTIVITY, type SeededActivity } from "@/lib/mocks/seeded-activity";

export const metadata = { title: "Timeline" };

const TONE_ICON: Record<SeededActivity["tone"], React.ElementType> = {
  scam: ShieldAlert,
  savings: Receipt,
  investment: Coins,
  family: HeartHandshake,
  milestone: TrendingUp,
};

const TONE_BADGE: Record<SeededActivity["tone"], "scam" | "gold" | "green" | "muted"> = {
  scam: "scam",
  savings: "gold",
  investment: "green",
  family: "muted",
  milestone: "gold",
};

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

export default function TimelinePage() {
  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10">
      <header className="mx-auto w-full max-w-3xl space-y-3">
        <Badge tone="green">
          <T hi="टाइमलाइन" en="Timeline" />
        </Badge>
        <h1 className="text-h1 font-semibold tracking-tight text-saathi-ink">
          <T hi="आपकी गतिविधि" en="Your activity" />
        </h1>
        <p className="text-body-lg text-saathi-ink-soft">
          <T
            hi="हर scam, हर audit, हर निवेश और परिवार की हर update — एक जगह।"
            en="Every scam, audit, investment, and family update — in one place."
          />
        </p>
      </header>

      <section className="mx-auto w-full max-w-3xl">
        <ol className="relative space-y-3 border-l border-saathi-paper-edge pl-6">
          {SEEDED_ACTIVITY.map((activity) => {
            const Icon = TONE_ICON[activity.tone];
            const rel = formatRelative(activity.at);
            return (
              <li key={activity.id} className="relative">
                <span
                  aria-hidden
                  className="absolute -left-[31px] top-3 flex h-5 w-5 items-center justify-center rounded-pill border border-saathi-paper-edge bg-saathi-paper text-saathi-deep-green"
                >
                  <Icon className="h-3 w-3" />
                </span>
                <Card tone="paper" padding="md" className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={TONE_BADGE[activity.tone]}>
                          <T hi={activity.tag.hi} en={activity.tag.en} />
                        </Badge>
                        <span className="text-caption text-saathi-ink-quiet">
                          <T hi={rel.hi} en={rel.en} />
                        </span>
                      </div>
                      <h3 className="text-body font-semibold text-saathi-ink">
                        <T hi={activity.title.hi} en={activity.title.en} />
                      </h3>
                      <p className="text-body-sm text-saathi-ink-soft">
                        <T hi={activity.subtitle.hi} en={activity.subtitle.en} />
                      </p>
                    </div>
                    {activity.amountInr ? (
                      <div className="shrink-0 text-right">
                        <div className="text-[10px] uppercase tracking-wide text-saathi-ink-quiet">
                          {activity.tone === "investment" ? (
                            <T hi="निवेश" en="Invested" />
                          ) : (
                            <T hi="बचत" en="Saved" />
                          )}
                        </div>
                        <Currency
                          amount={activity.amountInr}
                          variant="compact"
                          language="hi-IN"
                          className={
                            activity.tone === "investment"
                              ? "text-body font-semibold text-saathi-deep-green"
                              : "text-body font-semibold text-saathi-gold"
                          }
                        />
                      </div>
                    ) : null}
                  </div>
                </Card>
              </li>
            );
          })}
        </ol>
      </section>

      <footer className="mx-auto w-full max-w-3xl">
        <Card tone="cream" padding="md" className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-saathi-gold" />
          <p className="text-body-sm text-saathi-ink-soft">
            <T
              hi="यह demo data है। Live triggers run करते ही नई entries यहाँ जुड़ेंगी।"
              en="This is seeded demo data. Run live triggers from the simulator to see new entries flow in."
            />
          </p>
        </Card>
        <div className="mt-4 flex justify-center">
          <Banknote className="h-4 w-4 text-saathi-ink-quiet" />
        </div>
      </footer>
    </main>
  );
}
