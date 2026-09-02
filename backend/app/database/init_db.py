import os
import pandas as pd
from sqlalchemy import inspect
from .database import engine, SessionLocal, Base, DB_ENGINE_TYPE
from .models import PaimanaTimeseriesMaster, RiskScore, Prediction, EarlyWarning
from ..config import settings

def init_database():
    """
    Initializes database schema and populates from paimana_timeseries_master.csv if empty.
    Supports both MySQL and SQLite.
    """
    print(f"[DB Init] Checking database connection (Engine: {DB_ENGINE_TYPE})...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        count = db.query(PaimanaTimeseriesMaster).count()
        if count == 0:
            csv_path = settings.CSV_PATH
            if not os.path.exists(csv_path):
                print(f"[DB Init] CSV not found at {csv_path}. Skipping initial load.")
                return
                
            print(f"[DB Init] Loading {csv_path} into {DB_ENGINE_TYPE}...")
            df = pd.read_csv(csv_path)
            
            # Clean and ensure proper column mapping
            records = []
            for _, r in df.iterrows():
                rec = PaimanaTimeseriesMaster(
                    project_code=str(r['Project_Code']),
                    project_name=str(r['Project_Name']),
                    ministry=str(r['Ministry']) if pd.notna(r.get('Ministry')) else None,
                    sector=str(r['Sector']) if pd.notna(r.get('Sector')) else None,
                    state=str(r['State']) if pd.notna(r.get('State')) else None,
                    original_cost=float(r['Original_Cost']) if pd.notna(r.get('Original_Cost')) else None,
                    revised_cost=float(r['Revised_Cost']) if pd.notna(r.get('Revised_Cost')) else None,
                    cumulative_expenditure=float(r['Cumulative_Expenditure']) if pd.notna(r.get('Cumulative_Expenditure')) else None,
                    physical_progress=float(r['Physical_Progress']) if pd.notna(r.get('Physical_Progress')) else None,
                    date_of_approval=str(r['Date_of_Approval']) if pd.notna(r.get('Date_of_Approval')) else None,
                    original_target_doc=str(r['Original_Target_DoC']) if pd.notna(r.get('Original_Target_DoC')) else None,
                    revised_doc=str(r['Revised_DoC']) if pd.notna(r.get('Revised_DoC')) else None,
                    report_month=str(r['Report_Month']),
                    report_month_num=int(r['Report_Month_Num']),
                    report_year=int(r['Report_Year']),
                    report_date=pd.to_datetime(r['Report_Date']).date(),
                    physical_progress_velocity=float(r['Physical_Progress_Velocity']) if pd.notna(r.get('Physical_Progress_Velocity')) else None,
                    financial_burn_rate=float(r['Financial_Burn_Rate']) if pd.notna(r.get('Financial_Burn_Rate')) else None,
                    cost_escalation_ratio=float(r['Cost_Escalation_Ratio']) if pd.notna(r.get('Cost_Escalation_Ratio')) else None,
                    source_file=str(r['Source_File']) if pd.notna(r.get('Source_File')) else None
                )
                records.append(rec)
                
            # Batch insert
            batch_size = 1000
            for i in range(0, len(records), batch_size):
                db.bulk_save_objects(records[i : i + batch_size])
                db.commit()
                
            print(f"[DB Init] Successfully ingested {len(records)} records into database.")
        else:
            print(f"[DB Init] Database already populated with {count} records.")

        # Seed users if they don't exist
        from .models import User
        from ..api.auth import get_password_hash
        user_count = db.query(User).count()
        if user_count == 0:
            print("[DB Init] Seeding demo users...")
            demo_users = [
                User(username="admin", password_hash=get_password_hash("admin"), role="ADMIN"),
                User(username="engineer", password_hash=get_password_hash("engineer"), role="ENGINEER", ministry="Road Transport and Highways"),
                User(username="viewer", password_hash=get_password_hash("viewer"), role="VIEWER")
            ]
            db.bulk_save_objects(demo_users)
            db.commit()
            print("[DB Init] Successfully seeded demo users.")
            
    except Exception as e:
        print(f"[DB Init] Error during database initialization: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == '__main__':
    init_database()
