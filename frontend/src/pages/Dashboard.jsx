import React, { useState, useEffect } from 'react';
import { FaDollarSign, FaHome, FaChartLine, FaClipboardList } from 'react-icons/fa';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import dataService from '../services/dataService';
import { ProgressSpinner } from 'primereact/progressspinner';
import MetabaseEmbed from '../components/MetabaseEmbed';
import './Dashboard.css';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await dataService.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <ProgressSpinner />
      </div>
    );
  }

  if (!dashboardData) {
    return <div>Error loading dashboard data</div>;
  }

  const transactionColumns = [
    { field: 'property', header: 'Property', sortable: true },
    { field: 'type', header: 'Type', sortable: true },
    { field: 'price', header: 'Price', sortable: true },
    { field: 'date', header: 'Date', sortable: true },
    { field: 'status', header: 'Status', sortable: true },
    { field: 'agent', header: 'Agent', sortable: true },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-shell">
        <header className="dashboard-hero">
          <div className="dashboard-hero__inner">
            <div className="dashboard-hero__left">
              <p className="hero-eyebrow">
                <span className="hero-eyebrow__dot" />
                U.S. Housing Market Intelligence
              </p>
              <h1 className="hero-title">Real Estate Data Analytics Portfolio</h1>
              <p className="hero-subtitle">
                Built to understand markets, evaluate opportunities, and turn public Zillow housing data into decision-support tools — featuring automated daily data pipelines, SQL modeling, data quality auditing, and embedded dashboards.
              </p>
              <div className="hero-badges">
                <span className="hero-badge">PostgreSQL</span>
                <span className="hero-badge">Python</span>
                <span className="hero-badge">Flask</span>
                <span className="hero-badge">React</span>
                <span className="hero-badge">Docker</span>
                <span className="hero-badge">Metabase</span>
                <span className="hero-badge">Zillow API</span>
              </div>
            </div>
            <div className="dashboard-hero__right">
              <div className="hero-stat-card">
                <div className="hero-stat-card__live">
                  <span className="hero-live-dot" />
                  Live Data
                </div>
                <div className="hero-stats-row">
                  <div className="hero-stat">
                    <span className="hero-stat__num">Daily</span>
                    <span className="hero-stat__label">Refresh</span>
                  </div>
                  <div className="hero-stat-divider" />
                  <div className="hero-stat">
                    <span className="hero-stat__num">3</span>
                    <span className="hero-stat__label">Datasets</span>
                  </div>
                  <div className="hero-stat-divider" />
                  <div className="hero-stat">
                    <span className="hero-stat__num">330+</span>
                    <span className="hero-stat__label">U.S. Metros</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Row */}
        {/* <section className="stats-grid">
          <StatCard
            title="Total Revenue"
            value={dashboardData.stats.totalRevenue}
            icon={FaDollarSign}
            trend="up"
            trendValue="+12.5%"
            color="#10B981"
          />
          <StatCard
            title="Total Properties"
            value={dashboardData.stats.totalProperties}
            icon={FaHome}
            trend="up"
            trendValue="+8.2%"
            color="#3B82F6"
          />
          <StatCard
            title="Avg Property Value"
            value={dashboardData.stats.avgPropertyValue}
            icon={FaChartLine}
            trend="up"
            trendValue="+5.1%"
            color="#8B5CF6"
          />
          <StatCard
            title="Active Listings"
            value={dashboardData.stats.activeListings}
            icon={FaClipboardList}
            trend="down"
            trendValue="-2.3%"
            color="#F59E0B"
          />
        </section> */}


        {/* Embedded Metabase dashboard */}
        <section className="metabase-section">
          <div className="metabase-card">
            <MetabaseEmbed />
          </div>
        </section>


        {/* Charts Row 1 */}
        {/* <section className="panel-grid panel-grid--wide">
          <ChartCard
            title="Revenue Trends"
            type="line"
            data={dashboardData.revenueData}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => `$${value.toLocaleString()}`,
                  },
                },
              },
            }}
          />
          <ChartCard
            title="Property Types"
            type="doughnut"
            data={dashboardData.propertyTypesData}
          />
        </section> */}

        {/* Charts Row 2 */}
        {/* <section className="panel-grid">
          <ChartCard
            title="Sales by Region"
            type="bar"
            data={dashboardData.salesByRegionData}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
          <ChartCard
            title="Monthly Trends"
            type="line"
            data={dashboardData.trendsData}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </section> */}



        {/* Data Table */}
        {/* <section className="table-section">
          <DataTable
            title="Recent Transactions"
            data={dashboardData.recentTransactions}
            columns={transactionColumns}
          />
        </section> */}
      </div>
    </div>
  );
};

export default Dashboard;
