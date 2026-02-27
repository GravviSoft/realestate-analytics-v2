import React, { useState, useEffect } from 'react';
import { FaDollarSign, FaHome, FaChartLine, FaClipboardList } from 'react-icons/fa';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import dataService from '../services/dataService';
import { ProgressSpinner } from 'primereact/progressspinner';
import MetabaseEmbed from '../components/MetabaseEmbed';
import { Card } from 'primereact/card';
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
        <header className="dashboard-header">
          <div className="dashboard-heading">
            <p className="eyebrow">Real Estate Intelligence</p>
            <h1>Analytics Dashboard</h1>
            <p className="subtitle">Track portfolio performance, revenue, and listings in one place.</p>
          </div>
          <div className="header-actions">
            <button className="ghost-button">Export</button>
            <button className="primary-button">Add Listing</button>
          </div>
        </header>

        {/* Stats Row */}
        <section className="stats-grid">
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
        </section>


        {/* Embedded Metabase dashboard */}
        <section className="panel-grid">
          <Card className="chart-card" title="Market Insights (Metabase)" subTitle="Live dashboard embedded from Metabase.">
            <MetabaseEmbed />
          </Card>
        </section>


        {/* Charts Row 1 */}
        <section className="panel-grid panel-grid--wide">
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
        </section>

        {/* Charts Row 2 */}
        <section className="panel-grid">
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
        </section>



        {/* Data Table */}
        <section className="table-section">
          <DataTable
            title="Recent Transactions"
            data={dashboardData.recentTransactions}
            columns={transactionColumns}
          />
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
