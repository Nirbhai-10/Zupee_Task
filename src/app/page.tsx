import Link from "next/link";

/**
 * Day-1 placeholder landing page. The full landing per Part 8 of the brief
 * is a Day 6 task. This page validates that the design system, fonts, and
 * tokens render correctly and gives the demo team a smoke-test surface.
 */
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 saathi-paper-grain">
      <div className="mx-auto max-w-3xl text-center">
        <p
          lang="hi"
          className="text-saathi-deep-green font-medium tracking-wide uppercase text-sm"
        >
          जब बैंक वाले ULIP बेच रहे हैं,
        </p>
        <h1
          lang="hi"
          className="mt-3 text-display font-extrabold text-saathi-deep-green"
        >
          हम सच बताते हैं।
        </h1>
        <p className="mt-8 text-body-lg text-saathi-ink-soft">
          Saathi is your AI advocate for Bharat. Free scam defense for your family.
          Honest investment plans for your money. Entirely on WhatsApp.
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <span className="rounded-pill bg-saathi-deep-green-tint px-4 py-2 text-body-sm text-saathi-deep-green">
            Day 1 — Foundation booted ✓
          </span>
          <Link
            href="/demo/simulator"
            className="rounded-pill bg-saathi-deep-green px-6 py-3 text-body-sm font-medium text-white shadow-soft transition-colors hover:bg-saathi-deep-green-soft"
          >
            Demo simulator
          </Link>
          <Link
            href="/api/health"
            className="rounded-pill border border-saathi-paper-edge bg-saathi-paper px-6 py-3 text-body-sm font-medium text-saathi-ink transition-colors hover:bg-saathi-cream-deep"
          >
            Health check
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-4 text-left sm:grid-cols-4">
          <Token name="deep-green" hex="#0F4D3F" className="bg-saathi-deep-green text-white" />
          <Token name="gold" hex="#C8973F" className="bg-saathi-gold text-white" />
          <Token name="cream" hex="#FBF6EB" className="bg-saathi-cream text-saathi-ink ring-1 ring-saathi-paper-edge" />
          <Token name="voice" hex="#5C8A7F" className="bg-saathi-voice text-white" />
        </div>
      </div>
    </main>
  );
}

function Token({
  name,
  hex,
  className,
}: {
  name: string;
  hex: string;
  className?: string;
}) {
  return (
    <div className={`rounded-card-sm p-4 ${className ?? ""}`}>
      <div className="text-caption uppercase tracking-wide opacity-80">{name}</div>
      <div className="mt-1 text-body-sm font-mono tabular-nums">{hex}</div>
    </div>
  );
}
