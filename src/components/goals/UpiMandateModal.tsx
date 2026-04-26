"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Loader2, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Currency } from "@/components/shared/Currency";
import { T } from "@/components/shared/T";
import { useT } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils/cn";

const BANKS = [
  { id: "sbi", name: "SBI", color: "#1B4598" },
  { id: "hdfc", name: "HDFC", color: "#ED232A" },
  { id: "icici", name: "ICICI", color: "#F37920" },
  { id: "axis", name: "Axis", color: "#97144D" },
];

type Stage =
  | { kind: "pick-bank" }
  | { kind: "review"; bankId: string }
  | { kind: "auth"; bankId: string }
  | { kind: "verifying"; bankId: string }
  | { kind: "success"; bankId: string };

type UpiMandateModalProps = {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  /** Total monthly mandate in rupees. */
  monthlyInr: number;
  /** Vpa-style label, e.g. "anjali@oksbi". */
  vpaSuffix?: string;
  /** "Bharosa Investments — Goal-anchored monthly." */
  merchantLabel?: string;
};

export function UpiMandateModal({
  open,
  onClose,
  onComplete,
  monthlyInr,
  vpaSuffix = "anjali@oksbi",
  merchantLabel = "Bharosa Investments",
}: UpiMandateModalProps) {
  const t = useT();
  const [stage, setStage] = React.useState<Stage>({ kind: "pick-bank" });
  const [pin, setPin] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStage({ kind: "pick-bank" });
      setPin("");
    }
  }, [open]);

  function pickBank(bankId: string) {
    setStage({ kind: "review", bankId });
  }

  function startAuth() {
    if (stage.kind !== "review") return;
    setStage({ kind: "auth", bankId: stage.bankId });
  }

  async function submitPin() {
    if (stage.kind !== "auth") return;
    if (pin.length !== 4) return;
    setStage({ kind: "verifying", bankId: stage.bankId });
    await new Promise((r) => setTimeout(r, 1100));
    setStage({ kind: "success", bankId: stage.bankId });
    setTimeout(() => {
      onComplete();
    }, 1400);
  }

  const bank = stage.kind !== "pick-bank" ? BANKS.find((b) => b.id === stage.bankId) : null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            key="card"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0.4, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-card-sm border border-saathi-paper-edge bg-saathi-paper shadow-lift"
          >
            <div className="flex items-center gap-3 border-b border-saathi-paper-edge bg-saathi-deep-green px-4 py-3 text-white">
              <ShieldCheck className="h-5 w-5 text-saathi-gold" />
              <div className="flex-1">
                <div className="text-body font-semibold">UPI Autopay</div>
                <T
                  hi="Bharosa के लिए monthly mandate"
                  en="Monthly mandate for Bharosa"
                  className="text-caption text-white/80"
                />
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-pill text-white/80 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              {stage.kind === "pick-bank" ? (
                <div className="space-y-4">
                  <T
                    as="div"
                    hi="अपना bank चुनिए"
                    en="Pick your bank"
                    className="text-body-sm text-saathi-ink-soft"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {BANKS.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => pickBank(b.id)}
                        className="flex items-center justify-between rounded-card-sm border border-saathi-paper-edge bg-saathi-cream px-3 py-3 text-left transition-colors hover:bg-saathi-cream-deep"
                      >
                        <span className="font-semibold text-saathi-ink">{b.name}</span>
                        <span
                          aria-hidden
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: b.color }}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-caption text-saathi-ink-quiet">
                    <T
                      hi="Bharosa demo flow है — कोई असली payment नहीं होगा।"
                      en="This is the Bharosa demo flow — no real payment will be charged."
                    />
                  </p>
                </div>
              ) : null}

              {stage.kind === "review" && bank ? (
                <div className="space-y-3">
                  <Row label={{ hi: "Merchant", en: "Merchant" }} value={merchantLabel} />
                  <Row
                    label={{ hi: "VPA", en: "VPA" }}
                    value={vpaSuffix}
                  />
                  <Row label={{ hi: "Bank", en: "Bank" }} value={bank.name} />
                  <Row
                    label={{ hi: "Frequency", en: "Frequency" }}
                    value={t("हर 1 महीना", "Every 1 month")}
                  />
                  <Row
                    label={{ hi: "Validity", en: "Validity" }}
                    value={t("Aaj se Apr 2031 तक", "Today → Apr 2031")}
                  />
                  <div className="flex items-center justify-between rounded-card-sm border border-saathi-deep-green-line bg-saathi-deep-green-tint p-3">
                    <T
                      hi="मासिक debit"
                      en="Monthly debit"
                      className="text-caption uppercase tracking-wide text-saathi-deep-green"
                    />
                    <Currency
                      amount={monthlyInr}
                      variant="full"
                      language="en-IN"
                      className="text-h3 font-semibold text-saathi-deep-green"
                    />
                  </div>
                  <Button type="button" variant="primary" size="md" onClick={startAuth} className="w-full">
                    <T hi="Continue to UPI PIN" en="Continue to UPI PIN" />
                  </Button>
                </div>
              ) : null}

              {stage.kind === "auth" && bank ? (
                <div className="space-y-4 text-center">
                  <div
                    aria-hidden
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-pill text-white shadow-lift"
                    style={{ backgroundColor: bank.color }}
                  >
                    <span className="text-body font-bold">{bank.name.slice(0, 1)}</span>
                  </div>
                  <T
                    as="h3"
                    hi="UPI PIN डालें"
                    en="Enter your UPI PIN"
                    className="text-h3 font-semibold text-saathi-ink"
                  />
                  <T
                    as="p"
                    hi="यह demo है — कोई 4 अंक डाल दीजिए।"
                    en="This is a demo — enter any 4 digits."
                    className="text-caption text-saathi-ink-quiet"
                  />
                  <input
                    type="password"
                    inputMode="numeric"
                    autoFocus
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && pin.length === 4) submitPin();
                    }}
                    className="mx-auto w-32 rounded-card-sm border border-saathi-paper-edge bg-saathi-cream px-3 py-3 text-center text-display font-semibold tracking-[0.5em] text-saathi-ink outline-none focus:border-saathi-deep-green/40"
                    placeholder="••••"
                  />
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={submitPin}
                    disabled={pin.length !== 4}
                    className="w-full"
                  >
                    <T hi="Authorize" en="Authorize" />
                  </Button>
                </div>
              ) : null}

              {stage.kind === "verifying" ? (
                <div className="flex flex-col items-center gap-3 py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-saathi-deep-green" />
                  <T
                    as="p"
                    hi="Mandate verify हो रहा है…"
                    en="Verifying mandate…"
                    className="text-body text-saathi-ink-soft"
                  />
                </div>
              ) : null}

              {stage.kind === "success" ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 12 }}
                    className="flex h-14 w-14 items-center justify-center rounded-pill bg-saathi-success text-white"
                  >
                    <CheckCircle2 className="h-8 w-8" />
                  </motion.div>
                  <T
                    as="h3"
                    hi="Mandate active है"
                    en="Mandate is active"
                    className="text-h3 font-semibold text-saathi-success"
                  />
                  <T
                    as="p"
                    hi={`हर महीने ₹${monthlyInr.toLocaleString("en-IN")} auto-debit होगा। Apr 2031 तक चलेगा।`}
                    en={`₹${monthlyInr.toLocaleString("en-IN")} will auto-debit each month, valid through Apr 2031.`}
                    className="text-body-sm text-saathi-ink-soft"
                  />
                </div>
              ) : null}
            </div>

            <footer className="border-t border-saathi-paper-edge bg-saathi-cream px-4 py-2 text-center text-[10px] text-saathi-ink-quiet">
              <T
                hi="Razorpay-style demo flow · production में Razorpay या PhonePe या Cashfree पर लाइव होगा"
                en="Razorpay-style demo flow · production wires Razorpay / PhonePe / Cashfree live"
              />
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Row({ label, value }: { label: { hi: string; en: string }; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-saathi-paper-edge pb-2 last:border-0 last:pb-0">
      <T
        hi={label.hi}
        en={label.en}
        className="text-caption uppercase tracking-wide text-saathi-ink-quiet"
      />
      <div
        className={cn(
          "text-body-sm tabular-nums text-saathi-ink",
          value.match(/^[0-9]/) ? "font-mono" : "",
        )}
      >
        {value}
      </div>
    </div>
  );
}
