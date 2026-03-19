import React, { useState } from 'react';

const EVCalculator = () => {
  const [rows, setRows] = useState([
    { outcome: '', probability: '' },
    { outcome: '', probability: '' },
  ]);
  const [result, setResult] = useState(null);

  const addRow = () => setRows([...rows, { outcome: '', probability: '' }]);

  const removeRow = (i) => setRows(rows.filter((_, idx) => idx !== i));

  const updateRow = (i, field, value) => {
    const updated = [...rows];
    updated[i][field] = value;
    setRows(updated);
  };

  const calculate = () => {
    let ev = 0;
    let totalProb = 0;
    for (const row of rows) {
      const e = parseFloat(row.outcome);
      const p = parseFloat(row.probability) / 100;
      if (!isNaN(e) && !isNaN(p)) {
        ev += e * p;
        totalProb += p;
      }
    }
    setResult({ ev, totalProb });
  };

  const fmt = (n) =>
    n < 0
      ? `-$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="calc-card">
      <div className="calc-header">
        <h2>Expected Value (EV)</h2>
        <p>
          Calculate the probability-weighted average outcome across multiple scenarios.
          Useful for evaluating deals where outcomes are uncertain.
        </p>
      </div>
      <div className="calc-formula">
        EV = (E₁ × P₁) + (E₂ × P₂) + … + (Eₙ × Pₙ)
      </div>

      <div className="calc-body">
        <div className="calc-inputs">
          <div className="ev-col-labels">
            <span>Outcome ($)</span>
            <span>Probability (%)</span>
            <span></span>
          </div>
          <div className="ev-rows">
            {rows.map((row, i) => (
              <div className="ev-row" key={i}>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={row.outcome}
                  onChange={(e) => updateRow(i, 'outcome', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="e.g. 60"
                  value={row.probability}
                  onChange={(e) => updateRow(i, 'probability', e.target.value)}
                />
                {rows.length > 2 && (
                  <button className="ev-row-remove" onClick={() => removeRow(i)}>
                    <i className="pi pi-times"></i>
                  </button>
                )}
              </div>
            ))}
          </div>
          <button className="ev-add-btn" onClick={addRow}>
            + Add Scenario
          </button>
          <button className="calc-btn" onClick={calculate}>Calculate EV</button>
        </div>

        <div className="calc-result-panel">
          <h3>Expected Value</h3>
          {result !== null ? (
            <>
              <div className="calc-result-value">{fmt(result.ev)}</div>
              <p className="calc-result-note">
                Total probability used: {(result.totalProb * 100).toFixed(1)}%
                {Math.abs(result.totalProb - 1) > 0.01 && (
                  <span style={{ color: '#f59e0b', display: 'block', marginTop: 4 }}>
                    ⚠ Probabilities don't sum to 100%
                  </span>
                )}
              </p>
              <p className="calc-result-note">
                {result.ev > 0
                  ? 'Positive EV — this deal is expected to generate a return.'
                  : result.ev < 0
                  ? 'Negative EV — expected outcome is a loss.'
                  : 'Break-even expected value.'}
              </p>
            </>
          ) : (
            <div className="calc-result-value empty">Enter scenarios</div>
          )}
        </div>
      </div>
      <div className="calc-card-footer">
        Source: <em>Real Estate by the Numbers</em> — J Scott &amp; Dave Meyer, Ch. 7, p. 64
      </div>
    </div>
  );
};

export default EVCalculator;
