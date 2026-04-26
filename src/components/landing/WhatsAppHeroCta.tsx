import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { T } from "@/components/shared/T";
import { twilioSandboxJoinLink } from "@/lib/whatsapp/twilio-provider";

/**
 * Hero CTA. If Twilio is configured, opens WhatsApp with a prefilled
 * sandbox-join + greeting. Otherwise opens the in-app simulator. Server
 * component so we can read env at SSR.
 */
export function WhatsAppHeroCta() {
  const link = twilioSandboxJoinLink();
  if (link) {
    return (
      <Button asChild variant="primary" size="lg">
        <Link href={link} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-4 w-4" />
          <T hi="WhatsApp पर शुरू करें" en="Start on WhatsApp" />
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </Button>
    );
  }
  return (
    <Button asChild variant="primary" size="lg">
      <Link href="/demo/simulator">
        <MessageCircle className="h-4 w-4" />
        <T hi="WhatsApp simulator खोलें" en="Open the simulator" />
      </Link>
    </Button>
  );
}
