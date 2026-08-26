from typing import List, Dict, Any
from .heuristic_model import heuristic_engine
from ..database.schemas import EarlyWarningItem

class EarlyWarningEngine:
    """
    Dedicated Early Warning Engine for PAIMANA Intelligence.
    Detects critical conditions across schedule, cost, financial burn, and progress stagnation.
    """
    
    def generate_project_warnings(self, project_timeline: List[Dict[str, Any]]) -> List[EarlyWarningItem]:
        if not project_timeline:
            return []

        sorted_records = sorted(
            project_timeline,
            key=lambda x: str(x.get('Report_Date') or x.get('report_date') or '')
        )
        latest = sorted_records[-1]
        
        proj_code = str(latest.get('Project_Code') or latest.get('project_code') or '')
        proj_name = str(latest.get('Project_Name') or latest.get('project_name') or 'Unnamed Project')
        sector = str(latest.get('Sector') or latest.get('sector') or 'General Infrastructure')
        state = str(latest.get('State') or latest.get('state') or 'Multi-State / PAN India')
        rep_date = str(latest.get('Report_Date') or latest.get('report_date') or '2026-07-01')
        
        risk_output = heuristic_engine.evaluate(sorted_records)
        cost_pred = heuristic_engine.predict_cost(sorted_records)
        time_pred = heuristic_engine.predict_schedule(sorted_records)
        
        warnings: List[EarlyWarningItem] = []
        
        # 1. Critical Financial Burn Acceleration with Progress Slowdown
        if risk_output.slippage_ratio > 1.8 and time_pred.rolling_velocity_pct_pm < 1.0:
            warnings.append(EarlyWarningItem(
                project_code=proj_code,
                project_name=proj_name,
                sector=sector,
                state=state,
                severity="CRITICAL" if risk_output.slippage_ratio > 2.5 else "HIGH",
                warning_type="Financial Burn Disconnect",
                title="Severe Financial Expenditure Velocity Mismatch",
                trigger=f"Financial burn rate is moving at a slippage ratio of {risk_output.slippage_ratio:.2f}x relative to physical progress velocity.",
                evidence=f"Rolling financial expenditure is moving faster than physical pace (Monthly velocity: {time_pred.rolling_velocity_pct_pm:.2f}%/mo).",
                recommendation="Conduct an immediate technical and financial audit of milestone expenditures and physical site verification.",
                detected_date=rep_date,
                model_version=heuristic_engine.MODEL_VERSION
            ))

        # 2. Critical Schedule Overrun Risk
        if time_pred.predicted_delay_months > 12.0 and risk_output.schedule_risk > 60.0:
            warnings.append(EarlyWarningItem(
                project_code=proj_code,
                project_name=proj_name,
                sector=sector,
                state=state,
                severity="CRITICAL" if time_pred.predicted_delay_months > 24.0 else "HIGH",
                warning_type="Schedule Overrun Risk",
                title=f"Projected Commissioning Delay of {time_pred.predicted_delay_months:.0f} Months",
                trigger=f"Physical progress trajectory indicates completion around {time_pred.predicted_completion_date}, substantially exceeding target commissioning.",
                evidence=f"Physical progress is currently at {latest.get('Physical_Progress') or latest.get('physical_progress') or 0:.1f}%. Rolling velocity is {time_pred.rolling_velocity_pct_pm:.2f}%/mo.",
                recommendation="Review contractor workforce mobilization, land acquisition clearance, and statutory environmental approvals.",
                detected_date=rep_date,
                model_version=heuristic_engine.MODEL_VERSION
            ))

        # 3. Severe Cost Growth Risk
        if cost_pred.predicted_escalation_pct > 25.0:
            warnings.append(EarlyWarningItem(
                project_code=proj_code,
                project_name=proj_name,
                sector=sector,
                state=state,
                severity="CRITICAL" if cost_pred.predicted_escalation_pct > 50.0 else "HIGH",
                warning_type="Cost Escalation Warning",
                title=f"Projected Cost Growth of +{cost_pred.predicted_escalation_pct:.1f}% (₹{cost_pred.predicted_escalation_cr:,.0f} Cr)",
                trigger=f"Cumulative spending trajectory suggests final cost of ₹{cost_pred.predicted_final_cost:,.0f} Cr vs approved ₹{cost_pred.original_cost:,.0f} Cr.",
                evidence=f"Current revised estimate is ₹{cost_pred.revised_cost:,.0f} Cr with ₹{latest.get('Cumulative_Expenditure') or latest.get('cumulative_expenditure') or 0:,.0f} Cr already expended.",
                recommendation="Review material price escalation clauses, revised scope variations, and administrative expenditure approvals.",
                detected_date=rep_date,
                model_version=heuristic_engine.MODEL_VERSION
            ))

        # 4. Physical Progress Stagnation
        phys_prog = float(latest.get('Physical_Progress') or latest.get('physical_progress') or 0.0)
        if time_pred.rolling_velocity_pct_pm <= 0.1 and phys_prog < 95.0:
            warnings.append(EarlyWarningItem(
                project_code=proj_code,
                project_name=proj_name,
                sector=sector,
                state=state,
                severity="HIGH",
                warning_type="Progress Stagnation",
                title="Critical Stagnation in Physical Progress",
                trigger="Physical progress has remained essentially unchanged across the recent reporting window.",
                evidence=f"Physical progress is stalled at {phys_prog:.1f}% with zero or negligible monthly increment.",
                recommendation="Examine potential contractor contractual disputes, ROW issues, or state-level utility shifting bottlenecks.",
                detected_date=rep_date,
                model_version=heuristic_engine.MODEL_VERSION
            ))

        return warnings

early_warning_engine = EarlyWarningEngine()
