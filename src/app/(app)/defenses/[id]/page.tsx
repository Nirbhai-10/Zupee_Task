import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Currency } from "@/components/shared/Currency";
import { T } from "@/components/shared/T";
import { VoicePlayer } from "@/components/voice/VoicePlayer";
import { getSupabaseDemoClient, DEMO_USER_ID } from "@/lib/db/server-anon";
import type { ScamClassification } from "@/lib/llm/schemas";

export const dynamic = "force-dynamic";

type DefenseRow = {
  id: string;
  category: string;
  type: string | null;
  verdict: ScamClassification["verdict"];
  scam_category: string | null;
  confidence: number | string | null;
  identifying_signals: string[] | null;
  payload_type: string | null;
  estimated_savings_inr: number | string | null;
  receiver_explanation: string | null;
  primary_user_alert: string | null;
  language_used: string | null;
  voice_response_url: string | null;
  text_response: string | null;
  created_at: string;
};

const VERDICT_TONE: Record<ScamClassification["verdict"], "scam" | "suspicious" | "legit" | "unclear"> = {
  SCAM: "scam",
  SUSPICIOUS: "suspicious",
  LEGITIMATE_BUT_LOW_QUALITY: "suspicious",
  LEGITIMATE: "legit",
  UNCLEAR: "unclear",
};

const VERDICT_ICON: Record<ScamClassification["verdict"], React.ElementType> = {
  SCAM: ShieldAlert,
  SUSPICIOUS: ShieldAlert,
  LEGITIMATE_BUT_LOW_QUALITY: ShieldQuestion,
  LEGITIMATE: ShieldCheck,
  UNCLEAR: ShieldQuestion,
};

async function fetchDefense(id: string): Promise<DefenseRow | null> {
  const supabase = getSupabaseDemoClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("defenses")
    .select(
      "id, category, type, verdict, scam_category, confidence, identifying_signals, payload_type, estimated_savings_inr, receiver_explanation, primary_user_alert, language_used, voice_response_url, text_response, created_at",
    )
    .eq("id", id)
    .eq("user_id", DEMO_USER_ID)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as DefenseRow;
}

