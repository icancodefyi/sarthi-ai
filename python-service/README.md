# Sarthi AI — Python Analytics Service

## Setup

```bash
cd python-service

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Run

```bash
python main.py
# or
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Service runs at: **http://localhost:8000**

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/process` | Process a dataset by ID (reads from MongoDB, updates back) |

## POST /process

```json
{
  "dataset_id": "<uuid-string>"
}
```

Returns computed analytics and updates the MongoDB `datasets` document.

## What it computes

- Total records
- Date range detection
- Mean / variance / std dev / min / max per numeric column
- Growth % (first vs last value)
- Moving averages (7-period window)
- Anomaly detection (Z-score > 2.5)
- Risk score (composite)
- Forecast (5-period linear regression)
