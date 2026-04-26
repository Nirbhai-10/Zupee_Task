/**
 * Mock Account Aggregator response for Anjali. The shape mirrors what
 * Setu / Sahamati AA fetches will return so we can swap to live data
 * without touching call-sites.
 *
 * Day 1: structural placeholder. Day 4 will use this for the goal
 * confirmation step ("FD aur gold pe bharosa hai, sahi?") and Day 5 for
 * the salary detection trigger.
 */

export type MockBankAccount = {
  bankName: string;
  accountType: "savings" | "salary" | "current";
  accountMasked: string;
  balanceInr: number;
  monthlySalaryInr?: number;
};

export type MockFD = {
  bankName: string;
  principalInr: number;
  ratePctAnnual: number;
  maturityDate: string;
};

export type MockInsurance = {
  insurer: string;
  type: "term" | "health" | "ulip" | "endowment";
  sumAssuredInr: number;
  annualPremiumInr: number;
};

export type MockAATransaction = {
  date: string;
  description: string;
  amountInr: number;
  /** debit reduces, credit adds. */
  direction: "debit" | "credit";
  category: "salary" | "remittance" | "bill" | "transfer" | "groceries" | "fee" | "other";
};

export type MockAAResponse = {
  fetchedAt: string;
  accounts: MockBankAccount[];
  fds: MockFD[];
  goldGrams: number;
  insurance: MockInsurance[];
  recentTransactions: MockAATransaction[];
};

export const MOCK_AA_FOR_ANJALI: MockAAResponse = {
  fetchedAt: new Date("2026-04-25T03:30:00.000Z").toISOString(),
  accounts: [
    {
      bankName: "SBI",
      accountType: "savings",
      accountMasked: "XXXX1247",
      balanceInr: 32_180,
    },
    {
      bankName: "ICICI",
      accountType: "salary",
      accountMasked: "XXXX9023",
      balanceInr: 41_650,
      monthlySalaryInr: 38_000,
    },
  ],
  fds: [
    { bankName: "SBI", principalInr: 1_50_000, ratePctAnnual: 6.8, maturityDate: "2027-08-15" },
    { bankName: "HDFC", principalInr: 2_50_000, ratePctAnnual: 7.1, maturityDate: "2028-02-20" },
  ],
  goldGrams: 80,
  insurance: [
    { insurer: "LIC", type: "term", sumAssuredInr: 25_00_000, annualPremiumInr: 8_400 },
    { insurer: "Star Health (employer)", type: "health", sumAssuredInr: 5_00_000, annualPremiumInr: 0 },
  ],
  recentTransactions: [
    { date: "2026-04-01", description: "SALARY CR — UP GOVT", amountInr: 38_000, direction: "credit", category: "salary" },
    { date: "2026-04-01", description: "REMIT IN — RAJESH SHARMA", amountInr: 40_000, direction: "credit", category: "remittance" },
    { date: "2026-04-03", description: "VIKAS COLLEGE FEE", amountInr: 3_000, direction: "debit", category: "transfer" },
    { date: "2026-04-05", description: "MILK + GROCERIES", amountInr: 4_200, direction: "debit", category: "groceries" },
    { date: "2026-04-12", description: "ELECTRICITY UPPCL", amountInr: 1_840, direction: "debit", category: "bill" },
    { date: "2026-04-20", description: "RD CONTRIB SBI", amountInr: 2_500, direction: "debit", category: "transfer" },
  ],
};
