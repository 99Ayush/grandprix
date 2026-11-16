# Grand Prix — Pit-Wall Telemetry Engine

**A race-strategy dashboard that turns a track photo and a few sensor readings into a pit-stop recommendation.**

Built for the problem every race engineer actually has: the information is already there — track surface, tyre compound, ambient and track temperature, lap times — but it is scattered across screens and judgement calls. This project fuses it into one live view that answers three questions:

1. What compound is the car on right now?
2. How close is the track to aquaplaning?
3. Is this the lap to pit?

Live telemetry dashboard, three-lap progression chart, and a strategy engine that explains every recommendation.

---

## How the strategy engine works

**Tyre compound detection.** A track-side frame is classified zero-shot against three compound classes — Soft (slick), Intermediate, Full Wet — using `google/siglip-base-patch16-224` through the Hugging Face inference API. Class scores are sharpened with temperature-scaled softmax (`τ = 5.0`) so a marginal frame reads as genuinely uncertain instead of falsely confident.

**Aquaplaning risk.** Standing-water depth is weighted against a per-compound displacement threshold, then scaled by track temperature. Wet-rated compounds tolerate far more water than slicks; the model returns a continuous risk score, not a binary flag.

**Pit crossover window.** The engine compares the projected time loss of staying out against the loss of a pit stop (pit-lane delta + out-lap on cold tyres) and reports the lap range where stopping is net-positive.

Every recommendation returns its inputs alongside the output, so the call can be audited rather than taken on faith.

---

## Architecture

```
grandprix/
├── backend/                      Node.js + Express + MongoDB
│   ├── models/Telemetry.js       Mongoose schema for telemetry records
│   ├── routes/telemetry.js       POST /api/telemetry/process, GET /api/telemetry/history
│   ├── services/strategyEngine.js  Compound, aquaplaning and crossover logic
│   └── server.js
└── frontend/                     React + Vite + Tailwind
    └── src/App.jsx               Pit-wall dashboard, Chart.js lap progression
```

**Flow:** frontend posts a frame + sensor payload → backend runs classification and strategy math → result is persisted to MongoDB → dashboard renders it and keeps the last N laps for the progression chart.

---

## Running locally

**Prerequisites:** Node.js 18+, MongoDB running locally, a Hugging Face token for compound classification.

```bash
# backend
cd backend
npm install
cp .env.example .env      # MONGO_URI, HF_TOKEN, PORT
npm run dev               # http://localhost:5000

# frontend
cd frontend
npm install
npm run dev               # http://localhost:3000
```

### API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/telemetry/process` | Classify compound, score aquaplaning risk, return strategy |
| `GET` | `/api/telemetry/history` | Recent telemetry records for the progression chart |

---

## Stack

**Backend** — Node.js, Express, MongoDB / Mongoose, Hugging Face inference (SigLIP)
**Frontend** — React, Vite, Tailwind CSS, Chart.js, Lucide icons

## License

MIT
