# JanSeva AI — AI-Based Multilingual Public Grievance Resolution Platform

**JanSeva AI** is an AI-powered public grievance redressing portal designed for Indian civic governance. It empowers citizens to lodge municipal complaints in their native regional language (Telugu, Hindi, Tamil, Kannada, English) via text or voice. The platform uses AI/NLP to automatically translate, categorize, prioritize, and route grievances to the correct government department while performing TF-IDF semantic duplicate detection.

---

## Key Features

- 🌐 **Multilingual Support**: Real-time translation & processing for Telugu, Hindi, Tamil, Kannada, and English.
- 🎤 **Voice Grievance Input**: Built-in Speech-to-Text conversion using Web Speech API.
- ⚡ **Offline AI Fallback Engine**: Guaranteed to run 100% locally without external API dependencies. Seamlessly upgrades to Gemini/LLM APIs if an API key is provided.
- 🔍 **Semantic Duplicate Detection**: TF-IDF & Cosine Similarity algorithm identifies duplicate complaints for the same locality.
- 📍 **Smart Department Routing**: Automatically routes issues to Electricity, Water Supply, Roads, Sanitation, Public Transport, or Law Enforcement.
- 📊 **Executive Governance Dashboard**: Interactive Recharts graphs and real-time status management (Submitted → Assigned → Under Investigation → Resolved).
- 📜 **Live Citizen Tracking**: Audit trail with timestamped department comments for complete transparency.

---

## 🛠️ Recommended Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons, Recharts, React Router DOM.
- **Backend**: Python 3.10+, FastAPI, SQLAlchemy, SQLite, Pydantic, Scikit-Learn.
- **AI/NLP**: Multi-tiered pipeline (Regex & TF-IDF Cosine Similarity Engine + Optional Gemini LLM integration).

---

## 🚀 Quick Setup & Execution

### Option 1: One-Command Startup (Windows)

Simply double-click or run:
```cmd
run.bat
```
This batch script will automatically:
1. Initialize the Python virtual environment in `backend/venv`.
2. Install Python dependencies (`fastapi`, `scikit-learn`, `sqlalchemy`, etc.).
3. Install frontend Node packages (`npm install`).
4. Start FastAPI backend server on `http://localhost:8000`.
5. Start React Vite frontend dev server on `http://localhost:5173`.
6. Open your web browser automatically to `http://localhost:5173`.

---

### Option 2: Manual Terminal Commands

#### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate

# macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Application URLs

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **FastAPI Interactive Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🧠 AI Pipeline Architecture

```
                                  ┌─────────────────────────────┐
                                  │ Citizen Complaint (Text/Voice)│
                                  └──────────────┬──────────────┘
                                                 │
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │ Script & Language Detector  │
                                  └──────────────┬──────────────┘
                                                 │
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │  Indic to English Translator │
                                  └──────────────┬──────────────┘
                                                 │
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │  NLP Department Classifier   │
                                  │  & Urgency Priority Engine   │
                                  └──────────────┬──────────────┘
                                                 │
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │ TF-IDF Duplicate Detector    │
                                  │ (Cosine Similarity Matrix)  │
                                  └──────────────┬──────────────┘
                                                 │
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │  SQLite DB & Department API │
                                  └─────────────────────────────┘
```

1. **Language & Script Detection**: Parses Unicode codepoints (Telugu `\u0C00-\u0C7F`, Hindi `\u0900-\u097F`, Tamil `\u0B80-\u0BFF`, Kannada `\u0C80-\u0CFF`).
2. **Translation & Keyword Analysis**: Converts regional text into standard English and matches domain terminology.
3. **Department & Urgency Routing**: Categorizes complaints into Roads, Water, Electricity, Sanitation, Transport, or Public Safety with High/Medium priority.
4. **TF-IDF Semantic Scanning**: Computes term frequency-inverse document frequency vector similarity against existing grievances in the database. If similarity ≥ 45%, triggers duplicate alert.
5. **Fallback Safety**: If `LLM_API_KEY` is present in `.env`, queries Gemini API. If absent, seamlessly falls back to local deterministic rule engine.

---

## 🎬 5-Minute Hackathon Demo Script

1. **Open Frontend**: Navigate to `http://localhost:5173`.
2. **Select Telugu Preset**: Click the **Telugu** sample button under *Try a Sample Grievance*:
   > *"మా ప్రాంతంలో గత మూడు రోజులుగా వీధి దీపాలు పనిచేయడం లేదు."*
3. **Click "Analyze with AI"**:
   - Observe animated AI processing screen.
   - Verify detected language: **Telugu**.
   - Verify translation: *"Street lights in our area have not been working for the past three days."*
   - Verify classification: **Category: Electricity**, **Priority: High**, **Department: Electricity Department**.
4. **Click "Register Grievance"**:
   - Generates official ticket ID (e.g., `GRV-2026-00125`).
   - Click **Track Grievance** to view progress timeline.
5. **Open Admin Dashboard**: Navigate to `/admin`.
   - View updated KPI counters & Recharts graphs.
   - Click **Update Status** on the ticket to change status from `Submitted` → `Assigned` → `Under Investigation` → `Resolved`.
6. **Verify Live Update**: Return to Track page (`/track`) to see real-time timestamped audit logs.

---

## 🔮 Future Production Features

1. **WhatsApp & SMS Gateway Integration**: Allow citizens to lodge complaints via WhatsApp Bot or offline SMS.
2. **GIS Map Heatmap**: Map-based visualization of complaint clusters for municipal planning.
3. **Automated WhatsApp Status Notifications**: Push status updates directly to citizen mobile numbers.
4. **Edge AI Speech Model**: On-device Whisper models for noisy voice recording translation.
