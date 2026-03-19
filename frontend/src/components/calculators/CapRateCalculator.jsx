import React, { useState } from 'react';

const CapRateCalculator = () => {
  const [noi, setNoi] = useState('');
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const NOI = parseFloat(noi);
    const V = parseFloat(value);
    if (isNaN(NOI) || isNaN(V) || V === 0) return;
    const capRate = (NOI / V) * 100;
    setResult({ capRate });
  };

  const grade = (r) => {
    if (r >= 8) return { label: 'Strong', color: '#10b981' };
    if (r >= 5) return { label: 'Moderate', color: '#f59e0b' };
    return { label: 'Low', color: '#ef4444' };
  };

  return (
    <div className="calc-card">
      <div className="calc-header">
        <h2>Cap Rate</h2>
        <p>
          Capitalization rate measures a property's income relative to its value.
          Used to quickly compare investment properties.
        </p>
      </div>
      <div className="calc-formula">
        Cap Rate = NOI ÷ Property Value × 100
      </div>

      <div className="calc-body">
        <div className="calc-inputs">
          <div className="calc-field">
            <label>Net Operating Income (NOI) — Annual</label>
            <input type="number" placeholder="e.g. 24000" value={noi} onChange={(e) => setNoi(e.target.value)} />
            <span className="field-hint">Gross rent minus operating expenses (not including mortgage)</span>
          </div>
          <div className="calc-field">
            <label>Property Value / Purchase Price</label>
            <input type="number" placeholder="e.g. 300000" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <button className="calc-btn" onClick={calculate}>Calculate Cap Rate</button>
        </div>

        <div className="calc-result-panel">
          <h3>Cap Rate</h3>
          {result !== null ? (
            <>
              <div className="calc-result-value">{result.capRate.toFixed(2)}%</div>
              <p className="calc-result-note" style={{ color: grade(result.capRate).color, fontWeight: 600 }}>
                {grade(result.capRate).label} yield
              </p>
              <p className="calc-result-note">
                {result.capRate >= 8
                  ? 'Generally considered a strong return for most markets.'
                  : result.capRate >= 5
                  ? 'Acceptable in competitive or appreciating markets.'
                  : 'Low cap rate — may indicate appreciation play or overpriced.'}
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

export default CapRateCalculator;
