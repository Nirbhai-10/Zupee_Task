import type { PhoneId, SimulatorMessage } from "./types";

/**
 * Minimal in-memory pub/sub used by the SimulatorProvider when Supabase
 * Realtime isn't configured. Same shape as the Realtime channel so
 * swapping is a single-file change.
 *
 * Lives at module scope (singleton). Safe in dev because the simulator
 * is a single-tab experience; safe in production because the deployed
 * app uses Realtime, not this fallback.
 */

export type SimulatorBusEvent =
  | { kind: "message"; payload: SimulatorMessage }
  | { kind: "typing"; payload: { phoneId: PhoneId; isTyping: boolean } }
  | { kind: "reset" };

type Listener = (event: SimulatorBusEvent) => void;

const listeners = new Set<Listener>();

export function publish(event: SimulatorBusEvent) {
  for (const listener of listeners) {
    try {
      listener(event);
    } catch {
      // Subscriber error shouldn't break other subscribers.
    }
  }
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function clearListeners() {
  listeners.clear();
}
