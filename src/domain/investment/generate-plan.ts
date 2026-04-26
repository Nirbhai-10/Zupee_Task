import { generateText, MissingLLMCredentialsError } from "@/lib/llm/router";
import { PLAN_EXPLAIN_SYSTEM_V1 } from "@/lib/llm/prompts/plan-explain.v1";
import { buildPlan, type AllocatorInput, type Plan } from "./allocator";
import { findProduct } from "@/lib/mocks/investment-products";

export type GeneratePlanResult = {
  plan: Plan;
  voiceScript: string;
  source: "llm" | "mock-template";
};

export async function generatePlan(input: AllocatorInput): Promise<GeneratePlanResult> {
  const plan = buildPlan(input);
  const promptBody = [
    `User: ${input.user.name} (${input.user.occupation}, ${input.user.city}, language ${input.user.language}).`,
    `Monthly surplus: ₹${input.user.monthlySurplusInr.toLocaleString("en-IN")}.`,
    `Trust level: ${input.user.trustLevel} (use this to calibrate equity exposure).`,
    "",
    "Goals (priority 1 = highest):",
    ...input.goals.map(
      (g) =>
        `  - ${g.name} [${g.category}, priority ${g.priority}, target ₹${g.targetInr.toLocaleString(
          "en-IN",
        )} by ${g.targetDate}]`,
    ),
    "",
    "Plan (deterministic):",
    `  Total monthly allocation: ₹${plan.monthlyAllocationInr.toLocaleString("en-IN")} of ₹${input.user.monthlySurplusInr.toLocaleString("en-IN")} surplus.`,
    `  Tagline: ${plan.taglineHindi}`,
    ...plan.goalAllocations.flatMap((g) => [
      "",
      `  Goal: ${g.goalName} (${g.category}, ${g.horizonMonths} months horizon) — ₹${g.monthlyTotalInr.toLocaleString("en-IN")}/month`,
      `    Rationale: ${g.rationale}`,
      ...g.splits.map(
        (s) =>
          `    - ${s.instrument} via ${s.partnerName}: ₹${s.monthlyAmountInr.toLocaleString("en-IN")}/month (${s.pctOfGoal}%)`,
      ),
    ]),
    "",
    "Write the 60-90 second voice script now.",
  ].join("\n");

  try {
    const result = await generateText({
      feature: "plan-explain",
      tier: "sonnet",
      system: PLAN_EXPLAIN_SYSTEM_V1,
      prompt: promptBody,
      temperature: 0.4,
      maxOutputTokens: 2000,
    });
    return { plan, voiceScript: result.text.trim(), source: "llm" };
  } catch (error) {
    if (error instanceof MissingLLMCredentialsError) {
      return { plan, voiceScript: mockPlanScript(plan), source: "mock-template" };
    }
    throw error;
  }
}

function mockPlanScript(plan: Plan): string {
  const lines = [
    `Anjali ji, plan ready hai. Iss mahine ka kul investment ₹${plan.monthlyAllocationInr.toLocaleString("en-IN")}.`,
  ];
  for (const goal of plan.goalAllocations) {
    if (goal.monthlyTotalInr === 0) continue;
    const instrumentNames = goal.splits
      .map((s) => {
        const product = findProduct(s.instrument);
        return `${product?.partnerName ?? s.instrument} mein ₹${s.monthlyAmountInr.toLocaleString("en-IN")}`;
      })
      .join(", ");
    lines.push(`${goal.goalName} ke liye ₹${goal.monthlyTotalInr.toLocaleString("en-IN")} — ${instrumentNames}.`);
  }
  lines.push(
    "Sab government-backed ya regulator-monitored hai. Equity zero — woh tab jab aap comfortable ho.",
  );
  lines.push("UPI Autopay authorize kar dijiye, aur har mahine apne aap execute hoga.");
  return lines.join(" ");
}
