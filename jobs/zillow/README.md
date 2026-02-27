<!-- 
-- (SANITY CHECK) whenever you update the code use no cache 
docker compose -f docker-compose.dev.yml build --no-cache zillow_job
docker compose -f docker-compose.dev.yml run --rm zillow_job 

-->

# Zillow job (audit + mart pipeline)

What it does
- Downloads Zillow CSVs (ZHVI, ZORI, ZORDI), hashes each file, and loads RAW → STG tables.
- Runs single-sheet audits (keys, dupes, nulls, month-end dates, metric null %) and post-join audits (fanout, row preservation, coverage).
- Builds mart tables only when all audits for the run pass.
- Writes audit rows with `run_id` (per job) and `batch_id` (per dataset in the run) for traceability.

Idempotent ingestion & lineage (SHA-256)
- Compute SHA-256 per downloaded CSV.
- If the newest hash matches the last processed hash for that dataset, skip RAW/STG rebuild (still log audit).
- Every run logs `run_id`, `batch_id`, `source_url`, `local_path`, `source_file_hash`, `hash_check_status` so outputs are reproducible.

Example (single_sheet_audit)
| downloaded_at | dataset_name | source_file_name | source_file_hash | status |
| --- | --- | --- | --- | --- |
| 2026-02-20 | stg_zillow_zori_sfr_smoothed_metro_us_monthly | Metro_zori…csv | a3f…9c1 | pass |
| 2026-02-21 | stg_zillow_zori_sfr_smoothed_metro_us_monthly | Metro_zori…csv | a3f…9c1 | skip (unchanged) |
| 2026-02-22 | stg_zillow_zori_sfr_smoothed_metro_us_monthly | Metro_zori…csv | b71…e02 | pass |

How to run (dev)
```bash
docker compose -f docker-compose.dev.yml build --no-cache zillow_job
docker compose -f docker-compose.dev.yml run --rm zillow_job
```

Key env vars (backend/.env)
- `NEONPOSTGRES_URL` (or your Postgres DSN)
- `METABASE_SECRET_KEY`, `METABASE_SITE_URL`, `METABASE_DASHBOARD_ID` (for the dashboard token API)
- `ALLOWED_ORIGINS` (CORS allowlist; includes localhost by default)

Outputs
- RAW tables: `real_estate.raw_*`
- STG tables: `real_estate.stg_*`
- Audits: `ops.single_sheet_audit`, `ops.post_join_audit`
- Marts: `real_estate.mart_us_previous_XXM_state_date_avgs` (built when audits pass)

Notes
- Hash gating avoids redundant reloads on unchanged files.
- Preview samples and audit stats print to stdout; full details land in the audit tables for dashboards.
