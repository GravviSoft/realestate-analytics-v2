-- Post-join audit insertion for a single join definition
INSERT INTO "{AUDIT_SCHEMA_NAME}"."{POST_JOIN_TABLE}" (
  run_id, batch_id, audited_at,
  join_name,
  base_table_rows, join_table_rows, rows_preserved, row_preservation_delta,
  distinct_keys, fanout_dupes,
  base_metric_coverage, base_metric_pct,
  metric_coverage, metric_coverage_pct,
  left_table, right_table, join_grain, status, reason
)
WITH join_sheet AS (
  SELECT
    h.{key1},
    h.{key2},
    h.{left_metric}  AS base_metric,
    r.{right_metric} AS right_metric
  FROM "{SCHEMA_NAME}"."{left_stg}" AS h
  {join_type} "{SCHEMA_NAME}"."{right_stg}" AS r
    USING ({key1}, {key2})
),
counts AS (
  SELECT
    (SELECT COUNT(*) FROM "{SCHEMA_NAME}"."{left_stg}") AS base_table_rows,
    (SELECT COUNT(*) FROM join_sheet)                   AS join_table_rows
),
row_preservation AS (
  SELECT
    :join_name AS join_name,
    base_table_rows,
    join_table_rows,
    base_table_rows = join_table_rows AS rows_preserved,
    join_table_rows - base_table_rows AS row_preservation_delta
  FROM counts
),
fanout_metric_check AS (
  SELECT
    :join_name AS join_name,
    COUNT(DISTINCT ({key1}, {key2})) AS distinct_keys,
    COUNT(*) - COUNT(DISTINCT ({key1}, {key2})) AS fanout_dupes,
    COUNT(*) FILTER (WHERE base_metric  IS NOT NULL) AS base_metric_coverage,
    ROUND(100.0 * COUNT(*) FILTER (WHERE base_metric  IS NOT NULL) / NULLIF(COUNT(*),0), 3) AS base_metric_pct,
    COUNT(*) FILTER (WHERE right_metric IS NOT NULL) AS metric_coverage,
    ROUND(100.0 * COUNT(*) FILTER (WHERE right_metric IS NOT NULL) / NULLIF(COUNT(*),0), 3) AS metric_coverage_pct
  FROM join_sheet
)
SELECT
  CAST(:run_id AS uuid) AS run_id,
  CAST(:batch_id AS uuid) AS batch_id,
  CAST(:audited_at AS timestamptz) AS audited_at,
  rp.join_name,
  rp.base_table_rows,
  rp.join_table_rows,
  rp.rows_preserved,
  rp.row_preservation_delta,
  f.distinct_keys,
  f.fanout_dupes,
  f.base_metric_coverage,
  f.base_metric_pct,
  f.metric_coverage,
  f.metric_coverage_pct,
  '{left_stg}' AS left_table,
  '{right_stg}' AS right_table,
  '({key1}, {key2})' AS join_grain,
  CASE
    WHEN '{join_type}' = 'LEFT JOIN' AND rp.row_preservation_delta IS DISTINCT FROM 0 THEN 'fail'
    WHEN f.fanout_dupes IS DISTINCT FROM 0 THEN 'fail'
    WHEN f.metric_coverage_pct < 100.0 THEN 'warn'
    ELSE 'pass'
  END AS status,
  COALESCE(
    NULLIF(TRIM(BOTH '; ' FROM CONCAT_WS('; ',
      CASE WHEN '{join_type}' = 'LEFT JOIN' AND rp.row_preservation_delta IS DISTINCT FROM 0 THEN 'FAIL: rows not preserved (fan-out risk)' END,
      CASE WHEN f.fanout_dupes IS DISTINCT FROM 0 THEN 'FAIL: fanout duplicates detected' END,
      CASE WHEN f.metric_coverage_pct < 100.0 THEN 'WARN: metric coverage is under 100%' END
    )), ''),
    'PASS: all checks ok'
  ) AS reason
FROM row_preservation rp
JOIN fanout_metric_check f USING (join_name);
