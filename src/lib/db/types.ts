/**
 * Generated database type. Day 1: hand-stubbed minimum surface so the
 * llm_events insert and other Day-2 queries type-check. Day 7 we'll
 * regenerate via `pnpm dlx supabase gen types typescript --project-id ...`.
 */

type UsersRow = {
  id: string;
  phone: string;
  name: string;
  language: string;
  city: string | null;
  monthly_income_inr: number | null;
  monthly_surplus_inr: number | null;
  trust_level: TrustLevel;
  created_at: string;
};

type LLMEventsRow = {
  id: string;
  feature: string;
  provider: string;
  model_id: string;
  tier: string;
  input_tokens: number;
  output_tokens: number;
  cost_paise: number;
  latency_ms: number;
  user_id: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
};

type LLMEventsInsert = {
  feature: string;
  provider: string;
  model_id: string;
  tier: string;
  input_tokens: number;
  output_tokens: number;
  cost_paise: number;
  latency_ms: number;
  user_id?: string | null;
  meta?: Record<string, unknown> | null;
};

export type Database = {
  public: {
    Tables: {
      users: {
        Row: UsersRow;
        Insert: Partial<UsersRow> & Pick<UsersRow, "phone" | "name" | "language">;
        Update: Partial<UsersRow>;
        Relationships: [];
      };
      llm_events: {
        Row: LLMEventsRow;
        Insert: LLMEventsInsert;
        Update: Partial<LLMEventsRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      trust_level: TrustLevel;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type TrustLevel =
  | "new"
  | "first_defense"
  | "multiple_defenses"
  | "invested"
  | "seasoned";
