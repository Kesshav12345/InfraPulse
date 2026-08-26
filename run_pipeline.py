import os
import time
import pandas as pd
from extract_paimana_data import extract_all_reports
from transform_paimana_timeseries import build_timeseries_panel
from generate_sql_dump import generate_mysql_script

def run_paimana_pipeline(data_dir, output_csv, output_sql):
    print("=" * 80)
    print("  PAIMANA FLASH REPORT DATA PIPELINE & TIME-SERIES ENGINEERING")
    print("=" * 80)
    start_total = time.time()
    
    # Step 1: Extraction
    print("\n>>> STEP 1: Extracting project records from monthly PDF Flash Reports...")
    raw_df = extract_all_reports(data_dir)
    print(f"Extraction complete: {len(raw_df):,} raw project records collected.")
    
    # Step 2: Time-Series Feature Engineering
    print("\n>>> STEP 2: Building longitudinal panel dataset & computing time-series features...")
    master_df = build_timeseries_panel(raw_df)
    print(f"Transformed panel dataset: {len(master_df):,} records across {master_df['Project_Code'].nunique():,} unique projects.")
    
    # Step 3: Export Master CSV
    print(f"\n>>> STEP 3: Exporting master dataset to CSV -> {output_csv}...")
    master_df.to_csv(output_csv, index=False, encoding='utf-8')
    csv_size = os.path.getsize(output_csv) / (1024 * 1024)
    print(f"Master CSV exported successfully ({csv_size:.2f} MB).")
    
    # Step 4: Generate MySQL Script
    print(f"\n>>> STEP 4: Generating MySQL schema & batch insert script -> {output_sql}...")
    generate_mysql_script(master_df, output_sql)
    sql_size = os.path.getsize(output_sql) / (1024 * 1024)
    print(f"MySQL SQL script generated successfully ({sql_size:.2f} MB).")
    
    # Step 5: Summary & Validation Statistics
    print("\n" + "=" * 80)
    print("  DATA PIPELINE EXECUTION SUMMARY")
    print("=" * 80)
    print(f"Total Processing Time: {time.time() - start_total:.2f} seconds")
    print(f"Total Longitudinal Observations: {len(master_df):,}")
    print(f"Unique Projects (by Project Code): {master_df['Project_Code'].nunique():,}")
    print(f"Monthly Reports Processed: {master_df['Report_Date'].nunique()} months")
    print(f"Reporting Timeline: {master_df['Report_Date'].min()} to {master_df['Report_Date'].max()}")
    
    print("\n--- Summary Statistics of Key Numerical Features ---")
    cols_to_stat = [
        'Original_Cost', 'Revised_Cost', 'Cumulative_Expenditure',
        'Physical_Progress', 'Physical_Progress_Velocity',
        'Financial_Burn_Rate', 'Cost_Escalation_Ratio'
    ]
    print(master_df[cols_to_stat].describe().T[['count', 'mean', 'std', 'min', '50%', 'max']].to_string())
    
    print("\n--- Sample Multi-Month Longitudinal Tracking for Top Ongoing Project ---")
    # Pick a project with multiple observations
    top_proj = master_df['Project_Code'].value_counts().index[0]
    sample_proj_df = master_df[master_df['Project_Code'] == top_proj][[
        'Project_Code', 'Project_Name', 'Report_Date', 'Cumulative_Expenditure',
        'Physical_Progress', 'Physical_Progress_Velocity', 'Financial_Burn_Rate', 'Cost_Escalation_Ratio'
    ]]
    print(sample_proj_df.to_string(index=False))
    print("=" * 80)
    
    return master_df

if __name__ == '__main__':
    data_dir = r'c:\Users\kessh\OneDrive\Documents\AEGIS\dataset sih\dataset sih'
    output_csv = r'c:\Users\kessh\OneDrive\Documents\AEGIS\paimana_timeseries_master.csv'
    output_sql = r'c:\Users\kessh\OneDrive\Documents\AEGIS\load_paimana_data.sql'
    
    run_paimana_pipeline(data_dir, output_csv, output_sql)
