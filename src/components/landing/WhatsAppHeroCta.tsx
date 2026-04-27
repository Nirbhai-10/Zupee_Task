import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { T } from "@/components/shared/T";
import { twilioSandboxJoinLink } from "@/lib/whatsapp/twilio-provider";

const ctaClassName =
  "inline-flex h-12 items-center justify-center gap-2 rounded-pill bg-saathi-deep-green px-5 text-body-sm font-semibold text-white shadow-soft transition-colors hover:bg-saathi-deep-green-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saathi-deep-green/30 focus-visible:ring-offset-2 focus-visible:ring-offset-saathi-cream";

/**
 * Hero CTA. If Twilio is configured, opens WhatsApp with a prefilled
 * sandbox-join + greeting. Otherwise opens the in-app simulator. Server
 * component so we can read env at SSR.
 */
export function WhatsAppHeroCta() {
  const link = twilioSandboxJoinLink();
  if (link) {
    return (
      <Link
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={ctaClassName}
        style={{ color: "#fff" }}
      >
        <MessageCircle className="h-4 w-4 text-white" />
        <T hi="WhatsApp पर शुरू करें" en="Start on WhatsApp" className="text-white" />
        <ArrowUpRight className="h-4 w-4 text-white" />
      </Link>
    );
  }
  return (
    <Link href="/demo/simulator" className={ctaClassName} style={{ color: "#fff" }}>
      <MessageCircle className="h-4 w-4 text-white" />
      <T hi="WhatsApp simulator खोलें" en="Open the simulator" className="text-white" />
    </Link>
  );
}
