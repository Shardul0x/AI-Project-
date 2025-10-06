from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import xgboost as xgb
import joblib
import torch
from typing import Dict
from datetime import datetime
import os

app = FastAPI(title="GPU-Accelerated Startup ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f"🚀 Running on: {DEVICE}")

if DEVICE == 'cuda':
    print(f"✓ GPU: {torch.cuda.get_device_name(0)}")

MODEL_DIR = "../models"

try:
    xgb_model = joblib.load(f'{MODEL_DIR}/xgboost_gpu_model.pkl')
    category_encoder = joblib.load(f'{MODEL_DIR}/category_encoder.pkl')
    location_encoder = joblib.load(f'{MODEL_DIR}/location_encoder.pkl')
    print("✓ Models loaded successfully")
except Exception as e:
    print(f"⚠ Model loading failed: {e}")
    xgb_model = None

class StartupInput(BaseModel):
    funding_total: float
    founded_year: int
    category: str
    location: str
    team_size: int
    funding_rounds: int
    monthly_revenue: float = 0
    user_growth_rate: float = 0.5
    burn_rate: float = 0
    market_size: float = 1000000

class PredictionOutput(BaseModel):
    probability: float
    prediction: str
    confidence: float
    explanation: Dict[str, float]
    processing_device: str

@app.post("/predict/success", response_model=PredictionOutput)
async def predict_success(startup: StartupInput):
    try:
        company_age = 2025 - startup.founded_year
        funding_per_round = startup.funding_total / (startup.funding_rounds + 1)
        funding_velocity = startup.funding_total / (company_age + 1)
        revenue_to_burn_ratio = startup.monthly_revenue / (startup.burn_rate + 1)
        funding_efficiency = startup.user_growth_rate * startup.funding_total / 1e6
        
        try:
            category_encoded = category_encoder.transform([startup.category])[0]
        except:
            category_encoded = 0
        
        try:
            location_encoded = location_encoder.transform([startup.location])[0]
        except:
            location_encoded = 0
        
        features = pd.DataFrame([{
            'funding_total': startup.funding_total,
            'founded_year': startup.founded_year,
            'team_size': startup.team_size,
            'funding_rounds': startup.funding_rounds,
            'monthly_revenue': startup.monthly_revenue,
            'user_growth_rate': startup.user_growth_rate,
            'burn_rate': startup.burn_rate,
            'market_size': startup.market_size,
            'company_age': company_age,
            'funding_per_round': funding_per_round,
            'funding_velocity': funding_velocity,
            'revenue_to_burn_ratio': revenue_to_burn_ratio,
            'funding_efficiency': funding_efficiency,
            'category_encoded': category_encoded,
            'location_encoded': location_encoded
        }])
        
        if xgb_model:
            dmatrix = xgb.DMatrix(features)
            probability = float(xgb_model.predict(dmatrix)[0]) * 100
        else:
            probability = calculate_rule_based_score(startup, company_age)
        
        explanation = {
            'funding_total': 0.25 if startup.funding_total > 1000000 else -0.10,
            'team_size': 0.15 if 5 <= startup.team_size <= 50 else -0.05,
            'company_age': 0.20 if 2 <= company_age <= 5 else 0.05,
            'funding_rounds': 0.12 if startup.funding_rounds > 0 else -0.08,
            'growth_rate': 0.18 if startup.user_growth_rate > 0.5 else -0.10
        }
        
        prediction = "Success" if probability >= 50 else "Risk"
        confidence = probability if probability >= 50 else (100 - probability)
        
        return PredictionOutput(
            probability=round(probability, 2),
            prediction=prediction,
            confidence=round(confidence, 2),
            explanation=explanation,
            processing_device=DEVICE
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def calculate_rule_based_score(startup, company_age):
    score = 0.0
    
    if startup.funding_total > 5000000:
        score += 30
    elif startup.funding_total > 1000000:
        score += 20
    
    if 5 <= startup.team_size <= 50:
        score += 20
    
    if 2 <= company_age <= 5:
        score += 20
    
    if 2 <= startup.funding_rounds <= 4:
        score += 15
    
    hot_categories = ['Technology', 'AI/ML', 'Fintech', 'SaaS']
    if startup.category in hot_categories:
        score += 15
    
    return min(score, 100)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "device": DEVICE,
        "cuda_available": torch.cuda.is_available(),
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
