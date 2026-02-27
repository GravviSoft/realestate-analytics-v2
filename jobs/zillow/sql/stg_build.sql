-- Build STG table for a Zillow dataset
-- Identifiers substituted by Python; values passed as bind params.
                           
-- grain: one row per (region_id, month_end_date)
-- completeness rule: only regions with 36 non-null months retained 
CREATE TABLE "{SCHEMA_NAME}"."{stg_table}" AS
WITH long AS (
  SELECT
    p.region_id,
    p.size_rank,
    p.region_name,
    p.state_name,
    p.pulled_at,
    p.run_id,
    p.batch_id,
    j.key::date AS date,
    {metric_expr} AS {metric_col}
  FROM "{SCHEMA_NAME}"."{raw_table}" AS p
  CROSS JOIN LATERAL json_each_text(to_json(p)) AS j(key, value)
  WHERE j.key ~ :date_pat
    AND p.state_name IS NOT NULL
),
max_date_sheet AS (
  SELECT l.*, MAX(l.date) OVER () AS max_date
  FROM long l
),
previous_36M_filter AS (
  SELECT
    region_id, size_rank, region_name, state_name,
    pulled_at, run_id, batch_id,
    date, {metric_col}
  FROM max_date_sheet
  -- last 36 AVAILABLE month-ends (handles Zillow lag automatically)
  WHERE date >= (max_date - INTERVAL '35 months')
  
  ),
complete_regions AS (
  -- Data quality gate: keep only regions with a complete 36-month, non-null time series
  SELECT
    region_id 
  FROM 
    previous_36M_filter
  GROUP BY 1
  HAVING COUNT(DISTINCT date) FILTER (WHERE {metric_col} IS NOT NULL) = 36
)

SELECT
  region_id, size_rank, region_name, state_name,
  pulled_at, run_id, batch_id,
  date, {metric_col}
FROM
  previous_36M_filter AS p
WHERE EXISTS (
  SELECT 1 
  FROM 
    complete_regions AS c
  WHERE 
    c.region_id = p.region_id
)
