import os
import uuid
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import us
from typing import Optional

import pandas as pd
import requests
from sqlalchemy import create_engine, text
from dotenv import load_dotenv


##

# ------- 3 SOURCE_URL MATCHING GRAINS CONFIG (edit here only) -------
DATASETS = [
    {
        "name": "zhvi",
        "source_url": "https://files.zillowstatic.com/research/public_csvs/zhvi/Metro_zhvi_uc_sfr_tier_0.33_0.67_sm_sa_month.csv",
        "raw_table": "raw_zillow_zhvi_sfr_smoothed_metro_us_monthly",
        "stg_table": "stg_zillow_zhvi_sfr_smoothed_metro_us_monthly",
        "metric_col": "home_prices",
        "distinct_key1": "region_id",
        "distinct_key2": "date",
        "metric_expr": "ROUND(CASE WHEN LOWER(j.value) IN ('', 'nan', 'null') THEN NULL ELSE j.value::numeric END, 2)",
    },
    {
        "name": "zori",
        "source_url": "https://files.zillowstatic.com/research/public_csvs/zori/Metro_zori_uc_sfr_sm_month.csv",
        "raw_table": "raw_zillow_zori_sfr_smoothed_metro_us_monthly",
        "stg_table": "stg_zillow_zori_sfr_smoothed_metro_us_monthly",
        "metric_col": "rent_prices",
        "distinct_key1": "region_id",
        "distinct_key2": "date",
        "metric_expr": "ROUND(CASE WHEN LOWER(j.value) IN ('', 'nan', 'null') THEN NULL ELSE j.value::numeric END, 2)",
    },
    {
        "name": "zordi",
        "source_url": "https://files.zillowstatic.com/research/public_csvs/zordi/Metro_zordi_uc_sfr_month.csv",
        "raw_table": "raw_zillow_demand_sfr_metro_us_monthly",
        "stg_table": "stg_zillow_demand_sfr_metro_us_monthly",
        "metric_col": "demand_index",
        "distinct_key1": "region_id",
        "distinct_key2": "date",
        "metric_expr": "CASE WHEN LOWER(j.value) IN ('', 'nan', 'null') THEN NULL ELSE j.value::int END",
    },
]


## POST JOIN AUDIT
# --- ADD THESE CONSTANTS NEAR THE TOP (after AUDIT_TABLE) ---
POST_JOIN_TABLE = "post_join_audit"


JOINS_DATASET = [
    {  # zhvi (base) x zori
        "join_name": "zhvi_x_zori",
        'left_table': "zhvi",
        'right_table': "zori",
        "left_stg": "stg_zillow_zhvi_sfr_smoothed_metro_us_monthly",
        "right_stg": "stg_zillow_zori_sfr_smoothed_metro_us_monthly",
        "key1": "region_id",
        "key2": "date",
        "left_metric": "home_prices",
        "right_metric": "rent_prices",
        "join_type": "INNER JOIN",
    },
    {  # zhvi (base) x zordi
        "join_name": "zhvi_x_zordi",
        'left_table': "zhvi",
        'right_table': "zordi",
        "left_stg": "stg_zillow_zhvi_sfr_smoothed_metro_us_monthly",
        "right_stg": "stg_zillow_demand_sfr_metro_us_monthly",
        "key1": "region_id",
        "key2": "date",
        "left_metric": "home_prices",
        "right_metric": "demand_index",
        "join_type": "INNER JOIN",
    },
]



LOCAL_DIR = Path("data/raw/zillow")
SCHEMA_NAME = "real_estate"

AUDIT_SCHEMA_NAME = "ops"
AUDIT_TABLE = "single_sheet_audit"


def download_file(url: str, out_path: Path, timeout: int = 60) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with requests.get(url, stream=True, timeout=timeout) as r:
        r.raise_for_status()
        with out_path.open("wb") as f:
            for chunk in r.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    f.write(chunk)


def sha256_file(path: Path, chunk_size: int = 1024 * 1024) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(chunk_size), b""):
            h.update(chunk)
    return h.hexdigest()


def print_single_sheet_audits(conn, run_id):
    rows = conn.execute(
        text("""
            SELECT dataset_name, status, reason, row_count, dupes, broken_keys,
                   metric_null_pct, min_date, max_date
            FROM ops.single_sheet_audit
            WHERE run_id = :run
            ORDER BY downloaded_at
        """),
        {"run": run_id},
    )
    print("\n🧾 SINGLE-SHEET AUDITS (this run):")
    for r in rows:
        print(
            f" - {r.dataset_name}: {r.status} rows={r.row_count} "
            f"dupes={r.dupes} broken={r.broken_keys} nulls={r.metric_null_pct}% "
            f"min={r.min_date} max={r.max_date} reason={r.reason}"
        )


