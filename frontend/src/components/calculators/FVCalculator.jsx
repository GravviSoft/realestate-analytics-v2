import React, { useState } from 'react';

const FVCalculator = () => {
  const [pv, setPv] = useState('');
  const [rate, setRate] = useState('');
  const [periods, setPeriods] = useState('');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const PV = parseFloat(pv);
    const i = parseFloat(rate) / 100;
    const n = parseFloat(periods);
    if (isNaN(PV) || isNaN(i) || isNaN(n)) return;
    const fv = PV * Math.pow(1 + i, n);
    setResult({ fv, gain: fv - PV });
  };

  const fmt = (n) =>
    `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="calc-card">
      <div className="calc-header">
        <h2>Future Value (FV)</h2>
        <p>
          Project how much an investment will be worth in the future given a rate of return
          and number of periods.
        </p>
      </div>
      <div className="calc-formula">
        FV = PV × (1 + i)ⁿ
      </div>

      <div className="calc-body">
        <div className="calc-inputs">
          <div className="calc-field">
            <label>Present Value (PV)</label>
            <input type="number" placeholder="e.g. 1000" value={pv} onChange={(e) => setPv(e.target.value)} />
            <span className="field-hint">The amount you're investing today</span>
          </div>
          <div className="calc-field">
            <label>Rate per Period (i)</label>
            <input type="number" placeholder="e.g. 1 (for 1% monthly)" value={rate} onChange={(e) => setRate(e.target.value)} />
            <span className="field-hint">Enter as a percentage — e.g. 12% annual = 1% monthly</span>
          </div>
          <div className="calc-field">
            <label>Number of Periods (n)</label>
            <input type="number" placeholder="e.g. 12" value={periods} onChange={(e) => setPeriods(e.target.value)} />
            <span className="field-hint">Months, years, or any consistent period</span>
          </div>
          <button className="calc-btn" onClick={calculate}>Calculate FV</button>
        </div>

        <div className="calc-result-panel">
          <h3>Future Value</h3>
          {result !== null ? (
            <>
              <div className="calc-result-value">{fmt(result.fv)}</div>
              <p className="calc-result-note">
                Total gain: <strong>{fmt(result.gain)}</strong>
              </p>
              <p className="calc-result-note">
                Your {fmt(parseFloat(pv))} grows to {fmt(result.fv)} after {periods} period{periods !== '1' ? 's' : ''} at {parseFloat(rate)}% per period ({(parseFloat(rate) * parseFloat(periods)).toFixed(1)}% total).
              </p>
            </>
          ) : (
            <div className="calc-result-value empty">Enter values</div>
          )}
        </div>
      </div>
      <div className="calc-card-footer">
        Source: <em>Real Estate by the Numbers</em> — J Scott &amp; Dave Meyer, Ch. 8, p. 70
      </div>
    </div>
  );
};

export default FVCalculator;
