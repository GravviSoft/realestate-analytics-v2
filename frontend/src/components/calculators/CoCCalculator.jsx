import React, { useState } from 'react';

const CoCCalculator = () => {
  const [annualCashFlow, setAnnualCashFlow] = useState('');
  const [totalCashInvested, setTotalCashInvested] = useState('');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const cf = parseFloat(annualCashFlow);
    const inv = parseFloat(totalCashInvested);
    if (isNaN(cf) || isNaN(inv) || inv === 0) return;
    const coc = (cf / inv) * 100;
    setResult({ coc });
  };

  const grade = (r) => {
    if (r >= 10) return { label: 'Excellent', color: '#10b981' };
    if (r >= 6)  return { label: 'Good', color: '#3b82f6' };
    if (r >= 3)  return { label: 'Fair', color: '#f59e0b' };
    return { label: 'Poor', color: '#ef4444' };
  };

  return (
    <div className="calc-card">
      <div className="calc-header">
        <h2>Cash-on-Cash Return</h2>
        <p>
          Measures the annual pre-tax cash flow relative to the total cash invested.
          One of the most practical metrics for rental property investors.
        </p>
      </div>
      <div className="calc-formula">
        CoC Return = Annual Cash Flow ÷ Total Cash Invested × 100
      </div>

      <div className="calc-body">
        <div className="calc-inputs">
          <div className="calc-field">
            <label>Annual Pre-Tax Cash Flow</label>
            <input
              type="number"
              placeholder="e.g. 8400"
              value={annualCashFlow}
              onChange={(e) => setAnnualCashFlow(e.target.value)}
            />
            <span className="field-hint">Rental income minus all expenses including mortgage</span>
          </div>
          <div className="calc-field">
            <label>Total Cash Invested</label>
            <input
              type="number"
              placeholder="e.g. 80000"
              value={totalCashInvested}
              onChange={(e) => setTotalCashInvested(e.target.value)}
            />
            <span className="field-hint">Down payment + closing costs + repairs</span>
          </div>
          <button className="calc-btn" onClick={calculate}>Calculate CoC Return</button>
        </div>

        <div className="calc-result-panel">
          <h3>Cash-on-Cash Return</h3>
          {result !== null ? (
            <>
              <div className="calc-result-value">{result.coc.toFixed(2)}%</div>
              <p className="calc-result-note" style={{ color: grade(result.coc).color, fontWeight: 600 }}>
                {grade(result.coc).label}
              </p>
              <p className="calc-result-note">
                {result.coc >= 10
                  ? 'Excellent — strong cash yield relative to money invested.'
                  : result.coc >= 6
                  ? 'Good return — solid cash flow performance.'
                  : result.coc >= 3
                  ? 'Fair — may be worth it in appreciating markets.'
                  : 'Poor cash-on-cash — review expenses or purchase price.'}
              </p>
            </>
          ) : (
            <div className="calc-result-value empty">Enter values</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoCCalculator;
