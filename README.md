# Investment Calculator

A small React + TypeScript app for projecting investment growth and planning toward a target net worth.

## How It Works

The app has two calculators:

- **Compound Growth** projects a portfolio from an initial investment, regular deposits, withdrawals, expected annual ROI, and a selected compound frequency.
- **Investment Goal** works backward from a target net worth and time horizon. It supports a pure starting lump sum, a partial lump sum plus regular contributions, or regular contributions only.

Deposits, withdrawals, contributions, and compounding can use different frequencies: daily, weekly, biweekly, monthly, bimonthly, or annually. Compound frequency defaults to monthly.

Calculations are simulated period by period so the selected schedules affect the yearly breakdown, chart, total contributions, total interest, and final projected value.

## Build

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Check and build:

```bash
npm run lint
npm run build
```

Preview the production build:

```bash
npm run preview
```
