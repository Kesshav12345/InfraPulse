import fitz
import os, glob, re, time
import pandas as pd

def parse_month_year(filename):
    m = re.search(r'(?:FR|FlashReport)[_]?([A-Za-z]+)[_]?(\d{4})', filename, re.IGNORECASE)
    if m:
        month_str = m.group(1).capitalize()
        year_str = m.group(2)
        month_map = {
            'January': 1, 'February': 2, 'March': 3, 'April': 4,
            'May': 5, 'June': 6, 'July': 7, 'August': 8,
            'September': 9, 'October': 10, 'November': 11, 'December': 12
        }
        m_num = month_map.get(month_str, 0)
        return month_str, m_num, int(year_str)
    return None, None, None

def clean_num(val):
    if val is None:
        return None
    s = str(val).strip().replace(',', '').replace('%', '').replace('$', '').replace('`', '')
    if s in ['', '-', '--', 'N.A.', 'NA', 'None', 'nil', 'NIL', 'null', 'NULL']:
        return None
    try:
        return float(s)
    except:
        m = re.search(r'[-+]?\d*\.?\d+', s)
        if m:
            try:
                return float(m.group(0))
            except:
                return None
        return None

def standardize_date(d_str):
    if not d_str:
        return None
    s = str(d_str).strip('()[]{} ,')
    if s in ['', '-', '--', 'N.A.', 'NA', 'None', 'nil', 'NIL', 'null', 'NULL', '.']:
        return None
    # Check MM/YYYY or MM-YYYY
    m = re.search(r'(\d{1,2})[/-](\d{4})', s)
    if m:
        month = int(m.group(1))
        year = int(m.group(2))
        return f"{month:02d}/{year}"
    # Check Mon-YYYY or Month YYYY (e.g. Jun-2023, Dec-2025)
    month_map = {
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
        'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12,
        'january': 1, 'february': 2, 'march': 3, 'april': 4, 'june': 6,
        'july': 7, 'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12
    }
    m_text = re.search(r'([A-Za-z]+)[- /](\d{4})', s)
    if m_text:
        m_name = m_text.group(1).lower()
        if m_name in month_map:
            return f"{month_map[m_name]:02d}/{m_text.group(2)}"
    # If only YYYY
    m_yr = re.search(r'\b(19\d{2}|20\d{2})\b', s)
    if m_yr:
        return f"01/{m_yr.group(1)}"
    return s

def parse_cost_cell(cell_text):
    if not cell_text:
        return None, None
    lines = [l.strip() for l in str(cell_text).split('\n') if l.strip()]
    clean_nums = []
    for l in lines:
        c = clean_num(l)
        if c is not None:
            clean_nums.append(c)
    if len(clean_nums) == 0:
        return None, None
    elif len(clean_nums) == 1:
        return clean_nums[0], clean_nums[0]
    else:
        return clean_nums[0], clean_nums[1]

def parse_doc_cell(cell_text):
    if not cell_text:
        return None, None
    lines = [l.strip() for l in str(cell_text).split('\n') if l.strip()]
    dates = []
    for l in lines:
        d = standardize_date(l)
        if d is not None:
            dates.append(d)
    orig_doc = dates[0] if len(dates) > 0 else None
    rev_doc = dates[1] if len(dates) > 1 else None
    return orig_doc, rev_doc

def parse_approval_cell(cell_text):
    if not cell_text:
        return None
    lines = [l.strip() for l in str(cell_text).split('\n') if l.strip()]
    for l in lines:
        d = standardize_date(l)
        if d:
            return d
    return standardize_date(lines[0]) if lines else None

def parse_project_cell_detailed(cell_text):
    if not cell_text:
        return None, None
    text = str(cell_text).strip()
    if not text or any(text.startswith(x) for x in ['Ministry of', 'Total', 'Sector:']):
        return None, None
    
    parens = re.findall(r'\(([^)]+)\)', text)
    proj_code = None
    for p in parens:
        p_clean = p.strip()
        if p_clean in ['-', 'N.A.', 'NA', 'None', '']:
            continue
        if re.match(r'^[A-Za-z0-9_-]{4,20}$', p_clean) and re.search(r'\d', p_clean):
            proj_code = p_clean
            break
            
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    name_lines = []
    for l in lines:
        if l.startswith('(') and ((proj_code and proj_code in l) or any(k in l for k in ['[', ']', 'AAI', 'SECL', 'NLCIL', 'MoRTH', 'NHIDCL', 'NR', 'WR', 'CR']) or '-' in l):
            break
        l_clean = re.sub(r'\(.*?\)', '', l).strip()
        if l_clean:
            name_lines.append(l_clean)
    proj_name = " ".join(name_lines).strip()
    if not proj_name and lines:
        proj_name = lines[0]
        
    return proj_code, proj_name

def clean_state_name(state_raw):
    if not state_raw:
        return None
    s = state_raw.strip().replace('\n', ' ')
    s = re.sub(r'\s+', ' ', s)
    # Convert ALL CAPS to Title Case (e.g. ANDAMAN AND NICOBAR ISLANDS -> Andaman and Nicobar Islands)
    if s.isupper():
        words = s.split(' ')
        lower_words = {'and', 'of', '&', 'the'}
        title_words = [w.capitalize() if w.lower() not in lower_words else w.lower() for w in words]
        s = " ".join(title_words)
    return s

