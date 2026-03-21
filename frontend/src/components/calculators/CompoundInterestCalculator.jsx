import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const CompoundInterestCalculator = () => {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const P = parseFloat(principal);
    const i = parseFloat(rate) / 100;
    const n = parseFloat(years);
    if (isNaN(P) || isNaN(i) || isNaN(n) || n <= 0) return;

    const labels = [];
    const compoundData = [];
    const simpleData = [];

    for (let y = 0; y <= n; y++) {
      labels.push(`Year ${y}`);
      compoundData.push(P * Math.pow(1 + i, y));
      simpleData.push(P + P * i * y);
    }

    const compoundFinal = compoundData[compoundData.length - 1];
    const simpleFinal = simpleData[simpleData.length - 1];
    const compoundInterest = compoundFinal - P;
    const simpleInterest = simpleFinal - P;

    setResult({ labels, compoundData, simpleData, compoundFinal, simpleFinal, compoundInterest, simpleInterest, P });
  };

  const fmt = (n) =>
    `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const chartData = result ? {
    labels: result.labels,
    datasets: [
      {
        label: 'Compound Interest',
        data: result.compoundData,
        borderColor: '#1d4ed8',
        backgroundColor: 'rgba(29, 78, 216, 0.08)',
        borderWidth: 2.5,
        pointRadius: 0,
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Simple Interest',
        data: result.simpleData,
        borderColor: '#9ca3af',
        backgroundColor: 'rgba(156, 163, 175, 0.05)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0,
        fill: false,
        borderDash: [6, 4],
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 12 }, color: '#4b5563', boxWidth: 24 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#6b7280', font: { size: 11 }, maxTicksLimit: 8 },
        grid: { color: '#f1f5f9' },
      },
      y: {
        ticks: {
          color: '#6b7280',
          font: { size: 11 },
          callback: (v) => `$${(v / 1000).toFixed(0)}k`,
        },
        grid: { color: '#f1f5f9' },
      },
    },
  };

  return (
    <div className="calc-card">
      <div className="calc-header">
        <h2>Compound Interest</h2>
        <p>
          See how compounding accelerates growth over time compared to simple interest.
          The longer the horizon, the bigger the gap.
        </p>
      </div>
      <div className="calc-formula">
        Compound Interest = (Principal × (1 + i)ⁿ) − Principal
      </div>

      <div className="calc-body">
        <div className="calc-inputs">
          <div className="calc-field">
            <label>Principal ($)</label>
            <input
              type="number"
              placeholder="e.g. 10000"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
            />
            <span className="field-hint">Your initial investment amount</span>
          </div>
          <div className="calc-field">
            <label>Annual Interest Rate (i)</label>
            <input
              type="number"
              placeholder="e.g. 8"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
            <span className="field-hint">Enter as a percentage — e.g. 8 for 8%</span>
          </div>
          <div className="calc-field">
            <label>Number of Years (n)</label>
            <input
              type="number"
              placeholder="e.g. 30"
              value={years}
              onChange={(e) => setYears(e.target.value)}
            />
            <span className="field-hint">How long you hold the investment</span>
          </div>
          <button className="calc-btn" onClick={calculate}>Calculate</button>
        </div>

        <div className="calc-result-panel">
          <h3>Compound Interest Earned</h3>
          {result !== null ? (
            <>
              <div className="calc-result-value">{fmt(result.compoundInterest)}</div>
              <p className="calc-result-note">
                Final value: <strong>{fmt(result.compoundFinal)}</strong>
              </p>
              <p className="calc-result-note">
                Simple interest would earn <strong>{fmt(result.simpleInterest)}</strong> — compounding
                earns you <strong>{fmt(result.compoundInterest - result.simpleInterest)}</strong> more.
              </p>
            </>
          ) : (
            <div className="calc-result-value empty">Enter values</div>
          )}
        </div>
      </div>

      {result && (
        <div className="ci-chart-wrapper">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      <div className="calc-card-footer">
        Source: <em>Real Estate by the Numbers</em> — J Scott &amp; Dave Meyer, Ch. 6, p. 62
      </div>
    </div>
  );
};

export default CompoundInterestCalculator;
