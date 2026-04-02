import { useState, useEffect } from 'react';
import DealCard from '../components/deals/DealCard';
import DealDetail from '../components/deals/DealDetail';
import './DealAnalysis.css';

const API_URL = `${process.env.REACT_APP_API_URL || 'https://gravvisoft.com/api'}/deals`;

const EmptyState = () => (
  <div className="deal-empty">
    <i className="pi pi-home" />
    <h2>No deals yet</h2>
    <p>Check back soon — deals will appear here as they're analyzed.</p>
  </div>
);

const ErrorState = () => (
  <div className="deal-empty">
    <i className="pi pi-exclamation-triangle" />
    <h2>Could not load deals</h2>
    <p>There was a problem connecting to the server. Please try again later.</p>
  </div>
);

// view: 'grid' | 'detail'
const DealAnalysis = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [view, setView] = useState('grid');
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [activeTab] = useState('brrrr');

  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        // Only show active/visible deals
        setDeals(Array.isArray(data) ? data.filter((d) => d.is_active) : []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const openDetail = (deal) => {
    setSelectedDeal(deal);
    setView('detail');
  };

  // Full-page detail view
  if (view === 'detail' && selectedDeal) {
    return (
      <div className="deal-analysis-page">
        <div className="deal-analysis-shell">
          <DealDetail
            deal={selectedDeal}
            onBack={() => setView('grid')}
          />
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="deal-analysis-page">
      <div className="deal-analysis-shell">

        <div className="da-header">
          <div>
            <p className="da-eyebrow">Real Estate Deal Evaluation</p>
            <h1>Deal Analysis</h1>
          </div>
        </div>

        <div className="da-tabs">
          <button className={`da-tab${activeTab === 'brrrr' ? ' da-tab--active' : ''}`}>
            BRRRR
          </button>
          <button className="da-tab da-tab--disabled" disabled>
            Fix &amp; Flip <span className="da-tab-soon">Soon</span>
          </button>
          <button className="da-tab da-tab--disabled" disabled>
            Buy &amp; Hold <span className="da-tab-soon">Soon</span>
          </button>
        </div>

        {loading ? (
          <div className="deal-empty">
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem', color: '#3b82f6' }} />
            <p style={{ marginTop: 12, color: '#6b7280' }}>Loading deals...</p>
          </div>
        ) : error ? (
          <ErrorState />
        ) : deals.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="deal-grid">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} onClick={() => openDetail(deal)} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default DealAnalysis;
