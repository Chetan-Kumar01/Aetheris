<![CDATA[<div align="center">

# 🏥 Aetheris — AI-Powered Surgical Operations Dashboard

**A next-generation, real-time surgical monitoring and decision support platform powered by Machine Learning, LLMs, and intelligent anomaly detection.**

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.2-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://python.org)
[![XGBoost](https://img.shields.io/badge/XGBoost-ML_Model-FF6600)](https://xgboost.readthedocs.io)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [ML Models](#-ml-models)
- [Pages & Modules](#-pages--modules)
- [Environment Variables](#-environment-variables)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Aetheris** is a full-stack surgical operations dashboard designed to assist clinical teams throughout the entire surgical workflow — from **Pre-Op** patient assessment, through **Intra-Op** real-time monitoring, to **Post-Op** recovery tracking and reporting.

It combines:
- 🧠 **XGBoost ML models** trained on MIMIC-IV clinical data for risk prediction
- 🤖 **LLM-powered** report generation (Groq / Claude API)
- 📊 **Real-time vitals simulation** with anomaly injection and auto-alerting
- 💊 **OpenFDA drug interaction** checking
- 🔔 **Automatic nursing staff alerts** with audible triple-beep alarms

---

## ✨ Key Features

### 📊 Dashboard
- **Real-time patient vitals** — HR, SpO₂, BP, Temperature with live animated charts
- **Active patient count** — dynamically updates as patients are registered or discharged
- **Active Surgeries panel** — scrollable list of all registered patients with status badges
- **Risk Alerts panel** — live notifications from anomaly detection with severity indicators
- **Automatic anomaly detection** — ~8% chance per tick of triggering clinical events (bradycardia, tachycardia, SpO₂ desaturation, hypertension, fever)
- **Auto nursing staff alert** — audible triple-beep alarm on warning/critical vitals (no manual tapping needed)

### 🩺 Pre-Op Management
- **Patient intake form** — name, age, gender, weight, height, BP, allergies, medications, medical history toggles
- **AI Risk Assessment** — XGBoost-powered overall risk score with breakdown (cardiac, anesthesia, surgical)
- **Drug Interaction Checker** — powered by OpenFDA API
- **AI-Generated Checklist** — auto-generated pre-op checklist items
- **Export Summary** — downloads a formatted `.txt` report with all patient data and assessment results

### 🔬 Intra-Op Monitoring
- **Live vitals streaming** with WebSocket support
- **Procedure step tracker** — visual timeline of surgical progress
- **Voice command interface** — speech-to-text for hands-free queries
- **Real-time anomaly detection** — automatic alerts for out-of-range vitals

### 🫀 Post-Op & Recovery
- **Recovery Monitor** — tracks elapsed time, vitals, pain scale slider
- **Complication Risk Predictor** — ML-powered prediction for DVT, infection, pneumonia, 30-day readmission
- **Auto-Generated Reports** — operative notes and discharge summaries via LLM
- **Send to EHR** — mock EHR integration for report delivery
- **Discharge Patient** — removes patient from active monitoring with visual toast feedback

### 📄 Reports
- **Report generation** with operative notes and discharge summaries
- **Download reports** as formatted files
- **Report history** with search and filtering

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2 | UI framework |
| Vite | 7.3 | Build tool & dev server |
| TailwindCSS | 4.2 | Utility-first CSS |
| Recharts | 3.7 | Data visualization charts |
| React Router | 7.13 | Client-side routing |
| Lucide React | 0.575 | Icon library |
| Web Audio API | — | Real-time alarm sounds |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| FastAPI | 0.115 | REST API framework |
| Uvicorn | 0.32 | ASGI server |
| SQLAlchemy | 2.0 | ORM & database |
| SQLite/PostgreSQL | — | Database (dev/prod) |
| Pydantic | 2.10 | Data validation |
| scikit-learn | 1.5 | ML model serving |
| Groq / Anthropic | — | LLM report generation |
| HTTPX | 0.28 | Async HTTP client |

### ML / AI
| Component | Details |
|---|---|
| Complication Risk Model | XGBoost multi-output regressor (~218MB), trained on MIMIC-IV data |
| ASA Risk Model | scikit-learn classifier for ASA class prediction |
| Feature Scaler | StandardScaler for input normalization |
| Training Notebook | `train_preop_model.ipynb` |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │Dashboard │ │ Pre-Op   │ │ Intra-Op │ │ Post-Op  │     │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘     │
│       └─────────────┴─────────────┴─────────────┘          │
│                         │ REST API                         │
├─────────────────────────┼──────────────────────────────────┤
│                     BACKEND (FastAPI)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ Patients │ │ PreOp    │ │ IntraOp  │ │ PostOp   │     │
│  │ Routes   │ │ Routes   │ │ Routes   │ │ Routes   │     │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘     │
│       └─────────────┴─────────────┴─────────────┘          │
│                         │                                   │
│  ┌──────────────────────┴──────────────────────────┐       │
│  │              Service Layer                       │       │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────────┐   │       │
│  │  │ ML Model│  │ LLM API  │  │ OpenFDA API  │   │       │
│  │  │ (XGBoost)│ │(Groq/    │  │ (Drug Check) │   │       │
│  │  │         │  │ Claude)  │  │              │   │       │
│  │  └─────────┘  └──────────┘  └──────────────┘   │       │
│  └─────────────────────────────────────────────────┘       │
│                         │                                   │
│                  ┌──────┴───────┐                           │
│                  │   SQLite DB  │                           │
│                  └──────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Aetheris/
├── src/                          # Frontend source
│   ├── api/
│   │   ├── client.js             # API client (fetch wrapper)
│   │   └── constants.js          # Demo patient data
│   ├── components/
│   │   ├── layout/Layout.jsx     # App layout with sidebar
│   │   ├── charts/               # Recharts components (RiskDonut, etc.)
│   │   └── ui/                   # Reusable UI components
│   ├── context/
│   │   └── AetherisContext.jsx   # Global state (patients, alerts, forms)
│   ├── hooks/
│   │   ├── useVitals.js          # Real-time vitals simulation with anomaly injection
│   │   └── useApiCall.js         # API call wrapper with loading/error states
│   ├── pages/
│   │   ├── DashboardPage.jsx     # Main dashboard with vitals & alerts
│   │   ├── PreOpPage.jsx         # Patient intake & AI risk assessment
│   │   ├── IntraOpPage.jsx       # Intra-operative monitoring
│   │   ├── PostOpPage.jsx        # Recovery, reports, risk prediction
│   │   └── ReportsPage.jsx       # Report generation & history
│   ├── App.jsx                   # Root component with routing
│   └── index.css                 # Global styles
├── aetheris-backend/             # Backend source
│   ├── app/
│   │   ├── api/routes/
│   │   │   ├── patients.py       # CRUD + discharge
│   │   │   ├── preop.py          # AI risk assessment
│   │   │   ├── intraop.py        # Vitals, anomaly detection, voice commands
│   │   │   ├── postop.py         # Complication risk prediction
│   │   │   ├── reports.py        # LLM report generation
│   │   │   ├── alerts.py         # Alert management
│   │   │   └── vitals.py         # Vitals logging
│   │   ├── ml/
│   │   │   ├── model_service.py  # ML model loading & inference
│   │   │   └── models/           # Trained model files (.pkl)
│   │   ├── services/
│   │   │   ├── preop_service.py  # Risk calculation, drug interaction checking
│   │   │   ├── postop_service.py # Complication prediction, report generation
│   │   │   └── intraop_service.py# Anomaly detection, voice processing
│   │   ├── schemas/              # Pydantic request/response models
│   │   └── main.py               # FastAPI app entry point
│   ├── requirements.txt          # Python dependencies
│   └── .env.example              # Environment variable template
├── package.json                  # Node.js dependencies
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind configuration
└── train_preop_model.ipynb       # ML model training notebook
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18.x
- **Python** ≥ 3.10
- **pip** (Python package manager)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/aetheris.git
cd aetheris/Aetheris
```

### 2. Setup Backend
```bash
cd aetheris-backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate   # macOS/Linux
# .venv\Scripts\activate    # Windows

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env with your API keys (Groq, Anthropic, etc.)

# Start backend server
uvicorn app.main:app --reload --port 8000
```

### 3. Setup Frontend
```bash
cd ..  # Back to Aetheris root

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Open the App
Navigate to **http://localhost:4000** in your browser.

> **Tip:** Click anywhere on the page once to unlock browser audio for automatic alert beeps.

---

## 🔌 API Endpoints

### Patients
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/patients/` | List all patients |
| `GET` | `/api/patients/{id}` | Get patient by ID |
| `POST` | `/api/patients/` | Register new patient |
| `PATCH` | `/api/patients/{id}/discharge` | Discharge patient |

### Pre-Op
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/preop/assess` | Run AI risk assessment |

### Intra-Op
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/intraop/anomaly-check` | Check vitals for anomalies |
| `POST` | `/api/intraop/voice-command` | Process voice command |
| `POST` | `/api/intraop/procedure-step` | Update procedure step |

### Post-Op
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/postop/complication-risk` | Predict complication risks |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/reports/generate` | Generate operative note / discharge summary |
| `POST` | `/api/reports/send-to-ehr` | Send report to EHR system |
| `GET` | `/api/reports/types` | List available report types |

### Alerts
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/alerts/` | List all alerts |
| `POST` | `/api/alerts/` | Create alert |
| `PATCH` | `/api/alerts/{id}/acknowledge` | Acknowledge alert |

### Vitals
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/vitals/log` | Log vitals reading |

---

## 🧠 ML Models

### Complication Risk Predictor
- **Algorithm:** XGBoost Multi-Output Regressor
- **Training Data:** MIMIC-IV clinical dataset
- **Outputs:** DVT risk, Surgical Site Infection, Post-Op Pneumonia, 30-Day Readmission (all as percentages)
- **Features:** Age, BMI, surgery duration, blood loss, ASA class, diabetes, hypertension, cardiac history, smoking status, surgery type
- **BMI Computation:** Dynamically calculated from patient weight/height (not hardcoded)
- **Clinical Variation:** ±10 min surgery duration and ±30 mL blood loss jitter per prediction

### ASA Risk Classifier
- **Algorithm:** scikit-learn classifier
- **Purpose:** Predicts ASA physical status classification
- **Features:** Patient demographics, comorbidities, and surgical parameters

---

## 📱 Pages & Modules

| Page | Route | Description |
|---|---|---|
| **Dashboard** | `/` | Overview with live vitals, patient list, active surgeries, risk alerts |
| **Pre-Op** | `/preop` | Patient intake form, AI risk assessment, drug interactions, export |
| **Intra-Op** | `/intraop` | Real-time vitals monitoring, procedure steps, voice commands |
| **Post-Op** | `/postop` | Recovery monitor, complication prediction, report generation, discharge |
| **Reports** | `/reports` | Report history, generation, and download |
| **Components** | `/components` | UI component showcase (development reference) |

---

## ⚙️ Environment Variables

Create a `.env` file in the `aetheris-backend/` directory:

```env
# LLM API Keys (for report generation)
GROQ_API_KEY=your_groq_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# OpenFDA (drug interactions — no key needed for basic usage)
OPENFDA_BASE_URL=https://api.fda.gov

# Database
DATABASE_URL=sqlite:///./aetheris.db

# Optional: Redis for caching
REDIS_URL=redis://localhost:6379
```

---

## 🎨 Design Philosophy

- **Dark-mode first** — premium dark UI with glassmorphism accents
- **Real-time feel** — vitals update every 1.5s with smooth animations
- **Clinical accuracy** — realistic vital ranges, proper medical terminology
- **Accessible alerts** — visual + audible alarm system with distinct tones:
  - 🔺 **SpO₂ alarm:** 1000Hz triangle wave (gentle)
  - 🔻 **HR alarm:** 600Hz square wave double-beep (urgent)
  - 🚨 **Nurse alert:** Triple-beep at 800Hz (warning) or 1200Hz (critical)
- **Responsive layout** — 3-column grid with scrollable panels

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

---

## 📄 License

This project is developed for educational and demonstration purposes.

---

<div align="center">

**Built with ❤️ using React, FastAPI, and XGBoost**

*Aetheris — Intelligent Surgical Care, Reimagined*

</div>
]]>
