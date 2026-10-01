# Postpartum Care Connect

> **A comprehensive full-stack digital post-discharge care coordination platform connecting mothers, newborns, obstetricians, and postpartum nurses with Google Gemini AI assistance.**

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.0-teal.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-green.svg)](https://expressjs.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini_AI-3.8_Flash-orange.svg)](https://ai.google.dev/)

---

## 🌟 Problem & Vision

After childbirth, mothers and neonates are discharged from the hospital during a critical, vulnerable window. Postpartum complications—including postpartum preeclampsia, hemorrhage, surgical site infections, and perinatal mood disorders—frequently manifest days after discharge. At the same time, caregivers navigate demanding feeding, diaper output, and vaccination routines with limited immediate support.

**Postpartum Care Connect** bridges this post-discharge gap by providing:
- **For Mothers:** Daily recovery tracking, blood pressure logs with automated clinical triage, symptom reporting, baby feeding/growth/vaccine records, and 24/7 empathetic guidance through Gemini AI.
- **For Doctors (OB/GYN):** A centralized patient panel, hypertensive crisis alerts, vital trend charts, one-click AI Clinical Care Summaries & Follow-up Preparation, and signed care plan documentation.
- **For Nurses (Postpartum RN):** Follow-up task queues, outreach attempt logging (calls, in-app consults, home visits), missed check-in detection, and clinical risk escalation to attending physicians.

---

## 🏗️ System Architecture

- **Frontend:** React 19 SPA, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts (for BP and WHO infant growth curve charts).
- **Backend:** Node.js Express server (`server.ts`) mounting Vite middleware in development and serving static production assets.
- **Database & Data Layer:** Relational data store (`server/dataStore.ts`) with pre-seeded clinical demonstration accounts, audit logging, and automated triage rule evaluation.
- **AI Engine:** Google Gemini API (`@google/genai` TypeScript SDK) utilizing server-side proxy routes (`/api/gemini/chat`, `/api/gemini/generate`, `/api/ai/summarize`). **API secrets are never exposed to the client bundle.**

---

## 🚀 Key Functional Modules

### 1. Separate Dedicated Portals & Authentication
- **Mother Portal:** Personalized recovery trajectory based on delivery type and baby date of birth.
- **Doctor Portal:** Clinical review board with patient risk stratification (*Urgent Red Alert*, *Warning*, *Stable*).
- **Nurse Portal:** Active task management, outreach documentation, and escalation workflows.
- **Demo Switcher & Custom Registration:** 1-click access to realistic clinical profiles (Maria Santos, Aisha Patel, Elena Rostova, Dr. Sarah Jenkins, Carlos Mendoza, RN) or custom user registration.

### 2. Maternal Recovery
- **Blood Pressure Tracker:** Systolic/diastolic trend charts with automated clinical alerts:
  - `< 120/80 mmHg`: Normal
  - `≥ 140/90 mmHg`: Stage 1 / Elevated (Alerts assigned nurse)
  - `≥ 160/110 mmHg`: Hypertensive Crisis / Severe Preeclampsia Alert (Immediate emergency triage instructions)
- **Symptom Tracker:** Triage rules for heavy bleeding (soaking pad < 1h), severe persistent headaches, vision changes, high fever (≥100.4°F), and leg pain/swelling.
- **Mental Wellbeing Check-in:** Mood ratings, sleep tracking, anxiety scores, and 24/7 maternal mental health hotline access (1-833-TLC-MAMA / 988 Lifeline).
- **Hydration & Nutrition:** Volume tracker (2,800 mL target for nursing recovery), meal logs, and postpartum nutrition guidelines.

### 3. Newborn Care
- **Feeding Tracker:** Breastfeeding (left/right side timer) and formula volume (mL) logs with a timeline of feeds.
- **Vaccination Tracker:** Standard immunization schedule (Birth Hep B, 2-Month combo series) with completed/upcoming status and custom vaccine addition.
- **Newborn Health & Diapers:** Infant temperature monitoring (fever ≥100.4°F in infants <3 months triggers immediate pediatric emergency warning), wet/dirty diaper counters, jaundice progression check, and cord stump status.
- **Growth Tracker:** Weight, length, and head circumference plotted against World Health Organization (WHO) infant growth reference percentiles.

### 4. Agentic AI & Care Coordination Workflows
- **Workflow 1 (Missed Check-in Detection):** Automatically scans for patients without recorded vitals in 24 hours and queues a high-priority outreach task for the nurse.
- **Workflow 2 (Clinician-Reviewed Warning Alerts):** Automated instant rule evaluation creates alerts on clinician dashboards when concerning symptoms or BP readings occur.
- **Workflow 3 & 5 (AI Care Summary & Follow-up Prep):** Generates a structured 6-point clinical briefing from patient logs with recommended physician follow-up questions.
- **Workflow 4 (Reminders & Adherence):** Real-time medication checklist and adherence tracking.

---

## 🛠️ Quick Start & Local Setup

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/postpartum-care-connect.git
cd postpartum-care-connect
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory (based on `.env.example`):
```env
GEMINI_API_KEY="your-gemini-api-key-here"
PORT=3000
```

### 4. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production
```bash
npm run build
npm start
```

---

## 🔒 Security & Privacy

- **Server-Side API Proxy:** The frontend never connects directly to Google Gemini APIs. All AI requests pass through `/api/gemini/chat` where inputs are sanitized and patient context is injected securely.
- **Environment Isolation:** `.env` is ignored by `.gitignore` to prevent secret leaks.
- **Role-Based Access Control:** Mothers cannot view other mothers' private charts; clinicians only access assigned patients.
- **Clinical Safeguards:** The AI assistant enforces clear medical disclaimers, never diagnoses or changes prescriptions, and redirects red flag warning signs immediately to 911 or emergency maternity triage.

---

## 📄 License
Apache-2.0
