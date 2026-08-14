import gradio as gr
from backend import analyze_track_frame
from strategy_engine import TrackStrategyEngine

engine = TrackStrategyEngine()

def process_frame(image, sector):
    scores, active_sector = analyze_track_frame(image, sector)
    top_cond, alert_msg, color, risk, window, tire, compound_color, chart = engine.update(scores, active_sector)
    
    banner_html = f"""
    <div style="background-color: #0b0e14; border: 2px solid {color}; border-radius: 8px; padding: 15px; text-align: center;">
        <h2 style="color: {color}; margin: 0; font-family: monospace; letter-spacing: 2px;">{top_cond.upper()} SURFACE DETECTED</h2>
        <p style="color: #d1d5db; margin-top: 8px; font-size: 15px;"><b>Strategy Directive:</b> {alert_msg}</p>
    </div>
    """
    
    tire_html = f"""
    <div style="background-color: #0b0e14; border: 1px solid {compound_color}; border-radius: 6px; padding: 10px; text-align: center;">
        <span style="color: {compound_color}; font-weight: bold; font-size: 16px;">{tire}</span>
    </div>
    """
    
    return banner_html, scores, risk, window, tire_html, chart

custom_css = """
body { background-color: #05070a; font-family: monospace; }
.gradio-container { background-color: #05070a !important; }
"""

with gr.Blocks(css=custom_css) as demo:
    gr.Markdown("# 🏎️ GRAND PRIX PIT-WALL TELEMETRY ENGINE v2.0")
    gr.Markdown("### Multi-Sector Track Surface Analytics & Pit Crossover Predictor | Powered by Hugging Face Hub")
    
    with gr.Row():
        with gr.Column(scale=1):
            input_image = gr.Image(type="pil", label="Trackside / Onboard Optical Feed")
            sector_select = gr.Dropdown(
                choices=["Sector 1 (Turn 1-4)", "Sector 2 (Hairpin Apex)", "Sector 3 (Main Straight)"],
                value="Sector 2 (Hairpin Apex)",
                label="Circuit Telemetry Sector Target"
            )
            btn = gr.Button("⚡ PROCESS SECTOR TELEMETRY", variant="primary")
            
            with gr.Row():
                risk_metric = gr.Textbox(label="Aquaplaning Hazard Index", value="0%")
                window_metric = gr.Textbox(label="Pit Crossover Window", value="CLOSED")
            
            tire_output = gr.HTML(label="Target Pirelli Compound Directives")
            
        with gr.Column(scale=1):
            output_banner = gr.HTML(label="Pit-Wall Strategy Alert Engine")
            output_labels = gr.Label(label="Temperature-Calibrated Probabilities (Tau = 5.0)", num_top_classes=4)
            
    with gr.Row():
        output_chart = gr.Plot(label="Multi-Sector Track Surface Progression Matrix")
        
    btn.click(
        fn=process_frame,
        inputs=[input_image, sector_select],
        outputs=[output_banner, output_labels, risk_metric, window_metric, tire_output, output_chart]
    )

if __name__ == "__main__":
    demo.launch(share=True)