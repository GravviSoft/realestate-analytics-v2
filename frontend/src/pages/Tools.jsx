import React, { useState } from 'react';
import EVCalculator from '../components/calculators/EVCalculator';
import FVCalculator from '../components/calculators/FVCalculator';
import PVCalculator from '../components/calculators/PVCalculator';
import CapRateCalculator from '../components/calculators/CapRateCalculator';
import CoCCalculator from '../components/calculators/CoCCalculator';
import DCFCalculator from '../components/calculators/DCFCalculator';
import CompoundInterestCalculator from '../components/calculators/CompoundInterestCalculator';
import TaxableIncomeCalculator from '../components/calculators/TaxableIncomeCalculator';
import './Tools.css';

const GROUPS = [
  {
    label: 'Time Value of Money',
    items: [
      { id: 'ev',  label: 'Expected Value',      icon: 'pi pi-percentage' },
      { id: 'fv',  label: 'Future Value',         icon: 'pi pi-arrow-up-right' },
      { id: 'pv',  label: 'Present Value',        icon: 'pi pi-arrow-down-left' },
      { id: 'dcf', label: 'Discounted Cash Flow', icon: 'pi pi-chart-line' },
      { id: 'ci',  label: 'Compound Interest',    icon: 'pi pi-chart-bar' },
    ],
  },
  {
    label: 'Property Analysis',
    items: [
      { id: 'caprate', label: 'Cap Rate',             icon: 'pi pi-building' },
      { id: 'coc',     label: 'Cash-on-Cash Return',  icon: 'pi pi-wallet' },
      { id: 'ti',      label: 'Taxable Income',        icon: 'pi pi-file-edit' },
    ],
  },
];

const renderCalculator = (activeTab) => {
  switch (activeTab) {
    case 'ev':      return <EVCalculator />;
    case 'fv':      return <FVCalculator />;
    case 'pv':      return <PVCalculator />;
    case 'dcf':     return <DCFCalculator />;
    case 'ci':      return <CompoundInterestCalculator />;
    case 'caprate': return <CapRateCalculator />;
    case 'coc':     return <CoCCalculator />;
    case 'ti':      return <TaxableIncomeCalculator />;
    default:        return null;
  }
};

const Tools = () => {
  const [activeTab, setActiveTab] = useState('ev');

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

        <div className="tools-layout">
          <aside className="tools-sidebar">
            {GROUPS.map((group) => (
              <div key={group.label} className="tools-sidebar-group">
                <p className="tools-sidebar-label">{group.label}</p>
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    className={`tools-sidebar-item ${activeTab === item.id ? 'tools-sidebar-item--active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <i className={item.icon}></i>
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </aside>

          <div className="tools-content">
            {renderCalculator(activeTab)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tools;
