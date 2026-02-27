import React from 'react';
import { Card } from 'primereact/card';
import './StatCard.css';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = '#3B82F6' }) => {
  const isPositive = trend === 'up';

  return (
    <Card className="stat-card">
      <div className="stat-card-content">
        <div className="stat-info">
          <div className="stat-title">{title}</div>
          <div className="stat-value">{value}</div>
          {trendValue && (
            <div className={`stat-trend ${isPositive ? 'positive' : 'negative'}`}>
              <i className={`pi ${isPositive ? 'pi-arrow-up' : 'pi-arrow-down'}`}></i>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className="stat-icon" style={{ backgroundColor: `${color}20`, color: color }}>
          {Icon && <Icon size={32} />}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
