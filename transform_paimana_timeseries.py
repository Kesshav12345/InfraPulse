import pandas as pd
import numpy as np
import re

STATE_NORMALIZATION = {
    'Uttarakhan D': 'Uttarakhand',
    'Maharashtr A': 'Maharashtra',
    'Andhra Prades H': 'Andhra Pradesh',
    'Himachal Prades H': 'Himachal Pradesh',
    'Odish A': 'Odisha',
    'Tamll Nadu': 'Tamil Nadu',
    'Chhattlsgarh': 'Chhattisgarh',
    'Telangan A': 'Telangana',
    'West Benga L': 'West Bengal',
    'Rajast Han': 'Rajasthan',
    'Karnatak A': 'Karnataka',
    'J&K': 'Jammu and Kashmir',
    'A & N Islands': 'Andaman and Nicobar Islands',
    'Andaman & Nicobar Islands': 'Andaman and Nicobar Islands',
    'Delhi (NCT)': 'Delhi',
    'NCT of Delhi': 'Delhi',
    'UT of J&K': 'Jammu and Kashmir',
    'UT of Ladakh': 'Ladakh',
    'PAN India': 'Multi-State / PAN India',
    'Multi State': 'Multi-State / PAN India',
    'Multi-State': 'Multi-State / PAN India',
}

def clean_state(val):
    if pd.isna(val) or not val:
        return 'Multi-State / PAN India'
    s = str(val).strip()
    return STATE_NORMALIZATION.get(s, s)

def classify_project(name, code, state):
    n = str(name).upper()
    c = str(code).upper()
    
    # 1. Petroleum
    if any(k in n for k in ['REFINERY', 'PIPELINE', 'PETROLEUM', 'CRUDE', 'OIL INDIA', 'IOCL', 'BPCL', 'HPCL', 'GAIL', 'ONGC', 'LPG', 'LNG', 'BS-VI', 'PETROCHEMICAL', 'NAPHTHA', 'ETHYLENE']):
        return 'Petroleum & Natural Gas', 'Ministry of Petroleum & Natural Gas'
    # 2. Power
    elif any(k in n for k in ['HEP', 'HYDRO', 'THERMAL', 'TPS', 'POWER', 'TRANSMISSION', 'SUB-STATION', 'SUBSTATION', 'GRID', 'SOLAR', 'REZ', 'NTPC', 'POWERGRID', 'NHPC', 'SJVN', 'NEEPCO', 'THDC', 'TBCB', 'KV', '1000MW', '20GW', 'PUMPED STORAGE', 'NUCLEAR', 'ATOMIC']) or 'GW' in c or '1000MW' in c or c.startswith('1801'):
        return 'Power & Renewable Energy', 'Ministry of Power'
    # 3. Coal
    elif any(k in n for k in ['COAL', 'MINE', 'CIL', 'SECL', 'BCCL', 'ECL', 'WCL', 'MCL', 'NCL', 'NLCIL', 'LIGNITE', 'BLOCK', 'OCP', 'CHP', 'WASHERY']):
        return 'Coal & Lignite', 'Ministry of Coal'
    # 4. Telecom
    elif any(k in n for k in ['BHARATNET', 'TELECOM', 'OFC', 'OPTICAL FIBER', 'BROADBAND', 'BSNL', 'MTNL']) or 'BHARATNET' in n:
        return 'Telecommunications', 'Ministry of Communications'
    # 5. Civil Aviation
    elif any(k in n for k in ['AIRPORT', 'RUNWAY', 'TERMINAL', 'AAI', 'HELIPORT', 'AVIATION', 'AERODROME']):
        return 'Civil Aviation', 'Ministry of Civil Aviation'
    # 6. Ports & Waterways
    elif any(k in n for k in ['PORT', 'HARBOUR', 'JETTY', 'BERTH', 'DREDGING', 'WATERWAYS', 'SHIPPING', 'NW-', 'PORT TRUST', 'VOCPA', 'JNPT', 'MBPT', 'DPA']):
        return 'Ports & Shipping', 'Ministry of Ports, Shipping and Waterways'
    # 7. Health
    elif any(k in n for k in ['AIIMS', 'HOSPITAL', 'MEDICAL COLLEGE', 'HEALTHCARE']):
        return 'Healthcare Infrastructure', 'Ministry of Health & Family Welfare'
    # 8. Higher Education
    elif any(k in n for k in ['IIT', 'IIM', 'NIT', 'UNIVERSITY', 'CAMPUS', 'IIIT', 'CENTRAL UNIVERSITY', 'IISER']):
        return 'Higher Education', 'Department of Higher Education'
    # 9. Urban Development / Metro
    elif any(k in n for k in ['METRO', 'URBAN', 'SMART CITY', 'HOUSING', 'SEWAGE', 'DRAINAGE', 'WATER SUPPLY', 'RRTS', 'SUBWAY', 'TOWN PLANNING']):
        return 'Urban Development & Metro', 'Ministry of Housing & Urban Affairs'
    # 10. Railways
    elif any(k in n for k in ['RAILWAY', 'DOUBLING', 'TRIPLING', 'QUADRUPLING', 'NEW BG LINE', 'NEW LINE', 'GAUGE CONVERSION', 'GC', 'NL', 'DL', 'ELECTRIFICATION', 'STATION DEVELOPMENT', 'ROB', 'RUB', 'NR', 'WR', 'CR', 'ER', 'SR', 'ECR', 'SECR', 'SWR', 'WCR', 'NCR', 'NWR', 'NER', 'NFR', 'ECOR', 'KRCL', 'RVNL', 'DFCCIL', 'IRCON', 'RITES', 'METRO RAIL']) or c.startswith('2201'):
        return 'Railways', 'Ministry of Railways'
    # 11. Roads & Highways (Default for remaining NH/Widening/Corridor/State roads)
    elif any(k in n for k in ['NH', 'HIGHWAY', 'BYPASS', 'FLYOVER', 'EXPRESSWAY', 'LANE', 'LANING', 'WIDENING', 'SHOULDER', 'PAVED', 'SECTION', 'CORRIDOR', 'MORTH', 'NHAI', 'NHIDCL', 'ROAD', 'RING ROAD', 'PACKAGE', 'PKG', 'KM', 'BRIDGE']) or any(s in c for s in ['-KNT-', '-MAH-', '-GUJ-', '-RAJ-', '-TN-', '-UP-', '-MP-', '-AP-', '-KL-', '-WB-', '-OD-', '-AS-', '-BR-', '-HR-', '-PB-', '-UK-']):
        return 'Roads & Highways', 'Ministry of Road Transport & Highways'
    else:
        return 'Roads & Highways', 'Ministry of Road Transport & Highways'

