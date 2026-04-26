/**
 * Twilio WhatsApp send helper. Used by future server flows that need
 * to push messages outbound (salary day fan-out, scam alerts, etc).
 * Falls through to a no-op when Twilio isn't configured.
 *
 * Inbound flow (user → Saathi) uses the TwiML response in
 * /api/webhooks/whatsapp/twilio — no client needed for that direction.
 */

export type SendWhatsAppArgs = {
  /** E.164 number, with or without `whatsapp:` prefix. */
  to: string;
  body: string;
};

export type SendWhatsAppResult =
  | { ok: true; messageSid: string }
  | { ok: false; error: string; reason: "not-configured" | "send-failed" };

const TWILIO_API_BASE = "https://api.twilio.com/2010-04-01";

export async function twilioSendWhatsApp(args: SendWhatsAppArgs): Promise<SendWhatsAppResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const number = process.env.TWILIO_WHATSAPP_NUMBER;
  if (!sid || !token || !number) {
    return { ok: false, error: "Twilio not configured", reason: "not-configured" };
  }

  const fromAddress = number.startsWith("whatsapp:") ? number : `whatsapp:${number}`;
  const toAddress = args.to.startsWith("whatsapp:") ? args.to : `whatsapp:${args.to}`;

  const form = new URLSearchParams({
    From: fromAddress,
    To: toAddress,
    Body: args.body,
  });

  const response = await fetch(
    `${TWILIO_API_BASE}/Accounts/${encodeURIComponent(sid)}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
    },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    return { ok: false, error: `Twilio ${response.status}: ${detail}`, reason: "send-failed" };
  }
  const json = (await response.json()) as { sid?: string };
  return { ok: true, messageSid: json.sid ?? "unknown" };
}

export function twilioSandboxJoinLink(): string | null {
  const number = process.env.TWILIO_WHATSAPP_NUMBER;
  if (!number) return null;
  const digits = number.replace(/[^0-9]/g, "");
  if (!digits) return null;
  const code = process.env.TWILIO_WHATSAPP_SANDBOX_CODE;
  const greeting = "Namaste Bharosa";
  const text = code ? `join ${code}\n\n${greeting}` : greeting;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