def print_post_join_audits(conn, run_id):
    rows = conn.execute(
        text("""
            SELECT join_name, status, reason, fanout_dupes, row_preservation_delta,
                   base_metric_pct, metric_coverage_pct
            FROM ops.post_join_audit
            WHERE run_id = :run
            ORDER BY audited_at
        """),
        {"run": run_id},
    )
    print("\n🧾 POST-JOIN AUDITS (this run):")
    for r in rows:
        print(
            f" - {r.join_name}: {r.status} fanout={r.fanout_dupes} "
            f"delta_rows={r.row_preservation_delta} base_pct={r.base_metric_pct}% "
            f"join_pct={r.metric_coverage_pct}% reason={r.reason}"
        )


## Idempotency ingestion
def get_last_source_hash(conn, audit_schema: str, audit_table: str, dataset_name: str) -> Optional[str]:
    # Pull the most recent hash for this dataset from your audit log
    sql = text(f"""
        SELECT source_file_hash
        FROM "{audit_schema}"."{audit_table}"
        WHERE dataset_name = :dataset_name
          AND source_file_hash IS NOT NULL
          AND status IN ('pass', 'warn', 'skip')
          --AND hash_check_status IS DISTINCT FROM 'error'
        ORDER BY downloaded_at DESC
        LIMIT 1
        
    """)
    return conn.execute(sql, {"dataset_name": dataset_name}).scalar()

