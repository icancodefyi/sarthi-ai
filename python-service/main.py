"""
Sarthi AI — Python Analytics Engine
FastAPI service for CSV parsing and real statistical processing.
"""

import os
import io
import math
from typing import Optional
from datetime import datetime

import numpy as np
import pandas as pd
from scipy import stats
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env.local"))

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = "sarthi-ai"

mongo_client = MongoClient(MONGODB_URI)
db = mongo_client[DB_NAME]

app = FastAPI(title="Sarthi AI Analytics Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request/Response Models ─────────────────────────────────────────────────


class ProcessRequest(BaseModel):
    dataset_id: str


class AnalyticsResponse(BaseModel):
    success: bool
    dataset_id: str
    analytics: Optional[dict] = None
    error: Optional[str] = None


# ─── Analytics Engine ─────────────────────────────────────────────────────────


def compute_analytics(csv_content: str) -> dict:
    df = pd.read_csv(io.StringIO(csv_content))
    df.columns = df.columns.str.strip()

    total_records = len(df)
    columns = df.columns.tolist()

    # ── Date range ──
    date_range = None
    date_cols = df.select_dtypes(include=["datetime64"]).columns.tolist()
    # Try to auto-detect date columns
    for col in df.columns:
        try:
            parsed = pd.to_datetime(df[col], infer_datetime_format=True, errors="coerce")
            if parsed.notna().sum() > total_records * 0.5:
                date_range = {
                    "min": str(parsed.min().date()),
                    "max": str(parsed.max().date()),
                }
                break
        except Exception:
            continue

    # ── Numeric summary ──
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    numeric_summary = {}
    for col in numeric_cols:
        series = df[col].dropna()
        if len(series) == 0:
            continue
        numeric_summary[col] = {
            "mean": round(float(series.mean()), 4),
            "variance": round(float(series.var()), 4),
            "min": round(float(series.min()), 4),
            "max": round(float(series.max()), 4),
            "stdDev": round(float(series.std()), 4),
        }

    # ── Growth % (based on first numeric column, first vs last value) ──
    growth_percent = None
    if numeric_cols:
        primary_col = numeric_cols[0]
        series = df[primary_col].dropna()
        if len(series) >= 2:
            first_val = float(series.iloc[0])
            last_val = float(series.iloc[-1])
            if first_val != 0:
                growth_percent = round(((last_val - first_val) / abs(first_val)) * 100, 2)

    # ── Moving averages (window = 7) ──
    moving_averages = {}
    for col in numeric_cols[:3]:  # Limit to first 3 numeric cols
        series = df[col].dropna()
        if len(series) >= 7:
            ma = series.rolling(window=7).mean().dropna()
            moving_averages[col] = [round(v, 4) for v in ma.tolist()]

    # ── Anomaly detection (Z-score > 2.5) ──
    anomalies = []
    for col in numeric_cols:
        series = df[col].dropna()
        if len(series) < 10:
            continue
        z_scores = np.abs(stats.zscore(series))
        anomaly_indices = np.where(z_scores > 2.5)[0]
        for idx in anomaly_indices[:10]:  # Cap at 10 per column
            original_idx = series.index[idx]
            anomalies.append({
                "rowIndex": int(original_idx),
                "column": col,
                "value": round(float(series.iloc[idx]), 4),
                "zScore": round(float(z_scores[idx]), 4),
                "label": f"Outlier in {col} at row {original_idx}",
            })

    # ── Risk score (composite: based on anomaly density + variance spread) ──
    risk_score = 0.0
    if total_records > 0:
        anomaly_density = len(anomalies) / total_records
        variance_spread = 0.0
        if numeric_summary:
            variances = [v["variance"] for v in numeric_summary.values() if v["variance"] > 0]
            if variances:
                variance_spread = min(np.mean(variances) / (np.mean(variances) + 1), 1.0)
        risk_score = round(min((anomaly_density * 60 + variance_spread * 40), 100), 1)

    # ── Forecast (linear regression on first numeric col, next 5 periods) ──
    forecast = []
    if numeric_cols:
        primary_col = numeric_cols[0]
        series = df[primary_col].dropna()
        n = len(series)
        if n >= 5:
            x = np.arange(n)
            y = series.values
            slope, intercept, _, _, _ = stats.linregress(x, y)
            for i in range(1, 6):
                period = n + i
                predicted = slope * period + intercept
                forecast.append({
                    "period": period,
                    "value": round(float(predicted), 4),
                    "label": f"Period +{i}",
                })

    return {
        "totalRecords": total_records,
        "dateRange": date_range,
        "columns": columns,
        "numericSummary": numeric_summary,
        "growthPercent": growth_percent,
        "movingAverages": moving_averages,
        "anomalies": anomalies,
        "riskScore": risk_score,
        "forecast": forecast,
    }


# ─── Routes ──────────────────────────────────────────────────────────────────


@app.get("/health")
def health():
    return {"status": "ok", "service": "sarthi-analytics"}


@app.post("/process", response_model=AnalyticsResponse)
def process_dataset(req: ProcessRequest):
    """
    Pull CSV content from MongoDB by dataset_id,
    run analytics, update the dataset document, return results.
    """
    try:
        dataset = db["datasets"].find_one({"_id": req.dataset_id})
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")

        csv_content = dataset.get("csvContent")
        if not csv_content:
            raise HTTPException(status_code=400, detail="No CSV content stored for this dataset")

        analytics = compute_analytics(csv_content)

        db["datasets"].update_one(
            {"_id": req.dataset_id},
            {
                "$set": {
                    "analytics": analytics,
                    "status": "analyzed",
                    "updatedAt": datetime.utcnow(),
                    "metadata.rowCount": analytics["totalRecords"],
                    "metadata.columns": analytics["columns"],
                    "metadata.columnCount": len(analytics["columns"]),
                }
            },
        )

        return AnalyticsResponse(
            success=True,
            dataset_id=req.dataset_id,
            analytics=analytics,
        )

    except HTTPException:
        raise
    except Exception as e:
        db["datasets"].update_one(
            {"_id": req.dataset_id},
            {"$set": {"status": "failed", "updatedAt": datetime.utcnow()}},
        )
        return AnalyticsResponse(success=False, dataset_id=req.dataset_id, error=str(e))


class SimulateRequest(BaseModel):
    dataset_id: str
    forecast_periods: int = 5
    z_threshold: float = 2.5
    growth_adjustment: float = 0.0  # % adjustment applied to forecast values


@app.post("/simulate")
def simulate_dataset(req: SimulateRequest):
    """
    Re-run a subset of analytics with user-supplied parameters.
    Does NOT persist to DB — returns live results only.
    """
    try:
        dataset = db["datasets"].find_one({"_id": req.dataset_id})
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")

        csv_content = dataset.get("csvContent")
        if not csv_content:
            raise HTTPException(status_code=400, detail="No CSV content stored")

        df = pd.read_csv(io.StringIO(csv_content))
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()

        result: dict = {
            "forecastPeriods": req.forecast_periods,
            "zThreshold": req.z_threshold,
            "growthAdjustment": req.growth_adjustment,
            "forecast": [],
            "filteredAnomalies": [],
            "filteredRiskScore": 0.0,
            "filteredAnomalyCount": 0,
        }

        if not numeric_cols:
            return result

        primary_col = numeric_cols[0]
        series = df[primary_col].dropna()
        n = len(series)

        # Re-forecast with requested periods
        if n >= 5:
            x = np.arange(n)
            y = series.values
            slope, intercept, _, _, _ = stats.linregress(x, y)
            for i in range(1, req.forecast_periods + 1):
                period = n + i
                predicted = slope * period + intercept
                # Apply growth adjustment
                adjusted = predicted * (1 + req.growth_adjustment / 100)
                result["forecast"].append({
                    "period": period,
                    "value": round(float(adjusted), 4),
                    "label": f"Period +{i}",
                })

        # Re-detect anomalies with custom threshold
        anomalies = []
        for col in numeric_cols:
            col_series = df[col].dropna()
            if len(col_series) < 10:
                continue
            z_scores = np.abs(stats.zscore(col_series))
            anomaly_indices = np.where(z_scores > req.z_threshold)[0]
            for idx in anomaly_indices[:10]:
                original_idx = col_series.index[idx]
                anomalies.append({
                    "rowIndex": int(original_idx),
                    "column": col,
                    "value": round(float(col_series.iloc[idx]), 4),
                    "zScore": round(float(z_scores[idx]), 4),
                    "label": f"Outlier in {col} at row {original_idx}",
                })

        total_records = len(df)
        anomaly_density = len(anomalies) / total_records if total_records > 0 else 0
        result["filteredAnomalies"] = anomalies
        result["filteredAnomalyCount"] = len(anomalies)
        result["filteredRiskScore"] = round(min(anomaly_density * 100, 100), 1)

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
