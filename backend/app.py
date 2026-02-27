from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import time
import jwt

load_dotenv()

app = Flask(__name__)

allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "https://gravvisoft.com,http://localhost:3001"
)
CORS(app, origins=[o.strip() for o in allowed_origins.split(",") if o.strip()])

METABASE_SECRET_KEY = os.getenv("METABASE_SECRET_KEY")
METABASE_SITE_URL = os.getenv("METABASE_SITE_URL", "https://dash.gravvisoft.com")
METABASE_DASHBOARD_ID = int(os.getenv("METABASE_DASHBOARD_ID", "3"))


@app.route("/health")
def health():
    return jsonify({"status": "ok", "service": "flask-app-backend"})


@app.route("/example")
def example():
    return jsonify({"message": "Hello from flask-app backend"})


@app.route("/api/metabase/token")
@app.route("/metabase/token")
def metabase_token():
    if not METABASE_SECRET_KEY:
        return jsonify({"error": "METABASE_SECRET_KEY is not configured"}), 500

    payload = {
        "resource": {"dashboard": METABASE_DASHBOARD_ID},
        "params": {},
        "exp": round(time.time()) + (60 * 10),  # 10-minute expiration
    }
    token = jwt.encode(payload, METABASE_SECRET_KEY, algorithm="HS256")
    if isinstance(token, bytes):
        token = token.decode("utf-8")

    return jsonify({"token": token, "instanceUrl": METABASE_SITE_URL})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7000))
    app.run(host="0.0.0.0", port=port)
