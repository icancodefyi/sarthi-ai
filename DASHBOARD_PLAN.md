# Sarthi AI — AI-Certified Data Intelligence Platform
## Complete Product Overview & Development Roadmap

---

## 🚀 Product Overview

An AI-powered dataset intelligence platform that:

- Accepts CSV uploads
- Runs real, deterministic analytics
- Uses AI for interpretation and narrative generation
- Generates simulations
- Produces a tamper-resistant certified report
- Verifies reports via QR-based validation

**Core Flow:**
```
Upload → Analyze → Explain → Certify → Verify
```

---

## 🧭 Complete User Flow (End-to-End)

### 1️⃣ Authentication

**User:**
- Signs up / logs in
- Lands on dashboard

**System:**
- Creates user document
- Assigns unique user ID
- Stores plan type

---

### 2️⃣ Upload Dataset

**User:**
- Uploads CSV

**System:**
- Stores file in cloud storage
- Creates dataset document (`status: processing`)
- Parses CSV rows
- Stores structured records
- Triggers analytics engine

---

### 3️⃣ Core Analytics — Real Engine (No AI)

System computes all metrics mathematically and deterministically:

| Metric | Description |
|---|---|
| Total Records | Row count |
| Date Range | Min/max date |
| Mean / Variance | Statistical central tendency |
| Growth % | Period-over-period change |
| Moving Averages | Trend smoothing |
| Anomaly Detection | Statistical outlier detection |
| Risk Score | Composite risk metric |
| Forecast Projection | Trend extrapolation |

> **All mathematical. All deterministic. No AI.**

Results stored in `dataset.analytics`.

---

### 4️⃣ AI Interpretation Layer

System sends structured analytics summary to AI (e.g., GPT/Gemini).

**AI returns:**
- Executive summary
- Insight highlights
- Anomaly explanations
- Risk reasoning
- Forecast narrative
- Contextual "news"
- Certification reasoning
- Confidence score

Stored in `dataset.aiReport`.

Dataset `status` → `completed`.

---

### 5️⃣ Dashboard Display

**User sees:**
- KPI cards
- Main graph (real data + forecast + anomaly markers)
- AI insight panel
- Anomaly breakdown table
- Simulation controls
- **"Generate Certified Report"** button ← Power feature

---

## 📜 6️⃣ Report Generation Flow (Critical Layer)

When user clicks **"Generate Certified Report"**:

### Step 1 — Report Snapshot Creation

System creates an **immutable snapshot object** containing:
- User details (name, email, ID)
- Dataset metadata
- Analytics results
- AI report
- Timestamp
- Unique Report ID
- Integrity hash

Stored in `reports` collection.

> **This is NOT dynamic data. This is frozen at generation time.**

---

### Step 2 — Integrity Hash Generation

```
Hash = SHA-256(Dataset ID + Analytics JSON + AI Report JSON + Timestamp)
```

- This hash is the **report fingerprint**
- Stored in the report document
- If any field changes later → hash mismatch → tamper detected

---

### Step 3 — Certificate Object Creation

Certificate contains:
- Report ID
- User name
- Dataset name
- Generated date
- Integrity hash
- AI confidence score
- QR code link

Stored inside the report document.

---

### Step 4 — QR Code Generation

QR links to public verification endpoint:
```
/verify/{reportId}
```

**Anyone scanning sees:**
- Report summary
- Integrity status (✅ Valid / ❌ Tampered)
- Timestamp
- Certification statement

> QR is not decorative. It is a verification gateway.

---

## 🗄 Database Structure (MongoDB)

### Collection 1 — `users`
```json
{
  "_id": "userId",
  "name": "string",
  "email": "string",
  "planType": "free | pro",
  "createdAt": "Date"
}
```

### Collection 2 — `datasets`
```json
{
  "_id": "datasetId",
  "userId": "ref",
  "filename": "string",
  "fileUrl": "string",
  "status": "processing | completed | failed",
  "metadata": {},
  "analytics": {},
  "aiReport": {},
  "createdAt": "Date"
}
```

### Collection 3 — `records` *(optional for large datasets)*
```json
{
  "_id": "recordId",
  "datasetId": "ref",
  "rowData": {},
  "rowIndex": "number"
}
```

### Collection 4 — `reports`
```json
{
  "_id": "reportId",
  "userId": "ref",
  "datasetId": "ref",
  "snapshotData": {
    "analytics": {},
    "aiReport": {}
  },
  "integrityHash": "string (SHA-256)",
  "certificateObject": {
    "reportId": "string",
    "userName": "string",
    "datasetName": "string",
    "generatedDate": "Date",
    "integrityHash": "string",
    "aiConfidenceScore": "number",
    "qrCodeUrl": "string"
  },
  "qrCodeUrl": "string",
  "createdAt": "Date"
}
```

> **Reports are immutable. Never editable. Only regeneratable.**

---

## 🔐 Security & Tamper Protection Model

**Practical SaaS-level integrity validation:**

1. Snapshot saved at generation time
2. SHA-256 hash generated from snapshot content
3. Hash stored in report document
4. Verification endpoint recalculates hash on demand
5. If recalculated hash ≠ stored hash → mark as **Tampered**

