import { useState } from "react";
import {
  calculateGoal,
  formatCurrency,
  frequencyLabels,
  goalFundingStrategyLabels,
} from "../utils/calculations";
import type {
  Frequency,
  GoalFundingStrategy,
  GoalResult,
} from "../utils/calculations";
import InvestmentChart from "./InvestmentChart";

const frequencies: Frequency[] = [
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "bimonthly",
  "yearly",
];

const fundingStrategies: GoalFundingStrategy[] = [
  "lump_sum",
  "partial_lump_sum",
  "regular_contributions",
];

export default function GoalCalc() {
  const [targetValue, setTargetValue] = useState<string>("1000000");
  const [annualROI, setAnnualROI] = useState<string>("7");
  const [years, setYears] = useState<string>("30");
  const [fundingStrategy, setFundingStrategy] =
    useState<GoalFundingStrategy>("partial_lump_sum");
  const [partialLumpSum, setPartialLumpSum] = useState<string>("10000");
  const [compoundFrequency, setCompoundFrequency] =
    useState<Frequency>("monthly");
  const [contributionFrequency, setContributionFrequency] =
    useState<Frequency>("monthly");

  const [result, setResult] = useState<GoalResult | null>(null);

  function handleCalculate() {
    const target = parseFloat(targetValue) || 0;
    const roi = parseFloat(annualROI) || 0;
    const yrs = parseInt(years) || 0;
    const lumpSum = parseFloat(partialLumpSum) || 0;

    if (yrs <= 0 || yrs > 100 || target <= 0) return;

    const res = calculateGoal(
      target,
      roi,
      yrs,
      lumpSum,
      contributionFrequency,
      fundingStrategy,
      compoundFrequency
    );
    setResult(res);
  }

  const usesRegularContributions = fundingStrategy !== "lump_sum";
  const usesPartialLumpSum = fundingStrategy === "partial_lump_sum";

  return (
    <div className="calculator">
      <h2>Investment Goal Calculator</h2>
      <p className="description">
        Choose whether your goal is funded by one lump sum, regular
        contributions, or a mix of both.
      </p>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="gc-strategy">Goal Funding Strategy</label>
          <select
            id="gc-strategy"
            value={fundingStrategy}
            onChange={(e) =>
              setFundingStrategy(e.target.value as GoalFundingStrategy)
            }
          >
            {fundingStrategies.map((strategy) => (
              <option key={strategy} value={strategy}>
                {goalFundingStrategyLabels[strategy]}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="gc-target">Target Net Worth ($)</label>
          <input
            id="gc-target"
            type="number"
            min="0"
            step="1000"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="gc-roi">Expected Annual ROI (%)</label>
          <input
            id="gc-roi"
            type="number"
            step="0.1"
            value={annualROI}
            onChange={(e) => setAnnualROI(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="gc-compound">Compound Frequency</label>
          <select
            id="gc-compound"
            value={compoundFrequency}
            onChange={(e) =>
              setCompoundFrequency(e.target.value as Frequency)
            }
          >
            {frequencies.map((f) => (
              <option key={f} value={f}>
                {frequencyLabels[f]}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="gc-years">Time Horizon (Years)</label>
          <input
            id="gc-years"
            type="number"
            min="1"
            max="100"
            value={years}
            onChange={(e) => setYears(e.target.value)}
          />
        </div>

        {usesPartialLumpSum && (
          <div className="form-group">
            <label htmlFor="gc-lump">Starting Lump Sum ($)</label>
            <input
              id="gc-lump"
              type="number"
              min="0"
              step="100"
              value={partialLumpSum}
              onChange={(e) => setPartialLumpSum(e.target.value)}
            />
          </div>
        )}

        {usesRegularContributions && (
          <div className="form-group">
            <label htmlFor="gc-freq">Contribution Frequency</label>
            <select
              id="gc-freq"
              value={contributionFrequency}
              onChange={(e) =>
                setContributionFrequency(e.target.value as Frequency)
              }
            >
              {frequencies.map((f) => (
                <option key={f} value={f}>
                  {frequencyLabels[f]}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <button className="calculate-btn" onClick={handleCalculate}>
        Calculate
      </button>

      {result && (
        <div className="results">
          <h3>Results</h3>
          <div className="summary-cards">
            <div className="card full-width">
              <span className="card-label">Goal Funding Strategy</span>
              <span className="card-value">
                {goalFundingStrategyLabels[result.fundingStrategy]}
              </span>
            </div>
            <div className="card">
              <span className="card-label">Compound Frequency</span>
              <span className="card-value">
                {frequencyLabels[result.compoundFrequency]}
              </span>
            </div>
            <div className="card">
              <span className="card-label">
                {result.fundingStrategy === "lump_sum"
                  ? "Required Lump Sum at Beginning"
                  : "Lump Sum at Beginning"}
              </span>
              <span className="card-value primary">
                {formatCurrency(result.lumpSumAtStart)}
              </span>
            </div>
            <div className="card">
              <span className="card-label">
                {result.fundingStrategy === "lump_sum"
                  ? "Further Contributions"
                  : `Required ${
                      frequencyLabels[result.contributionFrequency]
                    } Contribution`}
              </span>
              <span className="card-value accent">
                {formatCurrency(result.requiredPeriodicContribution)}
              </span>
            </div>
            <div className="card">
              <span className="card-label">Total You Will Contribute</span>
              <span className="card-value">
                {formatCurrency(result.totalContributed)}
              </span>
            </div>
            <div className="card">
              <span className="card-label">Total Interest Earned</span>
              <span className="card-value">
                {formatCurrency(result.totalInterestEarned)}
              </span>
            </div>
            <div className="card">
              <span className="card-label">Projected Final Value</span>
              <span className="card-value primary">
                {formatCurrency(result.finalValue)}
              </span>
            </div>
          </div>

          <InvestmentChart data={result.yearlyBreakdown} />
        </div>
      )}
    </div>
  );
}
