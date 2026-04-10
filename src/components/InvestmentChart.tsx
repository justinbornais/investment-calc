import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "../utils/calculations";
import type { YearlyRow } from "../utils/calculations";
import { useState } from "react";

interface Props {
  data: YearlyRow[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: number;
}) {
  if (!active || !payload) return null;
  return (
    <div className="chart-tooltip">
      <p className="tooltip-label">Year {label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export default function InvestmentChart({ data }: Props) {
  const [view, setView] = useState<"chart" | "table">("chart");

  return (
    <div className="results-visualization">
      <div className="view-toggle">
        <button
          className={view === "chart" ? "active" : ""}
          onClick={() => setView("chart")}
        >
          Chart
        </button>
        <button
          className={view === "table" ? "active" : ""}
          onClick={() => setView("table")}
        >
          Table
        </button>
      </div>

      {view === "chart" ? (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={420}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="year"
                label={{ value: "Year", position: "insideBottom", offset: -5 }}
                stroke="#9ca3af"
              />
              <YAxis
                tickFormatter={(v: number) =>
                  v >= 1_000_000
                    ? `$${(v / 1_000_000).toFixed(1)}M`
                    : v >= 1_000
                    ? `$${(v / 1_000).toFixed(0)}K`
                    : `$${v}`
                }
                stroke="#9ca3af"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="totalContributed"
                stackId="1"
                name="Total Contributed"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="totalInterest"
                stackId="1"
                name="Total Interest"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>Contributed This Year</th>
                <th>Total Contributed</th>
                <th>Interest This Year</th>
                <th>Total Interest</th>
                <th>Total Value</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.year}>
                  <td>{row.year}</td>
                  <td>{formatCurrency(row.contributedThisYear)}</td>
                  <td>{formatCurrency(row.totalContributed)}</td>
                  <td>{formatCurrency(row.interestThisYear)}</td>
                  <td>{formatCurrency(row.totalInterest)}</td>
                  <td className="highlight">{formatCurrency(row.totalValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
