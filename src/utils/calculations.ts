/**
 * Investment calculation utilities.
 *
 * All calculations use standard compound interest formulas.
 * Contributions/withdrawals and interest compounding can use independent
 * schedules.
 */

export type Frequency =
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "bimonthly"
  | "yearly";

/** Number of times each frequency occurs per year */
export function frequencyPerYear(freq: Frequency): number {
  switch (freq) {
    case "daily":
      return 365;
    case "weekly":
      return 52;
    case "biweekly":
      return 26;
    case "monthly":
      return 12;
    case "bimonthly":
      return 6;
    case "yearly":
      return 1;
  }
}

export const frequencyLabels: Record<Frequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Biweekly",
  monthly: "Monthly",
  bimonthly: "Bimonthly",
  yearly: "Annually",
};

function greatestCommonDivisor(a: number, b: number): number {
  let x = a;
  let y = b;

  while (y !== 0) {
    const next = x % y;
    x = y;
    y = next;
  }

  return x;
}

function leastCommonMultiple(a: number, b: number): number {
  return (a * b) / greatestCommonDivisor(a, b);
}

export interface YearlyRow {
  year: number;
  /** Amount the person invested this year (deposits - withdrawals) */
  contributedThisYear: number;
  /** Total amount the person has contributed cumulatively (including initial) */
  totalContributed: number;
  /** Interest earned this year */
  interestThisYear: number;
  /** Total interest earned cumulatively */
  totalInterest: number;
  /** Total portfolio value at end of year */
  totalValue: number;
}

export interface CompoundGrowthResult {
  initialInvestment: number;
  compoundFrequency: Frequency;
  totalDeposited: number;
  totalWithdrawn: number;
  totalContributed: number;
  totalInterestEarned: number;
  finalValue: number;
  yearlyBreakdown: YearlyRow[];
}

/**
 * Calculate compound growth over a number of years.
 *
 * Uses period-by-period simulation for accuracy:
 * Each period, interest is computed on the current balance, then
 * deposits/withdrawals are applied.
 */
export function calculateCompoundGrowth(
  initialInvestment: number,
  annualROI: number, // as a percentage, e.g. 7 for 7%
  years: number,
  depositAmount: number,
  depositFrequency: Frequency,
  withdrawalAmount: number,
  withdrawalFrequency: Frequency,
  compoundFrequency: Frequency = "monthly"
): CompoundGrowthResult {
  const depositPeriodsPerYear = frequencyPerYear(depositFrequency);
  const withdrawalPeriodsPerYear = frequencyPerYear(withdrawalFrequency);
  const compoundPeriodsPerYear = frequencyPerYear(compoundFrequency);

  // Simulate at the smallest shared granularity that can represent all chosen
  // deposit, withdrawal, and compounding schedules exactly.
  const periodsPerYear = [
    depositPeriodsPerYear,
    withdrawalPeriodsPerYear,
    compoundPeriodsPerYear,
  ].reduce(leastCommonMultiple);

  const ratePerCompoundPeriod = annualROI / 100 / compoundPeriodsPerYear;

  const depositEveryNPeriods = periodsPerYear / depositPeriodsPerYear;
  const withdrawalEveryNPeriods = periodsPerYear / withdrawalPeriodsPerYear;
  const compoundEveryNPeriods = periodsPerYear / compoundPeriodsPerYear;

  let balance = initialInvestment;
  let totalDeposited = 0;
  let totalWithdrawn = 0;
  let cumulativeInterest = 0;

  const yearlyBreakdown: YearlyRow[] = [];

  // Year 0 row
  yearlyBreakdown.push({
    year: 0,
    contributedThisYear: initialInvestment,
    totalContributed: initialInvestment,
    interestThisYear: 0,
    totalInterest: 0,
    totalValue: initialInvestment,
  });

  for (let year = 1; year <= years; year++) {
    let interestThisYear = 0;
    let depositedThisYear = 0;
    let withdrawnThisYear = 0;

    for (let period = 1; period <= periodsPerYear; period++) {
      const globalPeriod = (year - 1) * periodsPerYear + period;

      // Apply interest first on compounding dates.
      if (globalPeriod % compoundEveryNPeriods === 0) {
        const interest = balance * ratePerCompoundPeriod;
        balance += interest;
        interestThisYear += interest;
      }

      // Apply deposit
      if (depositAmount > 0 && globalPeriod % depositEveryNPeriods === 0) {
        balance += depositAmount;
        depositedThisYear += depositAmount;
      }

      // Apply withdrawal
      if (withdrawalAmount > 0 && globalPeriod % withdrawalEveryNPeriods === 0) {
        balance -= withdrawalAmount;
        withdrawnThisYear += withdrawalAmount;
      }
    }

    totalDeposited += depositedThisYear;
    totalWithdrawn += withdrawnThisYear;
    cumulativeInterest += interestThisYear;

    const netContributedThisYear = depositedThisYear - withdrawnThisYear;

    yearlyBreakdown.push({
      year,
      contributedThisYear: netContributedThisYear,
      totalContributed: initialInvestment + totalDeposited - totalWithdrawn,
      interestThisYear,
      totalInterest: cumulativeInterest,
      totalValue: balance,
    });
  }

  return {
    initialInvestment,
    compoundFrequency,
    totalDeposited,
    totalWithdrawn,
    totalContributed: initialInvestment + totalDeposited - totalWithdrawn,
    totalInterestEarned: cumulativeInterest,
    finalValue: balance,
    yearlyBreakdown,
  };
}

