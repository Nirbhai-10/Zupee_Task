"use client";

import * as React from "react";
import { Mic, Sparkles, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Currency } from "@/components/shared/Currency";
import { T } from "@/components/shared/T";
import { useT } from "@/lib/i18n/language-context";
import type { GoalCategory } from "@/domain/types";
import { cn } from "@/lib/utils/cn";

const CATEGORIES: Array<{ id: GoalCategory; hi: string; en: string }> = [
  { id: "wedding", hi: "शादी", en: "Wedding" },
  { id: "education", hi: "पढ़ाई", en: "Education" },
  { id: "medical", hi: "मेडिकल", en: "Medical" },
  { id: "festival", hi: "त्योहार", en: "Festival" },
  { id: "house", hi: "घर", en: "House" },
  { id: "vehicle", hi: "वाहन", en: "Vehicle" },
  { id: "pilgrimage", hi: "तीर्थ", en: "Pilgrimage" },
  { id: "general", hi: "बचत", en: "General" },
];

const PRESETS = [
  { label: { hi: "बेटी की शादी 2032 में 8 लाख", en: "Daughter's wedding 2032: ₹8L" }, name: "Beti ki shaadi", category: "wedding" as const, target: 800_000, date: "2032-04-15" },
  { label: { hi: "बेटे की coaching 2027 तक 3 लाख", en: "Son's coaching by 2027: ₹3L" }, name: "Aarav coaching", category: "education" as const, target: 300_000, date: "2027-06-01" },
  { label: { hi: "Diwali fund — हर साल 30,000", en: "Diwali fund — ₹30k yearly" }, name: "Diwali fund", category: "festival" as const, target: 30_000, date: "2026-10-15" },
];

