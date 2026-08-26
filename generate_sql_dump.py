import pandas as pd
import numpy as np

def generate_mysql_script(df, output_sql_path):
    """
    Generates load_paimana_data.sql with optimized CREATE TABLE schema and
    batch INSERT statements formatted specifically for MySQL Workbench.
    """
    
    schema_sql = """-- ====================================================================
-- PAIMANA Flash Report - Time-Series Master Database Dump
-- Generated for MySQL Workbench Execution
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET NAMES utf8mb4;

-- --------------------------------------------------------------------
-- Table structure for table `paimana_timeseries_master`
-- --------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `paimana_timeseries_master` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `project_code` VARCHAR(50) NOT NULL,
    `project_name` TEXT NOT NULL,
    `ministry` VARCHAR(150) DEFAULT NULL,
    `sector` VARCHAR(100) DEFAULT NULL,
    `state` VARCHAR(100) DEFAULT NULL,
    `original_cost` DECIMAL(14, 2) DEFAULT NULL COMMENT 'Original Cost in Rs. Crore',
    `revised_cost` DECIMAL(14, 2) DEFAULT NULL COMMENT 'Revised Cost in Rs. Crore',
    `cumulative_expenditure` DECIMAL(14, 2) DEFAULT NULL COMMENT 'Cumulative Expenditure in Rs. Crore',
    `physical_progress` DECIMAL(6, 2) DEFAULT NULL COMMENT 'Physical Progress Percentage (0-100)',
    `date_of_approval` VARCHAR(20) DEFAULT NULL COMMENT 'Date of Approval (MM/YYYY)',
    `original_target_doc` VARCHAR(20) DEFAULT NULL COMMENT 'Original Target Date of Commissioning (MM/YYYY)',
    `revised_doc` VARCHAR(20) DEFAULT NULL COMMENT 'Revised Date of Commissioning (MM/YYYY)',
    `report_month` VARCHAR(20) NOT NULL,
    `report_month_num` TINYINT UNSIGNED NOT NULL,
    `report_year` SMALLINT UNSIGNED NOT NULL,
    `report_date` DATE NOT NULL COMMENT 'Reporting Month Date (YYYY-MM-01)',
    `physical_progress_velocity` DECIMAL(6, 2) DEFAULT NULL COMMENT 'Month-over-Month Physical Progress Delta (%)',
    `financial_burn_rate` DECIMAL(14, 2) DEFAULT NULL COMMENT 'Month-over-Month Expenditure Delta (Rs. Cr)',
    `cost_escalation_ratio` DECIMAL(8, 4) DEFAULT NULL COMMENT 'Cost Escalation Ratio: (Revised - Original) / Original',
    `source_file` VARCHAR(100) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_project_code` (`project_code`),
    INDEX `idx_report_date` (`report_date`),
    INDEX `idx_proj_date` (`project_code`, `report_date`),
    INDEX `idx_sector` (`sector`),
    INDEX `idx_ministry` (`ministry`),
    INDEX `idx_state` (`state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='PAIMANA Flash Report Ongoing Projects Longitudinal Panel';

-- --------------------------------------------------------------------
-- Data Ingestion: Batch INSERT Statements
-- --------------------------------------------------------------------

"""

    def sql_val(val, val_type='str'):
        if pd.isna(val) or val is None or val == '' or str(val).lower() == 'nan':
            return "NULL"
        if val_type == 'str':
            clean_s = str(val).replace("\\", "\\\\").replace("'", "''").replace("\n", " ").replace("\r", "")
            return f"'{clean_s}'"
        elif val_type == 'num':
            try:
                num = float(val)
                if np.isnan(num) or np.isinf(num):
                    return "NULL"
                return f"{num:.2f}"
            except:
                return "NULL"
        elif val_type == 'ratio':
            try:
                num = float(val)
                if np.isnan(num) or np.isinf(num):
                    return "NULL"
                return f"{num:.4f}"
            except:
                return "NULL"
        elif val_type == 'int':
            try:
                return str(int(val))
            except:
                return "NULL"
        elif val_type == 'date':
            clean_s = str(val).strip()
            return f"'{clean_s}'"
        return "NULL"

    batch_size = 500
    
    with open(output_sql_path, 'w', encoding='utf-8') as f:
        f.write(schema_sql)
        
        total_rows = len(df)
        for i in range(0, total_rows, batch_size):
            chunk = df.iloc[i : i + batch_size]
            values_list = []
            
            for _, r in chunk.iterrows():
                p_code = sql_val(r.get('Project_Code'), 'str')
                p_name = sql_val(r.get('Project_Name'), 'str')
                ministry = sql_val(r.get('Ministry'), 'str')
                sector = sql_val(r.get('Sector'), 'str')
                state = sql_val(r.get('State'), 'str')
                orig_cost = sql_val(r.get('Original_Cost'), 'num')
                rev_cost = sql_val(r.get('Revised_Cost'), 'num')
                cum_exp = sql_val(r.get('Cumulative_Expenditure'), 'num')
                phys_prog = sql_val(r.get('Physical_Progress'), 'num')
                app_date = sql_val(r.get('Date_of_Approval'), 'str')
                orig_doc = sql_val(r.get('Original_Target_DoC'), 'str')
                rev_doc = sql_val(r.get('Revised_DoC'), 'str')
                r_month = sql_val(r.get('Report_Month'), 'str')
                r_month_num = sql_val(r.get('Report_Month_Num'), 'int')
                r_year = sql_val(r.get('Report_Year'), 'int')
                r_date = sql_val(r.get('Report_Date'), 'date')
                prog_vel = sql_val(r.get('Physical_Progress_Velocity'), 'num')
                burn_rate = sql_val(r.get('Financial_Burn_Rate'), 'num')
                cost_esc = sql_val(r.get('Cost_Escalation_Ratio'), 'ratio')
                src_file = sql_val(r.get('Source_File'), 'str')
                
                val_tuple = f"({p_code}, {p_name}, {ministry}, {sector}, {state}, {orig_cost}, {rev_cost}, {cum_exp}, {phys_prog}, {app_date}, {orig_doc}, {rev_doc}, {r_month}, {r_month_num}, {r_year}, {r_date}, {prog_vel}, {burn_rate}, {cost_esc}, {src_file})"
                values_list.append(val_tuple)
                
            insert_stmt = f"INSERT INTO `paimana_timeseries_master` (`project_code`, `project_name`, `ministry`, `sector`, `state`, `original_cost`, `revised_cost`, `cumulative_expenditure`, `physical_progress`, `date_of_approval`, `original_target_doc`, `revised_doc`, `report_month`, `report_month_num`, `report_year`, `report_date`, `physical_progress_velocity`, `financial_burn_rate`, `cost_escalation_ratio`, `source_file`) VALUES\n"
            insert_stmt += ",\n".join(values_list) + ";\n\n"
            f.write(insert_stmt)
            
        f.write("SET FOREIGN_KEY_CHECKS = 1;\n-- Data ingestion completed successfully.\n")
        
    print(f"Generated MySQL script {output_sql_path} with {total_rows} records across {(total_rows + batch_size - 1) // batch_size} batch inserts.")

if __name__ == '__main__':
    print("MySQL generator module ready.")
