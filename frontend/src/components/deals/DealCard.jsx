import { computeBRRRR, VERDICT_COLORS } from './brrrr';
import './deals.css';

const fmt = (n) =>
  n == null || isNaN(n) ? '—'
  : (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 });

const fmtPct = (n) => n === Infinity ? '∞' : (n == null || isNaN(n) ? '—' : n.toFixed(1) + '%');

const VerdictBadge = ({ verdict }) => {
  const vc = VERDICT_COLORS[verdict] || VERDICT_COLORS['Pass'];
  return (
    <span
      className="verdict-badge"
      style={{ background: vc.bg, color: vc.color, border: `1px solid ${vc.border}` }}
    >
      {verdict}
    </span>
  );
};

const MetricPill = ({ label, value, neg, pos }) => (
  <div className="metric-pill">
    <div className="metric-pill__label">{label}</div>
    <div className={`metric-pill__value${neg ? ' metric-pill__value--neg' : ''}${pos ? ' metric-pill__value--pos' : ''}`}>
      {value}
    </div>
  </div>
);

const DealCard = ({ deal, onClick }) => {
  const m = computeBRRRR(deal);

  return (
    <div
      className="deal-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="deal-photo-wrap">
        {deal.photo
          ? <img className="deal-photo" src={deal.photo} alt={deal.name} />
          : <div className="deal-photo deal-photo--placeholder"><i className="pi pi-building" /></div>
        }
        <span className="deal-photo-date">
          <i className="pi pi-calendar" />
          {new Date(deal.created_at || deal.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
      <div className="deal-card__body">
        <div className="deal-card__header">
          <span className="deal-card__name">{deal.name}</span>
          <VerdictBadge verdict={m.verdict} />
        </div>
        <div className="deal-card__metrics">
          <MetricPill
            label="CF / mo"
            value={fmt(m.monthlyCashFlow)}
            neg={m.monthlyCashFlow < 0}
            pos={m.monthlyCashFlow > 0}
          />
          <MetricPill
            label="CoC Return"
            value={fmtPct(m.cashOnCash)}
            neg={(m.cashOnCash || 0) < 0}
            pos={(m.cashOnCash || 0) >= 8}
          />
          <MetricPill
            label="Cash Left In"
            value={fmt(m.cashLeftInDeal)}
            pos={m.cashLeftInDeal <= 0}
          />
        </div>
      </div>
    </div>
  );
};

export default DealCard;
