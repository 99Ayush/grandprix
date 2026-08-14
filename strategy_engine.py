import plotly.graph_objects as go
from datetime import datetime

class TrackStrategyEngine:
    def __init__(self):
        self.history = []

    def update(self, frame_scores: dict, camera_feed: str, track_temp: float, air_temp: float, rain_radar: str):
        lap_num = len(self.history) + 1
        record = {"lap": lap_num, "feed": camera_feed, **frame_scores}
        self.history.append(record)
        
        top_condition = max(frame_scores, key=frame_scores.get)
        
        # Core Strategy Engine
        alert_msg, status_color, risk, window, tire, compound_color, pace_delta = self._generate_recommendation(
            top_condition, frame_scores, camera_feed, track_temp, rain_radar
        )
        
        # New: Generate Team Radio & API Payload
        radio_transcript = self._generate_team_radio(top_condition, risk, window, tire, track_temp)
        api_payload = self._generate_api_payload(lap_num, frame_scores, top_condition, risk, tire, pace_delta, track_temp, air_temp)
        
        chart = self._build_telemetry_chart()
        
        return top_condition, alert_msg, status_color, risk, window, tire, compound_color, pace_delta, radio_transcript, api_payload, chart

    def _generate_recommendation(self, current_state, scores, feed, track_temp, rain_radar):
        wet_prob = scores.get("Wet", 0)
        damp_prob = scores.get("Damp", 0)
        drying_prob = scores.get("Drying", 0)

        risk_val = int((wet_prob * 0.90 + damp_prob * 0.45) * 100)
        if "RAINING" in rain_radar.upper():
            risk_val = min(100, risk_val + 15)
        risk_str = f"{risk_val}%"

        if current_state == "Dry":
            return ("TRACK OPTIMAL: Maximum grip across racing line. Maintain stint pace.", "#10b981", risk_str, "CLOSED", "SOFT SLICK (C5)", "#ef4444", "-0.0s (Baseline)")
        elif current_state == "Wet":
            return ("AQUAPLANING HAZARD: Standing water spray detected! Extreme hydroplaning risk.", "#ef4444", risk_str, "N/A", "FULL WET (BLUE)", "#3b82f6", "+14.2s (Rain Pace)")
        elif current_state == "Damp":
            return ("SURFACE TRANSITION: Monitor intermediate compound degradation on dry patches.", "#f59e0b", risk_str, "STANDBY", "INTERMEDIATE (GREEN)", "#10b981", "+4.5s (Transition)")
        else: # Drying
            if len(self.history) >= 2:
                prev_drying = self.history[-2].get("Drying", 0)
                delta_s = drying_prob - prev_drying
                if delta_s > 0.05:
                    return (f"CROSSOVER OPEN! Track drying rapidly (ΔS = +{round(delta_s*100, 1)}%/lap). BOX THIS LAP!", "#06b6d4", risk_str, "OPEN (BOX NOW)", "INTERMEDIATE -> MEDIUM SLICK", "#eab308", "-1.8s (SLICKS FASTER)")
            return ("CROSSOVER APPROACHING: Dry racing line widening. Prepare pit crew.", "#eab308", risk_str, "OPENING (1-2 LAPS)", "INTERMEDIATE", "#10b981", "+1.2s (Inter Optimal)")

    def _generate_team_radio(self, state, risk, window, tire, temp):
        """Translates mathematical telemetry into realistic F1 race engineer radio transcripts."""
        if state == "Dry":
            return f"📻 <b>[RACE ENGINEER]:</b> 'Track is clear. Surface temp is {temp}°C. Degradation is nominal on the {tire}. Keep pushing, pace is good.'"
        elif state == "Wet":
            return f"📻 <b>[RACE ENGINEER]:</b> 'We are seeing heavy standing water, Aquaplaning risk is critical at {risk}. Switch engine mode to wet, stay off the curbs.'"
        elif state == "Damp":
            return f"📻 <b>[RACE ENGINEER]:</b> 'Track is transitioning. Cool the {tire} on the straights, look for the wet patches. Crossover window is currently {window}.'"
        else:
            if "BOX NOW" in window:
                return f"📻 <b>[RACE ENGINEER]:</b> 'Box, Box, Box! The crossover delta has been met. Track is drying fast. Pit confirm for {tire}.'"
            return f"📻 <b>[RACE ENGINEER]:</b> 'Dry line is starting to appear. Give me feedback on the grip. We might box in 2 laps for slicks.'"

    def _generate_api_payload(self, lap, scores, state, risk, tire, delta, track_temp, air_temp):
        """Constructs a JSON-ready dictionary representing the backend API transmission."""
        return {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "telemetry_frame": {
                "lap_sequence": lap,
                "confidence_matrix": scores,
                "dominant_state": state
            },
            "meteorological_sensors": {
                "surface_temp_c": track_temp,
                "ambient_temp_c": air_temp
            },
            "strategy_directives": {
                "aquaplaning_risk": risk,
                "recommended_compound": tire,
                "projected_pace_delta": delta,
                "action_required": "PIT_STOP" if "BOX NOW" in tire else "MAINTAIN"
            }
        }

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
            paper_bgcolor="#0b0e14", plot_bgcolor="#0b0e14", height=320, margin=dict(l=20, r=20, t=40, b=20)
        )
        return fig
