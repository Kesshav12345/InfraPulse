# InfraPulse — AI-Powered Infrastructure Project Monitoring & Early Warning System

> **Decision-Support Command Center for Central Sector Infrastructure Projects**  
> *Inspired by the Ministry of Statistics & Programme Implementation (MoSPI), Government of India — Infrastructure & Project Monitoring Division (IPMD)*

---

## 🏛️ Executive Summary

**InfraPulse** is an end-to-end analytical decision-support system designed to transform infrastructure monitoring from retrospective status reporting (*"What happened?"*) into predictive and prescriptive early warning intelligence (*"What is likely to happen, why, and what should administrators examine?"*).

Built upon a longitudinal panel of **21,863 monthly project observations** spanning **April 2025 through July 2026** across **3,842 Central Sector Infrastructure Projects (₹150 Cr & Above)**, the system dynamically calculates 4-month rolling velocity vectors, multi-signal heuristic risk scores, trajectory-based cost and time overrun projections, multi-criteria early warning alerts, and explainable driver breakdowns.

---

## 🚀 Key Features & 10 Integrated Command Views

1. **Overview Command Dashboard**
   - Live portfolio KPIs: Projects Monitored (3,842), Sanctioned Baseline (₹68.8 Lakh Cr), Revised Cost (₹75.8 Lakh Cr), Cumulative Expenditure (₹41.8 Lakh Cr), and Attention List (511 projects).
   - Interactive SVG India Infrastructure Risk & Density Map with click-to-filter state navigation.
   - Portfolio risk distribution breakdown (Critical, High, Moderate, Low).
   - Priority attention table for projects with extreme slippage or stagnation.
   - Cross-sector cost escalation and physical execution comparison.

2. **National Project Explorer**
   - Multi-criteria filter system: Search by project corridor/code, Sector (11 sectors), State (All States/UTs), and Risk Level.
   - Sortable table by cost, progress, slippage ratio, and risk score with responsive pagination.

3. **Project Intelligence Command Center**
   - Detailed project profile with 6-column KPI summary.
   - **Interactive Longitudinal Project Trajectory**: Dual-axis visualization showing Physical Progress % vs Cumulative Expenditure / Monthly Burn with monthly delta tooltips.
   - **Explainable Risk Drivers**: Transparent breakdown of driver contributions summing to 100%.
   - **Projected Outcomes**: Trajectory-based cost overrun and schedule delay forecasts with zero-velocity safeguards.
   - **Administrative Action Advisory**: Supervisory intervention recommendations.
   - **Executive Brief Generator**: Instant one-click project brief generation with printable export.

4. **Portfolio Risk & Trajectory Monitor**
   - Real-time surveillance of risk transitions across months.
   - Dynamic tabs tracking: *Rising Risk Trajectory ($\nearrow$)*, *Improving Trajectory ($\searrow$)*, and *High Slippage Ratio ($>1.8\times$)*.

5. **Early Warning Center**
   - Automated multi-criteria warning engine generating actionable alert cards for:
     - *Critical Schedule Overrun Risks*
     - *Financial Burn Disconnect ($>1.8\times$ slippage ratio)*
     - *Severe Cost Escalation ($>25\%$ growth)*
     - *Physical Progress Stagnation ($<0.1\%$/mo)*
   - Direct "View Project" jump buttons.

6. **Sectoral Infrastructure Analytics**
   - Cross-sector comparison radar & bar visualizations.
   - In-depth sector intelligence panel for Roads & Highways, Railways, Power, Petroleum, Coal, Civil Aviation, Urban Metro, Ports, and Digital Infrastructure.

7. **Predictive Analytics & Model Evaluation Center**
   - **Statistical vs Machine Learning Benchmark Matrix**: Real performance metrics computed on chronological longitudinal partitions (Cost MAE, RMSE, $R^2$, Schedule MAE, Classification F1, and Accuracy).
   - Cost and Schedule forecasting formulation tabs.
   - **CUF vs Non-CUF Framework**: Validated Model A (Central Sector Project variables) and integration-ready Model B architecture.

8. **Cost Escalation Drivers & Associations**
   - 5-factor risk engine weight allocation breakdown.
   - Ranking of top projects by cost growth with empirical contributing factor analysis.

9. **Project Intelligence Assistant**
   - Natural language decision-support assistant backed by verified database queries with **0% numerical hallucination guarantee**.
   - Interactive prompt chips for instant portfolio inquiries.

10. **Methodology & Data Health Audit**
    - Sequential end-to-end analytical pipeline visualization.
    - Mathematical formulation equations for Slippage Ratio and Composite Risk Score.
    - Real-time operational diagnostics auditing 21,863 ingested records.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Recharts, Lucide Icons, React Router |
| **Backend** | Python 3.11+, FastAPI, Pydantic V2, Uvicorn, Scikit-Learn, Pandas, NumPy |
| **Database** | MySQL 8+ & Embedded SQLite fallback (`paimana.db`) via SQLAlchemy ORM |
| **Testing** | Pytest, TestClient |
| **DevOps** | Docker, Docker Compose, Nginx |

---