def main():
    load_dotenv()
    dsn = os.getenv("NEONPOSTGRES_URL")
    if not dsn:
        raise ValueError("Missing NEONPOSTGRES_URL in env/.env")

    # One run_id per cron execution (ties all datasets together)
    run_id = str(uuid.uuid4())
    run_started_at = datetime.now(timezone.utc)

    engine = create_engine(dsn)

    date_pat = r'^[[:digit:]]{4}-[[:digit:]]{2}-[[:digit:]]{2}$'
    rename_map = {
        "RegionID": "region_id",
        "SizeRank": "size_rank",
        "RegionName": "region_name",
        "StateName": "state_name",
    }

    with engine.begin() as conn:
        # Schemas
        conn.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{SCHEMA_NAME}";'))
        conn.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{AUDIT_SCHEMA_NAME}";'))

        # Ensure audit table has run_id + batch_id columns (idempotent migrations)
        conn.execute(text(
            f'ALTER TABLE IF EXISTS "{AUDIT_SCHEMA_NAME}"."{AUDIT_TABLE}" '
            f'ADD COLUMN IF NOT EXISTS run_id uuid;'
        ))
        conn.execute(text(
            f'ALTER TABLE IF EXISTS "{AUDIT_SCHEMA_NAME}"."{AUDIT_TABLE}" '
            f'ADD COLUMN IF NOT EXISTS batch_id uuid;'
        ))
        conn.execute(text(
            f'ALTER TABLE IF EXISTS "{AUDIT_SCHEMA_NAME}"."{AUDIT_TABLE}" '
            f'ADD COLUMN IF NOT EXISTS source_file_hash text;'
        ))
        conn.execute(text(
            f'ALTER TABLE IF EXISTS "{AUDIT_SCHEMA_NAME}"."{AUDIT_TABLE}" '
            f'ADD COLUMN IF NOT EXISTS hash_check_status text;'
        ))
        conn.execute(text(
            f'ALTER TABLE IF EXISTS "{AUDIT_SCHEMA_NAME}"."{AUDIT_TABLE}" '
            f'ADD COLUMN IF NOT EXISTS hash_check_details text;'
        ))

        print(f"🟣 RUN_ID: {run_id}")
        print(f"🕒 RUN_STARTED_AT (UTC): {run_started_at.isoformat()}")

        for ds in DATASETS:
            source_url = ds["source_url"]
            raw_table = ds["raw_table"]
            stg_table = ds["stg_table"]
            metric_col = ds["metric_col"]
            metric_expr = ds["metric_expr"]
            key1 = ds["distinct_key1"]
            key2 = ds["distinct_key2"]

            # One batch_id per dataset within the run
            batch_id = str(uuid.uuid4())
            pulled_at = run_started_at  # consistent timestamp across datasets in same run

            # 1) Download
            file_name = Path(source_url.split("?")[0]).name
            local_path = LOCAL_DIR / ds["name"] / file_name  # keep files separated by dataset

            print(f"\n================ {ds['name'].upper()} ================")
            print(f"🌐 Downloading: {source_url}")
            download_file(source_url, local_path)
            print(f"💾 Saved local copy: {local_path}")
            source_file_hash = sha256_file(local_path)
            print(f"🔐 SOURCE_FILE_HASH: {source_file_hash}")

            last_hash = get_last_source_hash(conn, AUDIT_SCHEMA_NAME, AUDIT_TABLE, stg_table)
            
            ##DO NOT DELETE OR TOUCH SECTION BELOW PLEASE WHERE SOURCE FILE HASH IS CHECKED
            # if last_hash == source_file_hash:
            #     print("⏭️ Hash unchanged → skipping RAW + STG build for this dataset.")
            #     hash_check_status = "unchanged"
            #     hash_check_details = "unchanged_hash"

            #     # We still write a full audit row (including status/reason) so nothing is blank.
            #     status = "skip"
            #     reason = "SKIP: unchanged source_file_hash"

            #     conn.execute(text(f"""
            #         INSERT INTO "{AUDIT_SCHEMA_NAME}"."{AUDIT_TABLE}" (
            #           dataset_name, audit_type, source_file_name, source_url,
            #           downloaded_at, local_path,
            #           run_id, batch_id,
            #           key1, key2, grain,
            #           status, reason,
            #           source_file_hash, hash_check_status, hash_check_details
            #         )
            #         VALUES (
            #           :dataset_name, 'hash_check', :source_file_name, :source_url,
            #           :downloaded_at, :local_path,
            #           CAST(:run_id AS uuid), CAST(:batch_id AS uuid),
            #           :key1, :key2, :grain,
            #           :status, :reason,
            #           :source_file_hash, :hash_check_status, :hash_check_details
            #         );
            #     """), {
            #         "dataset_name": stg_table,
            #         "source_file_name": file_name,
            #         "source_url": source_url,
            #         "downloaded_at": pulled_at.isoformat(),
            #         "local_path": str(local_path),
            #         "run_id": run_id,
            #         "batch_id": batch_id,
            #         "key1": key1,
            #         "key2": key2,
            #         "grain": f"({key1}, {key2})",
            #         "status": status,
            #         "reason": reason,
            #         "source_file_hash": source_file_hash,
            #         "hash_check_status": hash_check_status,
            #         "hash_check_details": hash_check_details,
            #     })

            #     continue

            # Hash changed (or no prior hash) → proceed with RAW + STG
            hash_check_status = "new" if last_hash else "first_seen"
            hash_check_details = "new_hash" if last_hash else "no_prior_hash"
            print(f"✅ Hash {hash_check_status} → proceeding with RAW + STG.")

            print(f"🟪 BATCH_ID: {batch_id}")

            # 2) RAW → write snapshot
            print("📂 Reading local CSV...")
            df = pd.read_csv(local_path)
            df = df.rename(columns=rename_map)

            # Stamp metadata in RAW
            df["pulled_at"] = pulled_at
            df["run_id"] = run_id
            df["batch_id"] = batch_id

            print(f"✅ Loaded {len(df):,} rows, {len(df.columns)} columns.")
            df.to_sql(
                name=raw_table,
                con=conn,
                schema=SCHEMA_NAME,
                if_exists="replace",   # later: switch to append + migrations
                index=False,
            )
            print(f"📤 Uploaded RAW to {SCHEMA_NAME}.{raw_table}")

            # 3) STG → build filtered/validated table
            print(f"🧱 Building STG table {SCHEMA_NAME}.{stg_table} ...")
            conn.execute(text(f'DROP TABLE IF EXISTS "{SCHEMA_NAME}"."{stg_table}";'))

            stg_sql_template = (Path(__file__).parent / "sql" / "stg_build.sql").read_text()
            stg_sql = stg_sql_template.format(
                SCHEMA_NAME=SCHEMA_NAME,
                stg_table=stg_table,
                raw_table=raw_table,
                metric_expr=metric_expr,
                metric_col=metric_col,
            )

            conn.execute(text(stg_sql), {"date_pat": date_pat})
            
            print(f"✅ STG table created: {SCHEMA_NAME}.{stg_table}")

            # Preview STG
            preview = conn.execute(text(
                f'SELECT * FROM "{SCHEMA_NAME}"."{stg_table}" ORDER BY date DESC LIMIT 5;'
            )).fetchall()

            print("👀 STG preview (top 5):")
            for row in preview:
                print(row)

            # 4) AUDIT → single-sheet stats
            print(f"🔍 Appending to AUDIT table {AUDIT_SCHEMA_NAME}.{AUDIT_TABLE} ...")

            audit_sql_template = (Path(__file__).parent / "sql" / "single_sheet_audit.sql").read_text()
            audit_sql = audit_sql_template.format(
                AUDIT_SCHEMA_NAME=AUDIT_SCHEMA_NAME,
                AUDIT_TABLE=AUDIT_TABLE,
                SCHEMA_NAME=SCHEMA_NAME,
                stg_table=stg_table,
                file_name=file_name,
                source_url=source_url,
                pulled_at=pulled_at.isoformat(),
                local_path=local_path,
                source_file_hash=source_file_hash,
                hash_check_status=hash_check_status,
                hash_check_details=hash_check_details,
                run_id=run_id,
                batch_id=batch_id,
                key1=key1,
                key2=key2,
                metric_col=metric_col,
            )

            conn.execute(text(audit_sql))
            print(f"✅ AUDIT row inserted into: {AUDIT_SCHEMA_NAME}.{AUDIT_TABLE}")
    

        # 5) AUDIT → post-join integrity checks
        # -------------------- POST JOIN AUDITS (INSERT INTO ops.post_join_audit) --------------------
        post_join_sql_template = (Path(__file__).parent / "sql" / "post_join_audit.sql").read_text()

        for pj in JOINS_DATASET:
            join_name = pj["join_name"]
            left_stg = pj["left_stg"]
            right_stg = pj["right_stg"]
            key1 = pj["key1"]
            key2 = pj["key2"]
            left_metric = pj["left_metric"]
            right_metric = pj["right_metric"]
            join_type = pj["join_type"]

            pj_batch_id = str(uuid.uuid4())
            audited_at = run_started_at

            print(f"👉 POST-JOIN AUDIT: {join_name} ({left_stg} {join_type} {right_stg})")

            post_join_sql = post_join_sql_template.format(
                AUDIT_SCHEMA_NAME=AUDIT_SCHEMA_NAME,
                POST_JOIN_TABLE=POST_JOIN_TABLE,
                SCHEMA_NAME=SCHEMA_NAME,
                left_stg=left_stg,
                right_stg=right_stg,
                join_type=join_type,
                key1=key1,
                key2=key2,
                left_metric=left_metric,
                right_metric=right_metric,
            )

            conn.execute(
                text(post_join_sql),
                {
                    "run_id": run_id,
                    "batch_id": pj_batch_id,
                    "audited_at": audited_at,
                    "join_name": join_name,
                },
            )
            print(f"✅ POST-JOIN audit row inserted: {join_name}")


        # 6) MART → build aggregates (only if audits pass)
        single_non_pass = conn.execute(text("""SELECT COUNT(*) FROM ops.single_sheet_audit WHERE run_id = CAST(:run_id AS uuid) AND status NOT IN ('pass', 'skip')"""), {"run_id": run_id}).scalar()
        post_non_pass = conn.execute(text("""SELECT COUNT(*) FROM ops.post_join_audit WHERE run_id = CAST(:run_id AS uuid) AND status <> 'pass' """), {"run_id": run_id}).scalar()

        if single_non_pass == 0 and post_non_pass == 0:
            mart_sql_path = Path(__file__).parent / "sql" / "mart_state_gross_yield.sql"
            mart_sql = mart_sql_path.read_text()
            horizons = (12, 36)  # last 12 months,  last 36 months

            for horizon in horizons:
                table = f'mart_us_previous_{horizon}M_state_date_avgs'
                conn.execute(text(f'DROP TABLE IF EXISTS "{SCHEMA_NAME}"."{table}";'))
                conn.execute(
                    text(f'CREATE TABLE "{SCHEMA_NAME}"."{table}" AS\n{mart_sql}'),
                    {"horizon_months": horizon},
                )

            tables = ", ".join(f'{SCHEMA_NAME}.mart_us_previous_{h}M_state_date_avgs' for h in horizons)
            print(f"✅ STATE-MART-BUILT SUCCESSFUL: {tables}")
        else:
            print(f"⏭️ Skipping mart build: audits not all pass (single_sheet non-pass={single_non_pass}, post_join non-pass={post_non_pass})")
        
        print_single_sheet_audits(conn, run_id)
        print_post_join_audits(conn, run_id)

    print("\n🎉 Done! All datasets processed.")


if __name__ == "__main__":
    main()
