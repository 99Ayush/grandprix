---
title: F1 Pit-Wall Telemetry Engine
emoji: 🏎️
colorFrom: red
colorTo: gray
sdk: gradio
sdk_version: 4.44.0
app_file: app.py
pinned: false
---

# 🏎️ GRAND PRIX PIT-WALL TELEMETRY ENGINE v2.0
> **Multi-Sector Track Surface Analytics & Pit Crossover Predictor**  
> *Powered by Hugging Face Hub (`google/siglip-base-patch16-224`)*

---

## 📌 Problem Overview: "Weather Whiplash"
In Formula 1 racing, rapid weather transitions create critical strategic decisions. Pitting one lap too early damages intermediate compounds on dry asphalt; pitting one lap too late costs upwards of 20 to 30 seconds in lost lap time.

The **F1 Pit-Wall Telemetry Engine** is a decision support system (DSS) designed to eliminate strategy guesswork. By processing optical feeds from trackside camera sectors or onboard feeds, it calibrates zero-shot vision scores into actionable pit-wall telemetry.

---

## ✨ Key Features & Technical Highlights

* **Temperature-Calibrated Softmax ($\tau = 5.0$):** Eliminates unconstrained zero-shot sigmoid noise by applying a temperature scaling factor to force logit values into a calibrated multi-class probability space[cite: 4].
* **Multi-Sector Track Ingestion:** Ingests sector-specific optical feeds (e.g., Turn 1-4, Hairpin Apex, Main Straight) rather than treating a circuit as a uniform surface[cite: 3, 4].
* **Surface Drying Gradient ($\Delta S$):** Tracks multi-lap progression ($\Delta S = P_{\text{Drying}}^{(t)} - P_{\text{Drying}}^{(t-1)}$) to detect the exact pit crossover window[cite: 6].
* **Aquaplaning Hazard Risk Index (AHRI):** Programmatically computes standing water risk based on wet/damp confidence weights[cite: 6].
* **Pirelli Compound Directives:** Outputs compound strategy directives (Soft Slicks, Intermediates, Full Wets) mapped to track conditions[cite: 6].
* **Plotly Telemetry Matrix:** Renders real-time dark-mode lap progression charts[cite: 3, 6].

---

## 📊 Telemetry State Mapping

| Track Surface State | Pirelli Compound Directive | Aquaplaning Index | Pit Crossover Window |
| :--- | :--- | :--- | :--- |
| **Dry** | `SOFT SLICK (C5)` | 0% – 10% | `CLOSED` |
| **Damp** | `INTERMEDIATE (GREEN)` | 20% – 45% | `STANDBY` |
| **Wet** | `FULL WET (BLUE)` | 70% – 100% | `N/A (HAZARD)` |
| **Drying ($\Delta S > 0.05$)** | `INTERMEDIATE -> MEDIUM SLICK` | 15% – 30% | `OPEN (BOX NOW)` |

---

## 🏗️ Architecture & Component Layout
