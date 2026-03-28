import { useState } from 'react';
import { computeBRRRR, VERDICT_COLORS } from './brrrr';
import './deals.css';

const fmt = (n) =>
  n == null || isNaN(n) ? '—'
  : (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtPct = (n) => n === Infinity ? '∞%' : (n == null || isNaN(n) ? '—' : n.toFixed(2) + '%');

const MetricPill = ({ label, value, neg, pos }) => (
  <div className="metric-pill">
    <div className="metric-pill__label">{label}</div>
    <div className={`metric-pill__value${neg ? ' metric-pill__value--neg' : ''}${pos ? ' metric-pill__value--pos' : ''}`}>
      {value}
    </div>
  </div>
);

const GuardrailRow = ({ ok, label }) => (
  <div className="guardrail-row">
    <i className={`pi ${ok ? 'pi-check-circle guardrail-icon--ok' : 'pi-times-circle guardrail-icon--fail'}`} />
    <span>{label}</span>
  </div>
);

const gradeLabel = { A: 'Prime', B: 'Good', C: 'Average', D: 'Distressed' };

const VERDICT_META = {
  Pass:       { icon: 'pi-check-circle', label: 'Strong Deal', sub: 'All guardrails pass and returns meet BRRRR targets.' },
  Borderline: { icon: 'pi-exclamation-circle', label: 'Borderline', sub: 'Clears minimum bars but does not hit full BRRRR targets. Proceed with caution.' },
  Fail:       { icon: 'pi-times-circle', label: 'Does Not Pass', sub: null },
  Incomplete: { icon: 'pi-info-circle', label: 'Incomplete', sub: 'Enter purchase price, ARV, rent, and interest rate to score this deal.' },
};

const DealDetail = ({ deal, onBack }) => {
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const m = computeBRRRR(deal);
  const vc = VERDICT_COLORS[m.verdict] || VERDICT_COLORS['Fail'];
  const meta = VERDICT_META[m.verdict] || VERDICT_META['Fail'];
  const cashLeftPct = m.totalInvested > 0 ? m.cashLeftInDeal / m.totalInvested : 0;

  const failSub = m.hardFails.length
    ? `Failing criteria: ${m.hardFails.join(', ')}.`
    : 'Returns are below minimum thresholds.';

  return (
    <div>
      {/* Top bar */}
      <div className="deal-detail__topbar">
        <button className="back-btn" onClick={onBack}>
          <i className="pi pi-arrow-left" /> Back to Deals
        </button>
      </div>

      {/* Verdict banner */}
      {!bannerDismissed && (
        <div className="verdict-banner-v2" style={{ borderColor: vc.border }}>
          <div className="verdict-banner-v2__accent" style={{ background: vc.color }} />
          <div className="verdict-banner-v2__icon" style={{ color: vc.color }}>
            <i className={`pi ${meta.icon}`} />
          </div>
          <div className="verdict-banner-v2__body">
            <span className="verdict-banner-v2__label" style={{ color: vc.color }}>{meta.label}</span>
            <span className="verdict-banner-v2__sub">{meta.sub || failSub}</span>
          </div>
          <div className="verdict-banner-v2__badge" style={{ background: vc.bg, color: vc.color, border: `1px solid ${vc.border}` }}>
            {m.verdict}
          </div>
          <button className="verdict-banner-v2__dismiss" onClick={() => setBannerDismissed(true)}>
            <i className="pi pi-times" />
          </button>
        </div>
      )}

      {/* Two-column layout */}
      <div className="deal-detail__grid">

        {/* Left — photo + property info */}
        <div className="deal-detail__left">
          {deal.photo
            ? <img className="deal-detail__photo" src={deal.photo} alt={deal.name} />
            : <div className="deal-detail__photo-placeholder"><i className="pi pi-building" /></div>
          }
          <div className="deal-info-block">
            <h2>{deal.name}</h2>
            {deal.address && <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 12px' }}>{deal.address}</p>}
            <dl>
              <dt>Purchase Price</dt>  <dd>{fmt(deal.purchase_price)}</dd>
              <dt>Rehab Cost</dt>      <dd>{fmt(deal.rehab_cost)}</dd>
              <dt>ARV</dt>             <dd>{fmt(deal.arv)}</dd>
              <dt>Refi LTV</dt>        <dd>{deal.refi_ltv_pct}%</dd>
              <dt>Rate / Term</dt>     <dd>{deal.refi_interest_rate}% / {deal.refi_loan_term_months / 12} yr</dd>
              <dt>Monthly Rent</dt>    <dd>{fmt(deal.monthly_rent)}</dd>
              <dt>HOA Fees</dt>        <dd>{fmt(deal.hoa_fees)}</dd>
              <dt>Neighborhood</dt>    <dd>Grade {deal.neighborhood_grade} — {gradeLabel[deal.neighborhood_grade]}</dd>
              <dt>Flood Zone</dt>      <dd>{deal.flood_zone ? 'Yes' : 'No'}</dd>
              <dt>Added</dt>           <dd>{new Date(deal.createdAt).toLocaleDateString()}</dd>
            </dl>
            {deal.notes && (
              <p style={{ fontSize: 12, color: '#6b7280', marginTop: 12, borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                {deal.notes}
              </p>
            )}
          </div>
        </div>

        {/* Right — metrics, expenses, guardrails */}
        <div className="deal-detail__right">

          <div className="detail-section">
            <h3>Key Metrics</h3>
            <div className="detail-metrics-grid">
              <MetricPill label="Total Invested"     value={fmt(m.totalInvested)} />
              <MetricPill label="Refi Loan"          value={fmt(m.refiLoan)} />
              <MetricPill label="Cash Left In Deal"  value={fmt(m.cashLeftInDeal)}
                pos={m.cashLeftInDeal <= 0} neg={m.cashLeftInDeal > m.totalInvested * 0.2} />
              <MetricPill label="Monthly Mortgage"   value={fmt(m.monthlyMortgage)} />
              <MetricPill label="Monthly Cash Flow"  value={fmt(m.monthlyCashFlow)}
                pos={m.monthlyCashFlow > 0} neg={m.monthlyCashFlow < 0} />
              <MetricPill label="Annual Cash Flow"   value={fmt(m.annualCashFlow)}
                pos={m.annualCashFlow > 0} neg={m.annualCashFlow < 0} />
              <MetricPill label="CoC Return"         value={fmtPct(m.cashOnCash)}
                pos={m.cashOnCash === Infinity || (m.cashOnCash || 0) >= 8} neg={(m.cashOnCash || 0) < 0} />
              <MetricPill label="Equity Captured"    value={fmt(m.equityCaptured)}
                pos={m.equityCaptured > 0} />
              <MetricPill label="LTV"                value={fmtPct(m.ltv)}
                neg={m.ltv > 80} pos={m.ltv <= 75} />
            </div>
          </div>

          <div className="detail-section">
            <h3>Monthly Expense Breakdown</h3>
            <table className="expense-table">
              <tbody>
                <tr><td>Taxes</td>                                          <td>{fmt(deal.monthly_taxes)}</td></tr>
                <tr><td>Insurance</td>                                      <td>{fmt(deal.monthly_insurance)}</td></tr>
                <tr><td>Maintenance</td>                                    <td>{fmt(deal.monthly_maintenance)}</td></tr>
                <tr><td>Management ({deal.mgmt_fee_pct}%)</td>             <td>{fmt(m.mgmtFee)}</td></tr>
                <tr><td>Vacancy ({deal.vacancy_pct}% of rent)</td>         <td>{fmt((deal.vacancy_pct / 100) * deal.monthly_rent)}</td></tr>
                <tr><td>CapEx ({deal.capex_pct}% of rent)</td>             <td>{fmt((deal.capex_pct / 100) * deal.monthly_rent)}</td></tr>
                <tr><td>HOA Fees</td>                                       <td>{fmt(deal.hoa_fees)}</td></tr>
                <tr className="expense-table__total">
                  <td>Total Monthly Expenses</td>
                  <td>{fmt(m.totalMonthlyExpenses)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="detail-section">
            <h3>Deal Guardrails</h3>
            <GuardrailRow ok={deal.neighborhood_grade !== 'D'}
              label={`Neighborhood grade not D-class (Grade ${deal.neighborhood_grade})`} />
            <GuardrailRow ok={!deal.flood_zone}
              label="Not in a FEMA flood zone" />
            <GuardrailRow ok={m.monthlyCashFlow > 0}
              label={`Cash flow positive (${fmt(m.monthlyCashFlow)}/mo)`} />
            <GuardrailRow ok={m.ltv <= 80}
              label={`LTV ≤ 80% (${fmtPct(m.ltv)})`} />
            <GuardrailRow ok={cashLeftPct <= 0.10}
              label={`Cash left ≤ 10% of total invested (${fmtPct(cashLeftPct * 100)})`} />
            <GuardrailRow ok={m.cashOnCash === Infinity || (m.cashOnCash || 0) >= 8}
              label={`CoC return ≥ 8% (${fmtPct(m.cashOnCash)})`} />
            <GuardrailRow ok={!deal.hoa_fees || deal.hoa_fees === 0}
              label={`No HOA fees${deal.hoa_fees > 0 ? ` (${fmt(deal.hoa_fees)}/mo)` : ''}`} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default DealDetail;
