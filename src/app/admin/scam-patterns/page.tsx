import { ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { T } from "@/components/shared/T";
import { SCAM_PATTERNS_SEED } from "@/lib/mocks/scam-patterns";

export const metadata = { title: "Admin · Scam patterns" };

const SEVERITY_TONE: Record<string, "scam" | "suspicious" | "muted"> = {
  high: "scam",
  medium: "suspicious",
  low: "muted",
};

export default function ScamPatternsAdminPage() {
  const byCategory = SCAM_PATTERNS_SEED.reduce(
    (acc, p) => {
      acc[p.category] = (acc[p.category] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10">
      <header className="mx-auto w-full max-w-5xl space-y-3">
        <Badge tone="green">
          <T hi="ऐडमिन" en="Admin" />
        </Badge>
        <h1 className="text-h1 font-semibold tracking-tight text-saathi-ink">
          <T hi="स्कैम पैटर्न बैंक" en="Scam pattern bank" />
        </h1>
        <p className="text-body-lg text-saathi-ink-soft">
          <T
            hi={`${SCAM_PATTERNS_SEED.length} seeded variants. Live LLM और pgvector पर matched।`}
            en={`${SCAM_PATTERNS_SEED.length} seeded variants. Matched live by the LLM + pgvector.`}
          />
        </p>
      </header>

      <section className="mx-auto flex w-full max-w-5xl flex-wrap gap-2">
        {Object.entries(byCategory).map(([cat, count]) => (
          <span
            key={cat}
            className="inline-flex items-center gap-2 rounded-pill border border-saathi-paper-edge bg-saathi-paper px-3 py-1.5 text-caption text-saathi-ink-soft"
          >
            <span className="font-mono uppercase tracking-wider text-[10px] text-saathi-ink-quiet">
              {cat.replace(/-/g, " ")}
            </span>
            <span className="font-mono tabular-nums">{count}</span>
          </span>
        ))}
      </section>

      <section className="mx-auto w-full max-w-5xl">
        <Card tone="paper" padding="none">
          <CardContent className="!mt-0">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="border-b border-saathi-paper-edge text-caption uppercase tracking-wide text-saathi-ink-quiet">
                  <th className="px-4 py-3 text-left">
                    <T hi="पैटर्न" en="Pattern" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <T hi="कैटेगरी" en="Category" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <T hi="भाषा" en="Lang" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <T hi="पेलोड" en="Payload" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <T hi="गंभीरता" en="Severity" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-saathi-paper-edge">
                {SCAM_PATTERNS_SEED.map((p) => (
                  <tr key={p.patternName} className="align-top">
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-saathi-danger" />
                        <div className="min-w-0">
                          <div className="font-mono text-caption text-saathi-ink-quiet">{p.patternName}</div>
                          <div className="mt-1 line-clamp-2 text-body-sm text-saathi-ink">
                            {p.representativeText}
                          </div>
                          {p.identifyingPhrases.length > 0 ? (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {p.identifyingPhrases.slice(0, 3).map((phrase) => (
                                <span
                                  key={phrase}
                                  className="rounded bg-saathi-cream-deep px-1.5 py-0.5 text-[10px] text-saathi-ink-soft"
                                >
                                  {phrase}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-saathi-ink-soft">
                      <span className="rounded-pill bg-saathi-cream-deep px-2 py-1 text-caption">
                        {p.category.replace(/-/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-caption text-saathi-ink-quiet">{p.language}</td>
                    <td className="px-4 py-3 font-mono text-caption text-saathi-ink-quiet">{p.payloadType}</td>
                    <td className="px-4 py-3">
                      <Badge tone={SEVERITY_TONE[p.severity] ?? "muted"}>{p.severity}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
