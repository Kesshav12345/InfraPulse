import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
from .base import BaseRiskModel, BasePredictionEngine
from ..database.schemas import (
    RiskAssessmentOutput,
    CostPrediction,
    TimePrediction,
    RiskDriver,
    TrajectoryPoint
)

class HeuristicPredictionEngine(BaseRiskModel, BasePredictionEngine):
    """
    Transparent Heuristic Trajectory & Risk Engine for PAIMANA Intelligence.
    Adheres strictly to the 4-month rolling temporal window and multi-signal risk formulation.
    """
    MODEL_VERSION = "heuristic-v1.0"

    def _clean_val(self, v: Any, default: float = 0.0) -> float:
        if v is None or pd.isna(v):
            return default
        try:
            f = float(v)
            return default if (np.isnan(f) or np.isinf(f)) else f
        except:
            return default

    def _extract_timeline_features(self, timeline_records: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Processes chronological project observations into rolling features."""
        if not timeline_records:
            return {}

        # Sort chronologically by report date
        sorted_records = sorted(
            timeline_records,
            key=lambda x: str(x.get('Report_Date') or x.get('report_date') or '')
        )
        
        latest = sorted_records[-1]
        n_obs = len(sorted_records)
        
        # 4-month window or maximum available
        window_records = sorted_records[-4:] if n_obs >= 4 else sorted_records
        
        # Physical progress series
        phys_prog_series = [self._clean_val(r.get('Physical_Progress') or r.get('physical_progress'), 0.0) for r in window_records]
        phys_vel_series = [
            self._clean_val(r.get('Physical_Progress_Velocity') or r.get('physical_progress_velocity'), 0.0)
            for r in window_records
            if (r.get('Physical_Progress_Velocity') or r.get('physical_progress_velocity')) is not None
            and not pd.isna(r.get('Physical_Progress_Velocity') or r.get('physical_progress_velocity'))
        ]
        
        # Financial burn series
        exp_series = [self._clean_val(r.get('Cumulative_Expenditure') or r.get('cumulative_expenditure'), 0.0) for r in window_records]
        burn_series = [
            self._clean_val(r.get('Financial_Burn_Rate') or r.get('financial_burn_rate'), 0.0)
            for r in window_records
            if (r.get('Financial_Burn_Rate') or r.get('financial_burn_rate')) is not None
            and not pd.isna(r.get('Financial_Burn_Rate') or r.get('financial_burn_rate'))
        ]
        
        # Rolling velocities
        rolling_phys_vel = float(np.mean(phys_vel_series)) if phys_vel_series else (phys_prog_series[-1] / max(1, n_obs) if phys_prog_series else 0.0)
        rolling_phys_vel = self._clean_val(rolling_phys_vel, 0.0)
        
        rolling_burn_rate = float(np.mean(burn_series)) if burn_series else 0.0
        rolling_burn_rate = self._clean_val(rolling_burn_rate, 0.0)
        
        # Slippage ratio = Financial velocity / max(Physical velocity, 0.001)
        # Normalized for percentage burn relative to original/revised cost
        orig_cost = self._clean_val(latest.get('Original_Cost') or latest.get('original_cost'), 1.0)
        orig_cost = max(1.0, orig_cost)
        rev_cost = self._clean_val(latest.get('Revised_Cost') or latest.get('revised_cost'), orig_cost)
        base_cost = max(1.0, rev_cost if rev_cost > 0 else orig_cost)
        
        # Normalized monthly burn in % of total cost
        norm_burn_pct = (rolling_burn_rate / base_cost) * 100.0 if base_cost > 0 else 0.0
        slippage_ratio = norm_burn_pct / max(rolling_phys_vel, 0.05) if rolling_phys_vel > 0 else (2.5 if rolling_burn_rate > 0 else 1.0)
        slippage_ratio = max(0.1, min(10.0, float(self._clean_val(slippage_ratio, 1.0))))
        
        # Velocity trends (acceleration)
        phys_accel = 0.0
        if len(phys_vel_series) >= 2:
            phys_accel = self._clean_val(phys_vel_series[-1] - phys_vel_series[0], 0.0)
            
        burn_accel = 0.0
        if len(burn_series) >= 2:
            burn_accel = self._clean_val(burn_series[-1] - burn_series[0], 0.0)

        # Confidence determination based on observation count
        if n_obs >= 4:
            confidence = "High"
        elif n_obs == 3:
            confidence = "Moderate"
        elif n_obs == 2:
            confidence = "Low"
        else:
            confidence = "Very Low"

        cum_exp = self._clean_val(latest.get('Cumulative_Expenditure') or latest.get('cumulative_expenditure'), 0.0)
        phys_prog = self._clean_val(latest.get('Physical_Progress') or latest.get('physical_progress'), 0.0)
        cost_esc = self._clean_val(latest.get('Cost_Escalation_Ratio') or latest.get('cost_escalation_ratio'), (rev_cost - orig_cost) / max(1.0, orig_cost))

        return {
            "sorted_records": sorted_records,
            "window_records": window_records,
            "latest": latest,
            "n_obs": n_obs,
            "orig_cost": orig_cost,
            "rev_cost": rev_cost,
            "cum_exp": cum_exp,
            "phys_prog": phys_prog,
            "cost_esc_ratio": cost_esc,
            "rolling_phys_vel": rolling_phys_vel,
            "rolling_burn_rate": rolling_burn_rate,
            "norm_burn_pct": norm_burn_pct,
            "slippage_ratio": slippage_ratio,
            "phys_accel": phys_accel,
            "burn_accel": burn_accel,
            "confidence": confidence
        }

    def evaluate(self, timeline_records: List[Dict[str, Any]]) -> RiskAssessmentOutput:
        """Evaluates longitudinal project observations and returns risk assessment."""
        feat = self._extract_timeline_features(timeline_records)
        if not feat:
            return RiskAssessmentOutput(
                project_code="UNKNOWN",
                risk_score=0.0,
                risk_level="LOW",
                risk_trajectory_trend="STABLE",
                risk_score_delta=0.0,
                cost_risk=0.0,
                schedule_risk=0.0,
                progress_risk=0.0,
                financial_velocity_risk=0.0,
                milestone_risk=0.0,
                slippage_ratio=1.0,
                confidence="Very Low",
                model_version=self.MODEL_VERSION,
                drivers=[],
                alert_tags=[]
            )

        latest = feat["latest"]
        project_code = str(latest.get('Project_Code') or latest.get('project_code') or 'UNKNOWN')
        cost_esc = feat["cost_esc_ratio"]
        phys_prog = feat["phys_prog"]
        phys_vel = feat["rolling_phys_vel"]
        slippage = feat["slippage_ratio"]
        cum_exp = feat["cum_exp"]
        rev_cost = feat["rev_cost"]
        orig_cost = feat["orig_cost"]
        
        # 1. Cost Risk (25% Weight)
        cost_risk_val = 0.0
        if cost_esc > 0.50: # >50% cost increase
            cost_risk_val = 95.0
        elif cost_esc > 0.20: # 20-50%
            cost_risk_val = 75.0
        elif cost_esc > 0.05: # 5-20%
            cost_risk_val = 45.0
        elif cost_esc > 0.0:
            cost_risk_val = 25.0
        else:
            cost_risk_val = 10.0
            
        # Add expenditure overrun factor if spending > revised cost
        if rev_cost > 0 and (cum_exp / rev_cost) > 1.05:
            cost_risk_val = min(100.0, cost_risk_val + 20.0)

        # 2. Schedule Risk (25% Weight)
        sched_risk_val = 20.0
        orig_doc = latest.get('Original_Target_DoC') or latest.get('original_target_doc')
        rev_doc = latest.get('Revised_DoC') or latest.get('revised_doc')
        if rev_doc and orig_doc and str(rev_doc).strip() != str(orig_doc).strip():
            sched_risk_val += 40.0
            
        if phys_prog < 95.0 and phys_vel < 0.5:
            sched_risk_val += 35.0
        elif phys_prog < 80.0 and phys_vel < 1.0:
            sched_risk_val += 20.0
            
        sched_risk_val = min(100.0, sched_risk_val)

        # 3. Progress Risk (20% Weight)
        prog_risk_val = 15.0
        if phys_prog < 100.0:
            if phys_vel <= 0.05: # Stagnant
                prog_risk_val = 90.0
            elif phys_vel < 0.5:
                prog_risk_val = 70.0
            elif phys_vel < 1.5:
                prog_risk_val = 40.0
            elif phys_vel < 3.0:
                prog_risk_val = 20.0
            else:
                prog_risk_val = 5.0
                
        if feat["phys_accel"] < -0.5: # Decelerating
            prog_risk_val = min(100.0, prog_risk_val + 15.0)

        # 4. Financial Velocity Risk (20% Weight)
        fin_risk_val = 15.0
        if slippage > 2.5: # Extreme spending mismatch
            fin_risk_val = 90.0
        elif slippage > 1.8:
            fin_risk_val = 70.0
        elif slippage > 1.2:
            fin_risk_val = 40.0
        else:
            fin_risk_val = 15.0
            
        if feat["burn_accel"] > 20.0 and phys_vel < 1.0:
            fin_risk_val = min(100.0, fin_risk_val + 15.0)

        # 5. Milestone / Historical Friction Risk (10% Weight)
        ms_risk_val = 20.0
        if rev_doc and phys_prog < 50.0:
            ms_risk_val = 75.0
        elif rev_doc:
            ms_risk_val = 50.0
        elif phys_vel <= 0.0:
            ms_risk_val = 80.0

        # Weighted final risk score (0-100)
        final_risk = (
            cost_risk_val * 0.25 +
            sched_risk_val * 0.25 +
            prog_risk_val * 0.20 +
            fin_risk_val * 0.20 +
            ms_risk_val * 0.10
        )
        final_risk = max(0.0, min(100.0, float(final_risk)))

        # Category
        if final_risk >= 75.0:
            risk_level = "CRITICAL"
        elif final_risk >= 50.0:
            risk_level = "HIGH"
        elif final_risk >= 25.0:
            risk_level = "MODERATE"
        else:
            risk_level = "LOW"

        # Trajectory trend calculation across previous months
        records = feat["sorted_records"]
        risk_delta = 0.0
        trend = "STABLE"
        if len(records) >= 2:
            prev_feat = self._extract_timeline_features(records[:-1])
            prev_risk = (
                (95.0 if prev_feat["cost_esc_ratio"] > 0.5 else 45.0) * 0.25 +
                (70.0 if prev_feat["rolling_phys_vel"] < 0.5 else 20.0) * 0.25 +
                (80.0 if prev_feat["rolling_phys_vel"] <= 0.1 else 20.0) * 0.20 +
                (80.0 if prev_feat["slippage_ratio"] > 2.0 else 20.0) * 0.20 +
                30.0 * 0.10
            )
            risk_delta = round(final_risk - prev_risk, 1)
            if risk_delta > 3.0:
                trend = "UP"
            elif risk_delta < -3.0:
                trend = "DOWN"

        # Explainable Drivers
        drivers = []
        raw_contribs = {
            "Cost Escalation": (cost_risk_val * 0.25, f"+{cost_esc*100:.1f}% revised cost growth vs original approval"),
            "Physical Progress Slowdown": (prog_risk_val * 0.20, f"Monthly physical velocity is {phys_vel:.2f}%/mo"),
            "Schedule Slippage": (sched_risk_val * 0.25, f"Revised commissioning date with remaining physical work {100-phys_prog:.1f}%"),
            "Financial Burn Mismatch": (fin_risk_val * 0.20, f"Slippage ratio {slippage:.2f}x expenditure relative to progress"),
            "Execution Friction": (ms_risk_val * 0.10, f"Milestone progress tracking across {feat['n_obs']} observations")
        }
        
        total_raw = sum(v[0] for v in raw_contribs.values()) or 1.0
        for name, (val, expl) in raw_contribs.items():
            pct = round((val / total_raw) * 100.0, 1)
            sev = "CRITICAL" if val >= 18.0 else ("HIGH" if val >= 12.0 else ("MODERATE" if val >= 6.0 else "LOW"))
            drivers.append(RiskDriver(
                driver_name=name,
                contribution_pct=pct,
                severity=sev,
                observed_value=f"{val:.1f} pts",
                explanation=expl
            ))
            
        drivers.sort(key=lambda d: d.contribution_pct, reverse=True)

        # Alert tags
        alert_tags = []
        if cost_esc > 0.25:
            alert_tags.append("Severe Cost Escalation")
        if slippage > 1.8:
            alert_tags.append("Financial Burn Disconnect")
        if phys_vel < 0.3 and phys_prog < 98.0:
            alert_tags.append("Progress Stagnation")
        if sched_risk_val > 70.0:
            alert_tags.append("Schedule Slippage")
        if not alert_tags and final_risk > 50.0:
            alert_tags.append("High Compound Risk")

        return RiskAssessmentOutput(
            project_code=project_code,
            risk_score=round(final_risk, 1),
            risk_level=risk_level,
            risk_trajectory_trend=trend,
            risk_score_delta=risk_delta,
            cost_risk=round(cost_risk_val, 1),
            schedule_risk=round(sched_risk_val, 1),
            progress_risk=round(prog_risk_val, 1),
            financial_velocity_risk=round(fin_risk_val, 1),
            milestone_risk=round(ms_risk_val, 1),
            slippage_ratio=round(slippage, 2),
            confidence=feat["confidence"],
            model_version=self.MODEL_VERSION,
            drivers=drivers,
            alert_tags=alert_tags
        )

    def predict_cost(self, timeline_records: List[Dict[str, Any]]) -> CostPrediction:
        """Projects final cost based on remaining physical work, historical cost escalation, and burn velocity."""
        feat = self._extract_timeline_features(timeline_records)
        if not feat:
            return CostPrediction(
                original_cost=0.0,
                revised_cost=0.0,
                predicted_final_cost=0.0,
                predicted_escalation_cr=0.0,
                predicted_escalation_pct=0.0,
                prediction_range_min=0.0,
                prediction_range_max=0.0,
                confidence="Very Low",
                model_version=self.MODEL_VERSION
            )

        orig_cost = feat["orig_cost"]
        rev_cost = feat["rev_cost"]
        cum_exp = feat["cum_exp"]
        phys_prog = max(1.0, feat["phys_prog"])
        cost_esc = feat["cost_esc_ratio"]
        
        # Trajectory cost estimation:
        # Projected total based on current burn-per-progress unit
        implied_unit_cost = cum_exp / (phys_prog / 100.0) if phys_prog > 5.0 else rev_cost
        
        # Blend revised cost with empirical trajectory
        blend_factor = min(0.7, (phys_prog / 100.0) * 0.8)
        predicted_final = (1 - blend_factor) * rev_cost + blend_factor * implied_unit_cost
        
        # Ensure predicted cost is at least cumulative expenditure
        predicted_final = max(cum_exp, max(rev_cost, predicted_final))
        escalation_cr = max(0.0, predicted_final - orig_cost)
        escalation_pct = (escalation_cr / orig_cost) * 100.0 if orig_cost > 0 else 0.0
        
        # Bounds: +/- 8% to 15% depending on history length
        margin = 0.08 if feat["confidence"] == "High" else 0.15
        range_min = round(predicted_final * (1.0 - margin), 2)
        range_max = round(predicted_final * (1.0 + margin), 2)

        return CostPrediction(
            original_cost=round(orig_cost, 2),
            revised_cost=round(rev_cost, 2),
            predicted_final_cost=round(predicted_final, 2),
            predicted_escalation_cr=round(escalation_cr, 2),
            predicted_escalation_pct=round(escalation_pct, 2),
            prediction_range_min=range_min,
            prediction_range_max=range_max,
            confidence=feat["confidence"],
            model_version=self.MODEL_VERSION
        )

    def predict_schedule(self, timeline_records: List[Dict[str, Any]]) -> TimePrediction:
        """Projects completion date based on remaining physical work and rolling velocity."""
        feat = self._extract_timeline_features(timeline_records)
        latest = feat.get("latest", {})
        orig_doc = latest.get('Original_Target_DoC') or latest.get('original_target_doc')
        rev_doc = latest.get('Revised_DoC') or latest.get('revised_doc')
        
        phys_prog = self._clean_val(feat.get("phys_prog", 0.0), 0.0)
        rolling_vel = self._clean_val(feat.get("rolling_phys_vel", 0.0), 0.0)
        if rolling_vel <= 0.0:
            rolling_vel = max(0.2, phys_prog / max(1, feat.get("n_obs", 1)))
        rolling_vel = self._clean_val(rolling_vel, 0.5)

        remaining_work = max(0.0, 100.0 - phys_prog)
        
        # Safe velocity for division
        safe_vel = max(0.2, rolling_vel)
        projected_months = remaining_work / safe_vel
        
        # Cap projected months to realistic maximum (e.g. 60 months)
        projected_months = min(60.0, max(0.0, projected_months))
        
        # Current report date
        rep_date_str = str(latest.get('Report_Date') or latest.get('report_date') or '2026-07-01')
        try:
            curr_date = datetime.strptime(rep_date_str, "%Y-%m-%d")
        except:
            curr_date = datetime(2026, 7, 1)
            
        proj_completion_dt = curr_date + timedelta(days=int(projected_months * 30.4))
        proj_completion_str = proj_completion_dt.strftime("%m/%Y")
        
        # Delay probability calculation
        delay_prob = 20.0
        if rev_doc or rolling_vel < 1.0:
            delay_prob = min(95.0, 40.0 + (100.0 - min(100.0, rolling_vel * 50.0)))
            
        return TimePrediction(
            original_doc=str(orig_doc) if (orig_doc and not pd.isna(orig_doc) and str(orig_doc).lower() != 'nan') else None,
            revised_doc=str(rev_doc) if (rev_doc and not pd.isna(rev_doc) and str(rev_doc).lower() != 'nan') else None,
            predicted_completion_date=proj_completion_str,
            predicted_delay_months=round(self._clean_val(projected_months, 0.0), 1),
            delay_probability_pct=round(self._clean_val(delay_prob, 20.0), 1),
            rolling_velocity_pct_pm=round(self._clean_val(rolling_vel, 0.0), 2),
            confidence=feat.get("confidence", "Very Low"),
            model_version=self.MODEL_VERSION
        )

# Singleton instance
heuristic_engine = HeuristicPredictionEngine()