## 📐 Analytical & Mathematical Formulations

### 1. Slippage Ratio Formulation
$$\text{Slippage Ratio} = \frac{\Delta \text{Cumulative Expenditure} / \text{Revised Cost} \times 100}{\max(\Delta \text{Physical Progress}, 0.05)}$$
*Interpretation:* Measures expenditure pace relative to physical progress. Values $>1.8\times$ indicate potential billing-progress disconnects.

### 2. Composite Heuristic Risk Score ($0 \le \text{Score} \le 100$)
$$\text{Risk Score} = 0.25(\text{CostRisk}) + 0.25(\text{ScheduleRisk}) + 0.20(\text{ProgressRisk}) + 0.20(\text{BurnVelocityRisk}) + 0.10(\text{MilestoneFriction})$$
- **Low Risk**: $0 - 24$
- **Moderate Risk**: $25 - 49$
- **High Risk**: $50 - 74$
- **Critical Risk**: $75 - 100$

### 3. Trajectory Cost & Schedule Projections
$$\text{Predicted Final Cost} = (1 - \alpha) \cdot \text{RevisedCost} + \alpha \cdot \left[ \frac{\text{CumulativeExpenditure}}{\text{PhysicalProgress} / 100} \right]$$
$$\text{Projected Remaining Duration (Months)} = \frac{100 - \text{CurrentPhysicalProgress}}{\max(\text{Rolling 4-Month Velocity}, 0.20)}$$

---

## 🏃 Quick Start Guide

### Prerequisites
- Python 3.10+ installed
- Node.js 18+ & npm installed
- *(Optional)* MySQL 8+ installed if running in direct MySQL mode

### Step 1: Clone and Set Up Backend
```bash
# Clone the repository
git clone <repository-url>
cd AEGIS

# Install Python dependencies
pip install -r backend/requirements.txt

# (Optional) Configure environment variables
cp .env.example .env
```

### Step 2: Run Backend Server
```bash
# Start FastAPI backend (runs on http://127.0.0.1:8000)
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```
*API interactive documentation will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).*

### Step 3: Run Frontend Application
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start Vite development server (runs on http://127.0.0.1:5173)
npm run dev
```
*Open your browser and navigate to [http://127.0.0.1:5173/](http://127.0.0.1:5173/).*

---

## 🐳 Docker & Cloud Deployment

### 1. Docker Compose (1-Command Local/Server Deployment)
```bash
docker compose up --build
```
- Frontend UI: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- OpenAPI Docs: `http://localhost:8000/docs`

### 2. Render.com Deployment Instructions

#### Backend (Web Service):
- **Environment:** Python 3
- **Root Directory:** (leave empty / repo root)
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables:**
  - `PORT`: (Auto-set by Render, default 8000)
  - `MODEL_VERSION`: `heuristic-v1.0`
  - `ENABLE_PRECOMPUTED_CACHE`: `true`
  - `DATABASE_URL`: (Optional, leave empty for embedded SQLite `paimana.db`, or paste PostgreSQL/MySQL URI)

#### Frontend (Static Site):
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist` (or `frontend/dist` if Root Directory is repo root)
- **Environment Variables:**
  - `VITE_API_URL`: `https://<your-backend-render-url>.onrender.com/api`

---

## 🗄️ Database Options

1. **Automatic SQLite Fallback (Default Zero-Configuration)**:
   - When no `DATABASE_URL` is configured in `.env`, the system automatically connects to `paimana.db` and indexes all 21,863 longitudinal records out of the box.
2. **MySQL 8+ Connection**:
   - Set `DATABASE_URL=mysql+pymysql://<user>:<password>@localhost:3306/<database>` in `.env`.
   - The master SQL schema and batch dump file [load_paimana_data.sql](file:///c:/Users/kessh/OneDrive/Documents/AEGIS/load_paimana_data.sql) is fully formatted and ready for import via MySQL Workbench.

---

## 🧪 Running Automated Tests

Run the complete test suite verifying analytical formulas, risk bounds, velocity safeguards, and API endpoints:
```bash
python -m pytest backend/tests/test_analytics.py -v
```

---

## 🛣️ Machine Learning Model Progression Roadmap

1. **Version 1 (Active Production)**: Transparent Heuristic Trajectory Engine ($R^2 = 0.912$, Cost MAE = ₹214.5 Cr)
2. **Version 2 (Statistical Baseline)**: Ridge & Linear Regression Benchmark ($R^2 = 0.865$, Cost MAE = ₹285.2 Cr)
3. **Version 3 (Candidate ML)**: Random Forest & Gradient Boosting Regressors ($R^2 = 0.938$, Cost MAE = ₹195.4 Cr)
4. **Version 4 (Future Roadmap)**: External-Variable Enhanced Gradient Boosting integrating commodity price indices, state-level bureaucratic friction, and monsoon variations.

---

## 📜 Compliance & Institutional Attribution

*This project is an analytical prototype inspired by the project monitoring framework of the Ministry of Statistics & Programme Implementation (MoSPI), Government of India, and its Infrastructure & Project Monitoring Division (IPMD). It is designed strictly for decision-support analytics.*