export interface GoalResult {
  fundingStrategy: GoalFundingStrategy;
  lumpSumAtStart: number;
  requiredPeriodicContribution: number;
  contributionFrequency: Frequency;
  compoundFrequency: Frequency;
  yearlyBreakdown: YearlyRow[];
  totalContributed: number;
  totalInterestEarned: number;
  finalValue: number;
}

export type GoalFundingStrategy =
  | "lump_sum"
  | "partial_lump_sum"
  | "regular_contributions";

export const goalFundingStrategyLabels: Record<GoalFundingStrategy, string> = {
  lump_sum: "Lump Sum Only",
  partial_lump_sum: "Partial Lump Sum + Contributions",
  regular_contributions: "Regular Contributions Only",
};

/**
 * Calculate the investment plan needed to reach a target net worth.
 *
 * The selected funding strategy determines whether the plan is funded by:
 * a beginning lump sum only, a partial beginning lump sum plus regular
 * contributions, or regular contributions only.
 */
export function calculateGoal(
  targetValue: number,
  annualROI: number, // percentage
  years: number,
  partialLumpSum: number,
  contributionFrequency: Frequency,
  fundingStrategy: GoalFundingStrategy,
  compoundFrequency: Frequency = "monthly"
): GoalResult {
  const safePartialLumpSum = Math.max(0, partialLumpSum);
  const lumpSumGrowthFactor = calculateCompoundGrowth(
    1,
    annualROI,
    years,
    0,
    contributionFrequency,
    0,
    "yearly",
    compoundFrequency
  ).finalValue;

  const requiredLumpSumOnly =
    lumpSumGrowthFactor > 0 ? targetValue / lumpSumGrowthFactor : targetValue;

  const lumpSumAtStart =
    fundingStrategy === "lump_sum"
      ? requiredLumpSumOnly
      : fundingStrategy === "partial_lump_sum"
      ? safePartialLumpSum
      : 0;

  const futureValueOfLumpSum = calculateCompoundGrowth(
    lumpSumAtStart,
    annualROI,
    years,
    0,
    contributionFrequency,
    0,
    "yearly",
    compoundFrequency
  ).finalValue;

  const contributionGrowthFactor = calculateCompoundGrowth(
    0,
    annualROI,
    years,
    1,
    contributionFrequency,
    0,
    "yearly",
    compoundFrequency
  ).finalValue;

  const remaining = targetValue - futureValueOfLumpSum;
  const requiredContribution =
    fundingStrategy === "lump_sum" || remaining <= 0 || contributionGrowthFactor <= 0
      ? 0
      : remaining / contributionGrowthFactor;

  // Now simulate the growth to produce yearly breakdown
  const growthResult = calculateCompoundGrowth(
    lumpSumAtStart,
    annualROI,
    years,
    Math.max(0, requiredContribution),
    contributionFrequency,
    0,
    "yearly",
    compoundFrequency
  );

  return {
    fundingStrategy,
    lumpSumAtStart,
    requiredPeriodicContribution: Math.max(0, requiredContribution),
    contributionFrequency,
    compoundFrequency,
    yearlyBreakdown: growthResult.yearlyBreakdown,
    totalContributed: growthResult.totalContributed,
    totalInterestEarned: growthResult.totalInterestEarned,
    finalValue: growthResult.finalValue,
  };
}

/** Format a number as currency */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
