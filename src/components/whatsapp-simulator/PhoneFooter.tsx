"use client";

/**
 * Sits at the very bottom of a PhoneFrame, holding the Composer. We
 * pull it out of PhoneFrame so different phones can wear different
 * composers (Anjali sees a normal one; the elder MIL phone uses a
 * "tap to send last forwarded scam" demo composer).
 */
export function PhoneFooter({ children }: { children: React.ReactNode }) {
  return <div className="border-t border-black/5">{children}</div>;
}
