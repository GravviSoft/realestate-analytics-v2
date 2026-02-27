-- Single-sheet audit insert for a STG table
WITH audit_stats AS (
  SELECT
    '{stg_table}' AS dataset_name,
    'stg_load' AS audit_type,
    '{file_name}' AS source_file_name,
    '{source_url}' AS source_url,
    '{pulled_at}'::timestamptz AS downloaded_at,
    '{local_path}' AS local_path,
    '{source_file_hash}' AS source_file_hash,
    '{hash_check_status}' AS hash_check_status,
    '{hash_check_details}' AS hash_check_details,
    '{run_id}'::uuid AS run_id,
    '{batch_id}'::uuid AS batch_id,

    COUNT(*) AS row_count,
    COUNT(DISTINCT ({key1}, {key2}))
      FILTER (WHERE {key1} IS NOT NULL AND {key2} IS NOT NULL) AS distinct_joinable_keys,
    COUNT(*) FILTER (WHERE {key1} IS NOT NULL AND {key2} IS NOT NULL) AS total_joinable_keys,

    (
      COUNT(*) FILTER (WHERE {key1} IS NOT NULL AND {key2} IS NOT NULL)
      - COUNT(DISTINCT ({key1}, {key2}))
        FILTER (WHERE {key1} IS NOT NULL AND {key2} IS NOT NULL)
    ) AS dupes,

    COUNT(*) FILTER (WHERE {key1} IS NULL OR {key2} IS NULL) AS broken_keys,

    MIN({key2}) AS min_date,
    MAX({key2}) AS max_date,

    COUNT(*) FILTER (
      WHERE {key2} = (date_trunc('month', {key2}) + INTERVAL '1 month - 1 day')::date
    ) AS month_end_dates,

    COUNT(*) FILTER (
      WHERE {key2} IS DISTINCT FROM (date_trunc('month', {key2}) + INTERVAL '1 month - 1 day')::date
    ) AS not_month_end_dates,

    COUNT(*) FILTER (WHERE {metric_col} IS NULL) AS metric_nulls,
    ROUND(COUNT(*) FILTER (WHERE {metric_col} IS NULL)::numeric / NULLIF(COUNT(*), 0), 3) * 100 AS metric_null_pct,

    COUNT(DISTINCT {key1}) AS distinct_key1_count,
    COUNT(*) FILTER (WHERE {key1} IS NULL) AS key1_nulls,
    COUNT(DISTINCT {key2}) AS distinct_key2_count,
    COUNT(*) FILTER (WHERE {key2} IS NULL) AS key2_nulls,

    '{key1}' AS key1,
    '{key2}' AS key2,
    '({key1}, {key2})' AS grain
  FROM "{SCHEMA_NAME}"."{stg_table}"
)
INSERT INTO "{AUDIT_SCHEMA_NAME}"."{AUDIT_TABLE}" (
    dataset_name, audit_type, source_file_name, source_url, source_file_hash,
    downloaded_at, local_path,
    run_id, batch_id,
    row_count, distinct_joinable_keys, dupes, broken_keys,
    min_date, max_date, month_end_dates, not_month_end_dates,
    metric_nulls, metric_null_pct,
    distinct_key1_count, key1_nulls, distinct_key2_count, key2_nulls,
    key1, key2, grain, hash_check_status, hash_check_details,
    status, reason
    )
    SELECT
    dataset_name,
    audit_type,
    source_file_name,
    source_url,
    source_file_hash,
    downloaded_at,
    local_path,
    run_id,
    batch_id,
    row_count,
    distinct_joinable_keys,
    dupes,
    broken_keys,
    min_date,
    max_date,
    month_end_dates,
    not_month_end_dates,
    metric_nulls,
    metric_null_pct,
    distinct_key1_count,
    key1_nulls,
    distinct_key2_count,
    key2_nulls,
    key1,
    key2,
    grain,
    hash_check_status,
    hash_check_details,
    CASE
        WHEN dupes > 0 OR broken_keys > 0 OR total_joinable_keys <> row_count THEN 'fail'
        WHEN not_month_end_dates > 0 OR COALESCE(metric_null_pct, 0) > 1.0 THEN 'warn'
        ELSE 'pass'
    END AS status,
    COALESCE(
        NULLIF(TRIM(BOTH '; ' FROM CONCAT_WS('; ',
        CASE WHEN dupes > 0 THEN 'FAIL: dupes > 0 (fan-out risk)' END,
        CASE WHEN broken_keys > 0 THEN 'FAIL: broken keys (null join keys)' END,
        CASE WHEN total_joinable_keys <> row_count THEN 'FAIL: non-joinable rows exist' END,
        CASE WHEN not_month_end_dates > 0 THEN 'WARN: not month-end dates present' END,
        CASE WHEN COALESCE(metric_null_pct, 0) > 1.0 THEN 'WARN: metric_null_pct > 1%' END,
        CASE WHEN max_date IS NULL THEN 'FAIL: max_date is NULL (no data loaded)' END
        )), ''),
        'PASS: all checks ok'
    ) AS reason
    FROM audit_stats;
