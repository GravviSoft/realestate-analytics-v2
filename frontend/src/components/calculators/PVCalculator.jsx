import React, { useState } from 'react';

const PVCalculator = () => {
  const [fv, setFv] = useState('');
  const [rate, setRate] = useState('');
  const [periods, setPeriods] = useState('');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const FV = parseFloat(fv);
    const i = parseFloat(rate) / 100;
    const n = parseFloat(periods);
    if (isNaN(FV) || isNaN(i) || isNaN(n)) return;
    const pv = FV / Math.pow(1 + i, n);
    setResult({ pv, discount: FV - pv });
  };

  const fmt = (n) =>
    `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="calc-card">
      <div className="calc-header">
        <h2>Present Value (PV)</h2>
        <p>
          Find out what a future cash flow is worth in today's dollars. Essential for
          evaluating whether a future payoff justifies today's investment.
        </p>
      </div>
      <div className="calc-formula">
        PV = FV ÷ (1 + i)ⁿ
      </div>

      <div className="calc-body">
        <div className="calc-inputs">
          <div className="calc-field">
            <label>Future Value (FV)</label>
            <input type="number" placeholder="e.g. 200000" value={fv} onChange={(e) => setFv(e.target.value)} />
            <span className="field-hint">The amount you expect to receive in the future</span>
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
          <button className="calc-btn" onClick={calculate}>Calculate PV</button>
        </div>

        <div className="calc-result-panel">
          <h3>Present Value</h3>
          {result !== null ? (
            <>
              <div className="calc-result-value">{fmt(result.pv)}</div>
              <p className="calc-result-note">
                Discount applied: <strong>{fmt(result.discount)}</strong>
              </p>
              <p className="calc-result-note">
                {fmt(result.pv)} today is the same as {fmt(parseFloat(fv))} in {periods} period{periods !== '1' ? 's' : ''}, assuming our investment strategy generates {parseFloat(rate)}% per period returns.
              </p>
            </>
          ) : (
            <div className="calc-result-value empty">Enter values</div>
          )}
        </div>
      </div>
      <div className="calc-card-footer">
        Source: <em>Real Estate by the Numbers</em> — J Scott &amp; Dave Meyer, Ch. 8, p. 73
      </div>
    </div>
  );
};

export default PVCalculator;