**Future enhancement:**
- Digitally sign hash using server private key (RSA/ECDSA)

> For MVP: Hash verification is sufficient.

---

## 🎭 Real vs AI vs Mock — Clarification

| Layer | Type | Examples |
|---|---|---|
| **Math Engine** | Real | CSV content, metrics, stats, forecast, risk score, hash, report snapshot, integrity validation |
| **AI Layer** | Interpreted | Summary, insight explanations, risk reasoning, forecast narrative, certification language, contextual "news" |
| **Synthetic** | Allowed mock | External cause speculation, market-style narrative tone, contextual explanation scenarios |

> Synthetic content is always derived from real analytics. Never random storytelling.

---

## 🖥 Dashboard Structure

### Top Bar
- Logo
- Upload button
- Generate Report button
- User profile

### Left Sidebar
- Dashboard
- Datasets
- Reports
- Verify Report
- Settings

### Dashboard Layout

**Section 1 — KPI Row**
- Total Records
- Growth %
- Risk Score
- Anomaly Count

**Section 2 — Main Visualization**
- Large interactive graph
  - Real data line
  - Forecast overlay
  - Anomaly markers

**Section 3 — AI Insight Panel**
Tabs:
- Summary
- Insights
- AI News
- Certification

**Section 4 — Anomaly Table**
- Detailed anomaly breakdown

**Section 5 — Simulation Panel**
- Interactive recalculation controls
- Optional AI narrative refresh

---

## 📜 Report View Page

Clean, printable layout:

```
Header:         Logo | Report ID | Generated date
User Details:   Name, email, ID
Dataset Overview
Analytics Summary
Charts Snapshot
AI Insight Section
Certification Block
Integrity Hash Display
QR Code (bottom-right corner)
```

**Export options:**
- PDF download
- Shareable link

---

## 🔎 Verification Page

**Public route:** `/verify/{reportId}`

**Shows:**
- Report owner
- Dataset name
- Generated date
- Integrity status: ✅ Verified or ❌ Tampered

> This builds serious institutional trust.

---

## 🏗 Development Roadmap

### Phase 1 — Core Infrastructure
- [ ] MongoDB connection utility (`/lib/mongodb.ts`)
- [ ] Auth (NextAuth or custom JWT)
- [ ] Dataset schema & model
- [ ] File upload + CSV parsing
- [ ] `users` and `datasets` collections

### Phase 2 — Analytics Engine
- [ ] Statistical calculations (mean, variance, growth %)
- [ ] Moving average computation
- [ ] Anomaly detection (Z-score / IQR method)
- [ ] Risk scoring algorithm
- [ ] Forecast projection (linear regression / trend)
- [ ] Dashboard KPI cards + charts functional

### Phase 3 — AI Layer
- [ ] Structured AI pipeline (JSON-only responses)
- [ ] Analytics → AI prompt construction
- [ ] AI response parsing and storage in `aiReport`
- [ ] AI insight panel in dashboard

### Phase 4 — Dashboard UI
- [ ] KPI cards component
- [ ] Main chart (real data + forecast + anomaly markers)
- [ ] AI insight panel with tabs
- [ ] Anomaly breakdown table
- [ ] Simulation controls panel

### Phase 5 — Report & Certification Engine
- [ ] Immutable snapshot system
- [ ] SHA-256 hash generation
- [ ] QR code generation (`qrcode` npm library)
- [ ] `reports` collection + API
- [ ] `/report/{reportId}` view page
- [ ] `/verify/{reportId}` public endpoint
- [ ] PDF export
- [ ] Share link generation

> **Phase 5 is the differentiator.**

---

## 🎯 Strategic Positioning

> **You are no longer: "AI CSV Analyzer"**
>
> **You are: "AI-Certified Data Intelligence Platform"**

**The certification + QR verification is your moat.**

Most AI tools explain data.
Very few verify it.

That's your angle.

---

## 📁 Folder Structure (Target)

```
sarthi-ai/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── datasets/page.tsx
│   │   ├── reports/page.tsx
│   │   └── settings/page.tsx
│   ├── verify/[reportId]/page.tsx
│   ├── report/[reportId]/page.tsx
│   ├── api/
│   │   ├── upload/route.ts
│   │   ├── analyze/route.ts
│   │   ├── ai-interpret/route.ts
│   │   ├── report/generate/route.ts
│   │   ├── report/[reportId]/route.ts
│   │   └── verify/[reportId]/route.ts
│   ├── layout.tsx
│   └── page.tsx          ← Landing page
├── lib/
│   ├── mongodb.ts
│   ├── analytics.ts      ← Math engine
│   ├── ai.ts             ← AI pipeline
│   ├── hash.ts           ← SHA-256 utility
│   └── qr.ts             ← QR code generation
├── models/
│   ├── User.ts
│   ├── Dataset.ts
│   ├── Record.ts
│   └── Report.ts
└── components/
    ├── dashboard/
    └── report/
```

---

*Last updated: February 2026*
