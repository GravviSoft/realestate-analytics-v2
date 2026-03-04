import requests

URL = "https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query"

# Small test bbox (xmin,ymin,xmax,ymax) in lat/lon
# This one is around central Denver for a quick sanity check
BBOX = (-104.99, 39.72, -104.95, 39.76)

OUT_FIELDS = [
    "DFIRM_ID",
    "FLD_AR_ID",
    "STUDY_TYP",
    "FLD_ZONE",
    "ZONE_SUBTY",
    "SFHA_TF",
    "STATIC_BFE",
    "DEPTH",
    "GFID",
    "GlobalID",
]

params = {
    "where": "1=1",
    "geometry": ",".join(map(str, BBOX)),
    "geometryType": "esriGeometryEnvelope",
    "inSR": 4326,
    "spatialRel": "esriSpatialRelIntersects",
    "outFields": ",".join(OUT_FIELDS),
    "returnGeometry": "false",   # set to "true" later if you want polygons now
    "resultRecordCount": 10,     # just grab a few
    "f": "geojson",
}

r = requests.get(URL, params=params, timeout=60)
r.raise_for_status()
data = r.json()

# ArcGIS sometimes returns errors as JSON
if "error" in data:
    raise RuntimeError(data["error"])

features = data.get("features", [])
print(f"Features returned: {len(features)}")

if not features:
    print("No features in this bbox. Try expanding the bbox.")
else:
    # Print field names from the first feature
    props = features[0].get("properties", {})
    print("\nFields (properties keys):")
    print(sorted(props.keys()))

    print("\nSample rows:")
    for i, f in enumerate(features[:5], start=1):
        p = f.get("properties", {})
        print(f"\nRow {i}:")
        for k in OUT_FIELDS:
            print(f"  {k}: {p.get(k)}")