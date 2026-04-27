"use client";

import * as React from "react";
import {
  Bell,
  Clock,
  CircleCheck,
  CircleDot,
  Cog,
  CreditCard,
  Globe,
  Lock,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { T } from "@/components/shared/T";
import { useT, useLanguage } from "@/lib/i18n/language-context";
import { ANJALI } from "@/lib/mocks/demo-personas";
import { cn } from "@/lib/utils/cn";

type ServiceStatus = {
  id: "llm" | "voice" | "supabase" | "upi" | "whatsapp";
  name: { hi: string; en: string };
  detail: { hi: string; en: string };
  state: "live" | "stub" | "missing";
};

const SERVICES: ServiceStatus[] = [
  {
    id: "llm",
    name: { hi: "LLM", en: "Language model" },
    detail: { hi: "Sarvam-M (Bharat-native) primary। Local Gemma 4 fallback।", en: "Sarvam-M (Bharat-native) primary. Local Gemma 4 as fallback." },
    state: "live",
  },
  {
    id: "voice",
    name: { hi: "वॉइस (TTS)", en: "Voice (TTS)" },
    detail: { hi: "Sarvam — Hindi और 10 क्षेत्रीय भाषाएँ।", en: "Sarvam — Hindi + 10 regional languages." },
    state: "live",
  },
  {
    id: "supabase",
    name: { hi: "Supabase", en: "Supabase" },
    detail: { hi: "Postgres + pgvector + Realtime + Storage।", en: "Postgres + pgvector + Realtime + Storage." },
    state: "live",
  },
  {
    id: "upi",
    name: { hi: "UPI Autopay", en: "UPI Autopay" },
    detail: { hi: "Approval preview अभी; regulated payment partner connection बाद में।", en: "Approval preview for now; regulated payment partner connection later." },
    state: "stub",
  },
  {
    id: "whatsapp",
    name: { hi: "WhatsApp Business API", en: "WhatsApp Business API" },
    detail: { hi: "Product simulator अभी; Meta Business connection बाद में।", en: "Product simulator for now; Meta Business connection later." },
    state: "stub",
  },
];

export default function SettingsPage() {
  const t = useT();
  const { lang, setLang } = useLanguage();
  const [pushNotif, setPushNotif] = React.useState(true);
  const [voiceNotif, setVoiceNotif] = React.useState(true);
  const [familyDigest, setFamilyDigest] = React.useState(true);
  const [vaultEvening, setVaultEvening] = React.useState(true);

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 py-10">
      <header className="mx-auto w-full max-w-3xl space-y-3">
        <Badge tone="green">
          <T hi="सेटिंग्स" en="Settings" />
        </Badge>
        <h1 className="text-h1 font-semibold tracking-tight text-saathi-ink">
          {t("आपकी सेटिंग्स", "Your settings")}
        </h1>
      </header>

      <section className="mx-auto grid w-full max-w-3xl gap-4">
        {/* Profile */}
        <Card tone="paper" padding="md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-h3">
              <Cog className="h-5 w-5 text-saathi-deep-green" />
              <T hi="प्रोफ़ाइल" en="Profile" />
            </CardTitle>
            <CardDescription>
              <T
                hi="यह जानकारी Bharosa इस्तेमाल करता है आपके लिए सही plan बनाने में।"
                en="What Bharosa uses to build a plan for you."
              />
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Field label={{ hi: "नाम", en: "Name" }} value={ANJALI.name} />
            <Field label={{ hi: "फ़ोन", en: "Phone" }} value={ANJALI.phone} />
            <Field label={{ hi: "शहर", en: "City" }} value={ANJALI.city} />
            <Field label={{ hi: "व्यवसाय", en: "Occupation" }} value={ANJALI.occupation} />
            <Field
              label={{ hi: "मासिक आय", en: "Monthly income" }}
              value={`₹${ANJALI.monthlyIncomeInr.toLocaleString("en-IN")}`}
            />
            <Field
              label={{ hi: "मासिक surplus", en: "Monthly surplus" }}
              value={`₹${ANJALI.monthlySurplusInr.toLocaleString("en-IN")}`}
            />
          </CardContent>
        </Card>

        {/* Language */}
        <Card tone="paper" padding="md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-h3">
              <Globe className="h-5 w-5 text-saathi-deep-green" />
              <T hi="भाषा" en="Language" />
            </CardTitle>
            <CardDescription>
              <T
                hi="UI और CTAs के लिए। Bharosa की voice आपकी पसंद की भाषा में रहती है।"
                en="Affects UI chrome and CTAs. Bharosa's voice stays in your preferred language."
              />
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <button
              type="button"
              onClick={() => setLang("hi")}
              className={cn(
                "flex-1 rounded-card-sm border px-3 py-3 text-left transition-colors",
                lang === "hi"
                  ? "border-saathi-deep-green bg-saathi-deep-green-tint text-saathi-deep-green"
                  : "border-saathi-paper-edge bg-saathi-paper text-saathi-ink-soft hover:bg-saathi-cream-deep",
              )}
            >
              <div lang="hi" className="font-deva text-body font-semibold">हिन्दी</div>
              <div className="text-caption text-saathi-ink-quiet">Hindi · default</div>
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={cn(
                "flex-1 rounded-card-sm border px-3 py-3 text-left transition-colors",
                lang === "en"
                  ? "border-saathi-deep-green bg-saathi-deep-green-tint text-saathi-deep-green"
                  : "border-saathi-paper-edge bg-saathi-paper text-saathi-ink-soft hover:bg-saathi-cream-deep",
              )}
            >
              <div className="text-body font-semibold">English</div>
              <div className="text-caption text-saathi-ink-quiet">For evaluators / admins</div>
            </button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card tone="paper" padding="md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-h3">
              <Bell className="h-5 w-5 text-saathi-deep-green" />
              <T hi="नोटिफ़िकेशन" en="Notifications" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ToggleRow
              label={{ hi: "Push notifications", en: "Push notifications" }}
              hint={{ hi: "Scam catch, plan execute, milestone पर alert।", en: "Alerts when scams are caught, plans execute, milestones hit." }}
              checked={pushNotif}
              onChange={setPushNotif}
            />
            <ToggleRow
              label={{ hi: "वॉइस replies", en: "Voice replies" }}
              hint={{ hi: "Sarvam voice messages के साथ replies भेजें।", en: "Reply with Sarvam-generated voice notes." }}
              checked={voiceNotif}
              onChange={setVoiceNotif}
            />
            <ToggleRow
              label={{ hi: "परिवार के लिए मासिक digest", en: "Monthly family digest" }}
              hint={{ hi: "हर महीने पति/मम्मी को update भेजें (आपकी visibility settings के अनुसार)।", en: "Send husband/MIL a monthly update (as per visibility settings)." }}
              checked={familyDigest}
              onChange={setFamilyDigest}
            />
          </CardContent>
        </Card>

        {/* Vault rhythm */}
        <Card tone="paper" padding="md" className="border-saathi-deep-green-line">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-h3">
              <Clock className="h-5 w-5 text-saathi-deep-green" />
              <T hi="Private reflection layer" en="Private reflection layer" />
            </CardTitle>
            <CardDescription>
              <T
                hi="यह front-door feature नहीं है. Bharosa इसे सिर्फ आपकी household memory को बेहतर करने के लिए use करता है."
                en="This is not a front-door feature. Bharosa uses it only to improve your household memory."
              />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ToggleRow
              label={{ hi: "Roz raat private sawaal", en: "Daily private evening question" }}
              hint={{
                hi: "Family ko notify nahi hota. Yeh sirf Vault mein rehta hai.",
                en: "Family is never notified. It stays only in Vault.",
              }}
              checked={vaultEvening}
              onChange={setVaultEvening}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={{ hi: "समय", en: "Time" }} value="21:00" />
              <Field label={{ hi: "Timezone", en: "Timezone" }} value="Asia/Kolkata" />
            </div>
            <p className="rounded-card-sm bg-saathi-deep-green-tint px-3 py-2 text-caption text-saathi-deep-green">
              Vault entries AES-256 encrypted hain. Delete karne ke liye voice confirmation lagega.
            </p>
          </CardContent>
        </Card>

        {/* Connected services */}
        <Card tone="paper" padding="md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-h3">
              <CreditCard className="h-5 w-5 text-saathi-deep-green" />
              <T hi="जुड़ी हुई services" en="Connected services" />
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-saathi-paper-edge">
            {SERVICES.map((s) => (
              <div key={s.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <div className="text-body font-medium text-saathi-ink">
                    <T hi={s.name.hi} en={s.name.en} />
                  </div>
                  <div className="text-caption text-saathi-ink-soft">
                    <T hi={s.detail.hi} en={s.detail.en} />
                  </div>
                </div>
                <ServiceStatusBadge state={s.state} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card tone="paper" padding="md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-h3">
              <Lock className="h-5 w-5 text-saathi-deep-green" />
              <T hi="निजता" en="Privacy" />
            </CardTitle>
            <CardDescription>
              <T
                hi="आपकी data minimal collect होती है। DPDP Act 2023 compliant।"
                en="We collect the minimum needed. DPDP Act 2023 compliant."
              />
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/legal/privacy">
                <T hi="Privacy notice" en="Privacy notice" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/legal/disclosure">
                <T hi="AI disclosure" en="AI disclosure" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/legal/grievance">
                <T hi="Grievance officer" en="Grievance officer" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/family">
                <T hi="Family privacy" en="Family privacy" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Trust + danger */}
        <Card tone="cream" padding="md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-h3">
              <ShieldCheck className="h-5 w-5 text-saathi-deep-green" />
              <T hi="विश्वास स्तर" en="Trust level" />
            </CardTitle>
            <CardDescription>
              <T
                hi="भरोसा आपके साथ बढ़ता है — पहले एक scam catch, फिर पूरा plan, फिर experienced निवेशक।"
                en="Bharosa grows with you — one scam catch, then full plan, then seasoned investor."
              />
            </CardDescription>
          </CardHeader>
          <CardContent className="text-body-sm">
            <Badge tone="green">
              <T hi="नया · पहला defense" en="New · first defense" />
            </Badge>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function Field({ label, value }: { label: { hi: string; en: string }; value: string }) {
  return (
    <div>
      <div className="text-caption uppercase tracking-wide text-saathi-ink-quiet">
        <T hi={label.hi} en={label.en} />
      </div>
      <div className="text-body text-saathi-ink">{value}</div>
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: { hi: string; en: string };
  hint: { hi: string; en: string };
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-start justify-between gap-3 rounded-card-sm border border-transparent px-1 py-2 text-left transition-colors hover:border-saathi-paper-edge hover:bg-saathi-cream-deep"
    >
      <div className="min-w-0">
        <div className="text-body text-saathi-ink">
          <T hi={label.hi} en={label.en} />
        </div>
        <div className="text-caption text-saathi-ink-soft">
          <T hi={hint.hi} en={hint.en} />
        </div>
      </div>
      <span
        aria-hidden
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-pill border transition-colors",
          checked ? "bg-saathi-deep-green border-saathi-deep-green" : "bg-saathi-paper-edge border-saathi-paper-edge",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-pill bg-white shadow-soft transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}

function ServiceStatusBadge({ state }: { state: ServiceStatus["state"] }) {
  if (state === "live") {
    return (
      <Badge tone="green">
        <CircleCheck className="h-3 w-3" />
        <T hi="लाइव" en="Live" />
      </Badge>
    );
  }
  if (state === "stub") {
    return (
      <Badge tone="gold">
        <CircleDot className="h-3 w-3" />
        <T hi="Preview" en="Preview" />
      </Badge>
    );
  }
  return (
    <Badge tone="muted">
      <TriangleAlert className="h-3 w-3" />
      <T hi="missing" en="Missing" />
    </Badge>
  );
}
