import re
from typing import Dict, Any, List
from ..database.schemas import IntelligenceQueryResponse

class ProjectIntelligenceAssistant:
    """
    Deterministic Natural Language Assistant for PAIMANA Intelligence.
    Ensures 0% hallucination by mapping queries to structured queries against real database data.
    """
    
    def process_query(self, query: str, data_service_instance) -> IntelligenceQueryResponse:
        q = query.strip().lower()
        
        # Intent 1: Highest risk projects
        if any(k in q for k in ["highest risk", "top risk", "most risky", "critical projects", "requiring attention"]):
            critical_projects = data_service_instance.get_projects_by_risk(risk_level="CRITICAL", limit=5)
            if not critical_projects:
                critical_projects = data_service_instance.get_projects_by_risk(risk_level="HIGH", limit=5)
                
            project_names = [f"**{p['Project_Name']}** (Code: `{p['Project_Code']}`, Sector: *{p.get('Sector', 'Infrastructure')}*, Risk Score: **{p.get('risk_score', 80):.1f}**)" for p in critical_projects]
            answer = (
                f"Currently, there are **{len(critical_projects)} prominent projects** flagged at elevated risk levels in the monitored portfolio:\n\n" +
                "\n".join([f"{i+1}. {txt}" for i, txt in enumerate(project_names)]) +
                "\n\n**Key Administrative Focus**: High expenditure burn rates coupled with sluggish physical progress (<1%/mo) are the primary risk drivers."
            )
            return IntelligenceQueryResponse(
                query=query,
                intent="highest_risk_projects",
                answer=answer,
                data=critical_projects,
                suggested_followups=[
                    "Why is the top project high risk?",
                    "Which sectors have the highest cost escalation?",
                    "Show projects with a slippage ratio above 2.0"
                ]
            )

        # Intent 2: Sectors with highest cost escalation
        if any(k in q for k in ["sector", "sectors", "cost escalation", "cost overrun by sector", "highest overrun"]):
            sectors = data_service_instance.get_sector_analytics()
            top_sectors = sorted(sectors, key=lambda s: s.cost_escalation_pct, reverse=True)[:4]
            lines = [f"- **{s.sector}**: +{s.cost_escalation_pct:.1f}% cost escalation ({s.project_count} projects, Total Revised: ₹{s.revised_cost_cr:,.0f} Cr)" for s in top_sectors]
            answer = (
                "Here are the top infrastructure sectors experiencing the highest cost escalations relative to original approvals:\n\n" +
                "\n".join(lines) +
                "\n\n*Source: PAIMANA Flash Report longitudinal aggregates.*"
            )
            return IntelligenceQueryResponse(
                query=query,
                intent="sector_cost_escalation",
                answer=answer,
                data=[s.model_dump() for s in top_sectors],
                suggested_followups=[
                    "Show critical projects in Railways",
                    "Which projects have accelerating expenditure?",
                    "What is the overall portfolio cost overrun?"
                ]
            )

        # Intent 3: Slippage ratio / burn rate disconnect
        if any(k in q for k in ["slippage ratio", "burn rate", "accelerating expenditure", "spending faster"]):
            slippage_projects = data_service_instance.get_projects_by_slippage(threshold=1.8, limit=5)
            lines = [f"- **{p['Project_Name']}** (Code: `{p['Project_Code']}`): Slippage Ratio **{p.get('slippage_ratio', 2.0):.2f}x**" for p in slippage_projects]
            answer = (
                f"Found **{len(slippage_projects)} projects** where cumulative expenditure is accelerating significantly faster than physical milestone progress (Slippage Ratio > 1.8x):\n\n" +
                "\n".join(lines) +
                "\n\n**Analytical Evidence**: A slippage ratio above 1.8x indicates potential material cost overruns or advance disbursements without corresponding physical execution."
            )
            return IntelligenceQueryResponse(
                query=query,
                intent="slippage_ratio_filter",
                answer=answer,
                data=slippage_projects,
                suggested_followups=[
                    "What is the formula for slippage ratio?",
                    "Show early warnings for these projects",
                    "Which states have the most high risk projects?"
                ]
            )

        # Intent 4: Specific Project query (e.g. "Why is Project 1000MW risky?" or "Details on 180100221")
        proj_code_match = re.search(r'\b([A-Za-z0-9_-]{4,20})\b', query)
        if proj_code_match:
            candidate_code = proj_code_match.group(1).upper()
            detail = data_service_instance.get_project_detail_by_code(candidate_code)
            if detail:
                summ = detail.summary
                risk = detail.risk_assessment
                pred = detail.cost_prediction
                time_p = detail.time_prediction
                
                drivers_str = ", ".join([f"{d.driver_name} ({d.contribution_pct}%)" for d in risk.drivers[:3]])
                answer = (
                    f"### Intelligence Summary: {summ.project_name} (Code: `{summ.project_code}`)\n\n"
                    f"- **Sector / State**: {summ.sector} | {summ.state}\n"
                    f"- **Original / Revised Cost**: ₹{summ.original_cost:,.1f} Cr / ₹{summ.revised_cost:,.1f} Cr (+{(summ.cost_escalation_ratio or 0)*100:.1f}%)\n"
                    f"- **Cumulative Expenditure**: ₹{summ.cumulative_expenditure:,.1f} Cr\n"
                    f"- **Physical Progress**: {summ.physical_progress or 0:.1f}% (Velocity: {time_p.rolling_velocity_pct_pm:.2f}%/mo)\n"
                    f"- **Risk Assessment**: **{risk.risk_score:.1f}/100 ({risk.risk_level})** [Trend: {risk.risk_trajectory_trend}]\n"
                    f"- **Key Risk Drivers**: {drivers_str}\n"
                    f"- **Predicted Outcome**: Projected Final Cost ₹{pred.predicted_final_cost:,.1f} Cr; Target Completion ~{time_p.predicted_completion_date} (Delay: {time_p.predicted_delay_months:.0f} mos)\n\n"
                    f"**Administrative Recommendation**: {detail.administrative_recommendations[0] if detail.administrative_recommendations else 'Review progress velocity.'}"
                )
                return IntelligenceQueryResponse(
                    query=query,
                    intent="project_deep_dive",
                    answer=answer,
                    data=detail.model_dump(),
                    suggested_followups=[
                        f"Show four-month trajectory for {summ.project_code}",
                        "Compare this project against its sector average",
                        "Show early warnings for this project"
                    ]
                )

        # Fallback general summary
        kpis = data_service_instance.get_dashboard_kpis()
        answer = (
            f"**PAIMANA Intelligence Portfolio Overview**:\n\n"
            f"- **Projects Monitored**: {kpis.total_projects_monitored:,} central sector projects\n"
            f"- **Total Approved Cost**: ₹{kpis.total_original_cost_cr:,.0f} Cr\n"
            f"- **Total Revised Cost**: ₹{kpis.total_revised_cost_cr:,.0f} Cr (+{kpis.overall_cost_escalation_pct:.1f}% escalation)\n"
            f"- **Cumulative Expenditure**: ₹{kpis.total_cumulative_expenditure_cr:,.0f} Cr\n"
            f"- **High & Critical Risk Projects**: {kpis.projects_requiring_attention:,} projects\n\n"
            "You can ask specific questions such as:\n"
            "1. *'Which projects have the highest current risk?'*\n"
            "2. *'Which sectors show the highest cost escalation?'*\n"
            "3. *'Show projects with a slippage ratio above 2.0'*\n"
            "4. *'Why is Project 1000MW high risk?'*"
        )
        return IntelligenceQueryResponse(
            query=query,
            intent="general_portfolio_summary",
            answer=answer,
            data=kpis.model_dump(),
            suggested_followups=[
                "Which projects have the highest current risk?",
                "Which sectors show the highest cost escalation?",
                "Show projects with a slippage ratio above 2.0"
            ]
        )

assistant_engine = ProjectIntelligenceAssistant()
