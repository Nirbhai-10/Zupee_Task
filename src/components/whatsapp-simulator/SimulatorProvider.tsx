"use client";

import * as React from "react";
import {
  publish,
  subscribe,
  type SimulatorBusEvent,
} from "@/lib/simulator/event-bus";
import type {
  PhoneId,
  SimulatorAudit,
  SimulatorDefense,
  SimulatorHarassment,
  SimulatorMessage,
  SimulatorPlan,
  SimulatorState,
} from "@/lib/simulator/types";

type Action =
  | { type: "append-message"; message: SimulatorMessage }
  | { type: "set-typing"; phoneId: PhoneId; isTyping: boolean }
  | { type: "append-defense"; defense: SimulatorDefense }
  | { type: "append-audit"; audit: SimulatorAudit }
  | { type: "append-plan"; plan: SimulatorPlan }
  | { type: "append-harassment"; harassment: SimulatorHarassment }
  | { type: "reset" };

const INITIAL: SimulatorState = {
  messages: [],
  typing: {},
  defenses: [],
  audits: [],
  plans: [],
  harassments: [],
};

function reducer(state: SimulatorState, action: Action): SimulatorState {
  switch (action.type) {
    case "append-message":
      return { ...state, messages: [...state.messages, action.message] };
    case "set-typing":
      return { ...state, typing: { ...state.typing, [action.phoneId]: action.isTyping } };
    case "append-defense":
      return { ...state, defenses: [action.defense, ...state.defenses] };
    case "append-audit":
      return { ...state, audits: [action.audit, ...state.audits] };
    case "append-plan":
      return { ...state, plans: [action.plan, ...state.plans] };
    case "append-harassment":
      return { ...state, harassments: [action.harassment, ...state.harassments] };
    case "reset":
      return INITIAL;
  }
}

type Ctx = {
  state: SimulatorState;
  appendMessage: (m: SimulatorMessage) => void;
  setTyping: (phoneId: PhoneId, isTyping: boolean) => void;
  appendDefense: (d: SimulatorDefense) => void;
  appendAudit: (a: SimulatorAudit) => void;
  appendPlan: (p: SimulatorPlan) => void;
  appendHarassment: (h: SimulatorHarassment) => void;
  reset: () => void;
  /** All messages targeted at a given phone (inbound + outbound from that phone). */
  messagesForPhone: (phoneId: PhoneId) => SimulatorMessage[];
};

const SimulatorContext = React.createContext<Ctx | null>(null);

export function SimulatorProvider({
  children,
  seedMessages = [],
}: {
  children: React.ReactNode;
  seedMessages?: SimulatorMessage[];
}) {
  const [state, dispatch] = React.useReducer(reducer, {
    ...INITIAL,
    messages: seedMessages,
  });

  // Bridge the in-memory bus → reducer. This lets server actions or
  // future Realtime channels publish events that the reducer applies.
  React.useEffect(() => {
    return subscribe((event: SimulatorBusEvent) => {
      if (event.kind === "message") {
        dispatch({ type: "append-message", message: event.payload });
      } else if (event.kind === "typing") {
        dispatch({
          type: "set-typing",
          phoneId: event.payload.phoneId,
          isTyping: event.payload.isTyping,
        });
      } else if (event.kind === "reset") {
        dispatch({ type: "reset" });
      }
    });
  }, []);

  const value = React.useMemo<Ctx>(
    () => ({
      state,
      appendMessage: (m) => {
        dispatch({ type: "append-message", message: m });
        publish({ kind: "message", payload: m });
      },
      setTyping: (phoneId, isTyping) => {
        dispatch({ type: "set-typing", phoneId, isTyping });
        publish({ kind: "typing", payload: { phoneId, isTyping } });
      },
      appendDefense: (d) => dispatch({ type: "append-defense", defense: d }),
      appendAudit: (a) => dispatch({ type: "append-audit", audit: a }),
      appendPlan: (p) => dispatch({ type: "append-plan", plan: p }),
      appendHarassment: (h) => dispatch({ type: "append-harassment", harassment: h }),
      reset: () => {
        dispatch({ type: "reset" });
        publish({ kind: "reset" });
      },
      messagesForPhone: (phoneId) =>
        state.messages.filter((m) => m.phoneId === phoneId),
    }),
    [state],
  );

  return <SimulatorContext.Provider value={value}>{children}</SimulatorContext.Provider>;
}

export function useSimulator(): Ctx {
  const ctx = React.useContext(SimulatorContext);
  if (!ctx) {
    throw new Error("useSimulator must be used inside <SimulatorProvider>");
  }
  return ctx;
}
