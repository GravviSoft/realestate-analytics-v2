import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-shell">

        <div className="about-hero">
          <div className="about-avatar">
            <i className="pi pi-user"></i>
          </div>
          <div className="about-hero-text">
            <p className="eyebrow">Analytics Engineer & Real Estate Investor</p>
            <h1>Beau Enslow</h1>
            <p className="about-tagline">
              Real Estate Investor | Data Analyst | Full Stack Developer 
              {/* I build data systems that turn public housing data into actionable investment insights. */}
            </p>
            <div className="about-actions">
              <a
                href="https://calendly.com/beau-enslow/30"
                target="_blank"
                rel="noreferrer"
                className="primary-button"
              >
                <i className="pi pi-calendar"></i> Book a Meeting
              </a>
              <a
                href="/beau_enslow_sample_resume_bi_analytics_v3.pdf"
                target="_blank"
                rel="noreferrer"
                className="ghost-button"
              >
                <i className="pi pi-download"></i> Download Resume
              </a>
            </div>
          </div>
        </div>

        <div className="about-grid">
          <div className="about-card">
            <h2>About This Project</h2>
            <p>
              I'm passionate about real estate investing and built this platform to better understand
              markets, evaluate opportunities, and turn public housing data into usable decision-support tools.
              It features automated daily Zillow data pipelines, SQL-based modeling, data quality auditing,
              and embedded Metabase dashboards.
            </p>
          </div>

          <div className="about-card">
            <h2>Tech Stack</h2>
            <div className="stack-list">
              <div className="stack-item"><i className="pi pi-database"></i> PostgreSQL (Neon)</div>
              <div className="stack-item"><i className="pi pi-code"></i> Python & Flask</div>
              <div className="stack-item"><i className="pi pi-desktop"></i> React</div>
              <div className="stack-item"><i className="pi pi-box"></i> Docker & VPS Deployment</div>
              <div className="stack-item"><i className="pi pi-chart-bar"></i> Metabase Dashboards</div>
              <div className="stack-item"><i className="pi pi-sync"></i> Automated ETL Pipelines</div>
            </div>
          </div>

          <div className="about-card">
            <h2>What I'm Looking For</h2>
              <p>
                I’m especially interested in real estate deal analysis and acquisitions-focused roles where I can combine market research, underwriting, and analytics to support investment decisions. I’m also open to BI, analytics engineering, and data roles where I can build reporting and data infrastructure that helps teams make better decisions.
              </p>
          </div>

          <div className="about-card about-card--contact">
            <h2>Get In Touch</h2>
            <p>Book time directly on my calendar or reach out via LinkedIn.</p>
            <a
              href="https://calendly.com/beau-enslow/30"
              target="_blank"
              rel="noreferrer"
              className="primary-button"
            >
              <i className="pi pi-calendar"></i> Schedule a Call
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
