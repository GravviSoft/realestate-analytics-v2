-- Gross yield by state over the most recent N months (parameter: :horizon_months)
WITH reusable_max_date AS (
  SELECT MAX(p.date) AS max_date
  FROM real_estate.stg_zillow_zhvi_sfr_smoothed_metro_us_monthly AS p
  JOIN real_estate.stg_zillow_zori_sfr_smoothed_metro_us_monthly AS r USING (region_id, date)
),

calc_avgs AS (
  SELECT
    p.state_name,
    MIN(p.date) AS min_date,
    MAX(p.date) AS max_date,
    AVG(r.rent_prices) AS avg_rent_prices,
    AVG(p.home_prices) AS avg_home_prices,
    (12 * AVG(r.rent_prices))::numeric / NULLIF(AVG(p.home_prices), 0) AS gross_yield
  FROM real_estate.stg_zillow_zhvi_sfr_smoothed_metro_us_monthly AS p
  JOIN real_estate.stg_zillow_zori_sfr_smoothed_metro_us_monthly AS r USING (region_id, date)
  CROSS JOIN reusable_max_date AS md
  WHERE p.date >= md.max_date - ((:horizon_months - 1) * INTERVAL '1 month')
  GROUP BY 1
)

SELECT
  state_name,
  us.state_name_full,
  min_date,
  max_date,
  ROUND(avg_rent_prices, 2) AS avg_rent_prices,
  ROUND(avg_home_prices, 2) AS avg_home_prices,
  ROUND(gross_yield, 4) AS avg_gross_yield,
  DENSE_RANK() OVER (ORDER BY gross_yield DESC) AS rank
FROM calc_avgs AS a
LEFT JOIN real_estate.us_states AS us
  ON a.state_name = us.state_code;
