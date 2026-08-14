import gradio as gr
from backend import analyze_track_frame
from strategy_engine import TrackStrategyEngine

engine = TrackStrategyEngine()

def process_frame(image, camera_feed, track_temp, air_temp, rain_radar):
    try:
        # Fallback values if inputs are empty
        cam = camera_feed if camera_feed else "Cam 02: Sector 2 Chicane"
        t_temp = float(track_temp) if track_temp is not None else 28.5
        a_temp = float(air_temp) if air_temp is not None else 21.0
        r_radar = rain_radar if rain_radar else "0.0mm"

        scores, active_feed = analyze_track_frame(image, cam, t_temp)
        
        top_cond, alert_msg, color, risk, window, tire, compound_color, pace_delta, radio, api_json, chart = engine.update(
            scores, active_feed, t_temp, a_temp, r_radar
        )
        
        banner_html = f"""
        <div style="background-color: #0b0e14; border: 2px solid {color}; border-radius: 8px; padding: 15px; text-align: center;">
            <h2 style="color: {color}; margin: 0; font-family: monospace; letter-spacing: 2px;">{top_cond.upper()} SURFACE DETECTED</h2>
            <p style="color: #d1d5db; margin-top: 8px; font-size: 15px;"><b>Strategy Directive:</b> {alert_msg}</p>
        </div>
        """
        
        radio_html = f"""
        <div style="background-color: #1f2937; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 12px; margin-top: 10px; font-family: monospace;">
            <span style="color: #fcd34d; font-size: 14px;">{radio}</span>
        </div>
        """
        
        tire_html = f"""
        <div style="background-color: #0b0e14; border: 1px solid {compound_color}; border-radius: 6px; padding: 10px; text-align: center;">
            <span style="color: {compound_color}; font-weight: bold; font-size: 16px;">{tire}</span>
            <p style="color: #9ca3af; margin: 4px 0 0 0; font-size: 12px;">Pace Delta: <b>{pace_delta}</b></p>
        </div>
        """
        
        return banner_html, scores, risk, window, tire_html, chart, radio_html, api_json

    except Exception as e:
        # Emergency Fail-Safe Return so UI never breaks
        err_banner = f"""
        <div style="background-color: #0b0e14; border: 2px solid #ef4444; border-radius: 8px; padding: 15px; text-align: center;">
            <h2 style="color: #ef4444; margin: 0; font-family: monospace;">SYSTEM INITIALIZING / ERROR</h2>
            <p style="color: #d1d5db; margin-top: 8px;">{str(e)}</p>
        </div>
        """
        fallback_scores = {"Dry": 0.25, "Damp": 0.25, "Wet": 0.25, "Drying": 0.25}
        return err_banner, fallback_scores, "N/A", "ERROR", "<div>Error Processing</div>", None, "<div>No Radio Transmission</div>", {"error": str(e)}

custom_css = """
body { background-color: #05070a; font-family: monospace; }
.gradio-container { background-color: #05070a !important; }
"""

with gr.Blocks(css=custom_css) as demo:
    gr.Markdown("# 🏎️ GRAND PRIX PIT-WALL TELEMETRY ENGINE v2.0")
    gr.Markdown("### Multi-Sector Optical Analytics, Pit Crossover Predictor & Enterprise API | Powered by Hugging Face Hub")
    
    with gr.Row():
        with gr.Column(scale=1):
            input_image = gr.Image(type="pil", label="Trackside / Onboard Optical Feed")
            
            with gr.Accordion("⚙️ Met-Office Sensor Data & Camera Settings", open=True):
                camera_select = gr.Dropdown(choices=["Cam 01: Turn 1 Apex", "Cam 02: Sector 2 Chicane", "Cam 03: Onboard Car #16"], value="Cam 02: Sector 2 Chicane", label="Camera Feed")
                track_temp_input = gr.Number(label="Track Surface Temp (°C)", value=28.5)
                air_temp_input = gr.Number(label="Ambient Air Temp (°C)", value=21.0)
                rain_radar_input = gr.Textbox(label="Met-Office Rain Radar", value="0.0mm (NO RAIN EXPECTED)")
                
            btn = gr.Button("⚡ PROCESS TELEMETRY FRAME", variant="primary")
            
            with gr.Row():
                risk_metric = gr.Textbox(label="Aquaplaning Hazard Index", value="0%")
                window_metric = gr.Textbox(label="Pit Crossover Window", value="CLOSED")
            
            tire_output = gr.HTML(label="Target Pirelli Compound Directives & Lap Delta")
            
        with gr.Column(scale=1):
            output_banner = gr.HTML(label="Pit-Wall Strategy Alert Engine")
            output_radio = gr.HTML(label="Automated Team Radio Transcript")
            output_labels = gr.Label(label="Temperature-Calibrated Probabilities (Tau = 5.0)", num_top_classes=4)
            
    with gr.Row():
        with gr.Column(scale=2):
            output_chart = gr.Plot(label="Multi-Sector Track Surface Progression Matrix")
        with gr.Column(scale=1):
            output_json = gr.JSON(label="Live Enterprise API Payload (AWS / Atlas Ready)")
        
    btn.click(
        fn=process_frame,
        inputs=[input_image, camera_select, track_temp_input, air_temp_input, rain_radar_input],
        outputs=[output_banner, output_labels, risk_metric, window_metric, tire_output, output_chart, output_radio, output_json]
    )

if __name__ == "__main__":
    demo.launch(share=True)