def build_timeseries_panel(df_raw):
    """
    Transforms extracted PAIMANA monthly data into an enriched longitudinal time-series master panel.
    - Cleans and ensures unique (Project_Code, Report_Date) entries.
    - Standardizes State names.
    - Assigns Sector and Ministry.
    - Chronologically sorts observations per project.
    - Computes Physical_Progress_Velocity, Financial_Burn_Rate, and Cost_Escalation_Ratio.
    """
    df = df_raw.copy()
    
    # State cleaning
    df['State'] = df['State'].apply(clean_state)
    
    # Sector and Ministry classification
    df['Sector'], df['Ministry'] = zip(*df.apply(lambda r: classify_project(r.get('Project_Name', ''), r.get('Project_Code', ''), r.get('State', '')), axis=1))
    
    # Ensure Report_Date is datetime for accurate sorting
    df['Report_Date_DT'] = pd.to_datetime(df['Report_Date'], errors='coerce')
    
    # Clean duplicates if any within same report month
    df = df.drop_duplicates(subset=['Project_Code', 'Report_Date'], keep='last')
    
    # Sort chronologically per project
    df = df.sort_values(by=['Project_Code', 'Report_Date_DT'], ascending=[True, True]).reset_index(drop=True)
    
    # Group by Project_Code to compute time-series deltas
    grouped = df.groupby('Project_Code')
    
    # 1. Physical_Progress_Velocity: MoM delta in Physical Progress (%)
    df['Physical_Progress_Velocity'] = grouped['Physical_Progress'].diff()
    
    # 2. Financial_Burn_Rate: MoM delta in Cumulative Expenditure (Rs. Cr)
    df['Financial_Burn_Rate'] = grouped['Cumulative_Expenditure'].diff()
    
    # 3. Cost_Escalation_Ratio: (Revised Cost - Original Cost) / Original Cost
    def calc_cost_escalation(row):
        orig = row['Original_Cost']
        rev = row['Revised_Cost']
        if pd.isna(orig) or pd.isna(rev) or orig <= 0:
            return 0.0
        return (rev - orig) / orig

    df['Cost_Escalation_Ratio'] = df.apply(calc_cost_escalation, axis=1)
    
    # Clean up auxiliary columns
    df = df.drop(columns=['Report_Date_DT'])
    
    # Desired column order
    ordered_cols = [
        'Project_Code',
        'Project_Name',
        'Ministry',
        'Sector',
        'State',
        'Original_Cost',
        'Revised_Cost',
        'Cumulative_Expenditure',
        'Physical_Progress',
        'Date_of_Approval',
        'Original_Target_DoC',
        'Revised_DoC',
        'Report_Month',
        'Report_Month_Num',
        'Report_Year',
        'Report_Date',
        'Physical_Progress_Velocity',
        'Financial_Burn_Rate',
        'Cost_Escalation_Ratio',
        'Source_File'
    ]
    
    existing_cols = [c for c in ordered_cols if c in df.columns]
    df = df[existing_cols]
    
    return df

if __name__ == '__main__':
    print("Time-series transformation module loaded successfully.")
