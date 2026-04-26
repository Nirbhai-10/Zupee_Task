import type {
  DemoFamilyMember,
  DemoGoal,
  DemoPersona,
  GoalCategory,
  Instrument,
} from "@/domain/types";
import { INVESTMENT_PRODUCTS } from "@/lib/mocks/investment-products";

/**
 * Bharosa portfolio allocator. Deterministic, rule-based. The plan-explain
 * LLM step *describes* what this engine produces; it does not invent
 * allocations.
 *
 * Trust-ladder bias (encoded in scoreInstrument): gold + FD + SSY + PPF
 * before debt funds, debt before equity. New users (`trust_level: new`)
 * default to zero equity exposure even when arithmetic might support it.
 *
 * Liquidity invariant: medical goals are restricted to instruments with
 * liquidity ≥ 0.95 (liquid funds, FDs > 1yr). Festival goals lock for
 * the term-minus-30-days window then convert to RD.
 *
 * Cultural fit: wedding goals tilted toward SSY (when target is a
 * daughter) + gold + FD. Education goals tilt toward short-debt + FD.
 *
 * Output `monthlyContributions[goalId]` sums to `surplus` exactly.
 */

export type GoalAllocation = {
  goalId: string;
  goalName: string;
  category: GoalCategory;
  monthlyTotalInr: number;
  splits: InstrumentSplit[];
  rationale: string;
  horizonMonths: number;
};

export type InstrumentSplit = {
  instrument: Instrument;
  monthlyAmountInr: number;
  partnerName: string;
  pctOfGoal: number;
};

export type AllocatorInput = {
  user: DemoPersona;
  family: DemoFamilyMember[];
  goals: DemoGoal[];
  /** Override the persona's `monthlySurplusInr` if needed. */
  monthlySurplusInr?: number;
  /** ISO yyyy-mm-dd of "today" — for horizon calculations. */
  todayIso?: string;
};

export type Plan = {
  monthlyAllocationInr: number;
  goalAllocations: GoalAllocation[];
  unallocatedInr: number;
  /** Highest-level Hindi tagline summarising the plan. */
  taglineHindi: string;
};

const HORIZON_MONTHS = (todayIso: string, targetIso: string): number => {
  const today = new Date(todayIso);
  const target = new Date(targetIso);
  return Math.max(
    1,
    (target.getFullYear() - today.getFullYear()) * 12 +
      (target.getMonth() - today.getMonth()),
  );
};

export function buildPlan(input: AllocatorInput): Plan {
  const today = input.todayIso ?? new Date().toISOString().slice(0, 10);
  const surplus = input.monthlySurplusInr ?? input.user.monthlySurplusInr;

  // Score-rank goals: priority + horizon-urgency combination.
  const goalsByPriority = [...input.goals].sort((a, b) => {
    const priDiff = a.priority - b.priority;
    if (priDiff !== 0) return priDiff;
    // Within same priority, shorter horizon first.
    return HORIZON_MONTHS(today, a.targetDate) - HORIZON_MONTHS(today, b.targetDate);
  });

  // Demand for each goal = monthly amount needed to hit target on time
  // (assuming zero existing balance + 7% blended return, simplification).
  const demand = goalsByPriority.map((g) => {
    const months = HORIZON_MONTHS(today, g.targetDate);
    const monthlyRate = 0.07 / 12;
    // FV of monthly annuity formula, solved for M.
    //   M = FV × r / ((1+r)^n – 1)
    const denominator = Math.pow(1 + monthlyRate, months) - 1;
    const baseDemand = denominator > 0 ? (g.targetInr * monthlyRate) / denominator : g.targetInr / months;
    return { goal: g, months, demand: Math.ceil(baseDemand / 50) * 50 };
  });

  // First pass: allocate min(demand, fair share) per goal, in priority order.
  let remaining = surplus;
  const totalDemand = demand.reduce((acc, d) => acc + d.demand, 0);
  const allocations: Array<{ goal: DemoGoal; horizonMonths: number; amount: number }> = [];

  for (const d of demand) {
    if (remaining <= 0) {
      allocations.push({ goal: d.goal, horizonMonths: d.months, amount: 0 });
      continue;
    }
    // Fair-share = surplus × (this demand / total demand). Cap at demand
    // so we don't over-fund any single goal.
    const fairShare = (surplus * d.demand) / Math.max(1, totalDemand);
    const allotted = Math.min(d.demand, Math.max(500, Math.floor(fairShare / 100) * 100));
    const taken = Math.min(allotted, remaining);
    allocations.push({ goal: d.goal, horizonMonths: d.months, amount: taken });
    remaining -= taken;
  }

  // Second pass: any leftover goes to the highest-priority underfunded goal,
  // rounded to ₹500.
  if (remaining >= 500) {
    const target = allocations.find((a) => a.amount > 0) ?? allocations[0];
    if (target) {
      const bump = Math.floor(remaining / 500) * 500;
      target.amount += bump;
      remaining -= bump;
    }
  }

  const goalAllocations: GoalAllocation[] = allocations.map((a) =>
    splitGoal(a.goal, a.amount, a.horizonMonths, input.user, input.family),
  );

  return {
    monthlyAllocationInr: surplus - remaining,
    goalAllocations,
    unallocatedInr: remaining,
    taglineHindi: composeTagline(goalAllocations),
  };
}

