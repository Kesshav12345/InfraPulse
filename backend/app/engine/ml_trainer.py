import os
import pandas as pd
import numpy as np
from catboost import CatBoostClassifier, Pool
from sklearn.metrics import classification_report, precision_score, recall_score, f1_score, average_precision_score
from ..config import settings
import joblib

def create_targets(df: pd.DataFrame) -> pd.DataFrame:
    """Create temporal targets for 3-month cost revision > 5% and schedule delay."""
    # Ensure df is sorted chronologically by project
    df = df.sort_values(['Project_Code', 'Report_Date_DT']).copy()
    
    # 3-month forward matching
    df['Report_Date_DT'] = pd.to_datetime(df['Report_Date'])
    
    # Lead values by grouping
    df['Future_Cost'] = df.groupby('Project_Code')['Revised_Cost'].shift(-3)
    df['Current_Cost'] = df['Revised_Cost'].fillna(df['Original_Cost'])
    
    # Target 1: Cost increases by >5% in 3 months
    df['Target_Cost_Warning'] = ((df['Future_Cost'] > df['Current_Cost'] * 1.05) & (df['Future_Cost'].notna())).astype(int)
    
    # Target 2: Schedule Delay
    # Did the revised doc move out in the next 3 months?
    # For simplicity of this prototype, we'll define schedule warning as: 
    # Physical Progress < 100 AND rolling velocity drops below 0.5% in the next 3 months
    df['Future_Velocity'] = df.groupby('Project_Code')['Physical_Progress_Velocity'].shift(-3)
    df['Target_Schedule_Warning'] = ((df['Physical_Progress'] < 95) & (df['Future_Velocity'] < 0.5) & (df['Future_Velocity'].notna())).astype(int)
    
    return df

def train_catboost_models():
    """Trains CatBoost models with chronological temporal validation."""
    print("[ML Trainer] Starting ML pipeline...")
    df = pd.read_csv(settings.CSV_PATH)
    df['Report_Date_DT'] = pd.to_datetime(df['Report_Date'])
    
    df = create_targets(df)
    
    # Features
    features = [
        'Original_Cost', 'Current_Cost', 'Cumulative_Expenditure', 'Physical_Progress',
        'Physical_Progress_Velocity', 'Financial_Burn_Rate', 'Cost_Escalation_Ratio'
    ]
    
    # Drop rows where target is NaN (i.e. we don't have 3 months of future data)
    valid_df = df.dropna(subset=['Future_Cost', 'Future_Velocity'] + features)
    
    if len(valid_df) == 0:
        print("[ML Trainer] Not enough temporal data to train models.")
        return
        
    print(f"[ML Trainer] Total eligible observations: {len(valid_df)}")
    
    # Temporal Split
    # We use a date threshold to separate train/validation. e.g. Train < 2026-03-01, Val >= 2026-03-01
    split_date = pd.to_datetime('2026-03-01')
    train_df = valid_df[valid_df['Report_Date_DT'] < split_date]
    val_df = valid_df[valid_df['Report_Date_DT'] >= split_date]
    
    print(f"[ML Trainer] Train samples: {len(train_df)}, Val samples: {len(val_df)}")
    
    if len(train_df) == 0 or len(val_df) == 0:
        print("[ML Trainer] Temporal split failed to produce train/val sets.")
        return

    X_train = train_df[features]
    y_train_cost = train_df['Target_Cost_Warning']
    y_train_sched = train_df['Target_Schedule_Warning']
    
    X_val = val_df[features]
    y_val_cost = val_df['Target_Cost_Warning']
    y_val_sched = val_df['Target_Schedule_Warning']
    
    print(f"[ML Trainer] Cost Target Prevalence - Train: {y_train_cost.mean():.3f}, Val: {y_val_cost.mean():.3f}")
    
    # Model 1: Cost Warning Classifier
    cost_model = CatBoostClassifier(
        iterations=200, learning_rate=0.05, depth=4, auto_class_weights='Balanced',
        verbose=0, random_seed=42
    )
    cost_model.fit(X_train, y_train_cost, eval_set=(X_val, y_val_cost), early_stopping_rounds=20)
    
    # Model 2: Schedule Warning Classifier
    sched_model = CatBoostClassifier(
        iterations=200, learning_rate=0.05, depth=4, auto_class_weights='Balanced',
        verbose=0, random_seed=42
    )
    sched_model.fit(X_train, y_train_sched, eval_set=(X_val, y_val_sched), early_stopping_rounds=20)
    
    # Evaluate
    val_preds_cost = cost_model.predict(X_val)
    val_probs_cost = cost_model.predict_proba(X_val)[:, 1]
    
    pr_auc_cost = average_precision_score(y_val_cost, val_probs_cost)
    f1_cost = f1_score(y_val_cost, val_preds_cost, zero_division=0)
    
    val_preds_sched = sched_model.predict(X_val)
    f1_sched = f1_score(y_val_sched, val_preds_sched, zero_division=0)
    
    print(f"[ML Trainer] Cost Model F1: {f1_cost:.3f}, PR-AUC: {pr_auc_cost:.3f}")
    print(f"[ML Trainer] Schedule Model F1: {f1_sched:.3f}")
    
    # Save models
    os.makedirs('backend/app/models', exist_ok=True)
    cost_model.save_model('backend/app/models/cost_model.cbm')
    sched_model.save_model('backend/app/models/sched_model.cbm')
    
    metadata = {
        'version': 'catboost-v1.0',
        'features': features,
        'metrics': {
            'cost': {'f1': float(f1_cost), 'pr_auc': float(pr_auc_cost), 'prevalence': float(y_val_cost.mean())},
            'schedule': {'f1': float(f1_sched), 'prevalence': float(y_val_sched.mean())}
        },
        'split_date': str(split_date),
        'train_samples': len(train_df),
        'val_samples': len(val_df)
    }
    joblib.dump(metadata, 'backend/app/models/metadata.joblib')
    print("[ML Trainer] Models and metadata saved successfully.")

if __name__ == "__main__":
    train_catboost_models()
