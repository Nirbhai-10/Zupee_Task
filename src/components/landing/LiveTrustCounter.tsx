"use client";

import * as React from "react";
import { motion } from "motion/react";
import { ShieldCheck, TrendingUp, Users } from "lucide-react";
import { T } from "@/components/shared/T";
import { Currency } from "@/components/shared/Currency";

/**
 * Live trust counter on the landing — three stats animate from 0 to
 * their target values once they enter the viewport. Numbers are
 * conservative aggregate-style figures pinned to the prototype's
 * seeded data, not real production traffic.
 */
export function LiveTrustCounter() {
  return (
    <section className="bg-saathi-cream">
      <div className="mx-auto grid max-w-6xl gap-3 px-6 py-10 md:grid-cols-3">
        <Counter
          icon={ShieldCheck}
          to={12_400}
          label={{ hi: "इस साल scams रोके", en: "Scams blocked this year" }}
          tone="green"
        />
        <CurrencyCounter
          icon={TrendingUp}
          to={3_24_00_000}
          label={{ hi: "Total risk रोका — सभी users", en: "Total risk caught — all users" }}
          tone="gold"
        />
        <Counter
          icon={Users}
          to={47_200}
          label={{ hi: "Bharat households on board", en: "Bharat households on board" }}
          tone="muted"
        />
      </div>
    </section>
  );
}

function useInViewCounter(target: number, duration = 1400) {
  const [value, setValue] = React.useState(0);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const start = performance.now();
          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(1, elapsed / duration);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          observer.unobserve(node);
        });
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [target, duration]);
  return { ref, value };
}

function Counter({
  icon: Icon,
  to,
  label,
  tone,
}: {
  icon: React.ElementType;
  to: number;
  label: { hi: string; en: string };
  tone: "green" | "gold" | "muted";
}) {
  const { ref, value } = useInViewCounter(to);
  const toneClass: Record<typeof tone, string> = {
    green: "bg-saathi-deep-green-tint text-saathi-deep-green",
    gold: "bg-saathi-gold-tint text-saathi-gold",
    muted: "bg-saathi-cream-deep text-saathi-ink-soft",
  };
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, amount: 0.4 }}
      className="flex items-center gap-3 rounded-card border border-saathi-paper-edge bg-saathi-paper p-4 shadow-soft"
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-pill ${toneClass[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-h3 font-semibold tabular-nums text-saathi-ink">
          {value.toLocaleString("en-IN")}
        </div>
        <T as="div" hi={label.hi} en={label.en} className="text-caption text-saathi-ink-soft" />
      </div>
    </motion.div>
  );
}

function CurrencyCounter({
  icon: Icon,
  to,
  label,
  tone,
}: {
  icon: React.ElementType;
  to: number;
  label: { hi: string; en: string };
  tone: "green" | "gold" | "muted";
}) {
  const { ref, value } = useInViewCounter(to);
  const toneClass: Record<typeof tone, string> = {
    green: "bg-saathi-deep-green-tint text-saathi-deep-green",
    gold: "bg-saathi-gold-tint text-saathi-gold",
    muted: "bg-saathi-cream-deep text-saathi-ink-soft",
  };
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, amount: 0.4 }}
      className="flex items-center gap-3 rounded-card border border-saathi-paper-edge bg-saathi-paper p-4 shadow-soft"
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-pill ${toneClass[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <Currency
          amount={value}
          variant="compact"
          language="hi-IN"
          className="block text-h3 font-semibold text-saathi-gold"
        />
        <T as="div" hi={label.hi} en={label.en} className="text-caption text-saathi-ink-soft" />
      </div>
    </motion.div>
  );
}
