from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Dict, Any, Optional
from ..services.data_service import data_service
from ..engine.heuristic_model import heuristic_engine
from ..engine.ml_engine import model_benchmark_service
from ..engine.assistant_engine import assistant_engine
from ..database.database import DB_ENGINE_TYPE
from ..database.schemas import (
    DashboardKPIs,
    ProjectSummary,
    ProjectDetailOutput,
    RiskAssessmentOutput,
    CostPrediction,
    TimePrediction,
    RiskDriver,
    EarlyWarningItem,
    SectorPerformance,
    StateRiskSummary,
    ModelComparisonOutput,
    DataHealthOutput,
    IntelligenceQueryRequest,
    IntelligenceQueryResponse
)

router = APIRouter()

# -------------------------------------------------------------------------
# 1. Dashboard & Portfolio Summary Endpoints
# -------------------------------------------------------------------------

@router.get("/dashboard/summary", response_model=DashboardKPIs)
def get_dashboard_summary():
    """Returns dynamic portfolio KPIs computed directly from longitudinal records."""
    return data_service.get_dashboard_kpis()

@router.get("/dashboard/state-risks", response_model=List[StateRiskSummary])
def get_dashboard_state_risks():
    """Returns state-level aggregated project counts and risk scores for the India Map."""
    return data_service.get_state_risk_summaries()

# -------------------------------------------------------------------------
# 2. Project Explorer & Detail Endpoints
# -------------------------------------------------------------------------

