import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import xgboost as xgb
import joblib
import os
import time
import torch

print("="*70)
print("GPU-ACCELERATED STARTUP SUCCESS PREDICTION MODEL TRAINING")
print("="*70)

# Check CUDA availability
print("\n[GPU CHECK]")
print(f"✓ CUDA Available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"✓ GPU Device: {torch.cuda.get_device_name(0)}")
    print(f"✓ GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")
else:
    print("⚠ CUDA not available, using CPU")

os.makedirs('../models', exist_ok=True)

def create_synthetic_dataset(n_samples=10000):
    print(f"\n[DATASET CREATION]")
    print(f"Generating {n_samples:,} samples...")
    
    np.random.seed(42)
    
    categories = ['Technology', 'Healthcare', 'Fintech', 'E-commerce', 
                  'Education', 'SaaS', 'AI/ML', 'Blockchain', 'Other']
    
    locations = ['San Francisco', 'New York', 'Boston', 'Austin', 
                 'London', 'Berlin', 'Singapore', 'Bangalore']
    
    data = {
        'funding_total': np.random.lognormal(13, 2.5, n_samples),
        'founded_year': np.random.randint(2010, 2024, n_samples),
        'team_size': np.random.randint(2, 150, n_samples),
        'funding_rounds': np.random.randint(0, 8, n_samples),
        'monthly_revenue': np.random.lognormal(10, 2, n_samples),
        'user_growth_rate': np.random.uniform(-0.2, 2.5, n_samples),
        'burn_rate': np.random.lognormal(11, 1.8, n_samples),
        'market_size': np.random.lognormal(15, 2, n_samples),
        'category': np.random.choice(categories, n_samples),
        'location': np.random.choice(locations, n_samples),
    }
    
    df = pd.DataFrame(data)
    
    # Feature engineering
    df['company_age'] = 2025 - df['founded_year']
    df['funding_per_round'] = df['funding_total'] / (df['funding_rounds'] + 1)
    df['funding_velocity'] = df['funding_total'] / (df['company_age'] + 1)
    df['revenue_to_burn_ratio'] = df['monthly_revenue'] / (df['burn_rate'] + 1)
    df['funding_efficiency'] = df['user_growth_rate'] * df['funding_total'] / 1e6
    
    # Create target
    df['success_score'] = (
        (df['funding_total'] > df['funding_total'].median()).astype(int) * 20 +
        (df['funding_rounds'] >= 2).astype(int) * 15 +
        ((df['team_size'] >= 5) & (df['team_size'] <= 80)).astype(int) * 15 +
        ((df['company_age'] >= 2) & (df['company_age'] <= 6)).astype(int) * 15 +
        (df['user_growth_rate'] > 0.5).astype(int) * 15 +
        (df['revenue_to_burn_ratio'] > 0.5).astype(int) * 10 +
        df['category'].isin(['Technology', 'AI/ML', 'Fintech', 'SaaS']).astype(int) * 10
    )
    
    df['success_score'] += np.random.normal(0, 10, n_samples)
    df['success'] = (df['success_score'] >= 55).astype(int)
    
    print(f"✓ Dataset created: {len(df):,} samples")
    print(f"✓ Success rate: {df['success'].mean():.2%}")
    
    return df

def preprocess_data(df):
    print("\n[DATA PREPROCESSING]")
    
    le_category = LabelEncoder()
    le_location = LabelEncoder()
    
    df['category_encoded'] = le_category.fit_transform(df['category'])
    df['location_encoded'] = le_location.fit_transform(df['location'])
    
    joblib.dump(le_category, '../models/category_encoder.pkl')
    joblib.dump(le_location, '../models/location_encoder.pkl')
    
    print("✓ Preprocessing completed")
    
    return df

def train_xgboost_gpu(X, y, X_test, y_test):
    print("\n[XGBOOST GPU TRAINING]")
    
    start_time = time.time()
    
    params = {
        'device': 'cuda' if torch.cuda.is_available() else 'cpu',
        'tree_method': 'hist',
        'max_depth': 10,
        'learning_rate': 0.1,
        'n_estimators': 200,
        'subsample': 0.8,
        'colsample_bytree': 0.8,
        'reg_alpha': 0.1,
        'reg_lambda': 1.0,
        'objective': 'binary:logistic',
        'eval_metric': 'auc',
        'random_state': 42
    }
    
    dtrain = xgb.DMatrix(X, label=y)
    dtest = xgb.DMatrix(X_test, label=y_test)
    
    evals = [(dtrain, 'train'), (dtest, 'test')]
    
    print("Training XGBoost...")
    model = xgb.train(
        params,
        dtrain,
        num_boost_round=200,
        evals=evals,
        early_stopping_rounds=20,
        verbose_eval=False
    )
    
    training_time = time.time() - start_time
    print(f"✓ Training completed in {training_time:.2f}s")
    
    y_train_pred = (model.predict(dtrain) > 0.5).astype(int)
    y_test_pred = (model.predict(dtest) > 0.5).astype(int)
    
    train_acc = accuracy_score(y, y_train_pred)
    test_acc = accuracy_score(y_test, y_test_pred)
    
    print(f"\n[PERFORMANCE]")
    print(f"Training Accuracy: {train_acc:.4f}")
    print(f"Testing Accuracy: {test_acc:.4f}")
    print(f"Overfitting Gap: {abs(train_acc - test_acc):.4f}")
    
    if abs(train_acc - test_acc) < 0.05:
        print("✓ Model is well-generalized!")
    
    return model

def main():
    df = create_synthetic_dataset(n_samples=10000)
    df = preprocess_data(df)
    
    feature_cols = [
        'funding_total', 'founded_year', 'team_size', 'funding_rounds',
        'monthly_revenue', 'user_growth_rate', 'burn_rate', 'market_size',
        'company_age', 'funding_per_round', 'funding_velocity',
        'revenue_to_burn_ratio', 'funding_efficiency',
        'category_encoded', 'location_encoded'
    ]
    
    X = df[feature_cols]
    y = df['success']
    
    print(f"\n[DATASET INFO]")
    print(f"Samples: {len(X):,}")
    print(f"Features: {len(feature_cols)}")
    print(f"Success rate: {y.mean():.2%}")
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Training: {len(X_train):,} | Testing: {len(X_test):,}")
    
    model = train_xgboost_gpu(X_train, y_train, X_test, y_test)
    
    print("\n[SAVING MODELS]")
    joblib.dump(model, '../models/xgboost_gpu_model.pkl')
    print("✓ Models saved to ../models/")
    
    print("\n" + "="*70)
    print("✓ TRAINING COMPLETE!")
    print("="*70)

if __name__ == "__main__":
    main()