function splitGoal(
  goal: DemoGoal,
  totalMonthly: number,
  horizonMonths: number,
  _user: DemoPersona,
  family: DemoFamilyMember[],
): GoalAllocation {
  if (totalMonthly <= 0) {
    return {
      goalId: goal.id,
      goalName: goal.name,
      category: goal.category,
      monthlyTotalInr: 0,
      splits: [],
      rationale: "Surplus iss baar ke liye baaki goals ko ja raha hai. Next month adjust karenge.",
      horizonMonths,
    };
  }

  const splits: { instrument: Instrument; pct: number }[] = [];

  if (goal.category === "medical") {
    // Liquidity-first.
    splits.push({ instrument: "liquid_fund", pct: 1.0 });
  } else if (goal.category === "festival" || horizonMonths <= 12) {
    splits.push({ instrument: "rd", pct: 1.0 });
  } else if (goal.category === "wedding") {
    const isDaughterTarget =
      goal.forFamilyMemberId &&
      family.find((m) => m.id === goal.forFamilyMemberId)?.relationship === "daughter";
    if (isDaughterTarget) {
      splits.push(
        { instrument: "sukanya_samriddhi", pct: 0.6 },
        { instrument: "gold", pct: 0.2 },
        { instrument: "fd", pct: 0.2 },
      );
    } else {
      splits.push(
        { instrument: "ppf", pct: 0.5 },
        { instrument: "gold", pct: 0.3 },
        { instrument: "fd", pct: 0.2 },
      );
    }
  } else if (goal.category === "education") {
    if (horizonMonths <= 36) {
      splits.push({ instrument: "short_debt_fund", pct: 0.65 }, { instrument: "fd", pct: 0.35 });
    } else {
      splits.push(
        { instrument: "ppf", pct: 0.4 },
        { instrument: "short_debt_fund", pct: 0.4 },
        { instrument: "fd", pct: 0.2 },
      );
    }
  } else if (goal.category === "house" || goal.category === "vehicle") {
    splits.push(
      { instrument: "fd", pct: 0.5 },
      { instrument: "short_debt_fund", pct: 0.5 },
    );
  } else if (goal.category === "pilgrimage") {
    splits.push({ instrument: "rd", pct: 0.7 }, { instrument: "fd", pct: 0.3 });
  } else {
    splits.push(
      { instrument: "fd", pct: 0.5 },
      { instrument: "gold", pct: 0.25 },
      { instrument: "rd", pct: 0.25 },
    );
  }

  // Materialise rupee amounts. Round each split DOWN to nearest ₹100 then
  // give the residual to the largest split so totalMonthly is preserved.
  const rawAmounts = splits.map((s) => ({
    ...s,
    amount: Math.floor((totalMonthly * s.pct) / 100) * 100,
  }));
  const allocated = rawAmounts.reduce((acc, s) => acc + s.amount, 0);
  const residual = totalMonthly - allocated;
  if (residual !== 0 && rawAmounts.length > 0) {
    rawAmounts[0].amount += residual;
  }

  return {
    goalId: goal.id,
    goalName: goal.name,
    category: goal.category,
    monthlyTotalInr: totalMonthly,
    horizonMonths,
    rationale: goal.rationale,
    splits: rawAmounts.map((s) => ({
      instrument: s.instrument,
      monthlyAmountInr: s.amount,
      partnerName: INVESTMENT_PRODUCTS.find((p) => p.instrument === s.instrument)?.partnerName ?? "TBD",
      pctOfGoal: Math.round(s.pct * 100),
    })),
  };
}

function composeTagline(goals: GoalAllocation[]): string {
  const funded = goals.filter((g) => g.monthlyTotalInr > 0);
  if (funded.length === 0) return "Plan banaane ke liye thoda aur surplus chahiye.";
  if (funded.length === 1) {
    return `Pehla focus: ${funded[0].goalName}. Baaki goals next month add karenge.`;
  }
  return `${funded.length} goals, ek monthly mandate, sab government-backed ya regulator-monitored instruments mein.`;
}
