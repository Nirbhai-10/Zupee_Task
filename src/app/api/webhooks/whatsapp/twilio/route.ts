import { NextResponse } from "next/server";
import { respondToChat } from "@/domain/chat/respond";
import { isLanguageCode, type LanguageCode } from "@/lib/i18n/languages";
import { detectScript } from "@/lib/i18n/scripts";
import type { ChatMessage } from "@/lib/chat/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Twilio WhatsApp sandbox webhook. The Twilio Messaging service POSTs
 * form-encoded fields (`From`, `Body`, `MessageSid`, etc.) here. We
 * reply with TwiML — Twilio relays it back to the sender's WhatsApp.
 *
 * Production: verify the X-Twilio-Signature header against
 * TWILIO_AUTH_TOKEN to reject forgeries. We skip in this prototype and
 * log the signature for debugging.
 */
export async function POST(req: Request) {
  if (!process.env.TWILIO_AUTH_TOKEN) {
    // Twilio not configured — return empty so Twilio doesn't retry.
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response/>`,
      { headers: { "Content-Type": "text/xml" } },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const body = String(formData.get("Body") ?? "").trim();
  const from = String(formData.get("From") ?? "");

  if (!body) {
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response/>`,
      { headers: { "Content-Type": "text/xml" } },
    );
  }

  const script = detectScript(body);
  const detectedLanguage: LanguageCode =
    script === "devanagari"
      ? "hi-IN"
      : script === "tamil"
        ? "ta-IN"
        : script === "telugu"
          ? "te-IN"
          : script === "bengali"
            ? "bn-IN"
            : script === "kannada"
              ? "kn-IN"
              : script === "malayalam"
                ? "ml-IN"
                : script === "gujarati"
                  ? "gu-IN"
                  : script === "gurmukhi"
                    ? "pa-IN"
                    : script === "oriya"
                      ? "or-IN"
                      : "en-IN";

  const messages: ChatMessage[] = [
    {
      id: crypto.randomUUID(),
      role: "user",
      text: body,
      language: isLanguageCode(detectedLanguage) ? detectedLanguage : "auto",
      createdAt: new Date().toISOString(),
    },
  ];

  const reply = await respondToChat(messages, detectedLanguage);
  const cta = reply.cta
    ? `\n\n${reply.cta.label}: ${process.env.NEXT_PUBLIC_APP_URL ?? "https://saathi-tau.vercel.app"}${reply.cta.href}`
    : "";

  const text = `${reply.text}${cta}`;
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(text)}</Message>
</Response>`;

  if (process.env.NODE_ENV === "development") {
    console.info(`[twilio-webhook] from=${from} → intent=${reply.intent}`);
  }

  return new NextResponse(twiml, {
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
