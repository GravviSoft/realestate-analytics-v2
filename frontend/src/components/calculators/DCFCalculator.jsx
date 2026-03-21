import React, { useState } from 'react';

const DCFCalculator = () => {
  const [mode, setMode] = useState('simple');
  const [showExplainer, setShowExplainer] = useState(false);

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
      {/* Explainer dropdown */}
      <div className="calc-explainer">
        <button
          className="calc-explainer-toggle"
          onClick={() => setShowExplainer((v) => !v)}
        >
          <span>When and why to use DCF in real estate</span>
          <i className={`pi ${showExplainer ? 'pi-chevron-up' : 'pi-chevron-down'}`} />
        </button>
        {showExplainer && (
          <div className="calc-explainer-body">
            <p>In real estate investing, DCF becomes useful anytime money is spread out over time and you want to know what that whole stream is worth today.</p>
            <p><strong>A simple way to picture it:</strong></p>
            <p>A dollar you get today is worth more than a dollar you get 5 years from now, because today's dollar could be invested elsewhere, used to pay down debt, or kept available for another deal. DCF helps you convert all those future dollars into today's dollars so you can compare deals more intelligently.</p>

            <p><strong>Here are some real estate situations where it comes in handy:</strong></p>

            <p><strong>1. Comparing two rental properties with different cash flow timing</strong></p>
            <p>Suppose Property A gives you strong cash flow immediately, while Property B gives you weak cash flow now but much bigger cash flow later after rents rise or renovations are done. At first glance, Property B may look better because the total future cash flow is bigger. But DCF asks: <em>"What are those later cash flows actually worth today?"</em> That matters because delayed cash flow is less valuable than immediate cash flow.</p>

            <p><strong>2. Deciding whether to do a value-add renovation</strong></p>
            <p>You buy an apartment building, spend money now on upgrades, and expect higher rents over the next 5 years. DCF helps answer: <em>"Are those future extra rents worth enough today to justify the renovation cost right now?"</em> Without DCF, you might just say "I'll make more rent later" — but DCF forces you to ask whether that later income is enough after considering time and risk.</p>

            <p><strong>3. Evaluating a flip or development project</strong></p>
            <p>Cash goes out now for purchase, carrying costs, repairs, and permits — then comes back later when you sell. DCF helps compare money spent now against sale proceeds received later. This is especially helpful when the timeline stretches longer than expected. A project that looks profitable in raw dollars may be less attractive once you discount the future sale proceeds back to today.</p>

            <p><strong>4. Comparing a deal against another place you could put your money</strong></p>
            <p>Say you have $100,000 and could put it into a rental property, leave it in another investment, or use it as a down payment on a different deal. DCF helps ask: <em>"Does this property produce enough future value to beat my alternative use of cash?"</em> That is where the discount rate comes in — it reflects your required return or opportunity cost.</p>

            <p><strong>5. Deciding whether seller financing is attractive</strong></p>
            <p>Suppose a seller offers to let you pay over time, or you sell a property and receive payments over several years. DCF helps answer: <em>"What are those future payments really worth in today's dollars?"</em> Because receiving $20,000 per year for 5 years is not the same as getting the full amount today.</p>

            <p><strong>6. Valuing a commercial property with uneven future cash flows</strong></p>
            <p>Maybe a property has leases expiring at different times, vacancies in year 1, tenant improvements in year 2, stronger NOI in years 3–10, and a sale at the end. DCF lets you model each year's expected cash flow separately, then discount all of it back to present value — much more realistic than using one simple average number.</p>

            <p><strong>7. Figuring out what price you should pay today</strong></p>
            <p>DCF can work backward. Instead of asking "What is this stream of cash flows worth?" you ask: <em>"Given the future cash flows I expect, what is the maximum I should pay today?"</em> That is hugely useful as an investor. If the DCF says the present value is $420,000, paying $500,000 may not make sense unless your assumptions improve.</p>

            <p><strong>Tiny real estate example</strong></p>
            <p>Imagine a property gives you: Year 1: $8,000 — Year 2: $9,000 — Year 3: $10,000 + $150,000 sale proceeds. DCF discounts each of those amounts back to today, then adds them up. So you are not just saying "Total future dollars = $177,000" — you are saying those future dollars are worth only some lower amount today because you have to wait for them and could have used your money elsewhere.</p>

            <p><strong>When you may not need a full DCF</strong></p>
            <p>For quick screening, many investors use simpler tools first: cash-on-cash return, cap rate, monthly cash flow, or simple ROI. But once you start asking <em>"Should I hold this 7 years? Should I renovate first? Should I buy Deal A or Deal B? What is this future income stream worth today?"</em> — that is DCF territory.</p>

            <p><strong>Best mental picture</strong></p>
            <p>Think of DCF as a translator: it translates future money into today's money so you can make a better decision today.</p>
          </div>
        )}
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