export default async function DefenseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await fetchDefense(id);
  if (!row) notFound();

  const Icon = VERDICT_ICON[row.verdict];
  const savings = Number(row.estimated_savings_inr ?? 0);
  const confidence = Number(row.confidence ?? 0);
  const signals = row.identifying_signals ?? [];

  // "How many minutes ago" inherently reads `now`. Server component —
  // re-renders only on navigation, so the apparent purity violation is
  // benign here.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const minutesAgo = Math.max(
    0,
    Math.floor((now - new Date(row.created_at).getTime()) / 60_000),
  );

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <Button asChild variant="ghost" size="sm">
          <Link href="/defenses">
            <ArrowLeft className="h-4 w-4" />
            <T hi="सभी defenses" en="All defenses" />
          </Link>
        </Button>
      </div>

      <header className="mx-auto w-full max-w-3xl space-y-3">
        <Badge tone={VERDICT_TONE[row.verdict]}>
          <Icon className="h-3 w-3" />
          {row.verdict}
        </Badge>
        <h1 className="text-h1 font-semibold tracking-tight text-saathi-ink capitalize">
          {(row.scam_category ?? row.category).replace(/-/g, " ")}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-caption text-saathi-ink-quiet">
          <span>
            <T hi="कब:" en="When:" />{" "}
            {minutesAgo < 60
              ? `${minutesAgo} min ago`
              : minutesAgo < 1440
                ? `${Math.floor(minutesAgo / 60)}h ago`
                : `${Math.floor(minutesAgo / 1440)}d ago`}
          </span>
          <span>·</span>
          <span>
            <T hi="Confidence:" en="Confidence:" />{" "}
            <span className="font-mono tabular-nums">{confidence.toFixed(2)}</span>
          </span>
          {row.payload_type ? (
            <>
              <span>·</span>
              <span className="font-mono">{row.payload_type}</span>
            </>
          ) : null}
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-3xl gap-4">
        {/* Voice + alert */}
        <Card tone="paper" padding="md" className="space-y-3">
          <CardHeader>
            <CardTitle className="text-h3">
              <T hi="साथी ने क्या बोला" en="What Bharosa said" />
            </CardTitle>
            <CardDescription>
              <T
                hi="Receiver की भाषा में voice + Anjali के dashboard पर alert।"
                en="Voice in the receiver's language + alert on Anjali's dashboard."
              />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {row.voice_response_url ? (
              <VoicePlayer
                src={row.voice_response_url}
                transcript={row.receiver_explanation ?? undefined}
                language="hi-IN"
                size="sm"
              />
            ) : null}
            {row.primary_user_alert ? (
              <div className="rounded-card-sm border border-saathi-paper-edge bg-saathi-cream-deep p-3">
                <div className="text-[10px] uppercase tracking-wider text-saathi-ink-quiet">
                  <T hi="Anjali को alert" en="Alert sent to Anjali" />
                </div>
                <p lang="hi" data-script="devanagari" className="mt-1 text-body-sm text-saathi-ink-soft">
                  {row.primary_user_alert}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Identifying signals */}
        {signals.length > 0 ? (
          <Card tone="paper" padding="md">
            <CardHeader>
              <CardTitle className="text-h3">
                <T hi="पहचान के signals" en="Identifying signals" />
              </CardTitle>
              <CardDescription>
                <T
                  hi="Auditable evidence — हर signal classification में weight करता है।"
                  en="Auditable evidence — each signal contributes to the classifier's verdict."
                />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {signals.map((s) => (
                  <li key={s} className="flex gap-2 text-body-sm text-saathi-ink-soft">
                    <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-saathi-deep-green" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}

        {/* Savings */}
        {savings > 0 ? (
          <Card tone="gold" padding="md" className="flex items-center justify-between">
            <T
              hi="अगर इस पर act किया होता, तो risk था"
              en="Risk caught — what would have been lost if acted on"
              className="text-body-sm text-saathi-ink-soft"
            />
            <Currency
              amount={savings}
              variant="compact"
              language="hi-IN"
              className="text-h2 font-semibold text-saathi-gold"
            />
          </Card>
        ) : null}

        {/* Action taken */}
        <Card tone="paper" padding="md">
          <CardHeader>
            <CardTitle className="text-h3">
              <T hi="क्या-क्या action लिया" en="Action taken" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-body-sm text-saathi-ink-soft">
            <ActionRow
              done
              text={{
                hi: "Receiver को उनकी भाषा में voice भेजी।",
                en: "Voice note sent to the receiver in their language.",
              }}
            />
            <ActionRow
              done
              text={{
                hi: "Anjali के dashboard पर notification + alert।",
                en: "Notification + alert posted to Anjali's dashboard.",
              }}
            />
            {row.category === "harassment" ? (
              <>
                <ActionRow
                  done
                  text={{
                    hi: "Cease-and-desist letter draft किया।",
                    en: "Cease-and-desist letter drafted.",
                  }}
                />
                <ActionRow
                  done
                  text={{
                    hi: "RBI Sachet portal के लिए complaint pre-fill।",
                    en: "RBI Sachet complaint pre-filled.",
                  }}
                />
              </>
            ) : null}
            <ActionRow
              done={false}
              text={{
                hi: "Optional: इसी pattern का scam बाकी users के लिए पकड़ा जाए।",
                en: "Optional: surface this pattern for other users (auto-enabled).",
              }}
            />
          </CardContent>
        </Card>

        {row.text_response && row.category === "harassment" ? (
          <Card tone="paper" padding="md">
            <CardHeader>
              <CardTitle className="text-h3">
                <T hi="भेजी गई letter" en="Letter sent" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-card-sm border border-saathi-paper-edge bg-saathi-cream-deep p-3 font-mono text-[11px] leading-relaxed text-saathi-ink-soft">
                {row.text_response}
              </pre>
            </CardContent>
          </Card>
        ) : null}

        <Card tone="cream" padding="md" className="text-body-sm text-saathi-ink-soft">
          <T
            hi="यह defense वही है जो आपने simulator में चलाया था। DB row → Supabase → Server Component।"
            en="This defense is the one you ran in the simulator. DB row → Supabase → Server Component."
          />
        </Card>
      </section>
    </main>
  );
}

function ActionRow({ done, text }: { done: boolean; text: { hi: string; en: string } }) {
  return (
    <div className="flex items-start gap-2">
      <span
        aria-hidden
        className={
          done
            ? "mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-saathi-success text-[10px] font-bold leading-none text-white"
            : "mt-0.5 inline-block h-4 w-4 rounded-full border border-saathi-paper-edge bg-saathi-paper"
        }
      >
        {done ? "✓" : ""}
      </span>
      <T hi={text.hi} en={text.en} />
    </div>
  );
}
