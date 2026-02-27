# Real Estate Analytics Platform (Portfolio)

Production-style demo: containerized data pipeline (Zillow), quality gates, and a React + Metabase dashboard, fronted by Traefik/HTTPS.

## Overview
- **Pipeline** (jobs/zillow): nightly Dockerized cron pulls Zillow public CSVs, hashes each file, loads RAW→STG, runs audits (single-sheet + post-join), and only builds marts when audits pass.
- **Backend**: Flask API (Metabase token endpoint, health), CORS allowlist per env.
- **Frontend**: React app embedding Metabase dashboards; Nginx-served; build-time API base via `REACT_APP_API_URL`.
- **Infra**: Docker Compose; Traefik routing (web/websecure), env-driven config; Postgres (Neon) as warehouse.

## Run locally
```bash
docker compose -f docker-compose.dev.yml up --build
# frontend: http://localhost:3001, backend: http://localhost:4001
```

## Deploy (Traefik/HTTPS)
```bash
REACT_APP_API_URL=https://your-domain/api docker compose up -d --build
```
Set in `backend/.env`: `ALLOWED_ORIGINS`, `METABASE_SECRET_KEY`, `METABASE_SITE_URL`, `METABASE_DASHBOARD_ID`, DB creds. CORS defaults include prod + localhost.

## Key features
- Hash-based idempotency and skip logic (see jobs/zillow/README.md).
- Audits: single-sheet (keys/dupes/nulls/month-end/metric null pct) and post-join (fanout, row preservation, coverage).
- Observability: run_id + batch_id on all loads; Metabase dashboards for statuses, hashes, and join checks.
- Hygiene: `.env` files ignored; `.env.example` templates; HTTPS and CORS configured.

## Repo map
- `frontend/` React dashboard (Metabase embed, Nginx)
- `backend/` Flask API (token, health, CORS)
- `jobs/zillow/` Pipeline code, SQL templates, job README
- `docker-compose.yml` Traefik-facing stack; `docker-compose.dev.yml` local dev

## Data sources (Zillow)
- Overview: https://www.zillow.com/research/data
- ZHVI: https://files.zillowstatic.com/research/public_csvs/zhvi/Metro_zhvi_uc_sfr_tier_0.33_0.67_sm_sa_month.csv
- ZORI: https://files.zillowstatic.com/research/public_csvs/zori/Metro_zori_uc_sfr_sm_month.csv
- ZORDI: https://files.zillowstatic.com/research/public_csvs/zordi/Metro_zordi_uc_sfr_month.csv
