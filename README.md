# Sarthi AI

Intelligent data analysis and verification platform for agricultural datasets. Upload a CSV, get AI-powered insights, link a farmer profile for contextual crop and weather advisory, and export a tamper-proof certified report.

---

## Quick Start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create a `.env.local` file in the project root:

```
MONGODB_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
```

---

## Architecture

```
Browser (Next.js 15 App Router)
|
+-- Landing Page (/)
|   +-- Hero, Problem, Features, HowItWorks
|   +-- Comparison, UseCases, CTA, Footer
|
+-- Dashboard (/dashboard)
|   +-- Upload (/upload)             CSV ingestion -> MongoDB
|   +-- Datasets (/datasets)         List all uploaded datasets
|   +-- Dataset Detail (/datasets/[id])
|   |   +-- KPI Cards                Auto-detected metrics
|   |   +-- Schema Panel             Column types, null%, cardinality
|   |   +-- Kisan AI Panel           Farmer + weather + advisory (agricultural only)
|   |   +-- Analytics Chart          Recharts visualisation
|   |   +-- AI Insight Panel         Groq-generated executive summary
|   |   +-- Anomaly Table            Row-level anomaly flags
|   |   +-- Simulation Panel         What-if sliders -> re-run AI
|   |   +-- News Correlation         External factor context
|   |   +-- Dataset Chatbot          Q&A over your data (Groq)
|   +-- Reports (/reports)           Certified report archive
|   +-- Verify (/verify)             Tamper-check any report by ID
|   +-- Settings (/settings)
|
+-- API Layer (/api)
|   +-- /api/datasets                CRUD for datasets
|   +-- /api/datasets/[id]/interpret       Groq AI analysis
|   +-- /api/datasets/[id]/chat            Chatbot (Groq)
|   +-- /api/datasets/[id]/explain-kpi     KPI explanation (Groq)
|   +-- /api/datasets/[id]/simulate        What-if simulation (Groq)
|   +-- /api/datasets/[id]/link-farmer     Link / unlink farmer
|   +-- /api/datasets/[id]/report          Generate certified report
|   +-- /api/farmer/[aadhaar]              Farmer profile lookup
|   +-- /api/farmer/weather                Open-Meteo live weather
|   +-- /api/farmer/insights               Groq farm advisory
|   +-- /api/farmer/voice-advisory         Groq Hindi / English Q&A
|   +-- /api/reports                       Report archive
|   +-- /api/verify                        SHA-256 integrity check
|
+-- External Services
    +-- Groq (llama-3.3-70b-versatile)     All LLM inference
    +-- Open-Meteo                          Weather data (free, no key)
    +-- MongoDB                             Dataset + report storage
    +-- Web Speech API (browser-native)     Voice input / TTS output
```

---

## Features

### Data Upload and Schema Detection

- Drag-and-drop CSV upload
- Auto-detects column types (numeric, categorical, date, boolean)
- Reports null percentage, unique value count, and sample values per column

### AI Dataset Interpretation

- Sends dataset structure, sample rows, and KPIs to Groq
- Returns executive summary, insight highlights, anomaly explanations, risk reasoning, forecast narrative, and a certification statement
- Confidence score rendered as a circular progress indicator (0-100)

### KPI Cards with AI Explanations

- Auto-detects meaningful numeric metrics from column names
- Sparkline trend visualisation per KPI
- Click any KPI card to get a plain-English explanation from Groq

### Anomaly Detection

- Statistical anomaly flagging across rows
- Table view with flagged column, value, and reason

### What-If Simulation

- Adjust detected numeric parameters via sliders
- Re-runs AI interpretation with modified values and shows the delta in outcomes

### Dataset Chatbot

- Ask free-form questions about uploaded data
- Groq answers using the dataset schema and sample rows as context

### Certified Reports

- Generate a report from any completed analysis
- Contains: dataset metadata, AI findings, risk level, confidence score, and SHA-256 integrity hash
- Every report gets a unique shareable verification URL

### Document Verification

- Paste any report ID or verification URL
- Checks SHA-256 hash against MongoDB to detect tampering
- Returns: owner, dataset name, generation date, confidence score, and status (verified / tampered / not found)

---

## Kisan AI (Agricultural Datasets)

Activates automatically when a dataset category is agricultural. Requires linking a farmer profile via Aadhaar number.