export default function NewGoalPage() {
  const t = useT();
  const [category, setCategory] = React.useState<GoalCategory>("wedding");
  const [name, setName] = React.useState("");
  const [target, setTarget] = React.useState<number | "">("");
  const [date, setDate] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  function applyPreset(preset: (typeof PRESETS)[number]) {
    setCategory(preset.category);
    setName(preset.name);
    setTarget(preset.target);
    setDate(preset.date);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <Card tone="paper" padding="lg" className="w-full max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-pill bg-saathi-deep-green-tint">
            <Sparkles className="h-6 w-6 text-saathi-deep-green" />
          </div>
          <h2 className="mt-4 text-h3 font-semibold text-saathi-ink">
            <T hi="लक्ष्य जोड़ दिया गया" en="Goal added" />
          </h2>
          <p className="mt-2 text-body-sm text-saathi-ink-soft">
            <T
              hi="अब प्लान बनाने के लिए लाइव सिमुलेटर पर 'Plan banwayein' दबाएँ।"
              en="Now hit 'Plan banwayein' on the live simulator to generate a fresh allocation."
            />
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button onClick={() => setSubmitted(false)} variant="ghost" size="sm">
              <T hi="और लक्ष्य जोड़ें" en="Add another" />
            </Button>
            <Button asChild variant="primary" size="sm">
              <a href="/demo/simulator">
                <T hi="सिमुलेटर पर जाएँ" en="Go to simulator" />
              </a>
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10">
      <header className="mx-auto w-full max-w-3xl space-y-3">
        <Badge tone="green">
          <T hi="नया लक्ष्य" en="New goal" />
        </Badge>
        <h1 className="text-h1 font-semibold tracking-tight text-saathi-ink">
          <T hi="नया लक्ष्य बनाइए" en="Add a goal" />
        </h1>
        <p className="text-body-lg text-saathi-ink-soft">
          <T
            hi="वॉइस से बताइए, या नीचे form भरिए। Bharosa instrument चुन लेगा।"
            en="Speak it, or fill the form below. Bharosa will pick the instrument."
          />
        </p>
      </header>

      <section className="mx-auto grid w-full max-w-3xl gap-4 lg:grid-cols-[2fr_3fr]">
        {/* Voice CTA */}
        <Card tone="green" padding="lg" className="flex flex-col items-center text-center text-white">
          <div className="flex h-24 w-24 items-center justify-center rounded-pill bg-saathi-gold text-saathi-ink shadow-lift">
            <Mic className="h-10 w-10" />
          </div>
          <h2 className="mt-4 text-h3 font-semibold">
            <T hi="अपना लक्ष्य बोलिए" en="Speak your goal" />
          </h2>
          <p className="mt-2 text-body-sm text-white/85">
            <T
              hi="उदाहरण: ‘बेटी की शादी 2032 में 8 लाख चाहिए।’"
              en="e.g. ‘I need ₹8 lakh for Priya's wedding in 2032.’"
            />
          </p>
          <p className="mt-3 text-caption text-white/70">
            <T
              hi="वॉइस intake पूरा state-machine demo simulator में run होता है — Plan banwayein."
              en="Full voice intake runs in the live simulator — try ‘Plan banwayein’."
            />
          </p>
        </Card>

        {/* Form */}
        <form onSubmit={submit} className="space-y-4">
          <Card tone="paper" padding="md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-h3">
                <Target className="h-5 w-5 text-saathi-deep-green" />
                <T hi="लक्ष्य के डिटेल्स" en="Goal details" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={cn(
                      "rounded-card-sm border px-2 py-2 text-caption transition-colors",
                      category === c.id
                        ? "border-saathi-deep-green bg-saathi-deep-green-tint text-saathi-deep-green"
                        : "border-saathi-paper-edge bg-saathi-paper text-saathi-ink-soft hover:bg-saathi-cream-deep",
                    )}
                  >
                    <T hi={c.hi} en={c.en} />
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-caption font-medium text-saathi-ink-soft">
                  <T hi="नाम" en="Goal name" />
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("उदाहरण: बेटी की शादी", "e.g. Priya's wedding")}
                  className="w-full rounded-card-sm border border-saathi-paper-edge bg-saathi-paper px-3 py-2 text-body-sm outline-none focus:border-saathi-deep-green/40"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-caption font-medium text-saathi-ink-soft">
                    <T hi="लक्ष्य राशि (₹)" en="Target amount (₹)" />
                  </label>
                  <input
                    type="number"
                    value={target}
                    onChange={(e) => setTarget(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="800000"
                    min={1000}
                    className="w-full rounded-card-sm border border-saathi-paper-edge bg-saathi-paper px-3 py-2 text-body-sm font-mono tabular-nums outline-none focus:border-saathi-deep-green/40"
                    required
                  />
                  {typeof target === "number" && target > 0 ? (
                    <div className="text-caption text-saathi-ink-quiet">
                      ≈ <Currency amount={target} variant="compact" language="hi-IN" />
                    </div>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <label className="text-caption font-medium text-saathi-ink-soft">
                    <T hi="कब तक" en="Target date" />
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-card-sm border border-saathi-paper-edge bg-saathi-paper px-3 py-2 text-body-sm outline-none focus:border-saathi-deep-green/40"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Button type="submit" variant="primary" size="md">
                  <T hi="लक्ष्य जोड़ें" en="Add goal" />
                </Button>
                <Button type="button" variant="ghost" size="md" onClick={() => { setName(""); setTarget(""); setDate(""); }}>
                  <T hi="रीसेट" en="Reset" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card tone="cream" padding="md">
            <div className="text-caption uppercase tracking-wide text-saathi-ink-quiet">
              <T hi="फटाफट प्रीसेट" en="Quick presets" />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="rounded-pill border border-saathi-paper-edge bg-saathi-paper px-3 py-1.5 text-caption text-saathi-ink-soft transition-colors hover:bg-saathi-deep-green-tint hover:text-saathi-deep-green"
                >
                  <T hi={p.label.hi} en={p.label.en} />
                </button>
              ))}
            </div>
          </Card>
        </form>
      </section>
    </main>
  );
}
