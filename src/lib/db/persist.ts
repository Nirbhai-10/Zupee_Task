import { getSupabaseDemoClient, DEMO_USER_ID } from "./server-anon";
import type { ScamClassification } from "@/lib/llm/schemas";
import type { ULIPAuditResult } from "@/domain/investment/ulip-math";
import type { Plan } from "@/domain/investment/allocator";

/**
 * Best-effort persistence helpers used by API routes after they
 * compute a response. All silently no-op if Supabase isn't configured.
 * Errors are logged but never thrown — the response always ships.
 */

export async function persistScamDefense(args: {
  classification: ScamClassification;
  voiceUrl?: string | null;
  receiverFamilyMemberId?: string | null;
  matchedPatternName?: string | null;
  language: string;
  source: string;
}): Promise<string | null> {
  const supabase = getSupabaseDemoClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("defenses")
    .insert({
      user_id: DEMO_USER_ID,
      family_member_id: args.receiverFamilyMemberId ?? null,
      category: "scam",
      type: args.classification.category,
      verdict: args.classification.verdict,
      scam_category: args.classification.category,
      confidence: args.classification.confidence,
      identifying_signals: args.classification.identifyingSignals,
      payload_type: args.classification.payloadType,
      estimated_savings_inr: args.classification.estimatedLossInr,
      voice_response_url: args.voiceUrl ?? null,
      receiver_explanation: args.classification.receiverExplanation,
      primary_user_alert: args.classification.primaryUserAlert,
      language_used: args.language,
      text_response: args.classification.primaryUserAlert,
    } as never)
    .select("id")
    .maybeSingle();

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[persist] scam defense insert failed:", error.message);
    }
    return null;
  }
  return (data as { id?: string } | null)?.id ?? null;
}

export async function persistAuditDefense(args: {
  audit: ULIPAuditResult;
  voiceUrl?: string | null;
  voiceScript: string;
  language: string;
  source: string;
}): Promise<string | null> {
  const supabase = getSupabaseDemoClient();
  if (!supabase) return null;

  const { error: docError } = await supabase
    .from("documents")
    .insert({
      user_id: DEMO_USER_ID,
      type: "ulip-brochure",
      storage_path: "demo://sample-ulip",
      language_detected: args.language,
      structured_analysis: {
        productName: args.audit.productName,
        insurerName: args.audit.insurerName,
        termYears: args.audit.termYears,
        finalUlip: args.audit.ulip.finalFundValue,
        finalAlternative: args.audit.alternative.finalFundValue,
        lifetimeSavingsInr: args.audit.lifetimeSavingsInr,
      } as never,
      audit_voice_url: args.voiceUrl ?? null,
      estimated_savings_inr: args.audit.lifetimeSavingsInr,
    } as never);

  if (docError && process.env.NODE_ENV === "development") {
    console.warn("[persist] document insert failed:", docError.message);
  }

  const { data, error } = await supabase
    .from("defenses")
    .insert({
      user_id: DEMO_USER_ID,
      category: "mis_selling",
      type: "ulip-misselling",
      verdict: "LEGITIMATE_BUT_LOW_QUALITY",
      scam_category: "ulip-misselling",
      confidence: 0.92,
      identifying_signals: [
        `${args.audit.termYears}-year ULIP effective return ${(args.audit.ulip.effectiveAnnualReturn * 100).toFixed(1)}%`,
        `Alternative effective return ${(args.audit.alternative.effectiveAnnualReturn * 100).toFixed(1)}%`,
        `Lifetime savings ₹${args.audit.lifetimeSavingsInr.toLocaleString("en-IN")} if user picks term + SIP`,
      ],
      payload_type: "premium-product",
      estimated_savings_inr: args.audit.lifetimeSavingsInr,
      voice_response_url: args.voiceUrl ?? null,
      text_response: args.voiceScript,
      language_used: args.language,
    } as never)
    .select("id")
    .maybeSingle();

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[persist] audit defense insert failed:", error.message);
    }
    return null;
  }
  return (data as { id?: string } | null)?.id ?? null;
}

export async function persistPlan(args: {
  plan: Plan;
  voiceUrl?: string | null;
  voiceScript: string;
  source: string;
}): Promise<string | null> {
  const supabase = getSupabaseDemoClient();
  if (!supabase) return null;

  const { data: planRow, error: planError } = await supabase
    .from("investment_plans")
    .insert({
      user_id: DEMO_USER_ID,
      monthly_allocation_inr: args.plan.monthlyAllocationInr,
      status: "draft",
      rationale_voice_url: args.voiceUrl ?? null,
      rationale_text: args.voiceScript,
    } as never)
    .select("id")
    .maybeSingle();

  if (planError) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[persist] plan insert failed:", planError.message);
    }
    return null;
  }
  const planId = (planRow as { id?: string } | null)?.id;
  if (!planId) return null;

  // Insert goals + allocations sequentially so we can reference goal_id.
  for (const goal of args.plan.goalAllocations) {
    if (goal.monthlyTotalInr === 0) continue;
    const { data: goalRow, error: goalError } = await supabase
      .from("investment_goals")
      .insert({
        plan_id: planId,
        user_id: DEMO_USER_ID,
        name: goal.goalName,
        category: goal.category,
        target_inr: 0, // The allocator's plan view doesn't carry the target back.
        target_date: null,
        current_value_inr: 0,
        monthly_contribution_inr: goal.monthlyTotalInr,
        priority: 1,
      } as never)
      .select("id")
      .maybeSingle();

    if (goalError && process.env.NODE_ENV === "development") {
      console.warn("[persist] goal insert failed:", goalError.message);
      continue;
    }
    const goalId = (goalRow as { id?: string } | null)?.id;
    if (!goalId) continue;

    for (const split of goal.splits) {
      const { error: allocError } = await supabase
        .from("investment_allocations")
        .insert({
          goal_id: goalId,
          instrument: split.instrument,
          monthly_amount_inr: split.monthlyAmountInr,
          partner_name: split.partnerName,
        } as never);
      if (allocError && process.env.NODE_ENV === "development") {
        console.warn("[persist] allocation insert failed:", allocError.message);
      }
    }
  }

  return planId;
}

export async function persistHarassmentDefense(args: {
  letter: string;
  callScript: string;
  voiceUrl?: string | null;
  agentName: string;
  agencyName: string;
  language: string;
  source: string;
}): Promise<string | null> {
  const supabase = getSupabaseDemoClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("defenses")
    .insert({
      user_id: DEMO_USER_ID,
      category: "harassment",
      type: "recovery-agent-harassment",
      verdict: "SCAM",
      scam_category: "harassment",
      confidence: 0.95,
      identifying_signals: [
        "Calls outside RBI 8 AM – 7 PM window",
        "Threatening language in conversation",
        "Repeated calls to relatives despite borrower being reachable",
      ],
      payload_type: "social-engineering",
      estimated_savings_inr: 0,
      voice_response_url: args.voiceUrl ?? null,
      receiver_explanation: args.callScript,
      primary_user_alert: `${args.agentName} (${args.agencyName}) ko negotiator call gayi. Cease-and-desist letter aur Sachet draft taiyaar hai.`,
      language_used: args.language,
      text_response: args.letter,
    } as never)
    .select("id")
    .maybeSingle();

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[persist] harassment defense insert failed:", error.message);
    }
    return null;
  }
  return (data as { id?: string } | null)?.id ?? null;
}