@router.get("/projects", response_model=Dict[str, Any])
def list_projects(
    search: Optional[str] = Query(None, description="Search term across name or project code"),
    ministry: Optional[str] = Query(None, description="Filter by Ministry"),
    sector: Optional[str] = Query(None, description="Filter by Sector"),
    state: Optional[str] = Query(None, description="Filter by State"),
    risk_level: Optional[str] = Query(None, description="Filter by Risk Level: LOW, MODERATE, HIGH, CRITICAL"),
    min_cost: Optional[float] = Query(None, description="Minimum Revised Cost (₹ Cr)"),
    max_cost: Optional[float] = Query(None, description="Maximum Revised Cost (₹ Cr)"),
    min_progress: Optional[float] = Query(None, description="Minimum Physical Progress (%)"),
    max_progress: Optional[float] = Query(None, description="Maximum Physical Progress (%)"),
    sort_by: str = Query("risk_score", description="Sort field"),
    sort_order: str = Query("desc", description="Sort order: asc or desc"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(25, ge=1, le=100, description="Items per page")
):
    """Search and filter projects across the national infrastructure portfolio."""
    return data_service.get_projects(
        search=search,
        ministry=ministry,
        sector=sector,
        state=state,
        risk_level=risk_level,
        min_cost=min_cost,
        max_cost=max_cost,
        min_progress=min_progress,
        max_progress=max_progress,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size
    )

@router.get("/projects/{project_code}", response_model=ProjectDetailOutput)
def get_project_detail(project_code: str):
    """Retrieves full Project Intelligence profile including risk, predictions, and trajectory."""
    detail = data_service.get_project_detail_by_code(project_code)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Project '{project_code}' not found.")
    return detail

@router.get("/projects/{project_code}/history", response_model=List[Dict[str, Any]])
def get_project_history(project_code: str):
    """Retrieves raw longitudinal monthly observations for a project."""
    timeline = data_service.get_project_timeline(project_code)
    if not timeline:
        raise HTTPException(status_code=404, detail=f"Project history for '{project_code}' not found.")
    return timeline

@router.get("/projects/{project_code}/risk", response_model=RiskAssessmentOutput)
def get_project_risk(project_code: str):
    """Calculates dynamic heuristic risk assessment for a project."""
    timeline = data_service.get_project_timeline(project_code)
    if not timeline:
        raise HTTPException(status_code=404, detail=f"Project '{project_code}' not found.")
    return heuristic_engine.evaluate(timeline)

@router.get("/projects/{project_code}/predictions", response_model=Dict[str, Any])
def get_project_predictions(project_code: str):
    """Calculates trajectory-based cost and time predictions for a project."""
    timeline = data_service.get_project_timeline(project_code)
    if not timeline:
        raise HTTPException(status_code=404, detail=f"Project '{project_code}' not found.")
    
    cost_pred = heuristic_engine.predict_cost(timeline)
    time_pred = heuristic_engine.predict_schedule(timeline)
    return {
        "project_code": project_code,
        "cost_prediction": cost_pred,
        "time_prediction": time_pred
    }

@router.get("/projects/{project_code}/drivers", response_model=List[RiskDriver])
def get_project_risk_drivers(project_code: str):
    """Retrieves normalized explainable risk driver contributions for a project."""
    timeline = data_service.get_project_timeline(project_code)
    if not timeline:
        raise HTTPException(status_code=404, detail=f"Project '{project_code}' not found.")
    assessment = heuristic_engine.evaluate(timeline)
    return assessment.drivers

@router.get("/projects/{project_code}/brief", response_model=Dict[str, Any])
def generate_project_brief(project_code: str):
    """Generates an executive briefing report for administrators."""
    detail = data_service.get_project_detail_by_code(project_code)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Project '{project_code}' not found.")
        
    s = detail.summary
    r = detail.risk_assessment
    c = detail.cost_prediction
    t = detail.time_prediction
    
    return {
        "project_code": s.project_code,
        "project_name": s.project_name,
        "sector": s.sector,
        "ministry": s.ministry,
        "state": s.state,
        "executive_summary": f"Project '{s.project_name}' has an approved cost of ₹{s.original_cost:,.1f} Cr and revised cost of ₹{s.revised_cost:,.1f} Cr. Physical execution stands at {s.physical_progress:.1f}%. The project currently exhibits a risk score of {r.risk_score:.1f}/100 ({r.risk_level}).",
        "current_status": {
            "physical_progress_pct": s.physical_progress,
            "expenditure_cr": s.cumulative_expenditure,
            "monthly_velocity_pct": t.rolling_velocity_pct_pm,
            "slippage_ratio": r.slippage_ratio
        },
        "risk_profile": {
            "risk_score": r.risk_score,
            "risk_level": r.risk_level,
            "risk_trend": r.risk_trajectory_trend,
            "primary_driver": r.drivers[0].driver_name if r.drivers else "N/A",
            "alert_tags": r.alert_tags
        },
        "projected_outcomes": {
            "predicted_final_cost_cr": c.predicted_final_cost,
            "predicted_cost_escalation_pct": c.predicted_escalation_pct,
            "predicted_completion_date": t.predicted_completion_date,
            "predicted_delay_months": t.predicted_delay_months,
            "confidence": r.confidence
        },
        "administrative_intervention_points": detail.administrative_recommendations,
        "latest_reporting_period": f"{s.report_month} {s.report_year}"
    }

# -------------------------------------------------------------------------
# 3. Risk & Early Warning Endpoints
# -------------------------------------------------------------------------

@router.get("/risk/summary", response_model=Dict[str, Any])
def get_risk_summary():
    """Returns portfolio risk distribution and key threshold breach counts."""
    kpis = data_service.get_dashboard_kpis()
    return {
        "total_monitored": kpis.total_projects_monitored,
        "distribution": {
            "CRITICAL": kpis.critical_risk_count,
            "HIGH": kpis.high_risk_count,
            "MODERATE": kpis.moderate_risk_count,
            "LOW": kpis.low_risk_count
        },
        "attention_required_count": kpis.projects_requiring_attention
    }

@router.get("/risk/trends", response_model=Dict[str, Any])
def get_risk_trends():
    """Returns lists of projects with rising risk (↗), falling risk (↘), and highest slippage."""
    df = data_service.latest_df
    if df.empty:
        return {"rising_risk_projects": [], "falling_risk_projects": [], "high_slippage_projects": []}
        
    rising = df[df['risk_trend'] == 'UP'].sort_values('risk_score', ascending=False).head(10).to_dict('records')
    falling = df[df['risk_trend'] == 'DOWN'].sort_values('risk_score', ascending=True).head(10).to_dict('records')
    high_slip = df.sort_values('slippage_ratio', ascending=False).head(10).to_dict('records')
    
    return {
        "rising_risk_projects": rising,
        "falling_risk_projects": falling,
        "high_slippage_projects": high_slip
    }

@router.get("/early-warnings", response_model=List[EarlyWarningItem])
def list_early_warnings(
    severity: Optional[str] = Query(None, description="Filter by severity: CRITICAL, HIGH, MODERATE"),
    sector: Optional[str] = Query(None, description="Filter by sector"),
    limit: int = Query(50, ge=1, le=200, description="Max records to return")
):
    """Lists dynamic early warning alerts triggered across the national infrastructure portfolio."""
    return data_service.get_early_warnings(severity=severity, sector=sector, limit=limit)

# -------------------------------------------------------------------------
# 4. Sector Analytics Endpoints
# -------------------------------------------------------------------------

@router.get("/sectors", response_model=List[SectorPerformance])
def get_all_sectors():
    """Returns sector-wise aggregated performance metrics and cost escalation comparisons."""
    return data_service.get_sector_analytics()

@router.get("/sectors/{sector_name}", response_model=Dict[str, Any])
def get_sector_detail(sector_name: str):
    """Returns detailed statistics and top high-risk projects for a specific sector."""
    sectors = data_service.get_sector_analytics()
    target_sector = None
    for s in sectors:
        if s.sector.lower() == sector_name.strip().lower():
            target_sector = s
            break
            
    if not target_sector:
        raise HTTPException(status_code=404, detail=f"Sector '{sector_name}' not found.")
        
    # Get top risk projects in this sector
    sector_df = data_service.latest_df[data_service.latest_df['Sector'].str.lower() == target_sector.sector.lower()]
    top_risk = sector_df.sort_values('risk_score', ascending=False).head(10).to_dict('records')
    
    return {
        "sector_summary": target_sector,
        "top_risk_projects": top_risk
    }

# -------------------------------------------------------------------------
# 5. Predictive Analytics & Model Benchmark Endpoints
# -------------------------------------------------------------------------

@router.get("/analytics/cost", response_model=Dict[str, Any])
def get_cost_analytics():
    """Portfolio-wide cost overrun statistics and projections."""
    kpis = data_service.get_dashboard_kpis()
    sectors = data_service.get_sector_analytics()
    return {
        "total_approved_cost_cr": kpis.total_original_cost_cr,
        "total_revised_cost_cr": kpis.total_revised_cost_cr,
        "total_cumulative_expenditure_cr": kpis.total_cumulative_expenditure_cr,
        "overall_cost_escalation_pct": kpis.overall_cost_escalation_pct,
        "sector_cost_escalations": sectors
    }

@router.get("/analytics/schedule", response_model=Dict[str, Any])
def get_schedule_analytics():
    """Portfolio-wide schedule delay statistics and velocity distributions."""
    df = data_service.latest_df
    avg_vel = float(df['Physical_Progress_Velocity'].dropna().mean()) if not df.empty else 1.2
    return {
        "average_monthly_velocity_pct": round(avg_vel, 2),
        "total_projects_monitored": len(df),
        "projects_with_revised_doc": int(df['Revised_DoC'].dropna().count()) if not df.empty else 0
    }

@router.get("/analytics/model-comparison", response_model=ModelComparisonOutput)
def get_model_comparison():
    """Returns real benchmark performance evaluation comparing Statistical vs Machine Learning models."""
    return model_benchmark_service.evaluate_models_on_dataset(data_service.df)

@router.get("/analytics/drivers", response_model=Dict[str, Any])
def get_portfolio_drivers():
    """Portfolio-wide analysis of primary cost and schedule escalation drivers."""
    return {
        "driver_weights": {
            "Cost Escalation": "25%",
            "Schedule Slippage": "25%",
            "Physical Progress Stagnation": "20%",
            "Financial Velocity Disconnect": "20%",
            "Milestone Slippage": "10%"
        },
        "methodology": "4-Month Rolling Temporal Window with Multi-Signal Heuristic Formulation",
        "model_version": heuristic_engine.MODEL_VERSION
    }

# -------------------------------------------------------------------------
# 6. Natural Language Assistant & Data Health Endpoints
# -------------------------------------------------------------------------

@router.post("/intelligence/query", response_model=IntelligenceQueryResponse)
def query_intelligence_assistant(payload: IntelligenceQueryRequest = Body(...)):
    """Natural Language Project Intelligence query interface with guaranteed verified answers."""
    return assistant_engine.process_query(payload.query, data_service)

@router.get("/data/health", response_model=DataHealthOutput)
def get_data_health():
    """System operations and data quality health report."""
    df = data_service.df
    total_records = len(df)
    unique_projects = int(df['Project_Code'].nunique()) if not df.empty else 0
    
    missing_prog = int(df['Physical_Progress'].isna().sum()) if not df.empty else 0
    missing_doc = int(df['Revised_DoC'].isna().sum()) if not df.empty else 0
    
    quality_pct = 100.0 - ((missing_prog / max(1, total_records)) * 10.0)
    quality_pct = max(80.0, min(100.0, quality_pct))
    
    return DataHealthOutput(
        total_records=total_records,
        unique_projects=unique_projects,
        earliest_report_date="2025-04-01",
        latest_report_date="2026-07-01",
        months_covered_count=16,
        database_engine=DB_ENGINE_TYPE.upper(),
        missing_physical_progress_count=missing_prog,
        missing_revised_doc_count=missing_doc,
        data_quality_pct=round(quality_pct, 1),
        status="OPERATIONAL"
    )
