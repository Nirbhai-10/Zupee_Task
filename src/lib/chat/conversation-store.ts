"use client";

import type { ChatMessage } from "./types";

const STORAGE_KEY = "bharosa_landing_chat_v1";
const STORAGE_EVENT = "bharosa-chat-change";

function safeRead(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m): m is ChatMessage =>
        m && typeof m === "object" && typeof m.text === "string" && typeof m.id === "string",
    );
  } catch {
    return [];
  }
}

function safeWrite(messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch {
    // Quota exceeded or storage disabled — degrade silently.
  }
}

export const conversationStore = {
  read: safeRead,
  write: safeWrite,
  append(message: ChatMessage) {
    const next = [...safeRead(), message];
    safeWrite(next);
    return next;
  },
  clear() {
    safeWrite([]);
  },
  subscribe(listener: () => void): () => void {
    if (typeof window === "undefined") return () => {};
    window.addEventListener(STORAGE_EVENT, listener);
    window.addEventListener("storage", listener);
    return () => {
      window.removeEventListener(STORAGE_EVENT, listener);
      window.removeEventListener("storage", listener);
    };
  },
};
