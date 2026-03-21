import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TAX_BRACKETS = [
  { label: '10%', value: 10 },
  { label: '12%', value: 12 },
  { label: '22%', value: 22 },
  { label: '24%', value: 24 },
  { label: '32%', value: 32 },
  { label: '35%', value: 35 },
  { label: '37%', value: 37 },
];

const TaxableIncomeCalculator = () => {
  const [noi, setNoi] = useState('');
  const [mortgageInterest, setMortgageInterest] = useState('');
  const [propertyValue, setPropertyValue] = useState('');
  const [landValue, setLandValue] = useState('');
  const [amortization, setAmortization] = useState('');
  const [taxBracket, setTaxBracket] = useState('');
  const [yearsOwned, setYearsOwned] = useState('');
  const [result, setResult] = useState(null);

  const applyLandEstimate = () => {
    const propVal = parseFloat(propertyValue);
    if (!isNaN(propVal)) setLandValue((propVal * 0.2).toFixed(0));
  };

  const calculate = () => {
    const NOI = parseFloat(noi) || 0;
    const interest = parseFloat(mortgageInterest) || 0;
    const propVal = parseFloat(propertyValue) || 0;
    const land = parseFloat(landValue) || 0;
    const amort = parseFloat(amortization) || 0;
    const bracket = parseFloat(taxBracket) || 0;
    const owned = parseFloat(yearsOwned) || 0;

    if (!noi) return;

    const depreciableBasis = Math.max(propVal - land, 0);
    const depreciation = depreciableBasis / 27.5;
    const totalDeductions = interest + depreciation + amort;
    const taxableIncome = NOI - totalDeductions;
    const taxWithDeductions = Math.max(taxableIncome, 0) * (bracket / 100);
    const taxWithoutDeductions = Math.max(NOI, 0) * (bracket / 100);
    const taxSavings = taxWithoutDeductions - taxWithDeductions;

    // Depreciation schedule
    const clampedYears = Math.min(owned, 27.5);
    const depreciationClaimed = depreciation * clampedYears;
    const depreciationRemaining = depreciableBasis - depreciationClaimed;
    const progressPct = (clampedYears / 27.5) * 100;
    const recaptureEstimate = depreciationClaimed * 0.25;

    setResult({
      NOI, interest, depreciation, amort, totalDeductions,
      taxableIncome, taxWithDeductions, taxWithoutDeductions, taxSavings, bracket,
      depreciableBasis, depreciationClaimed, depreciationRemaining,
      progressPct, recaptureEstimate, owned: clampedYears,
    });
  };

  const fmt = (n) => {
    const abs = Math.abs(n);
    const str = `$${abs.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    return n < 0 ? `-${str}` : str;
  };

  const fmtFull = (n) =>
    n < 0
      ? `-$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const deductionChart = result ? {
    labels: ['Income Breakdown'],
    datasets: [
      {
        label: 'Taxable Income',
        data: [Math.max(result.taxableIncome, 0)],
        backgroundColor: '#1d4ed8',
        borderRadius: 4,
      },
      {
        label: 'Mortgage Interest',
        data: [result.interest],
        backgroundColor: '#93c5fd',
        borderRadius: 0,
      },
      {
        label: 'Depreciation',
        data: [result.depreciation],
        backgroundColor: '#60a5fa',
        borderRadius: 0,
      },
      {
        label: 'Amortization',
        data: [result.amort],
        backgroundColor: '#bfdbfe',
        borderRadius: 0,
      },
    ],
  } : null;

  const taxChart = result && result.bracket > 0 ? {
    labels: ['Without Deductions', 'With Deductions'],
    datasets: [
      {
        label: 'Tax Owed',
        data: [result.taxWithoutDeductions, result.taxWithDeductions],
        backgroundColor: ['#ef4444', '#22c55e'],
        borderRadius: 6,
        barThickness: 60,
      },
    ],
  } : null;

  const deductionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 11 }, color: '#4b5563', boxWidth: 14 },
      },
      tooltip: {
        callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.x)}` },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: { color: '#6b7280', font: { size: 11 }, callback: (v) => `$${(v / 1000).toFixed(0)}k` },
        grid: { color: '#f1f5f9' },
      },
      y: { stacked: true, ticks: { display: false }, grid: { display: false } },
    },
  };

  const taxChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx) => ` Tax owed: ${fmtFull(ctx.parsed.y)}` },
      },
    },
    scales: {
      x: { ticks: { color: '#6b7280', font: { size: 12 } }, grid: { display: false } },
      y: {
        ticks: { color: '#6b7280', font: { size: 11 }, callback: (v) => `$${(v / 1000).toFixed(0)}k` },
        grid: { color: '#f1f5f9' },
      },
    },
  };

  return (
    <div className="calc-card">
      <div className="calc-header">
        <h2>Taxable Income</h2>
        <p>
          Calculate your taxable income after real estate deductions. Depreciation and
          amortization are non-cash deductions — they reduce your tax bill without costing
          you money out of pocket.
        </p>
      </div>
      <div className="calc-formula">
        Taxable Income = NOI − Mortgage Interest − Depreciation − Amortization
      </div>

      <div className="calc-body">
        <div className="calc-inputs">

          <div className="calc-field">
            <label>Net Operating Income (NOI)</label>
            <input type="number" placeholder="e.g. 24000" value={noi}
              onChange={(e) => setNoi(e.target.value)} />
            <span className="field-hint">Annual rental income minus operating expenses</span>
          </div>

          <div className="calc-field">
            <label>Annual Mortgage Interest</label>
            <input type="number" placeholder="e.g. 9500" value={mortgageInterest}
              onChange={(e) => setMortgageInterest(e.target.value)} />
            <span className="field-hint">Interest portion of your mortgage payments only (not principal)</span>
          </div>

          <div className="ti-depreciation-group">
            <div className="calc-field">
              <label>Property Value ($)</label>
              <input type="number" placeholder="e.g. 300000" value={propertyValue}
                onChange={(e) => setPropertyValue(e.target.value)} />
            </div>
            <div className="calc-field">
              <label>Land Value ($)</label>
              <input type="number" placeholder="e.g. 50000" value={landValue}
                onChange={(e) => setLandValue(e.target.value)} />
              <span className="field-hint">
                Land cannot be depreciated — auto-calculates at 27.5 years.{' '}
                <button type="button" className="ti-estimate-btn" onClick={applyLandEstimate}>
                  Use 20% estimate
                </button>
              </span>
            </div>
          </div>

          <div className="calc-field">
            <label>Years Owned (optional)</label>
            <input type="number" placeholder="e.g. 5" value={yearsOwned}
              onChange={(e) => setYearsOwned(e.target.value)} />
            <span className="field-hint">How long you've owned the property — unlocks depreciation schedule</span>
          </div>

          <div className="calc-field">
            <label>Annual Amortization</label>
            <input type="number" placeholder="e.g. 500" value={amortization}
              onChange={(e) => setAmortization(e.target.value)} />
            <span className="field-hint">Amortization of loan costs (points, origination fees) spread over loan term</span>
          </div>

          <div className="calc-field">
            <label>Your Tax Bracket (optional)</label>
            <select value={taxBracket} onChange={(e) => setTaxBracket(e.target.value)}
              style={{ padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, color: '#0f172a', outline: 'none' }}>
              <option value="">Select bracket</option>
              {TAX_BRACKETS.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
            <span className="field-hint">Used to estimate tax savings from deductions</span>
          </div>

          <button className="calc-btn" onClick={calculate}>Calculate</button>
        </div>

        <div className="calc-result-panel">
          <h3>Taxable Income</h3>
          {result !== null ? (
            <>
              <div className={`calc-result-value ${result.taxableIncome < 0 ? 'ti-negative' : ''}`}>
                {fmtFull(result.taxableIncome)}
              </div>
              {result.taxableIncome < 0 && (
                <p className="calc-result-note" style={{ color: '#16a34a' }}>
                  Negative taxable income — this loss may offset other income (consult a tax advisor).
                </p>
              )}
              <p className="calc-result-note">
                Auto-calculated depreciation: <strong>{fmtFull(result.depreciation)}/yr</strong>
              </p>
              <p className="calc-result-note">
                Total deductions: <strong>{fmtFull(result.totalDeductions)}</strong>
              </p>
              {result.bracket > 0 && (
                <>
                  <p className="calc-result-note">
                    Est. tax owed: <strong>{fmtFull(result.taxWithDeductions)}</strong>
                  </p>
                  <p className="calc-result-note" style={{ color: '#16a34a' }}>
                    Est. tax saved via deductions: <strong>{fmtFull(result.taxSavings)}</strong>
                  </p>
                </>
              )}
            </>
          ) : (
            <div className="calc-result-value empty">Enter values</div>
          )}
        </div>
      </div>

      {result && (
        <div className="ti-charts">
          <div className="ti-chart-block">
            <p className="ti-chart-title">NOI Breakdown — Where Your Income Goes</p>
            <div style={{ height: 120 }}>
              <Bar data={deductionChart} options={deductionChartOptions} />
            </div>
          </div>
          {taxChart && (
            <div className="ti-chart-block">
              <p className="ti-chart-title">Tax Owed — With vs. Without Deductions</p>
              <div style={{ height: 200 }}>
                <Bar data={taxChart} options={taxChartOptions} />
              </div>
            </div>
          )}
        </div>
      )}

      {result && result.owned > 0 && result.depreciableBasis > 0 && (
        <div className="ti-depr-schedule">
          <p className="ti-chart-title">Depreciation Schedule</p>
          <div className="ti-depr-progress">
            <div className="ti-depr-progress-labels">
              <span>Year {result.owned.toFixed(1)} of 27.5</span>
              <span>{result.progressPct.toFixed(1)}% used</span>
            </div>
            <div className="ti-depr-bar-track">
              <div className="ti-depr-bar-fill" style={{ width: `${result.progressPct}%` }} />
            </div>
          </div>
          <div className="ti-depr-stats">
            <div className="ti-depr-stat">
              <span className="ti-depr-stat-label">Depreciation Claimed</span>
              <span className="ti-depr-stat-value ti-claimed">{fmtFull(result.depreciationClaimed)}</span>
            </div>
            <div className="ti-depr-stat">
              <span className="ti-depr-stat-label">Depreciation Remaining</span>
              <span className="ti-depr-stat-value ti-remaining">{fmtFull(result.depreciationRemaining)}</span>
            </div>
            <div className="ti-depr-stat">
              <span className="ti-depr-stat-label">Est. Recapture Tax if Sold Now</span>
              <span className="ti-depr-stat-value ti-recapture">{fmtFull(result.recaptureEstimate)}</span>
              <span className="ti-depr-stat-hint">25% of depreciation claimed — consult a tax advisor</span>
            </div>
          </div>
        </div>
      )}

      <div className="calc-card-footer">
        Source: <em>Real Estate by the Numbers</em> — J Scott &amp; Dave Meyer, Ch. 12 p. 92
      </div>
    </div>
  );
};

export default TaxableIncomeCalculator;
