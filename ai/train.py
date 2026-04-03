import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib
import os

os.makedirs("data", exist_ok=True)
df = pd.read_csv("data/logs.csv")
features = df[["requests_per_minute", "unique_ips", "geo_spread_score", "hour_of_day"]]
model = IsolationForest(contamination=0.05, random_state=42)
model.fit(features)
joblib.dump(model, "model.pkl")
print("Model saved.")
