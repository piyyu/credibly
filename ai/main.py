from fastapi import FastAPI
from pydantic import BaseModel
import joblib, numpy as np, os

app = FastAPI()
model = joblib.load("model.pkl") if os.path.exists("model.pkl") else None

class VerifyRequest(BaseModel):
    requests_per_minute: float
    unique_ips: int
    geo_spread_score: float
    hour_of_day: int

@app.post("/detect")
def detect(req: VerifyRequest):
    if model is None:
        return {"anomaly": False, "note": "model not trained"}
    features = np.array([[
        req.requests_per_minute, req.unique_ips,
        req.geo_spread_score, req.hour_of_day
    ]])
    return {"anomaly": bool(model.predict(features)[0] == -1)}

@app.get("/health")
def health():
    return {"status": "ok"}
