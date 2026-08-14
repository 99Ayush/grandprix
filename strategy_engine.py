import plotly.graph_objects as go

class TrackStrategyEngine:
    def __init__(self):
        self.history = []

    def update(self, frame_scores: dict, sector: str):
        lap_num = len(self.history) + 1
        record = {"lap": lap_num, "sector": sector, **frame_scores}
        self.history.append(record)
        
        top_condition = max(frame_scores, key=frame_scores.get)
        alert_msg, status_color, risk, window, tire, compound_color = self._generate_recommendation(top_condition, frame_scores, sector)
        chart = self._build_telemetry_chart()
        
        return top_condition, alert_msg, status_color, risk, window, tire, compound_color, chart

    def _generate_recommendation(self, current_state, scores, sector):
        wet_prob = scores.get("Wet", 0)
        damp_prob = scores.get("Damp", 0)
        drying_prob = scores.get("Drying", 0)

        # 1. Calculate Aquaplaning Risk Index (%)
        risk_val = int((wet_prob * 0.90 + damp_prob * 0.45) * 100)
        risk_str = f"{risk_val}%"

        # 2. Strategy Rules & Pirelli Directives
        if current_state == "Dry":
            return (
                f"TRACK OPTIMAL ({sector.upper()}): Maximum grip across racing line. Maintain stint pace.",
                "#10b981", risk_str, "CLOSED", "SOFT SLICK (C5)", "#ef4444"
            )
        elif current_state == "Wet":
            return (
                f"AQUAPLANING HAZARD ({sector.upper()}): Standing water spray detected! Extreme hydroplaning risk.",
                "#ef4444", risk_str, "N/A", "FULL WET (BLUE)", "#3b82f6"
            )
        elif current_state == "Damp":
            return (
                f"SURFACE TRANSITION ({sector.upper()}): Monitor intermediate compound wear on dry patches.",
                "#f59e0b", risk_str, "STANDBY", "INTERMEDIATE (GREEN)", "#10b981"
            )
        else: # Drying
            if len(self.history) >= 2:
                prev_drying = self.history[-2].get("Drying", 0)
                delta_s = drying_prob - prev_drying
                if delta_s > 0.05:
                    return (
                        f"CROSSOVER OPEN ({sector.upper()})! Track drying fast (ΔS = +{round(delta_s*100, 1)}%/lap). BOX THIS LAP FOR SLICKS!",
                        "#06b6d4", risk_str, "OPEN (BOX NOW)", "INTERMEDIATE -> MEDIUM SLICK", "#eab308"
                    )
            return (
                f"CROSSOVER APPROACHING ({sector.upper()}): Dry racing line emerging. Prepare pit crew.",
                "#eab308", risk_str, "OPENING (1-2 LAPS)", "INTERMEDIATE", "#10b981"
            )

    def _build_telemetry_chart(self):
        laps = [h["lap"] for h in self.history]
        fig = go.Figure()

        fig.add_trace(go.Scatter(x=laps, y=[h.get("Dry", 0) for h in self.history], mode='lines+markers', name='Dry', line=dict(color='#10b981', width=3)))
        fig.add_trace(go.Scatter(x=laps, y=[h.get("Damp", 0) for h in self.history], mode='lines+markers', name='Damp', line=dict(color='#f59e0b', width=3)))
        fig.add_trace(go.Scatter(x=laps, y=[h.get("Wet", 0) for h in self.history], mode='lines+markers', name='Wet', line=dict(color='#ef4444', width=3)))
        fig.add_trace(go.Scatter(x=laps, y=[h.get("Drying", 0) for h in self.history], mode='lines+markers', name='Drying', line=dict(color='#06b6d4', width=3)))

        fig.update_layout(
            title="Optical Surface Progression Matrix (Multi-Lap Delta)",
            xaxis=dict(title="Lap Sequence / Frame Timestamp", dtick=1),
            yaxis=dict(title="Calibrated Confidence Probability", range=[0, 1.05]),
            template="plotly_dark",
            paper_bgcolor="#0b0e14",
            plot_bgcolor="#0b0e14",
            height=320,
            margin=dict(l=20, r=20, t=40, b=20)
        )
        return fig