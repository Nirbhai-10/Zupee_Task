import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type DayPlaceholderProps = {
  day: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  title: string;
  /** What this surface ships when the matching day's work is complete. */
  whatToExpect: string;
  /** Optional list of related routes the evaluator might want next. */
  cousins?: { href: string; label: string }[];
};

export function DayPlaceholder({ day, title, whatToExpect, cousins }: DayPlaceholderProps) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-20">
      <Card tone="paper" padding="lg" className="w-full max-w-2xl">
        <CardHeader>
          <Badge tone="green">Day {day}</Badge>
          <CardTitle className="mt-3">{title}</CardTitle>
          <CardDescription>{whatToExpect}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-body-sm text-saathi-ink-soft">
            Saathi is being built day-by-day per the spec in <code>progress/</code>. This screen
            ships on Day {day}; the current commit lays the foundation it sits on (design tokens,
            providers, schema, mocks).
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href="/">Home</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/api/health">Health check</Link>
            </Button>
            {cousins?.map((c) => (
              <Button key={c.href} asChild variant="ghost" size="sm">
                <Link href={c.href}>{c.label}</Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
