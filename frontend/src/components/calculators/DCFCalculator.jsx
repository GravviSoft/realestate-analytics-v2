import React, { useState } from 'react';

const DCFCalculator = () => {
  const [mode, setMode] = useState('simple');

  // Simple mode
  const [cashFlow, setCashFlow] = useState('');
  const [discountRate, setDiscountRate] = useState('');
  const [periods, setPeriods] = useState('');

  // Advanced mode
  const [advRate, setAdvRate] = useState('');
  const [cashFlows, setCashFlows] = useState([
    { period: 1, amount: '' },
    { period: 2, amount: '' },
    { period: 3, amount: '' },
  ]);

  const [result, setResult] = useState(null);

  // Simple mode handlers
  const calculateSimple = () => {
    const cf = parseFloat(cashFlow);
    const i = parseFloat(discountRate) / 100;
    const n = parseFloat(periods);
    if (isNaN(cf) || isNaN(i) || isNaN(n)) return;
    let totalPV = 0;
    const rows = [];
    for (let p = 1; p <= n; p++) {
      const pv = cf / Math.pow(1 + i, p);
      totalPV += pv;
      rows.push({ period: p, amount: cf, pv });
    }
    setResult({ rows, totalPV });
  };

  // Advanced mode handlers
  const addRow = () =>
    setCashFlows([...cashFlows, { period: cashFlows.length + 1, amount: '' }]);

  const removeRow = (i) => {
    const updated = cashFlows.filter((_, idx) => idx !== i).map((row, idx) => ({ ...row, period: idx + 1 }));
    setCashFlows(updated);
  };

  const updateAmount = (i, value) => {
    const updated = [...cashFlows];
    updated[i].amount = value;
    setCashFlows(updated);
  };

  const calculateAdvanced = () => {
    const i = parseFloat(advRate) / 100;
    if (isNaN(i)) return;
    let totalPV = 0;
    const rows = cashFlows.map((row) => {
      const cf = parseFloat(row.amount);
      if (isNaN(cf)) return { ...row, pv: null };
      const pv = cf / Math.pow(1 + i, row.period);
      totalPV += pv;
      return { ...row, pv };
    });
    setResult({ rows, totalPV });
  };

  const fmt = (n) =>
    n < 0
      ? `-$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const switchMode = (m) => {
    setMode(m);
    setResult(null);
  };

  return (
    <div className="calc-card">
      <div className="calc-header">
        <h2>Discounted Cash Flow (DCF)</h2>
        <p>
          Discount a stream of future income back to today's dollars. Use <strong>Simple</strong> for
          equal cash flows each period, or <strong>Advanced</strong> for variable income streams.
        </p>
      </div>
      <div className="calc-formula">
        DCF = CF₁ ÷ (1+i)¹ + CF₂ ÷ (1+i)² + … + CFₙ ÷ (1+i)ⁿ
      </div>

      {/* Mode toggle */}
      <div className="dcf-toggle">
        <button
          className={`dcf-toggle-btn ${mode === 'simple' ? 'dcf-toggle-btn--active' : ''}`}
          onClick={() => switchMode('simple')}
        >
          Simple
        </button>
        <button
          className={`dcf-toggle-btn ${mode === 'advanced' ? 'dcf-toggle-btn--active' : ''}`}
          onClick={() => switchMode('advanced')}
        >
          Advanced
        </button>
      </div>

      <div className="calc-body">
        {mode === 'simple' ? (
          <div className="calc-inputs">
            <div className="calc-field">
              <label>Cash Flow per Period</label>
              <input
                type="number"
                placeholder="e.g. 200000"
                value={cashFlow}
                onChange={(e) => setCashFlow(e.target.value)}
              />
              <span className="field-hint">The same amount received each period (e.g. annual rental income)</span>
            </div>
            <div className="calc-field">
              <label>Discount Rate (i)</label>
              <input
                type="number"
                placeholder="e.g. 8"
                value={discountRate}
                onChange={(e) => setDiscountRate(e.target.value)}
              />
              <span className="field-hint">Your opportunity cost as a percentage — e.g. 8% annual</span>
            </div>
            <div className="calc-field">
              <label>Number of Periods (n)</label>
              <input
                type="number"
                placeholder="e.g. 25"
                value={periods}
                onChange={(e) => setPeriods(e.target.value)}
              />
              <span className="field-hint">How many periods you'll receive the cash flow</span>
            </div>
            <button className="calc-btn" onClick={calculateSimple}>Calculate DCF</button>
          </div>
        ) : (
          <div className="calc-inputs">
            <div className="calc-field">
              <label>Discount Rate (i)</label>
              <input
                type="number"
                placeholder="e.g. 8"
                value={advRate}
                onChange={(e) => setAdvRate(e.target.value)}
              />
              <span className="field-hint">Your opportunity cost as a percentage — e.g. 8% annual</span>
            </div>
            <div className="ev-col-labels" style={{ gridTemplateColumns: '60px 1fr auto' }}>
              <span>Period</span>
              <span>Cash Flow ($)</span>
              <span></span>
            </div>
            <div className="ev-rows">
              {cashFlows.map((row, i) => (
                <div className="ev-row" key={i} style={{ gridTemplateColumns: '60px 1fr auto' }}>
                  <span style={{ fontSize: 13, color: '#6b7280', paddingTop: 8 }}>{row.period}</span>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={row.amount}
                    onChange={(e) => updateAmount(i, e.target.value)}
                  />
                  {cashFlows.length > 2 && (
                    <button className="ev-row-remove" onClick={() => removeRow(i)}>
                      <i className="pi pi-times"></i>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button className="ev-add-btn" onClick={addRow}>+ Add Period</button>
            <button className="calc-btn" onClick={calculateAdvanced}>Calculate DCF</button>
          </div>
        )}

        <div className="calc-result-panel">
          <h3>Total Present Value</h3>
          {result !== null ? (
            <>
              <div className="calc-result-value">{fmt(result.totalPV)}</div>
              <p className="calc-result-note">
                {fmt(result.totalPV)} is the most you should pay today for this income stream,
                discounted at {parseFloat(mode === 'simple' ? discountRate : advRate)}%.
              </p>
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {result.rows.map((row) =>
                  row.pv !== null ? (
                    <p key={row.period} className="calc-result-note">
                      Period {row.period}: {fmt(parseFloat(row.amount))} → <strong>{fmt(row.pv)}</strong> PV
                    </p>
                  ) : null
                )}
              </div>
            </>
          ) : (
            <div className="calc-result-value empty">Enter values</div>
          )}
        </div>
      </div>
      <div className="calc-card-footer">
        Source: <em>Real Estate by the Numbers</em> — J Scott &amp; Dave Meyer, Ch. 9, p. 75
      </div>
    </div>
  );
};

export default DCFCalculator;
