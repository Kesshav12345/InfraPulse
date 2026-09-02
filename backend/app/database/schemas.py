from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import date, datetime

class RiskDriver(BaseModel):
    driver_name: str
    contribution_pct: float
    severity: str # LOW, MODERATE, HIGH, CRITICAL
    observed_value: Optional[str] = None
    explanation: str

class TrajectoryPoint(BaseModel):
    report_date: str
    report_month: str
    report_year: int
    physical_progress: Optional[float] = None
    physical_progress_velocity: Optional[float] = None
    cumulative_expenditure: Optional[float] = None
    financial_burn_rate: Optional[float] = None
    slippage_ratio: Optional[float] = None
    cost_escalation_ratio: Optional[float] = None
    risk_score: Optional[float] = None

class CostPrediction(BaseModel):
    original_cost: float
    revised_cost: float
    predicted_final_cost: float
    predicted_escalation_cr: float
    predicted_escalation_pct: float
    prediction_range_min: float
    prediction_range_max: float
    confidence: str
    model_version: str

class TimePrediction(BaseModel):
    original_doc: Optional[str] = None
    revised_doc: Optional[str] = None
    predicted_completion_date: str
    predicted_delay_months: float
    delay_probability_pct: float
    rolling_velocity_pct_pm: float
    confidence: str
    model_version: str

class RiskAssessmentOutput(BaseModel):
    project_code: str
    risk_score: float
    risk_level: str # LOW, MODERATE, HIGH, CRITICAL
    risk_trajectory_trend: str # UP, DOWN, STABLE
    risk_score_delta: float
    cost_risk: float
    schedule_risk: float
    progress_risk: float
    financial_velocity_risk: float
    milestone_risk: float
    slippage_ratio: float
    confidence: str
    model_version: str
    drivers: List[RiskDriver]
    alert_tags: List[str]

class ProjectSummary(BaseModel):
    project_code: str
    project_name: str
    ministry: Optional[str] = None
    sector: Optional[str] = None
    state: Optional[str] = None
    original_cost: Optional[float] = None
    revised_cost: Optional[float] = None
    cumulative_expenditure: Optional[float] = None
    physical_progress: Optional[float] = None
    date_of_approval: Optional[str] = None
    original_target_doc: Optional[str] = None
    revised_doc: Optional[str] = None
    report_date: str
    report_month: str
    report_year: int
    physical_progress_velocity: Optional[float] = None
    financial_burn_rate: Optional[float] = None
    cost_escalation_ratio: Optional[float] = None
    risk_score: Optional[float] = None
    risk_level: Optional[str] = None
    risk_trend: Optional[str] = None
    slippage_ratio: Optional[float] = None

class ProjectDetailOutput(BaseModel):
    summary: ProjectSummary
    risk_assessment: RiskAssessmentOutput
    cost_prediction: CostPrediction
    time_prediction: TimePrediction
    trajectory: List[TrajectoryPoint]
    historical_count: int
    administrative_recommendations: List[str]

class DashboardKPIs(BaseModel):
    total_projects_monitored: int
    total_original_cost_cr: float
    total_revised_cost_cr: float
    total_cumulative_expenditure_cr: float
    overall_cost_escalation_pct: float
    projects_requiring_attention: int
    critical_risk_count: int
    high_risk_count: int
    moderate_risk_count: int
    low_risk_count: int
    latest_report_date: str
    latest_report_month_year: str
    active_sectors_count: int
    active_states_count: int

class EarlyWarningItem(BaseModel):
    id: Optional[int] = None
    project_code: str
    project_name: str
    sector: str
    state: str
    severity: str # CRITICAL, HIGH, MODERATE
    warning_type: str
    title: str
    trigger: str
    evidence: str
    recommendation: str
    detected_date: str
    model_version: str

class SectorPerformance(BaseModel):
    sector: str
    project_count: int
    original_cost_cr: float
    revised_cost_cr: float
    expenditure_cr: float
    cost_escalation_pct: float
    avg_physical_progress: float
    avg_risk_score: float
    critical_projects_count: int

class StateRiskSummary(BaseModel):
    state: str
    project_count: int
    total_cost_cr: float
    avg_risk_score: float
    critical_count: int
    high_count: int

class ModelMetric(BaseModel):
    model_name: str
    model_type: str
    mae_cost_cr: Optional[float] = None
    rmse_cost_cr: Optional[float] = None
    r2_score: Optional[float] = None
    schedule_mae_months: Optional[float] = None
    risk_classification_f1: Optional[float] = None
    risk_accuracy: Optional[float] = None
    features_used: str
    status: str

class ModelComparisonOutput(BaseModel):
    models: List[ModelMetric]
    cuf_experiment_summary: Dict[str, Any]
    evaluation_split: str
    last_evaluated: str

class IntelligenceQueryRequest(BaseModel):
    query: str

class IntelligenceQueryResponse(BaseModel):
    query: str
    intent: str
    answer: str
    data: Optional[Any] = None
    suggested_followups: List[str]

class DataHealthOutput(BaseModel):
    total_records: int
    unique_projects: int
    earliest_report_date: str
    latest_report_date: str
    months_covered_count: int
    database_engine: str
    
    # Detailed Data Quality Flags
    cost_below_150cr_count: int
    invalid_physical_progress_count: int
    negative_cumulative_expenditure_count: int
    negative_financial_burn_count: int
    invalid_revised_cost_count: int
    missing_physical_progress_count: int
    missing_completion_dates_count: int
    duplicate_records_count: int
    malformed_dates_count: int
    inconsistent_geography_count: int
    short_history_count: int
    
    # Eligibility & Limitations
    eligible_for_cost_model_count: int
    eligible_for_schedule_model_count: int
    excluded_count: int
    exclusion_reasons: Dict[str, int]
    
    data_quality_pct: float
    status: str
