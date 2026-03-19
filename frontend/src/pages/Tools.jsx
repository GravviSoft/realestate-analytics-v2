import React, { useState } from 'react';
import EVCalculator from '../components/calculators/EVCalculator';
import FVCalculator from '../components/calculators/FVCalculator';
import PVCalculator from '../components/calculators/PVCalculator';
import CapRateCalculator from '../components/calculators/CapRateCalculator';
import CoCCalculator from '../components/calculators/CoCCalculator';
import DCFCalculator from '../components/calculators/DCFCalculator';
import './Tools.css';

const TABS = [
  { id: 'ev',      label: 'Expected Value',         icon: 'pi pi-percentage' },
  { id: 'fv',      label: 'Future Value',            icon: 'pi pi-arrow-up-right' },
  { id: 'pv',      label: 'Present Value',           icon: 'pi pi-arrow-down-left' },
  { id: 'dcf',     label: 'Discounted Cash Flow',    icon: 'pi pi-chart-line' },
  { id: 'caprate', label: 'Cap Rate',                icon: 'pi pi-building' },
  { id: 'coc',     label: 'Cash-on-Cash Return',     icon: 'pi pi-wallet' },
];

const Tools = () => {
  const [activeTab, setActiveTab] = useState('ev');

  const renderCalculator = () => {
    switch (activeTab) {
      case 'ev':      return <EVCalculator />;
      case 'fv':      return <FVCalculator />;
      case 'pv':      return <PVCalculator />;
      case 'caprate': return <CapRateCalculator />;
      case 'dcf':     return <DCFCalculator />;
      case 'coc':     return <CoCCalculator />;
      default:        return null;
    }
  };

  return (
    <div className="tools-page">
      <div className="tools-shell">
        <div className="tools-header">
          <p className="eyebrow">Real Estate by the Numbers</p>
          <h1>Investor Tools</h1>
          <p className="subtitle">
            Financial calculators based on proven real estate investment formulas. Plug in your numbers and evaluate deals with confidence.
          </p>
        </div>

        <div className="tools-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tools-tab ${activeTab === tab.id ? 'tools-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={tab.icon}></i>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="tools-content">
          {renderCalculator()}
        </div>
      </div>
    </div>
  );
};

export default Tools;