def extract_pdf_data(pdf_path):
    t0 = time.time()
    fname = os.path.basename(pdf_path)
    m_name, m_num, year = parse_month_year(fname)
    doc = fitz.open(pdf_path)
    
    file_records = []
    current_state = None
    
    # Locate Ongoing Projects start page from TOC or first pages
    start_p = 0
    for p in range(min(5, len(doc))):
        txt = doc[p].get_text()
        m_start = re.search(r'(?:Table[:-]?\s*[674]\.?\s*Project List:\s*Ongoing Projects[^\n\d]*|\bAll Ongoing Projects\b[^\n\d]*)(\d+)', txt)
        if m_start:
            try:
                start_p = max(0, int(m_start.group(1)) - 2)
            except:
                pass
                
    for pno in range(start_p, len(doc)):
        page = doc[pno]
        txt = page.get_text()
        if not ("Cumulative" in txt or "Physical Progress" in txt or "Ongoing Projects" in txt):
            continue
        if "Table 1:" in txt or "Table 2:" in txt or "Table 3:" in txt or "Table 5: Ongoing Projects of North" in txt:
            if "Table 6: All Ongoing Projects" not in txt and "Table 4: All Ongoing Projects" not in txt and "Ongoing Projects as of" not in txt:
                continue
            
        tabs = page.find_tables()
        if not tabs.tables:
            continue
            
        for tab in tabs.tables:
            extracted = tab.extract()
            if not extracted or len(extracted) < 2:
                continue
                
            header = [str(c).replace('\n', ' ').strip() for c in extracted[0] if c is not None]
            header_str = " ".join(header)
            
            if not any(k in header_str for k in ['Project Name', 'Physical Progress', 'Cumulative Expenditure', 'Orignal Cost', 'Cost Original']):
                continue
                
            is_legacy = 'State' in header[:2] or len(extracted[0]) >= 9
            
            for row in extracted[1:]:
                row_str = " ".join([str(c) for c in row if c is not None])
                if not row_str.strip() or 'Project Name' in row_str or 'Total (' in row_str or 'Ministry of' in row_str:
                    continue
                    
                if is_legacy:
                    if len(row) < 9:
                        continue
                    state_raw = row[0]
                    if state_raw and state_raw.strip():
                        current_state = clean_state_name(state_raw)
                    
                    p_cell = row[3]
                    p_code, p_name = parse_project_cell_detailed(p_cell)
                    if not p_code:
                        continue
                        
                    app_date = parse_approval_cell(row[4])
                    orig_doc, rev_doc = parse_doc_cell(row[5])
                    orig_cost, rev_cost = parse_cost_cell(row[6])
                    cum_exp = clean_num(row[7])
                    phys_prog = clean_num(row[8])
                    
                    file_records.append({
                        'Project_Code': p_code,
                        'Project_Name': p_name,
                        'State': current_state,
                        'Original_Cost': orig_cost,
                        'Revised_Cost': rev_cost,
                        'Cumulative_Expenditure': cum_exp,
                        'Physical_Progress': phys_prog,
                        'Date_of_Approval': app_date,
                        'Original_Target_DoC': orig_doc,
                        'Revised_DoC': rev_doc,
                        'Report_Month': m_name,
                        'Report_Month_Num': m_num,
                        'Report_Year': year,
                        'Report_Date': f"{year}-{m_num:02d}-01",
                        'Source_File': fname
                    })
                else:
                    if len(row) < 8:
                        continue
                    p_cell = row[1]
                    p_code, p_name = parse_project_cell_detailed(p_cell)
                    if not p_code:
                        continue
                        
                    state = clean_state_name(row[2])
                    app_date = parse_approval_cell(row[3])
                    orig_doc, rev_doc = parse_doc_cell(row[4])
                    orig_cost, rev_cost = parse_cost_cell(row[5])
                    cum_exp = clean_num(row[6])
                    phys_prog = clean_num(row[7])
                    
                    file_records.append({
                        'Project_Code': p_code,
                        'Project_Name': p_name,
                        'State': state,
                        'Original_Cost': orig_cost,
                        'Revised_Cost': rev_cost,
                        'Cumulative_Expenditure': cum_exp,
                        'Physical_Progress': phys_prog,
                        'Date_of_Approval': app_date,
                        'Original_Target_DoC': orig_doc,
                        'Revised_DoC': rev_doc,
                        'Report_Month': m_name,
                        'Report_Month_Num': m_num,
                        'Report_Year': year,
                        'Report_Date': f"{year}-{m_num:02d}-01",
                        'Source_File': fname
                    })
    doc.close()
    return file_records, time.time() - t0

def extract_all_reports(directory_path):
    pdf_files = sorted(glob.glob(os.path.join(directory_path, '*.pdf')))
    print(f"Discovered {len(pdf_files)} PDF files in {directory_path}\n" + "-"*60, flush=True)
    all_data = []
    
    t_start = time.time()
    for idx, pdf_path in enumerate(pdf_files, 1):
        fname = os.path.basename(pdf_path)
        print(f"[{idx:02d}/{len(pdf_files):02d}] Parsing {fname}...", end="", flush=True)
        recs, duration = extract_pdf_data(pdf_path)
        print(f" -> {len(recs):4d} records extracted in {duration:.2f}s", flush=True)
        all_data.extend(recs)
        
    df = pd.DataFrame(all_data)
    print("-"*60 + f"\nExtraction completed: {len(df)} total project records across {len(pdf_files)} files in {time.time()-t_start:.2f}s\n", flush=True)
    return df

if __name__ == '__main__':
    data_dir = r'c:\Users\kessh\OneDrive\Documents\AEGIS\dataset sih\dataset sih'
    df = extract_all_reports(data_dir)
    print(df.info())
    print("\nSample records:")
    print(df.head())
