"use client";

import * as React from "react";
import { PhoneFrame } from "./PhoneFrame";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { useSimulator } from "./SimulatorProvider";
import type { PhoneId } from "@/lib/simulator/types";

const PHONES: Array<{
  id: PhoneId;
  contactName: string;
  contactStatus: string;
  ownerLabel: string;
  ownerSubLabel: string;
}> = [
  {
    id: "mil",
    contactName: "Bharosa",
    contactStatus: "online",
    ownerLabel: "Sushma Maaji",
    ownerSubLabel: "68 · saas (mother-in-law)",
  },
  {
    id: "anjali",
    contactName: "Bharosa",
    contactStatus: "online",
    ownerLabel: "Anjali",
    ownerSubLabel: "34 · primary user",
  },
  {
    id: "husband",
    contactName: "Bharosa",
    contactStatus: "online",
    ownerLabel: "Rajesh",
    ownerSubLabel: "39 · pati (Dubai)",
  },
];

export function SimulatorStage() {
  const { state, messagesForPhone } = useSimulator();
  return (
    <div className="flex flex-wrap justify-center gap-8">
      {PHONES.map((phone) => {
        const messages = messagesForPhone(phone.id);
        const isTyping = state.typing[phone.id] === true;
        return (
          <PhoneFrame
            key={phone.id}
            contactName={phone.contactName}
            contactStatus={phone.contactStatus}
            ownerLabel={phone.ownerLabel}
            ownerSubLabel={phone.ownerSubLabel}
            avatarInitials="स"
          >
            <ConversationStream messages={messages} isTyping={isTyping} />
          </PhoneFrame>
        );
      })}
    </div>
  );
}

function ConversationStream({
  messages,
  isTyping,
}: {
  messages: ReturnType<ReturnType<typeof useSimulator>["messagesForPhone"]>;
  isTyping: boolean;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const node = scrollRef.current?.parentElement?.querySelector(
      "[data-conversation-scroll]",
    );
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages.length, isTyping]);

  if (messages.length === 0 && !isTyping) {
    return (
      <div ref={scrollRef} className="flex h-full items-center justify-center">
        <div className="rounded-pill bg-saathi-cream-deep/70 px-3 py-1 text-caption text-saathi-ink-quiet">
          Trigger se demo shuru kijiye →
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex flex-col gap-1.5">
      {messages.map((m) => (
        <MessageBubble
          key={m.id}
          variant={m.variant}
          direction={m.direction}
          timestamp={m.timestamp}
          status={m.status}
          highlight={m.highlight}
        />
      ))}
      {isTyping ? <TypingIndicator /> : null}
    </div>
  );
}
