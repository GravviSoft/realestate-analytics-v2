from sqlalchemy import create_engine, text
from dotenv import load_dotenv
from geopy.geocoders import ArcGIS
import os
import time

load_dotenv()

engine = create_engine(os.getenv("NEONPOSTGRES_URL"))
geolocator = ArcGIS(timeout=10)


def geocode_region(region_name: str):
    location = geolocator.geocode(f"{region_name}, USA")
    if not location:
        return None, None
    return location.latitude, location.longitude


def sync_and_geocode_us_regions():
    create_table_sql = text("""
        CREATE TABLE IF NOT EXISTS real_estate.us_regions (
            region_id BIGSERIAL PRIMARY KEY,
            region_name TEXT NOT NULL UNIQUE,
            latitude DOUBLE PRECISION,
            longitude DOUBLE PRECISION
        );
    """)

    insert_new_regions_sql = text("""
        INSERT INTO real_estate.us_regions (region_name)
        SELECT DISTINCT TRIM(region_name) AS region_name
        FROM real_estate.stg_zillow_zhvi_sfr_smoothed_metro_us_monthly
        WHERE region_name IS NOT NULL
        ON CONFLICT (region_name) DO NOTHING;
    """)

    select_missing_lat_lon_sql = text("""
        SELECT region_id, region_name
        FROM real_estate.us_regions
        WHERE latitude IS NULL
           OR longitude IS NULL
        ORDER BY region_id;
    """)

    update_lat_lon_sql = text("""
        UPDATE real_estate.us_regions
        SET latitude = :latitude,
            longitude = :longitude
        WHERE region_id = :region_id;
    """)

    with engine.begin() as conn:
        conn.execute(create_table_sql)
        conn.execute(insert_new_regions_sql)
        rows = conn.execute(select_missing_lat_lon_sql).fetchall()

        print(f"Regions needing geocoding: {len(rows)}")

        for row in rows:
            lat, lon = geocode_region(row.region_name)

            if lat is None or lon is None:
                print(f"Could not geocode: {row.region_name}")
                continue

            conn.execute(
                update_lat_lon_sql,
                {
                    "region_id": row.region_id,
                    "latitude": lat,
                    "longitude": lon,
                },
            )

            print(f"Updated: {row.region_name} -> ({lat}, {lon})")
            time.sleep(0.25)


if __name__ == "__main__":
    sync_and_geocode_us_regions()