from sqlalchemy import Column, Integer, String, Float, Date, Text, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from .database import Base

class PaimanaTimeseriesMaster(Base):
    __tablename__ = "paimana_timeseries_master"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_code = Column(String(50), nullable=False, index=True)
    project_name = Column(Text, nullable=False)
    ministry = Column(String(150), nullable=True, index=True)
    sector = Column(String(100), nullable=True, index=True)
    state = Column(String(100), nullable=True, index=True)
    original_cost = Column(Float, nullable=True)
    revised_cost = Column(Float, nullable=True)
    cumulative_expenditure = Column(Float, nullable=True)
    physical_progress = Column(Float, nullable=True)
    date_of_approval = Column(String(20), nullable=True)
    original_target_doc = Column(String(20), nullable=True)
    revised_doc = Column(String(20), nullable=True)
    report_month = Column(String(20), nullable=False)
    report_month_num = Column(Integer, nullable=False)
    report_year = Column(Integer, nullable=False)
    report_date = Column(Date, nullable=False, index=True)
    physical_progress_velocity = Column(Float, nullable=True)
    financial_burn_rate = Column(Float, nullable=True)
    cost_escalation_ratio = Column(Float, nullable=True)
    source_file = Column(String(100), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (
        Index("idx_proj_date", "project_code", "report_date"),
    )

class RiskScore(Base):
    __tablename__ = "risk_scores"

    risk_id = Column(Integer, primary_key=True, autoincrement=True)
    project_code = Column(String(50), nullable=False, index=True)
    reporting_date = Column(Date, nullable=False, index=True)
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False)
    cost_risk = Column(Float, nullable=False)
    schedule_risk = Column(Float, nullable=False)
    progress_risk = Column(Float, nullable=False)
    financial_velocity_risk = Column(Float, nullable=False)
    milestone_risk = Column(Float, nullable=False)
    slippage_ratio = Column(Float, nullable=True)
    confidence = Column(String(20), nullable=False)
    model_version = Column(String(50), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

class Prediction(Base):
    __tablename__ = "predictions"

    prediction_id = Column(Integer, primary_key=True, autoincrement=True)
    project_code = Column(String(50), nullable=False, index=True)
    prediction_date = Column(Date, nullable=False)
    predicted_final_cost = Column(Float, nullable=True)
    predicted_cost_overrun_cr = Column(Float, nullable=True)
    predicted_cost_overrun_pct = Column(Float, nullable=True)
    predicted_completion_date = Column(String(30), nullable=True)
    predicted_delay_months = Column(Float, nullable=True)
    delay_probability = Column(Float, nullable=True)
    confidence = Column(String(20), nullable=False)
    model_version = Column(String(50), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

class EarlyWarning(Base):
    __tablename__ = "early_warnings"

    warning_id = Column(Integer, primary_key=True, autoincrement=True)
    project_code = Column(String(50), nullable=False, index=True)
    project_name = Column(Text, nullable=False)
    sector = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    severity = Column(String(20), nullable=False) # CRITICAL, HIGH, MODERATE
    warning_type = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    trigger = Column(Text, nullable=False)
    evidence = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=False)
    detected_date = Column(Date, nullable=False)
    model_version = Column(String(50), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(128), nullable=False)
    role = Column(String(20), nullable=False) # ADMIN, ENGINEER, VIEWER
    ministry = Column(String(150), nullable=True) # For ENGINEER role scoping
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class Intervention(Base):
    __tablename__ = "interventions"

    intervention_id = Column(Integer, primary_key=True, autoincrement=True)
    project_code = Column(String(50), nullable=False, index=True)
    warning_reference = Column(Integer, nullable=True) # Optional link to EarlyWarning.warning_id
    ministry = Column(String(150), nullable=True)
    assigned_to_user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    status = Column(String(20), nullable=False, default="OPEN") # OPEN, ACKNOWLEDGED, IN_PROGRESS, RESOLVED, CLOSED
    priority = Column(String(20), nullable=False, default="MODERATE") # CRITICAL, HIGH, MODERATE
    recommended_review_area = Column(Text, nullable=True)
    evidence_summary = Column(Text, nullable=True)
    engineer_response_note = Column(Text, nullable=True)
    due_date = Column(Date, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    resolved_at = Column(DateTime, nullable=True)
