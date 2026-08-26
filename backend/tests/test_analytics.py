import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.engine.heuristic_model import heuristic_engine
from backend.app.engine.early_warning_engine import early_warning_engine
from backend.app.services.data_service import data_service

def test_slippage_ratio_calculation():
    """Verify slippage ratio is computed correctly and safely."""
    records = [
        {"Project_Code": "P1", "Report_Date": "2025-04-01", "Physical_Progress": 10.0, "Cumulative_Expenditure": 100.0, "Physical_Progress_Velocity": 2.0, "Financial_Burn_Rate": 40.0, "Original_Cost": 1000.0, "Revised_Cost": 1000.0},
        {"Project_Code": "P1", "Report_Date": "2025-05-01", "Physical_Progress": 12.0, "Cumulative_Expenditure": 150.0, "Physical_Progress_Velocity": 2.0, "Financial_Burn_Rate": 50.0, "Original_Cost": 1000.0, "Revised_Cost": 1000.0}
    ]
    res = heuristic_engine.evaluate(records)
    assert res.slippage_ratio > 0.0
    assert res.slippage_ratio <= 10.0

def test_risk_score_bounds():
    """Verify risk score strictly remains within [0, 100]."""
    test_cases = [
        # Zero cost, zero progress
        [{"Project_Code": "P_ZERO", "Report_Date": "2025-04-01", "Physical_Progress": 0.0, "Cumulative_Expenditure": 0.0, "Original_Cost": 100.0, "Revised_Cost": 100.0}],
        # Massive escalation & zero progress
        [{"Project_Code": "P_MAX", "Report_Date": "2025-04-01", "Physical_Progress": 10.0, "Cumulative_Expenditure": 5000.0, "Original_Cost": 100.0, "Revised_Cost": 5000.0, "Physical_Progress_Velocity": 0.0, "Financial_Burn_Rate": 500.0}],
        # Completed on time
        [{"Project_Code": "P_COMP", "Report_Date": "2025-04-01", "Physical_Progress": 100.0, "Cumulative_Expenditure": 100.0, "Original_Cost": 100.0, "Revised_Cost": 100.0, "Physical_Progress_Velocity": 5.0, "Financial_Burn_Rate": 10.0}]
    ]
    for tc in test_cases:
        res = heuristic_engine.evaluate(tc)
        assert 0.0 <= res.risk_score <= 100.0
        assert res.risk_level in ["LOW", "MODERATE", "HIGH", "CRITICAL"]

def test_zero_physical_velocity_safeguard():
    """Verify zero physical progress velocity does not trigger ZeroDivisionError."""
    records = [
        {"Project_Code": "P_STALL", "Report_Date": "2025-04-01", "Physical_Progress": 40.0, "Cumulative_Expenditure": 200.0, "Physical_Progress_Velocity": 0.0, "Financial_Burn_Rate": 0.0, "Original_Cost": 500.0, "Revised_Cost": 500.0}
    ]
    time_pred = heuristic_engine.predict_schedule(records)
    assert time_pred.predicted_delay_months >= 0.0
    assert time_pred.predicted_completion_date is not None

def test_missing_month_handling():
    """Verify graceful handling when records have missing fields or gaps."""
    records = [
        {"Project_Code": "P_GAP", "Report_Date": "2025-04-01", "Physical_Progress": None, "Cumulative_Expenditure": None, "Original_Cost": 100.0, "Revised_Cost": None},
        {"Project_Code": "P_GAP", "Report_Date": "2025-07-01", "Physical_Progress": 50.0, "Cumulative_Expenditure": 60.0, "Original_Cost": 100.0, "Revised_Cost": 120.0}
    ]
    res = heuristic_engine.evaluate(records)
    assert res.risk_score >= 0.0
    cost_pred = heuristic_engine.predict_cost(records)
    assert cost_pred.predicted_final_cost >= 60.0

def test_prediction_with_short_history():
    """Verify confidence lowers appropriately with short history."""
    single_obs = [{"Project_Code": "P_ONE", "Report_Date": "2025-04-01", "Physical_Progress": 20.0, "Cumulative_Expenditure": 50.0, "Original_Cost": 200.0, "Revised_Cost": 200.0}]
    res = heuristic_engine.evaluate(single_obs)
    assert res.confidence == "Very Low"
    
    four_obs = [
        {"Project_Code": "P_FOUR", "Report_Date": f"2025-0{i}-01", "Physical_Progress": 20.0 + i*2, "Cumulative_Expenditure": 50.0 + i*10, "Original_Cost": 200.0, "Revised_Cost": 200.0}
        for i in range(1, 5)
    ]
    res4 = heuristic_engine.evaluate(four_obs)
    assert res4.confidence == "High"

def test_early_warning_triggers():
    """Verify early warning engine produces alerts for high slippage and stall."""
    stalled_records = [
        {"Project_Code": "P_WARN", "Project_Name": "Critical Highway", "Sector": "Roads & Highways", "State": "Rajasthan", "Report_Date": "2025-04-01", "Physical_Progress": 30.0, "Cumulative_Expenditure": 500.0, "Physical_Progress_Velocity": 0.05, "Financial_Burn_Rate": 150.0, "Original_Cost": 600.0, "Revised_Cost": 800.0}
    ]
    warns = early_warning_engine.generate_project_warnings(stalled_records)
    assert len(warns) > 0
    assert any(w.severity in ["CRITICAL", "HIGH"] for w in warns)

def test_api_endpoints():
    """Verify core FastAPI endpoints respond successfully."""
    # Ensure data is loaded
    if data_service.latest_df.empty:
        data_service.load_and_index_data()

    with TestClient(app) as client:
        # 1. Summary
        res = client.get("/api/dashboard/summary")
        assert res.status_code == 200
        data = res.json()
        assert "total_projects_monitored" in data
        assert data["total_projects_monitored"] > 0

        # 2. Projects list
        res_p = client.get("/api/projects?page=1&page_size=10")
        assert res_p.status_code == 200
        p_data = res_p.json()
        assert len(p_data["items"]) == 10

        # 3. Early warnings
        res_w = client.get("/api/early-warnings?limit=5")
        assert res_w.status_code == 200
        assert len(res_w.json()) > 0

        # 4. Sectors
        res_s = client.get("/api/sectors")
        assert res_s.status_code == 200
        assert len(res_s.json()) > 0

        # 5. Data health
        res_h = client.get("/api/data/health")
        assert res_h.status_code == 200
        assert res_h.json()["status"] == "OPERATIONAL"
