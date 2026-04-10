import { useState } from "react";
import {
  calculateCompoundGrowth,
  formatCurrency,
  frequencyLabels,
} from "../utils/calculations";
import type { Frequency, CompoundGrowthResult } from "../utils/calculations";
import InvestmentChart from "./InvestmentChart";

const frequencies: Frequency[] = [
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "bimonthly",
  "yearly",
];

export default function CompoundGrowthCalc() {
  const [initialInvestment, setInitialInvestment] = useState<string>("10000");
  const [annualROI, setAnnualROI] = useState<string>("7");
  const [years, setYears] = useState<string>("30");
  const [compoundFrequency, setCompoundFrequency] =
    useState<Frequency>("monthly");
  const [depositAmount, setDepositAmount] = useState<string>("500");
  const [depositFrequency, setDepositFrequency] = useState<Frequency>("monthly");
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>("0");
  const [withdrawalFrequency, setWithdrawalFrequency] = useState<Frequency>("monthly");

  const [result, setResult] = useState<CompoundGrowthResult | null>(null);

  function handleCalculate() {
    const init = parseFloat(initialInvestment) || 0;
    const roi = parseFloat(annualROI) || 0;
    const yrs = parseInt(years) || 0;
    const dep = parseFloat(depositAmount) || 0;
    const wth = parseFloat(withdrawalAmount) || 0;

    if (yrs <= 0 || yrs > 100) return;

    const res = calculateCompoundGrowth(
      init,
      roi,
      yrs,
      dep,
      depositFrequency,
      wth,
      withdrawalFrequency,
      compoundFrequency
    );
    setResult(res);
  }

  return (
    <div className="calculator">
      <h2>Compound Growth Calculator</h2>
      <p className="description">
        Calculate how your investment will grow over time with compound interest,
        regular deposits, and/or withdrawals.
      </p>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="cg-initial">Initial Investment ($)</label>
          <input
            id="cg-initial"
            type="number"
            min="0"
            step="100"
            value={initialInvestment}
            onChange={(e) => setInitialInvestment(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="cg-roi">Expected Annual ROI (%)</label>
          <input
            id="cg-roi"
            type="number"
            step="0.1"
            value={annualROI}
            onChange={(e) => setAnnualROI(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="cg-compound">Compound Frequency</label>
          <select
            id="cg-compound"
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
          <label htmlFor="cg-years">Investment Period (Years)</label>
          <input
            id="cg-years"
            type="number"
            min="1"
            max="100"
            value={years}
            onChange={(e) => setYears(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="cg-deposit">Deposit Amount ($)</label>
          <div className="input-with-select">
            <input
              id="cg-deposit"
              type="number"
              min="0"
              step="50"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
            <select
              value={depositFrequency}
              onChange={(e) => setDepositFrequency(e.target.value as Frequency)}
              aria-label="Deposit frequency"
            >
              {frequencies.map((f) => (
                <option key={f} value={f}>
                  {frequencyLabels[f]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="cg-withdrawal">Withdrawal Amount ($)</label>
          <div className="input-with-select">
            <input
              id="cg-withdrawal"
              type="number"
              min="0"
              step="50"
              value={withdrawalAmount}
              onChange={(e) => setWithdrawalAmount(e.target.value)}
            />
            <select
              value={withdrawalFrequency}
              onChange={(e) =>
                setWithdrawalFrequency(e.target.value as Frequency)
              }
              aria-label="Withdrawal frequency"
            >
              {frequencies.map((f) => (
                <option key={f} value={f}>
                  {frequencyLabels[f]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button className="calculate-btn" onClick={handleCalculate}>
        Calculate
      </button>

      {result && (
        <div className="results">
          <h3>Results</h3>
          <div className="summary-cards">
            <div className="card">
              <span className="card-label">Final Portfolio Value</span>
              <span className="card-value primary">
                {formatCurrency(result.finalValue)}
              </span>
            </div>
            <div className="card">
              <span className="card-label">Compound Frequency</span>
              <span className="card-value">
                {frequencyLabels[result.compoundFrequency]}
              </span>
            </div>
            <div className="card">
              <span className="card-label">Initial Investment</span>
              <span className="card-value">
                {formatCurrency(result.initialInvestment)}
              </span>
            </div>
            <div className="card">
              <span className="card-label">Total Deposited</span>
              <span className="card-value">
                {formatCurrency(result.totalDeposited)}
              </span>
            </div>
            <div className="card">
              <span className="card-label">Total Withdrawn</span>
              <span className="card-value">
                {formatCurrency(result.totalWithdrawn)}
              </span>
            </div>
            <div className="card">
              <span className="card-label">Total Contributed</span>
              <span className="card-value">
                {formatCurrency(result.totalContributed)}
              </span>
            </div>
            <div className="card">
              <span className="card-label">Total Interest Earned</span>
              <span className="card-value accent">
                {formatCurrency(result.totalInterestEarned)}
              </span>
            </div>
          </div>

          <InvestmentChart data={result.yearlyBreakdown} />
        </div>
      )}
    </div>
  );
}
