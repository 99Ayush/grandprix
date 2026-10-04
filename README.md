# 🏎️ GRAND PRIX PIT-WALL TELEMETRY ENGINE (PURE MERN STACK)

An enterprise-grade real-time racing strategy and optical telemetry system for Formula 1 / Endurance racing. Built purely with Node.js, Express, MongoDB, React, Vite, and Tailwind CSS. Features optical surface condition evaluation, temperature-scaled probability estimation, real-time aquaplaning risk assessment, and pit crossover window recommendations.

---

## 🏗️ Repository Architecture & Directory Structure

```
grandprix/
├── README.md                  # Project documentation & setup guide
├── index.html                 # Static entry point
├── style.css                  # Optional base stylesheet
├── backend/                   # Node.js + Express + MongoDB REST API backend
│   ├── models/
│   │   └── Telemetry.js       # MongoDB Schema for Telemetry logs
│   ├── routes/
│   │   └── telemetry.js       # API endpoints (/api/telemetry/process, /history)
│   ├── services/
│   │   └── strategyEngine.js  # JavaScript strategy engine
│   ├── package.json
│   ├── server.js              # Express server entry point
│   └── .env.example
└── frontend/                  # React + Vite + Tailwind CSS telemetry dashboard
    ├── src/
    │   ├── App.jsx            # Real-time Pit-Wall telemetry dashboard UI
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🚀 Quick Start Guide

### 1. Node.js Express Backend API
```bash
cd backend
npm install
npm run dev
```
*Backend runs on `http://localhost:5000` with `/api/health` and `/api/telemetry/process` routes.*

### 2. React Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
*Frontend UI accessible at `http://localhost:3000`.*

---

## 🤖 Hugging Face Integration Details
- **Target Hugging Face Model**: `google/siglip-base-patch16-224` (Zero-shot classification via HF API / Express Proxy)
- **Temperature Scaling**: Softmax temperature $\tau = 5.0$
- **Target Compounds**: Soft Slick (C5), Intermediate (Green), Full Wet (Blue)