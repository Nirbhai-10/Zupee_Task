import type { DemoFamilyMember } from "@/domain/types";
import type { Plan } from "@/domain/investment/allocator";
import { findProduct } from "@/lib/mocks/investment-products";
import type { LanguageCode } from "@/lib/i18n/languages";

/**
 * Bharosa's family notification copywriter (deterministic).
 *
 * Uses templates per relationship/visibility combination. The matching
 * LLM-driven rewriter (`family-notify.v1.ts`) is a Day 6 polish layer
 * that re-renders these for register variance. The deterministic path
 * runs on every salary day so the demo is reliable.
 */

export type FamilyNotification = {
  familyMemberId: string;
  channel: "voice" | "text";
  language: string;
  content: string;
};

export type SalaryDayContext = {
  plan: Plan;
  monthName: string;
  yearNumber: number;
  primaryLanguage?: LanguageCode;
  /** Optional running totals — used by the husband's update. */
  yearProgress?: {
    weddingPctComplete?: number;
    coachingPctComplete?: number;
    totalSavedYtdInr?: number;
  };
};

export function notifyFamilyForSalaryDay(
  family: DemoFamilyMember[],
  context: SalaryDayContext,
): FamilyNotification[] {
  const notifications: FamilyNotification[] = [];
  const inr = (v: number) => `₹${v.toLocaleString("en-IN")}`;

  for (const member of family) {
    if (member.visibility.sees.includes("self_savings_only")) {
      // Children — skip salary day notifications.
      continue;
    }

    if (member.relationship === "mother-in-law") {
      notifications.push({
        familyMemberId: member.id,
        channel: "voice",
        language: member.language,
        content: `Maaji, namaste. Iss mahine ka plan execute ho gaya hai. Bahurani ne ${inr(
          context.plan.monthlyAllocationInr,
        )} invest kar diye hain. Sab safe jagah pe — Sukanya Samriddhi, FD, gold. Aapke medical buffer mein bhi paisa daala gaya hai. Aap chinta na karein, sab theek hai.`,
      });
    } else if (member.relationship === "husband") {
      const top = context.plan.goalAllocations
        .filter((g) => g.monthlyTotalInr > 0)
        .slice(0, 3)
        .map((g) => `${g.goalName}: ${inr(g.monthlyTotalInr)}`)
        .join(", ");
      const progressLine = context.yearProgress?.weddingPctComplete
        ? ` Beti ki shaadi fund ${context.yearProgress.weddingPctComplete}% complete ho gaya.`
        : "";
      notifications.push({
        familyMemberId: member.id,
        channel: "voice",
        language: member.language,
        content: `Rajesh ji, ${context.monthName} ${context.yearNumber} ka mahine ka update. ${inr(
          context.plan.monthlyAllocationInr,
        )} invest hua hai — ${top}.${progressLine} Sab government-backed instruments mein, equity zero. Bharosa.`,
      });
    } else if (member.relationship === "brother" && member.visibility.sees.includes("college_fee_transfers_only")) {
      notifications.push({
        familyMemberId: member.id,
        channel: "text",
        language: member.language,
        content: `Vikas, bhabhi se ${inr(3000)} college fees aa gaye. Bharosa.`,
      });
    } else if (member.visibility.sees.includes("aggregate_goal_progress")) {
      notifications.push({
        familyMemberId: member.id,
        channel: "text",
        language: member.language,
        content: `${context.monthName}: ${inr(context.plan.monthlyAllocationInr)} invest. ${context.plan.goalAllocations.filter((g) => g.monthlyTotalInr > 0).length} goals on track.`,
      });
    }
  }

  return notifications;
}

export function buildHisaabScript(context: SalaryDayContext): string {
  const inr = (v: number) => `₹${v.toLocaleString("en-IN")}`;
  if (context.primaryLanguage === "en-IN") {
    const parts = [
      `Anjali, here is the ${context.monthName} ${context.yearNumber} account update.`,
      `This month ${inr(context.plan.monthlyAllocationInr)} has been invested —`,
    ];
    for (const goal of context.plan.goalAllocations.filter((g) => g.monthlyTotalInr > 0)) {
      const top = goal.splits[0];
      const product = findProduct(top.instrument);
      parts.push(
        `${inr(goal.monthlyTotalInr)} into ${goal.goalName} through ${product?.partnerName ?? top.instrument},`,
      );
    }
    parts.push("and the rest follows the plan.");
    if (context.yearProgress?.weddingPctComplete) {
      parts.push(`Priya's wedding fund is now ${context.yearProgress.weddingPctComplete}% complete.`);
    }
    parts.push("The family update has been sent. Everything is on track.");
    return parts.join(" ");
  }

  const parts = [
    `Anjali ji, ${context.monthName} ${context.yearNumber} ka Hisaab.`,
    `Iss mahine ${inr(context.plan.monthlyAllocationInr)} invest hua —`,
  ];
  for (const goal of context.plan.goalAllocations.filter((g) => g.monthlyTotalInr > 0)) {
    const top = goal.splits[0];
    const product = findProduct(top.instrument);
    parts.push(
      `${goal.goalName} mein ${inr(goal.monthlyTotalInr)} (${product?.partnerName ?? top.instrument}),`,
    );
  }
  parts.push("aur baaki sab plan ke according.");
  if (context.yearProgress?.weddingPctComplete) {
    parts.push(`Beti ki shaadi fund ${context.yearProgress.weddingPctComplete}% complete.`);
  }
  parts.push("Family ko bhi inform kar diya hai. Thande dimaag se rahiye, sab theek hai.");
  return parts.join(" ");
}
