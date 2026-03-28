import { useState, useRef } from 'react';
import { computeBRRRR, VERDICT_COLORS } from './brrrr';
import './AddDeal.css';

const EMPTY = {
  photo: null,
  name: '',
  address: '',
  notes: '',
  purchase_price: '',
  rehab_cost: '',
  arv: '',
  rehab_months: '',
  monthly_carry_cost: '',
  refi_ltv_pct: '75',
  refi_interest_rate: '',
  refi_loan_term_months: '360',
  monthly_rent: '',
  monthly_taxes: '',
  monthly_insurance: '',
  mgmt_fee_pct: '10',
  monthly_maintenance: '',
  vacancy_pct: '5',
  capex_pct: '5',
  hoa_fees: '0',
  neighborhood_grade: 'B',
  flood_zone: false,
};

const fmt = (n) =>
  n == null || isNaN(n)
    ? '—'
    : (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 });

const fmtPct = (n) => n === Infinity ? '∞%' : (n == null || isNaN(n) ? '—' : n.toFixed(1) + '%');

export default function BRRRRForm({ onSave, onCancel, editDeal }) {
  const [form, setForm] = useState(editDeal ? { ...EMPTY, ...editDeal } : { ...EMPTY });
  const [error, setError] = useState('');
  const fileRef = useRef();

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));
  const num = (field) => (e) => set(field, e.target.value);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2_000_000) { setError('Photo too large — max 2 MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => set('photo', ev.target.result);
    reader.readAsDataURL(file);
  };

  const calc = computeBRRRR(form);
  const vc = VERDICT_COLORS[calc.verdict];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Deal name is required'); return; }
    setError('');
    const deal = {
      id: editDeal?.id ?? crypto.randomUUID(),
      createdAt: editDeal?.createdAt ?? new Date().toISOString(),
      ...form,
      purchase_price:        parseFloat(form.purchase_price)       || 0,
      rehab_cost:            parseFloat(form.rehab_cost)           || 0,
      arv:                   parseFloat(form.arv)                  || 0,
      rehab_months:          parseFloat(form.rehab_months)         || 0,
      monthly_carry_cost:    parseFloat(form.monthly_carry_cost)   || 0,
      refi_ltv_pct:          parseFloat(form.refi_ltv_pct)         || 75,
      refi_interest_rate:    parseFloat(form.refi_interest_rate)   || 0,
      refi_loan_term_months: parseInt(form.refi_loan_term_months, 10) || 360,
      monthly_rent:          parseFloat(form.monthly_rent)         || 0,
      monthly_taxes:         parseFloat(form.monthly_taxes)        || 0,
      monthly_insurance:     parseFloat(form.monthly_insurance)    || 0,
      mgmt_fee_pct:          parseFloat(form.mgmt_fee_pct)         || 10,
      monthly_maintenance:   parseFloat(form.monthly_maintenance)  || 0,
      vacancy_pct:           parseFloat(form.vacancy_pct)          || 5,
      capex_pct:             parseFloat(form.capex_pct)            || 5,
      hoa_fees:              parseFloat(form.hoa_fees)             || 0,
    };
    onSave(deal);
  };

  return (
    <div className="ad-page">
      <div className="ad-layout">

        {/* ── Form ── */}
        <form className="ad-form" onSubmit={handleSubmit}>
          <div className="ad-form-header">
            <button type="button" className="ad-back" onClick={onCancel}>
              ← Deals
            </button>
            <h1 className="ad-title">{editDeal ? 'Edit Deal' : 'New BRRRR Deal'}</h1>
          </div>

          {error && <div className="ad-error">{error}</div>}

          {/* Photo */}
          <div className="ad-section">
            <h2 className="ad-section-title">Property Photo</h2>
            {form.photo && <img className="ad-photo-preview" src={form.photo} alt="Property" />}
            <button type="button" className="ad-photo-btn" onClick={() => fileRef.current.click()}>
              <i className="pi pi-camera" /> {form.photo ? 'Change Photo' : 'Upload Photo'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
          </div>

          {/* Deal Info */}
          <div className="ad-section">
            <h2 className="ad-section-title">Deal Info</h2>
            <div className="ad-row">
              <div className="ad-field ad-field--wide">
                <label>Deal Name *</label>
                <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. 123 Main St BRRRR" />
              </div>
            </div>
            <div className="ad-field">
              <label>Address</label>
              <input value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="123 Main St, City, State" />
            </div>
            <div className="ad-field">
              <label>Notes</label>
              <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} placeholder="Deal notes, source, motivation..." />
            </div>
          </div>

          {/* Acquisition & Rehab */}
          <div className="ad-section">
            <h2 className="ad-section-title">Acquisition &amp; Rehab</h2>
            <div className="ad-row">
              <div className="ad-field">
                <label>Purchase Price</label>
                <div className="ad-input-wrap"><span>$</span><input type="number" min="0" value={form.purchase_price} onChange={num('purchase_price')} placeholder="0" /></div>
              </div>
              <div className="ad-field">
                <label>Rehab Cost</label>
                <div className="ad-input-wrap"><span>$</span><input type="number" min="0" value={form.rehab_cost} onChange={num('rehab_cost')} placeholder="0" /></div>
              </div>
              <div className="ad-field">
                <label>After Repair Value (ARV)</label>
                <div className="ad-input-wrap"><span>$</span><input type="number" min="0" value={form.arv} onChange={num('arv')} placeholder="0" /></div>
              </div>
            </div>
            <div className="ad-row">
              <div className="ad-field">
                <label>Rehab Duration (months)</label>
                <input type="number" min="0" value={form.rehab_months} onChange={num('rehab_months')} placeholder="0" />
              </div>
              <div className="ad-field">
                <label>Monthly Carry Cost</label>
                <div className="ad-input-wrap"><span>$</span><input type="number" min="0" value={form.monthly_carry_cost} onChange={num('monthly_carry_cost')} placeholder="0" /></div>
              </div>
              <div className="ad-field ad-field--hint">
                <label>Total Holding Costs</label>
                <div className="ad-hint-val">{fmt(calc.holdingCosts)}</div>
              </div>
            </div>
          </div>

          {/* Refinance */}
          <div className="ad-section">
            <h2 className="ad-section-title">Refinance</h2>
            <div className="ad-row">
              <div className="ad-field">
                <label>LTV %</label>
                <div className="ad-input-wrap"><input type="number" min="0" max="100" step="0.5" value={form.refi_ltv_pct} onChange={num('refi_ltv_pct')} placeholder="75" /><span>%</span></div>
              </div>
              <div className="ad-field">
                <label>Interest Rate</label>
                <div className="ad-input-wrap"><input type="number" min="0" step="0.125" value={form.refi_interest_rate} onChange={num('refi_interest_rate')} placeholder="7.0" /><span>%</span></div>
              </div>
              <div className="ad-field">
                <label>Loan Term</label>
                <select value={form.refi_loan_term_months} onChange={(e) => set('refi_loan_term_months', e.target.value)}>
                  <option value="180">15 years</option>
                  <option value="240">20 years</option>
                  <option value="360">30 years</option>
                </select>
              </div>
            </div>
            <div className="ad-row">
              <div className="ad-field ad-field--hint">
                <label>Refi Loan Amount</label>
                <div className="ad-hint-val">{fmt(calc.refiLoan)}</div>
              </div>
              <div className="ad-field ad-field--hint">
                <label>Cash Out at Refi</label>
                <div className={`ad-hint-val ${calc.cashOutAtRefi >= 0 ? 'green' : 'red'}`}>{fmt(calc.cashOutAtRefi)}</div>
              </div>
              <div className="ad-field ad-field--hint">
                <label>Monthly Mortgage</label>
                <div className="ad-hint-val">{fmt(calc.monthlyMortgage)}</div>
              </div>
            </div>
          </div>

          {/* Income & Expenses */}
          <div className="ad-section">
            <h2 className="ad-section-title">Income &amp; Expenses</h2>
            <div className="ad-row">
              <div className="ad-field">
                <label>Monthly Rent</label>
                <div className="ad-input-wrap"><span>$</span><input type="number" min="0" value={form.monthly_rent} onChange={num('monthly_rent')} placeholder="0" /></div>
              </div>
              <div className="ad-field">
                <label>Monthly Taxes</label>
                <div className="ad-input-wrap"><span>$</span><input type="number" min="0" value={form.monthly_taxes} onChange={num('monthly_taxes')} placeholder="0" /></div>
              </div>
              <div className="ad-field">
                <label>Monthly Insurance</label>
                <div className="ad-input-wrap"><span>$</span><input type="number" min="0" value={form.monthly_insurance} onChange={num('monthly_insurance')} placeholder="0" /></div>
              </div>
            </div>
            <div className="ad-row">
              <div className="ad-field">
                <label>Management Fee</label>
                <div className="ad-input-wrap"><input type="number" min="0" max="100" step="0.5" value={form.mgmt_fee_pct} onChange={num('mgmt_fee_pct')} placeholder="10" /><span>%</span></div>
                {calc.mgmtFee > 0 && <div className="ad-sub">{fmt(calc.mgmtFee)}/mo</div>}
              </div>
              <div className="ad-field">
                <label>Monthly Maintenance</label>
                <div className="ad-input-wrap"><span>$</span><input type="number" min="0" value={form.monthly_maintenance} onChange={num('monthly_maintenance')} placeholder="0" /></div>
              </div>
              <div className="ad-field">
                <label>HOA Fees</label>
                <div className="ad-input-wrap"><span>$</span><input type="number" min="0" value={form.hoa_fees} onChange={num('hoa_fees')} placeholder="0" /></div>
              </div>
            </div>
            <div className="ad-row">
              <div className="ad-field">
                <label>Vacancy Reserve</label>
                <div className="ad-input-wrap"><input type="number" min="0" max="100" step="0.5" value={form.vacancy_pct} onChange={num('vacancy_pct')} placeholder="5" /><span>%</span></div>
              </div>
              <div className="ad-field">
                <label>CapEx Reserve</label>
                <div className="ad-input-wrap"><input type="number" min="0" max="100" step="0.5" value={form.capex_pct} onChange={num('capex_pct')} placeholder="5" /><span>%</span></div>
              </div>
              <div className="ad-field ad-field--hint">
                <label>Total Expenses/mo</label>
                <div className="ad-hint-val red">{fmt(calc.totalMonthlyExpenses)}</div>
              </div>
            </div>
          </div>

          {/* Deal Qualifiers */}
          <div className="ad-section">
            <h2 className="ad-section-title">Deal Qualifiers</h2>
            <div className="ad-row">
              <div className="ad-field">
                <label>Neighborhood Grade</label>
                <div className="ad-grade-selector">
                  {['A', 'B', 'C', 'D'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      className={`ad-grade-btn ad-grade-btn--${g}${form.neighborhood_grade === g ? ' ad-grade-btn--active' : ''}`}
                      onClick={() => set('neighborhood_grade', g)}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <div className="ad-sub">A = Prime · B = Good · C = Average · D = Hard disqualifier</div>
              </div>
              <div className="ad-field">
                <label>Flood Zone</label>
                <div className="ad-flood-zone">
                  <input
                    id="flood-zone"
                    type="checkbox"
                    checked={form.flood_zone}
                    onChange={(e) => set('flood_zone', e.target.checked)}
                  />
                  <label htmlFor="flood-zone">Property is in a FEMA flood zone</label>
                </div>
                {form.flood_zone && <div className="ad-warn">Flood zone is a hard disqualifier</div>}
              </div>
            </div>
          </div>

          <div className="ad-actions">
            <button type="button" className="ad-btn-cancel" onClick={onCancel}>Cancel</button>
            <button type="submit" className="ad-btn-save">{editDeal ? 'Update Deal' : 'Save Deal'}</button>
          </div>
        </form>

        {/* ── Live Preview ── */}
        <aside className="ad-preview">
          <div className="ad-preview-header">
            <span>Live Analysis</span>
            <span className="ad-preview-badge" style={{ background: vc.bg, color: vc.color, border: `1px solid ${vc.border}` }}>
              {calc.verdict}
            </span>
          </div>

          {/* Waterfall */}
          <div className="ad-preview-waterfall">
            <div className="ad-wf-row">
              <span>Purchase Price</span><span>{fmt(parseFloat(form.purchase_price) || 0)}</span>
            </div>
            <div className="ad-wf-row">
              <span>+ Rehab Cost</span><span>{fmt(parseFloat(form.rehab_cost) || 0)}</span>
            </div>
            <div className="ad-wf-row">
              <span>+ Holding Costs</span><span>{fmt(calc.holdingCosts)}</span>
            </div>
            <div className="ad-wf-row ad-wf-total">
              <span>= Total Invested</span><span>{fmt(calc.totalInvested)}</span>
            </div>
            <div className="ad-wf-row">
              <span>− Cash Out at Refi</span>
              <span className={calc.cashOutAtRefi >= 0 ? 'green' : 'red'}>{fmt(calc.cashOutAtRefi)}</span>
            </div>
            <div className="ad-wf-row ad-wf-total">
              <span>= Cash Left in Deal</span>
              <span className={calc.cashLeftInDeal <= 10000 ? 'green' : calc.cashLeftInDeal <= 30000 ? '' : 'red'}>
                {fmt(calc.cashLeftInDeal)}
              </span>
            </div>
          </div>

          {/* Key metrics */}
          <div className="ad-preview-metrics">
            <div className="ad-pm-row">
              <span className="ad-pm-label">Monthly Cash Flow</span>
              <span className={`ad-pm-val ${calc.monthlyCashFlow >= 0 ? 'green' : 'red'}`}>
                {fmt(calc.monthlyCashFlow)}<span className="ad-pm-unit">/mo</span>
              </span>
            </div>
            <div className="ad-pm-row">
              <span className="ad-pm-label">Cash-on-Cash Return</span>
              <span className={`ad-pm-val ${(calc.cashOnCash || 0) >= 8 ? 'green' : (calc.cashOnCash || 0) >= 4 ? '' : 'red'}`}>
                {fmtPct(calc.cashOnCash)}
              </span>
            </div>
            <div className="ad-pm-row">
              <span className="ad-pm-label">Equity Captured</span>
              <span className="ad-pm-val green">{fmt(calc.equityCaptured)}</span>
            </div>
            <div className="ad-pm-row">
              <span className="ad-pm-label">Refi Loan</span>
              <span className="ad-pm-val">{fmt(calc.refiLoan)}</span>
            </div>
            <div className="ad-pm-row">
              <span className="ad-pm-label">Monthly Mortgage</span>
              <span className="ad-pm-val">{fmt(calc.monthlyMortgage)}</span>
            </div>
            <div className="ad-pm-row">
              <span className="ad-pm-label">Gross Yield</span>
              <span className="ad-pm-val">{fmtPct(calc.grossYield)}</span>
            </div>
            <div className="ad-pm-row">
              <span className="ad-pm-label">LTV</span>
              <span className={`ad-pm-val ${calc.ltv > 80 ? 'red' : ''}`}>{fmtPct(calc.ltv)}</span>
            </div>
          </div>

          {/* Guardrails */}
          {calc.hardFails.length > 0 && (
            <div className="ad-preview-fails">
              <div className="ad-preview-fails-label">Hard Fails</div>
              {calc.hardFails.map((f) => (
                <div key={f} className="ad-fail-row">
                  <i className="pi pi-times-circle" /> {f}
                </div>
              ))}
            </div>
          )}
        </aside>

      </div>
    </div>
  );
}