### Farmer Profile Linking

- Enter a 12-digit Aadhaar number to link a farmer record
- Farmer context (crops, land size, soil type, irrigation type, GPS location) enriches all subsequent AI calls for that dataset

### Live Weather

- Fetches current conditions and 7-day forecast from Open-Meteo using the farmer's coordinates
- Displays temperature, humidity, wind speed, rainfall, cloud cover, and a daily precipitation bar

### PM Scheme Eligibility Scanner

Automatically evaluates the linked farmer's eligibility for 6 central government schemes:

| Scheme | Benefit |
|---|---|
| PM-KISAN | Rs 6,000 per year direct income support |
| PMFBY | Crop loss insurance at subsidised premium |
| Kisan Credit Card | Short-term credit at 4% per annum |
| Soil Health Card | Free soil testing and fertiliser recommendation |
| e-NAM | Online mandi access for better price discovery |
| MGNREGS | 100 days guaranteed wage employment |

For each scheme, shows: eligibility status, reason, required documents, and direct portal link.

### Voice Advisory

- Language toggle between Hindi and English
- Mic button using the browser's native Web Speech API (no third-party service)
- Question is sent to Groq with the full farmer profile and current weather as context
- Answer is displayed as text and spoken aloud via browser Text-to-Speech
- Suggested question chips for one-tap access to common queries

### Enriched Dataset Analysis

- Runs the standard AI dataset interpretation enriched with the farmer's crop profile and live weather
- Produces farm-specific insight highlights and anomaly explanations tied to agricultural context

### Full Farm Advisory

Generates a comprehensive advisory via Groq:

- Overall risk level (Low / Medium / High) with reasoning
- Seasonal summary
- Immediate action items
- Weather alerts
- Per-crop advisory with status: Good, Caution, or Critical
- Irrigation recommendation
- Market price outlook per crop: Bullish, Neutral, or Bearish
- Government scheme recommendations tailored to the farmer's situation

---

## Demo Aadhaar Numbers

For testing the Kisan AI panel on any agricultural dataset:

```
1234-5678-9012
2345-6789-0123
3456-7890-1234
4567-8901-2345
5678-9012-3456
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 App Router, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| LLM | Groq API (llama-3.3-70b-versatile) |
| Database | MongoDB (native driver, no ORM) |
| Charts | Recharts |
| Weather | Open-Meteo (no API key required) |
| Voice | Browser Web Speech API (STT + TTS) |
| Report hashing | Node.js crypto (SHA-256) |
| IDs | UUID v4 |

---

## Project Structure

```
app/
  page.tsx                      Landing page
  dashboard/
    page.tsx                    Dashboard home
    upload/                     CSV upload
    datasets/[id]/              Dataset detail with all analysis panels
    reports/                    Report archive
    verify/                     Document verification
    farmer/                     Standalone Kisan AI portal
    settings/
  api/
    datasets/                   Dataset CRUD and AI endpoints
    farmer/                     Farmer profile, weather, insights, voice
    reports/                    Report management
    verify/                     SHA-256 integrity check
  components/
    dashboard/
      FarmerLinkPanel.tsx       Complete Kisan AI integration (self-contained)
      KPICards.tsx
      SchemaPanel.tsx
      AnalyticsChart.tsx
      AIInsightPanel.tsx
      AnomalyTable.tsx
      SimulationPanel.tsx
      DatasetChatbot.tsx
      NewsCorrelation.tsx
      Sidebar.tsx
  hooks/
    useSTT.ts                   Browser speech-to-text (pure Web Speech API)
    useTTS.ts                   Browser text-to-speech (pure speechSynthesis)
lib/
  mongodb.ts
  mockUser.ts
types/
  index.ts
```

---

## Evaluation Notes

- All LLM inference runs through Groq. Add your `GROQ_API_KEY` to `.env.local`.
- MongoDB stores datasets and reports persistently. Add your `MONGODB_URI` to `.env.local`.
- Authentication is not in scope. The mock user (`mock-user-001`) is hardcoded. No login is required to evaluate any feature.
- Weather data comes from Open-Meteo, which is fully free and requires no API key.
- Voice features (speech-to-text and text-to-speech) require Chrome or Edge. The advisory panel also works with text input alone if a microphone is unavailable.
- To test document verification, generate a report from any dataset, copy the report ID from the Reports page, and paste it into the Verify page.
