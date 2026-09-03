# PAIMANA Intelligence — AI-Powered Project Monitoring & Early Warning Platform

> **Predictive, Explainable, and Prescriptive Decision Support for Central Sector Infrastructure**
> *Prototype intelligence layer inspired by the PAIMANA / MoSPI project-monitoring framework.*

---

## 🏛️ Executive Summary

**PAIMANA Intelligence** transforms infrastructure monitoring from descriptive status reporting (*"What happened?"*) into predictive and prescriptive early warning intelligence (*"What is likely to happen, why, and what should administrators examine?"*).

**⚠️ CRITICAL PROTOTYPE DISCLAIMER:**
PAIMANA Intelligence is a **prototype** intelligence layer. It **does not replace PAIMANA** and must not claim a live production integration with PAIMANA. It uses a sanitized, localized dataset for demonstration purposes.

Built upon a longitudinal panel of **21,863 monthly project observations** across **3,842 Central Sector Infrastructure Projects (₹150 Cr & Above)**, the system dynamically calculates 4-month rolling velocity vectors, multi-signal ML risk scores, trajectory-based projections, multi-criteria early warning alerts, and provides a grounded NLP query interface.

---

## 🚀 Key Features & Command Views

1. **Overview Command Dashboard**
   - Live portfolio KPIs: Projects Monitored, Sanctioned Baseline, Revised Cost, Cumulative Expenditure, and Attention List.
   - Interactive Portfolio risk distribution breakdown.
   - Priority attention table for projects with extreme slippage or stagnation.

2. **Project Intelligence**
   - Multi-criteria filter system by Project, Sector, State, and Risk Level.
   - **Interactive Longitudinal Project Trajectory**: Physical Progress % vs Cumulative Expenditure / Monthly Burn.
   - **Explainable Risk Drivers**: Transparent breakdown of driver contributions.
   - **Projected Outcomes**: Trajectory-based cost overrun and schedule delay forecasts.
   - **Administrative Action Advisory**: Supervisory intervention recommendations.

3. **Early Warning Center & Intervention Workflow (RBAC)**
   - Automated multi-criteria warning engine generating actionable alert cards for:
     - *Critical Schedule Overrun Risks*
     - *Financial Burn Disconnect ($>1.8\times$ slippage ratio)*
     - *Severe Cost Escalation*
   - **Role-Based Access Control (RBAC)**: Secure access mapped to Administrative, Engineering (Ministry-scoped), and Viewer roles.
   - **Intervention Lifecycle**: Request review, assign tickets, and clear alerts.

4. **Sector & Predictive Analytics**
   - Cross-sector comparison radar & bar visualizations.
   - **Statistical vs Machine Learning Benchmark Matrix**: Real performance metrics computed on chronological longitudinal partitions comparing CatBoost models vs Statistical baselines.

5. **PAIMANA Intelligence Assistant (Local LLM)**
   - Natural language decision-support assistant backed by verified database queries and **Local Ollama LLM**.
   - **Strict Data Grounding**: Context window is strictly bounded to the user's RBAC scope (e.g., Engineers only see their Ministry's data).
   - Graceful deterministic fallback if LLM is offline.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Recharts, Lucide Icons, React Router |
| **Backend** | Python 3.11+, FastAPI, Pydantic V2, PyJWT, Uvicorn |
| **Machine Learning** | CatBoost, Scikit-Learn, Pandas, Joblib |
| **Generative AI** | Local Ollama (qwen2.5:1.5b), Request-based NLP Orchestration |
| **Database** | SQLite fallback (`paimana.db`) via SQLAlchemy ORM |

---

## 🏃 Quick Start Guide

### Prerequisites
- Python 3.10+ installed
- Node.js 18+ & npm installed
- *(Optional)* Ollama installed locally for LLM features

### Step 1: Clone and Set Up Backend
```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# (Optional) Run ML Training Pipeline to generate models
python -m backend.app.engine.ml_trainer
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

# Install dependencies and run
npm install
npm run dev
```

### Authentication Credentials
- **Admin**: `admin` / `admin`
- **Engineer**: `engineer` / `engineer`
- **Viewer**: `viewer` / `viewer`

---

## ☁️ Deployment Guide (Render)

### Option 1: Backend Web Service (FastAPI)
1. In Render, select **New +** > **Web Service** and connect this GitHub repository.
2. Configure settings:
   - **Name**: `paimana-intelligence-api`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `python -m uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
3. Add Environment Variables:
   - `JWT_SECRET_KEY`: `<your-random-secret-key>`
   - `PYTHONUNBUFFERED`: `1`
4. Deploy and copy your backend service URL (e.g., `https://paimana-intelligence-api.onrender.com`).

### Option 2: Frontend Static Site (React / Vite)
1. In Render, select **New +** > **Static Site** and connect this repository.
2. Configure settings:
   - **Name**: `paimana-intelligence`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://paimana-intelligence-api.onrender.com/api` *(Your backend Render URL + `/api`)*
4. Under **Redirects/Rewrites**, add:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`
5. Deploy.

---

## 📜 Compliance & Institutional Attribution

*This project is an analytical prototype inspired by the project monitoring framework of the Ministry of Statistics & Programme Implementation (MoSPI), Government of India, and its Infrastructure & Project Monitoring Division (IPMD). It is designed strictly for decision-support analytics and is not a live government dashboard.*
