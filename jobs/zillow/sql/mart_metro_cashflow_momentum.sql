-- MART: metro_cashflow_momentum
-- PURPOSE:
-- Identify U.S. metro markets where single-family rental cash flow appears attractive
-- and is improving, using rent-to-price yield trends from Zillow metro data.
--
-- BUSINESS QUESTION:
-- Which metro markets currently show strong gross yield, improving recent momentum,
-- and rent growth healthy enough to reduce the risk of a yield trap?
--
-- GRAIN:
-- One row per (region_id, month_end) in the underlying model.
-- Final output is filtered to the latest available month only.
--
-- PRIMARY USERS:
-- Investors, acquisitions teams, analysts, and product stakeholders reviewing
-- market-level opportunity screens.
--
-- KEY METRICS:
-- gross_yield = annualized rent / home price
-- bps_3m_vs_12m = recent yield momentum versus 12-month trend
-- bps_12m_vs_36m = current valuation versus longer-run baseline
--
-- SCREEN LOGIC:
-- 1. Require improving recent yield momentum
-- 2. Require positive rent growth
-- 3. Require rent growth to keep pace with or exceed home price growth
--
-- IMPORTANT LIMITATION:
-- This is a market screening tool, not a full underwriting model for individual deals.

WITH kpi_base AS (
  SELECT
    p.region_id,
    p.date,
    p.size_rank,
    p.region_name,
    p.state_name,
    p.home_prices,
    r.rent_prices,
    (12 * r.rent_prices) / NULLIF(p.home_prices, 0) AS gross_yield
  FROM "{SCHEMA_NAME}"."stg_zillow_zhvi_sfr_smoothed_metro_us_monthly" AS p
  JOIN "{SCHEMA_NAME}"."stg_zillow_zori_sfr_smoothed_metro_us_monthly" AS r
    USING (region_id, date)
),
rolling_avgs AS (
  SELECT
    *,
    -- 3 month
    AVG(gross_yield) OVER (PARTITION BY region_id ORDER BY date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS gross_yield_trailing_3m_avg,
    -- 6 month
    AVG(gross_yield) OVER (PARTITION BY region_id ORDER BY date ROWS BETWEEN 5 PRECEDING AND CURRENT ROW) AS gross_yield_trailing_6m_avg,
    --12 month
    AVG(gross_yield) OVER (PARTITION BY region_id ORDER BY date ROWS BETWEEN 11 PRECEDING AND CURRENT ROW) AS gross_yield_trailing_12m_avg,
    --24 month
    AVG(gross_yield) OVER (PARTITION BY region_id ORDER BY date ROWS BETWEEN 23 PRECEDING AND CURRENT ROW) AS gross_yield_trailing_24m_avg,
    --36 month
    AVG(gross_yield) OVER (PARTITION BY region_id ORDER BY date ROWS BETWEEN 35 PRECEDING AND CURRENT ROW) AS gross_yield_trailing_36m_avg,

    (home_prices / NULLIF(LAG(home_prices, 12) OVER (PARTITION BY region_id ORDER BY date), 0)) - 1 AS home_yoy_pct,
    (rent_prices / NULLIF(LAG(rent_prices, 12) OVER (PARTITION BY region_id ORDER BY date), 0)) - 1 AS rent_yoy_pct,

    COUNT(*) OVER (PARTITION BY region_id ORDER BY date) AS region_months
  FROM kpi_base
),
calc_yield_momentum_spread AS (
  SELECT
    *,
    ROUND(10000 * (gross_yield_trailing_3m_avg - gross_yield_trailing_12m_avg), 4) AS bps_3m_vs_12m,
    ROUND(10000 * (gross_yield_trailing_12m_avg - gross_yield_trailing_36m_avg), 4) AS bps_12m_vs_36m
  FROM rolling_avgs
),
bps_momentum_valuation AS (
  SELECT
    *,
    CASE
      WHEN bps_3m_vs_12m >= 25 THEN 'Strongly Improving'
      WHEN bps_3m_vs_12m >= 10 THEN 'Improving'
      WHEN bps_3m_vs_12m >= 1 THEN 'Slightly Improving'
      WHEN bps_3m_vs_12m > -1 THEN 'Flat'
      WHEN bps_3m_vs_12m > -10 THEN 'Slightly Deteriorating'
      WHEN bps_3m_vs_12m > -25 THEN 'Deteriorating'
      ELSE 'Strongly Deteriorating'
    END AS momentum_3m_vs_12m,
    CASE
      WHEN bps_12m_vs_36m >= 25 THEN 'Highly Attractive vs Baseline'
      WHEN bps_12m_vs_36m >= 10 THEN 'Attractive vs Baseline'
      WHEN bps_12m_vs_36m >= 1 THEN 'Slightly Attractive vs Baseline'
      WHEN bps_12m_vs_36m > -1 THEN 'In Line with Baseline'
      WHEN bps_12m_vs_36m > -10 THEN 'Slightly Unattractive vs Baseline'
      WHEN bps_12m_vs_36m > -25 THEN 'Unattractive vs Baseline'
      ELSE 'Highly Unattractive vs Baseline'
    END AS valuation_12m_vs_36m
    -- CASE
    --   WHEN bps_12m_vs_36m >= 25 THEN 'Extremely Cheap vs Baseline'
    --   WHEN bps_12m_vs_36m >= 10 THEN 'Very Cheap vs Baseline'
    --   WHEN bps_12m_vs_36m >= 1 THEN 'Slightly Cheap'
    --   WHEN bps_12m_vs_36m > -1 THEN 'At Baseline'
    --   WHEN bps_12m_vs_36m > -10 THEN 'Slightly Rich'
    --   WHEN bps_12m_vs_36m > -25 THEN 'Very Rich vs Baseline'
    --   ELSE 'Extremely Rich vs Baseline'
    -- END AS valuation_12m_vs_36m
  FROM calc_yield_momentum_spread
)
SELECT
  -- region_id,
  date AS month_end,
  -- size_rank,
  region_name,
  -- state_name,
  us.state_name_full,
  home_prices,
  rent_prices,
  ROUND(home_yoy_pct, 6) AS home_yoy_pct,
  ROUND(rent_yoy_pct, 6) AS rent_yoy_pct,
  ROUND(gross_yield_trailing_12m_avg, 6) AS gross_yield_12m_avg,
  bps_3m_vs_12m,
  momentum_3m_vs_12m,
  bps_12m_vs_36m,
  valuation_12m_vs_36m
FROM bps_momentum_valuation
LEFT JOIN "{SCHEMA_NAME}"."us_states" AS us
  ON state_name = us.state_code
WHERE
  -- state_name_full = 'Indiana'
  -- AND
  date = (SELECT MAX(date) FROM bps_momentum_valuation)
  -- Demand/cashflow health guardrail: require rent growth so high yields are not distress-driven.
  AND bps_3m_vs_12m > 10  -- yield improving recently (momentum)
  -- Yield trap guardrail: avoid markets where yield is rising only because rents are falling.
  AND rent_yoy_pct > 0
  AND rent_yoy_pct >= home_yoy_pct
ORDER BY
  gross_yield_trailing_12m_avg DESC, -- 1) highest yield first
  bps_3m_vs_12m DESC,                -- 2) fastest recent improvement
  bps_12m_vs_36m DESC,               -- 3) cheap vs longer baseline
  rent_yoy_pct DESC                  -- 4) strongest rent growth
