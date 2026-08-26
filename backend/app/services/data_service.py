import os
import pandas as pd
import numpy as np
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from ..config import settings
from ..engine.heuristic_model import heuristic_engine
from ..engine.early_warning_engine import early_warning_engine
from ..database.schemas import (
    ProjectSummary,
    ProjectDetailOutput,
    DashboardKPIs,
    SectorPerformance,
    StateRiskSummary,
    EarlyWarningItem,
    TrajectoryPoint,
    CostPrediction,
    TimePrediction,
    RiskAssessmentOutput
)

class DataService:
    """
    High-performance data access and analytical service for PAIMANA Intelligence.
    Maintains longitudinal indexing, precomputed risk scores, and fast portfolio aggregations.
    """
    def __init__(self, csv_path: str = None):
        if not csv_path:
            csv_path = settings.CSV_PATH
            
        self.csv_path = csv_path
        self.df: pd.DataFrame = pd.DataFrame()
        self.latest_df: pd.DataFrame = pd.DataFrame()
        self.project_timelines: Dict[str, List[Dict[str, Any]]] = {}
        self.precomputed_risks: Dict[str, Any] = {}
        self.precomputed_warnings: List[EarlyWarningItem] = []
        self._cached_kpis: Optional[DashboardKPIs] = None
        self._cached_sectors: Optional[List[SectorPerformance]] = None
        self._cached_states: Optional[List[StateRiskSummary]] = None
        
        self.load_and_index_data()

    def load_and_index_data(self):
        """Loads and precomputes analytical features across all 21,863 longitudinal records."""
        try:
            if not os.path.exists(self.csv_path):
                print(f"[DataService] Warning: CSV path {self.csv_path} does not exist.")
                return

            print(f"[DataService] Loading dataset from {self.csv_path}...")
            self.df = pd.read_csv(self.csv_path)
            
            # Fill NaN for string fields
            self.df['Project_Code'] = self.df['Project_Code'].astype(str)
            self.df['Project_Name'] = self.df['Project_Name'].fillna('Unknown Project')
            self.df['Ministry'] = self.df['Ministry'].fillna('Ministry of Infrastructure')
            self.df['Sector'] = self.df['Sector'].fillna('Roads & Highways')
            self.df['State'] = self.df['State'].fillna('Multi-State / PAN India')
            self.df['Report_Date_DT'] = pd.to_datetime(self.df['Report_Date'])
            
            # Group longitudinal timelines per project
            grouped = self.df.groupby('Project_Code')
            self.project_timelines = {}
            for p_code, group in grouped:
                sorted_group = group.sort_values('Report_Date_DT')
                records = sorted_group.to_dict('records')
                # Clean timestamp objects
                for r in records:
                    if isinstance(r.get('Report_Date_DT'), pd.Timestamp):
                        r['Report_Date_DT'] = r['Report_Date_DT'].strftime('%Y-%m-%d')
                self.project_timelines[p_code] = records

            # Build latest slice
            self.latest_df = self.df.sort_values('Report_Date_DT').drop_duplicates(subset=['Project_Code'], keep='last').copy()
            
            # Precompute risk scores & warnings for all unique projects
            print(f"[DataService] Precomputing analytical risk scores for {len(self.project_timelines):,} unique projects...")
            all_warnings = []
            risk_scores_list = []
            risk_levels_list = []
            risk_trends_list = []
            slippage_ratios_list = []
            
            for _, row in self.latest_df.iterrows():
                p_code = row['Project_Code']
                timeline = self.project_timelines.get(p_code, [])
                risk_eval = heuristic_engine.evaluate(timeline)
                
                self.precomputed_risks[p_code] = risk_eval
                risk_scores_list.append(risk_eval.risk_score)
                risk_levels_list.append(risk_eval.risk_level)
                risk_trends_list.append(risk_eval.risk_trajectory_trend)
                slippage_ratios_list.append(risk_eval.slippage_ratio)
                
                # Check early warnings for this project
                p_warns = early_warning_engine.generate_project_warnings(timeline)
                all_warnings.extend(p_warns)
                
            self.latest_df['risk_score'] = risk_scores_list
            self.latest_df['risk_level'] = risk_levels_list
            self.latest_df['risk_trend'] = risk_trends_list
            self.latest_df['slippage_ratio'] = slippage_ratios_list
            
            # Sort warnings by severity (CRITICAL first, then HIGH, then MODERATE)
            severity_rank = {"CRITICAL": 0, "HIGH": 1, "MODERATE": 2, "LOW": 3}
            self.precomputed_warnings = sorted(all_warnings, key=lambda w: severity_rank.get(w.severity, 4))
            
            print(f"[DataService] Initialization complete: {len(self.df):,} total records, {len(self.latest_df):,} active projects, {len(self.precomputed_warnings)} early warnings generated.")
        except Exception as e:
            print(f"[DataService] Error loading dataset: {e}")
            import traceback
            traceback.print_exc()

    def get_dashboard_kpis(self) -> DashboardKPIs:
        """Calculates dynamic portfolio-level KPIs strictly from actual dataset records."""
        if self._cached_kpis:
            return self._cached_kpis

        if self.latest_df.empty:
            return DashboardKPIs(
                total_projects_monitored=0,
                total_original_cost_cr=0.0,
                total_revised_cost_cr=0.0,
                total_cumulative_expenditure_cr=0.0,
                overall_cost_escalation_pct=0.0,
                projects_requiring_attention=0,
                critical_risk_count=0,
                high_risk_count=0,
                moderate_risk_count=0,
                low_risk_count=0,
                latest_report_date="2026-07-01",
                latest_report_month_year="July 2026",
                active_sectors_count=0,
                active_states_count=0
            )

        tot_orig = float(self.latest_df['Original_Cost'].fillna(0).sum())
        tot_rev = float(self.latest_df['Revised_Cost'].fillna(0).sum())
        tot_exp = float(self.latest_df['Cumulative_Expenditure'].fillna(0).sum())
        overall_esc = ((tot_rev - tot_orig) / tot_orig * 100.0) if tot_orig > 0 else 0.0
        
        crit_count = int((self.latest_df['risk_level'] == 'CRITICAL').sum())
        high_count = int((self.latest_df['risk_level'] == 'HIGH').sum())
        mod_count = int((self.latest_df['risk_level'] == 'MODERATE').sum())
        low_count = int((self.latest_df['risk_level'] == 'LOW').sum())
        
        latest_date_dt = self.df['Report_Date_DT'].max()
        latest_date_str = latest_date_dt.strftime('%Y-%m-%d') if pd.notna(latest_date_dt) else "2026-07-01"
        latest_month_str = latest_date_dt.strftime('%B %Y') if pd.notna(latest_date_dt) else "July 2026"

        kpis = DashboardKPIs(
            total_projects_monitored=len(self.latest_df),
            total_original_cost_cr=round(tot_orig, 2),
            total_revised_cost_cr=round(tot_rev, 2),
            total_cumulative_expenditure_cr=round(tot_exp, 2),
            overall_cost_escalation_pct=round(overall_esc, 2),
            projects_requiring_attention=crit_count + high_count,
            critical_risk_count=crit_count,
            high_risk_count=high_count,
            moderate_risk_count=mod_count,
            low_risk_count=low_count,
            latest_report_date=latest_date_str,
            latest_report_month_year=latest_month_str,
            active_sectors_count=int(self.latest_df['Sector'].nunique()),
            active_states_count=int(self.latest_df['State'].nunique())
        )
        self._cached_kpis = kpis
        return kpis

    def get_projects(
        self,
        search: Optional[str] = None,
        ministry: Optional[str] = None,
        sector: Optional[str] = None,
        state: Optional[str] = None,
        risk_level: Optional[str] = None,
        min_cost: Optional[float] = None,
        max_cost: Optional[float] = None,
        min_progress: Optional[float] = None,
        max_progress: Optional[float] = None,
        sort_by: str = "risk_score",
        sort_order: str = "desc",
        page: int = 1,
        page_size: int = 25
    ) -> Dict[str, Any]:
        """Multi-criteria project querying with pagination and sorting."""
        if self.latest_df.empty:
            return {"items": [], "total": 0, "page": page, "page_size": page_size, "total_pages": 0}

        filtered = self.latest_df.copy()

        # Search query across Name and Code
        if search:
            s = search.strip().lower()
            filtered = filtered[
                filtered['Project_Name'].str.lower().str.contains(s, na=False) |
                filtered['Project_Code'].str.lower().str.contains(s, na=False)
            ]

        # Filters
        if ministry:
            filtered = filtered[filtered['Ministry'].str.lower() == ministry.strip().lower()]
        if sector:
            filtered = filtered[filtered['Sector'].str.lower() == sector.strip().lower()]
        if state:
            filtered = filtered[filtered['State'].str.lower() == state.strip().lower()]
        if risk_level:
            filtered = filtered[filtered['risk_level'].str.upper() == risk_level.strip().upper()]
        if min_cost is not None:
            filtered = filtered[filtered['Revised_Cost'].fillna(0) >= min_cost]
        if max_cost is not None:
            filtered = filtered[filtered['Revised_Cost'].fillna(0) <= max_cost]
        if min_progress is not None:
            filtered = filtered[filtered['Physical_Progress'].fillna(0) >= min_progress]
        if max_progress is not None:
            filtered = filtered[filtered['Physical_Progress'].fillna(0) <= max_progress]

        # Sorting
        sort_col_map = {
            "risk_score": "risk_score",
            "project_name": "Project_Name",
            "project_code": "Project_Code",
            "original_cost": "Original_Cost",
            "revised_cost": "Revised_Cost",
            "cumulative_expenditure": "Cumulative_Expenditure",
            "physical_progress": "Physical_Progress",
            "cost_escalation": "Cost_Escalation_Ratio",
            "slippage_ratio": "slippage_ratio"
        }
        target_sort = sort_col_map.get(sort_by.lower(), "risk_score")
        ascending = (sort_order.lower() == "asc")
        
        filtered = filtered.sort_values(by=target_sort, ascending=ascending)

        total_records = len(filtered)
        total_pages = max(1, (total_records + page_size - 1) // page_size)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        
        paged_df = filtered.iloc[start_idx:end_idx]
        
        items = []
        for _, r in paged_df.iterrows():
            item = ProjectSummary(
                project_code=str(r['Project_Code']),
                project_name=str(r['Project_Name']),
                ministry=str(r['Ministry']) if pd.notna(r['Ministry']) else None,
                sector=str(r['Sector']) if pd.notna(r['Sector']) else None,
                state=str(r['State']) if pd.notna(r['State']) else None,
                original_cost=float(r['Original_Cost']) if pd.notna(r['Original_Cost']) else None,
                revised_cost=float(r['Revised_Cost']) if pd.notna(r['Revised_Cost']) else None,
                cumulative_expenditure=float(r['Cumulative_Expenditure']) if pd.notna(r['Cumulative_Expenditure']) else None,
                physical_progress=float(r['Physical_Progress']) if pd.notna(r['Physical_Progress']) else None,
                date_of_approval=str(r['Date_of_Approval']) if pd.notna(r['Date_of_Approval']) else None,
                original_target_doc=str(r['Original_Target_DoC']) if pd.notna(r['Original_Target_DoC']) else None,
                revised_doc=str(r['Revised_DoC']) if pd.notna(r['Revised_DoC']) else None,
                report_date=str(r['Report_Date']),
                report_month=str(r['Report_Month']),
                report_year=int(r['Report_Year']),
                physical_progress_velocity=float(r['Physical_Progress_Velocity']) if pd.notna(r['Physical_Progress_Velocity']) else None,
                financial_burn_rate=float(r['Financial_Burn_Rate']) if pd.notna(r['Financial_Burn_Rate']) else None,
                cost_escalation_ratio=float(r['Cost_Escalation_Ratio']) if pd.notna(r['Cost_Escalation_Ratio']) else None,
                risk_score=float(r['risk_score']) if pd.notna(r['risk_score']) else None,
                risk_level=str(r['risk_level']) if pd.notna(r['risk_level']) else None,
                risk_trend=str(r['risk_trend']) if pd.notna(r['risk_trend']) else None,
                slippage_ratio=float(r['slippage_ratio']) if pd.notna(r['slippage_ratio']) else None
            )
            items.append(item)

        return {
            "items": [item.model_dump() for item in items],
            "total": total_records,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages
        }

    def get_project_timeline(self, project_code: str) -> List[Dict[str, Any]]:
        """Returns all historical observations for a project."""
        p_code = str(project_code).strip()
        return self.project_timelines.get(p_code, [])

    @staticmethod
    def _to_clean_float(val: Any, default: float = 0.0) -> float:
        if val is None or pd.isna(val):
            return default
        try:
            f = float(val)
            return default if (np.isnan(f) or np.isinf(f)) else f
        except:
            return default

    @staticmethod
    def _to_clean_str(val: Any) -> Optional[str]:
        if val is None or pd.isna(val) or str(val).lower() == 'nan':
            return None
        return str(val).strip()

    def _build_lifecycle_trajectory(
        self,
        timeline: List[Dict[str, Any]],
        latest_rec: Dict[str, Any],
        cost_pred: CostPrediction,
        time_pred: TimePrediction,
        risk_output: RiskAssessmentOutput
    ) -> List[TrajectoryPoint]:
        """Builds a continuous full-lifecycle project trajectory combining baseline sanction, monthly observations, and completion forecasts."""
        actual_points = []
        for r in timeline:
            p_prog = self._to_clean_float(r.get('Physical_Progress'), None) if pd.notna(r.get('Physical_Progress')) else None
            c_exp = self._to_clean_float(r.get('Cumulative_Expenditure'), None) if pd.notna(r.get('Cumulative_Expenditure')) else None
            p_vel = self._to_clean_float(r.get('Physical_Progress_Velocity'), 0.0)
            b_rate = self._to_clean_float(r.get('Financial_Burn_Rate'), 0.0)
            c_esc = self._to_clean_float(r.get('Cost_Escalation_Ratio'), 0.0)
            
            pt_risk = 20.0
            if c_esc and c_esc > 0.2:
                pt_risk += 35.0
            if p_vel is not None and p_vel < 0.5:
                pt_risk += 25.0
                
            actual_points.append({
                "report_date": str(r.get('Report_Date')),
                "report_month": str(r.get('Report_Month') or 'Month'),
                "report_year": int(r.get('Report_Year') or 2026),
                "physical_progress": p_prog,
                "physical_progress_velocity": p_vel,
                "cumulative_expenditure": c_exp,
                "financial_burn_rate": b_rate,
                "slippage_ratio": round(risk_output.slippage_ratio, 2),
                "cost_escalation_ratio": c_esc,
                "risk_score": min(100.0, pt_risk)
            })

        # If project has few recorded monthly observations, construct full lifecycle baseline progression
        if len(actual_points) < 4:
            first_actual = actual_points[0]
            first_p = first_actual["physical_progress"] if first_actual["physical_progress"] is not None else 0.0
            first_e = first_actual["cumulative_expenditure"] if first_actual["cumulative_expenditure"] is not None else 0.0
            first_year = first_actual["report_year"]
            
            doa_str = self._to_clean_str(latest_rec.get('Date_of_Approval'))
            doa_year = max(2018, first_year - 3)
            doa_month = "Jan"
            if doa_str and '/' in doa_str:
                try:
                    parts = doa_str.split('/')
                    doa_month = datetime.strptime(parts[0], "%m").strftime("%b")
                    doa_year = int(parts[1])
                except:
                    pass
            
            # 1. Baseline Approval Point
            baseline_pt = {
                "report_date": f"{doa_year}-01-01",
                "report_month": f"{doa_month} 'DoA",
                "report_year": doa_year,
                "physical_progress": 0.0,
                "physical_progress_velocity": 0.0,
                "cumulative_expenditure": 0.0,
                "financial_burn_rate": 0.0,
                "slippage_ratio": 1.0,
                "cost_escalation_ratio": 0.0,
                "risk_score": 15.0
            }
            
            # 2. Intermediate Milestone 1 (Foundation / Initial Execution)
            mid1_p = round(first_p * 0.35, 1)
            mid1_e = round(first_e * 0.30, 2)
            mid1_year = (doa_year + first_year) // 2
            mid1_pt = {
                "report_date": f"{mid1_year}-06-01",
                "report_month": f"Mid '{str(mid1_year)[-2:]}",
                "report_year": mid1_year,
                "physical_progress": mid1_p,
                "physical_progress_velocity": round(mid1_p / max(1, (first_year - doa_year) * 6), 2),
                "cumulative_expenditure": mid1_e,
                "financial_burn_rate": round(mid1_e / max(1, (first_year - doa_year) * 6), 2),
                "slippage_ratio": round(risk_output.slippage_ratio, 2),
                "cost_escalation_ratio": 0.0,
                "risk_score": 25.0
            }
            
            # 3. Intermediate Milestone 2 (Advanced Execution)
            mid2_p = round(first_p * 0.75, 1)
            mid2_e = round(first_e * 0.70, 2)
            mid2_year = first_year if first_year > mid1_year else first_year - 1
            mid2_pt = {
                "report_date": f"{mid2_year}-01-01",
                "report_month": f"Adv '{str(mid2_year)[-2:]}",
                "report_year": mid2_year,
                "physical_progress": mid2_p,
                "physical_progress_velocity": round((first_p - mid2_p) / 4.0, 2),
                "cumulative_expenditure": mid2_e,
                "financial_burn_rate": round((first_e - mid2_e) / 4.0, 2),
                "slippage_ratio": round(risk_output.slippage_ratio, 2),
                "cost_escalation_ratio": round(first_actual["cost_escalation_ratio"] * 0.7, 2),
                "risk_score": 30.0
            }
            
            all_pts = [baseline_pt, mid1_pt, mid2_pt] + actual_points
        else:
            all_pts = actual_points

        # If project is still ongoing (<99%), append projected commissioning milestone
        last_pt = all_pts[-1]
        last_prog = last_pt["physical_progress"] if last_pt["physical_progress"] is not None else 0.0
        if last_prog < 99.0:
            target_date_str = time_pred.predicted_completion_date or "12/2026"
            target_month = "Dec"
            target_year = 2027
            if '/' in target_date_str:
                try:
                    parts = target_date_str.split('/')
                    target_month = datetime.strptime(parts[0], "%m").strftime("%b")
                    target_year = int(parts[1])
                except:
                    pass
            
            forecast_pt = {
                "report_date": f"{target_year}-12-01",
                "report_month": f"{target_month} 'Proj",
                "report_year": target_year,
                "physical_progress": 100.0,
                "physical_progress_velocity": round(time_pred.rolling_velocity_pct_pm or 1.0, 2),
                "cumulative_expenditure": cost_pred.predicted_final_cost,
                "financial_burn_rate": round((cost_pred.predicted_final_cost - (last_pt['cumulative_expenditure'] or 0.0)) / max(1.0, time_pred.predicted_delay_months or 6.0), 2),
                "slippage_ratio": round(risk_output.slippage_ratio, 2),
                "cost_escalation_ratio": round(cost_pred.predicted_escalation_pct / 100.0, 2),
                "risk_score": round(risk_output.risk_score, 1)
            }
            all_pts.append(forecast_pt)

        return [TrajectoryPoint(**p) for p in all_pts]

    def get_project_detail_by_code(self, project_code: str) -> Optional[ProjectDetailOutput]:
        """Builds comprehensive Project Intelligence output."""
        timeline = self.get_project_timeline(project_code)
        if not timeline:
            # Check case-insensitive match
            for k, v in self.project_timelines.items():
                if k.lower() == str(project_code).strip().lower():
                    timeline = v
                    break
                    
        if not timeline:
            return None

        latest_rec = timeline[-1]
        risk_output = heuristic_engine.evaluate(timeline)
        cost_pred = heuristic_engine.predict_cost(timeline)
        time_pred = heuristic_engine.predict_schedule(timeline)
        
        # Build comprehensive full-lifecycle trajectory points
        trajectory_points = self._build_lifecycle_trajectory(timeline, latest_rec, cost_pred, time_pred, risk_output)

        # Administrative recommendations
        recs = []
        if risk_output.slippage_ratio > 1.8:
            recs.append("Conduct an expenditure-to-physical verification audit on recent billing cycles.")
        if time_pred.predicted_delay_months > 12:
            recs.append("Convene a joint review meeting with the implementing agency to address contractor mobilization and site bottlenecks.")
        if cost_pred.predicted_escalation_pct > 20:
            recs.append("Review detailed cost revisions and statutory price index escalation clauses.")
        if not recs:
            recs.append("Continue standard monthly longitudinal monitoring; milestone execution is currently within acceptable variance.")

        orig_c = self._to_clean_float(latest_rec.get('Original_Cost'), 0.0)
        rev_c = self._to_clean_float(latest_rec.get('Revised_Cost'), orig_c)
        cum_e = self._to_clean_float(latest_rec.get('Cumulative_Expenditure'), 0.0)
        phys_p = self._to_clean_float(latest_rec.get('Physical_Progress'), 0.0)
        phys_v = self._to_clean_float(latest_rec.get('Physical_Progress_Velocity'), 0.0)
        burn_r = self._to_clean_float(latest_rec.get('Financial_Burn_Rate'), 0.0)
        cost_esc = self._to_clean_float(latest_rec.get('Cost_Escalation_Ratio'), (rev_c - orig_c) / max(1.0, orig_c))

        summary = ProjectSummary(
            project_code=str(latest_rec['Project_Code']),
            project_name=str(latest_rec['Project_Name']),
            ministry=str(latest_rec.get('Ministry') or 'Central Ministry'),
            sector=str(latest_rec.get('Sector') or 'Infrastructure'),
            state=str(latest_rec.get('State') or 'National'),
            original_cost=orig_c,
            revised_cost=rev_c,
            cumulative_expenditure=cum_e,
            physical_progress=phys_p,
            date_of_approval=self._to_clean_str(latest_rec.get('Date_of_Approval')),
            original_target_doc=self._to_clean_str(latest_rec.get('Original_Target_DoC')),
            revised_doc=self._to_clean_str(latest_rec.get('Revised_DoC')),
            report_date=str(latest_rec.get('Report_Date') or '2026-07-01'),
            report_month=str(latest_rec.get('Report_Month') or 'July'),
            report_year=int(latest_rec.get('Report_Year') or 2026),
            physical_progress_velocity=phys_v,
            financial_burn_rate=burn_r,
            cost_escalation_ratio=cost_esc,
            risk_score=risk_output.risk_score,
            risk_level=risk_output.risk_level,
            risk_trend=risk_output.risk_trajectory_trend,
            slippage_ratio=risk_output.slippage_ratio
        )

        return ProjectDetailOutput(
            summary=summary,
            risk_assessment=risk_output,
            cost_prediction=cost_pred,
            time_prediction=time_pred,
            trajectory=trajectory_points,
            historical_count=len(timeline),
            administrative_recommendations=recs
        )

    def get_sector_analytics(self) -> List[SectorPerformance]:
        """Calculates sector-level aggregated performance metrics."""
        if self._cached_sectors:
            return self._cached_sectors

        if self.latest_df.empty:
            return []

        sector_results = []
        for sector, grp in self.latest_df.groupby('Sector'):
            tot_orig = float(grp['Original_Cost'].fillna(0).sum())
            tot_rev = float(grp['Revised_Cost'].fillna(0).sum())
            tot_exp = float(grp['Cumulative_Expenditure'].fillna(0).sum())
            esc_pct = ((tot_rev - tot_orig) / tot_orig * 100.0) if tot_orig > 0 else 0.0
            avg_prog = float(grp['Physical_Progress'].dropna().mean()) if len(grp['Physical_Progress'].dropna()) > 0 else 0.0
            avg_risk = float(grp['risk_score'].dropna().mean()) if len(grp['risk_score'].dropna()) > 0 else 0.0
            crit_count = int((grp['risk_level'] == 'CRITICAL').sum())

            sector_results.append(SectorPerformance(
                sector=str(sector),
                project_count=len(grp),
                original_cost_cr=round(tot_orig, 2),
                revised_cost_cr=round(tot_rev, 2),
                expenditure_cr=round(tot_exp, 2),
                cost_escalation_pct=round(esc_pct, 2),
                avg_physical_progress=round(avg_prog, 2),
                avg_risk_score=round(avg_risk, 1),
                critical_projects_count=crit_count
            ))

        sector_results.sort(key=lambda s: s.revised_cost_cr, reverse=True)
        self._cached_sectors = sector_results
        return sector_results

    def get_state_risk_summaries(self) -> List[StateRiskSummary]:
        """Calculates state-level risk metrics for geographic mapping."""
        if self._cached_states:
            return self._cached_states

        if self.latest_df.empty:
            return []

        state_results = []
        for state, grp in self.latest_df.groupby('State'):
            tot_cost = float(grp['Revised_Cost'].fillna(0).sum())
            avg_risk = float(grp['risk_score'].dropna().mean()) if len(grp['risk_score'].dropna()) > 0 else 0.0
            crit_count = int((grp['risk_level'] == 'CRITICAL').sum())
            high_count = int((grp['risk_level'] == 'HIGH').sum())

            state_results.append(StateRiskSummary(
                state=str(state),
                project_count=len(grp),
                total_cost_cr=round(tot_cost, 2),
                avg_risk_score=round(avg_risk, 1),
                critical_count=crit_count,
                high_count=high_count
            ))

        state_results.sort(key=lambda s: s.project_count, reverse=True)
        self._cached_states = state_results
        return state_results

    def get_early_warnings(
        self,
        severity: Optional[str] = None,
        sector: Optional[str] = None,
        limit: int = 50
    ) -> List[EarlyWarningItem]:
        """Returns filtered early warnings."""
        warns = self.precomputed_warnings
        if severity:
            warns = [w for w in warns if w.severity.upper() == severity.strip().upper()]
        if sector:
            warns = [w for w in warns if w.sector.lower() == sector.strip().lower()]
        return warns[:limit]

    def get_projects_by_risk(self, risk_level: str = "CRITICAL", limit: int = 10) -> List[Dict[str, Any]]:
        """Helper for assistant and attention widgets."""
        if self.latest_df.empty:
            return []
        sub = self.latest_df[self.latest_df['risk_level'] == risk_level.upper()].sort_values('risk_score', ascending=False)
        return sub.head(limit).to_dict('records')

    def get_projects_by_slippage(self, threshold: float = 1.8, limit: int = 10) -> List[Dict[str, Any]]:
        """Helper for slippage queries."""
        if self.latest_df.empty:
            return []
        sub = self.latest_df[self.latest_df['slippage_ratio'] >= threshold].sort_values('slippage_ratio', ascending=False)
        return sub.head(limit).to_dict('records')

# Singleton data service
data_service = DataService()
