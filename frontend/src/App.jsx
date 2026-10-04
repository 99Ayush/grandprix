import React, { useState, useEffect } from 'react';

// Pirelli Compound Color Badge Helpers
const COMPOUND_STYLES = {
  SOFT: { border: '#ef4444', text: '#ef4444', label: 'SOFT SLICK (C5)', bg: 'rgba(239, 68, 68, 0.1)' },
  MEDIUM: { border: '#eab308', text: '#eab308', label: 'MEDIUM SLICK (C3)', bg: 'rgba(234, 179, 8, 0.1)' },
  INTERMEDIATE: { border: '#10b981', text: '#10b981', label: 'INTERMEDIATE (GREEN)', bg: 'rgba(16, 185, 129, 0.1)' },
  WET: { border: '#3b82f6', text: '#3b82f6', label: 'FULL WET (BLUE)', bg: 'rgba(59, 130, 246, 0.1)' }
};

export default function App() {
  const [activeSector, setActiveSector] = useState('Sector 2 (Chicane)');
  const [cameraFeed, setCameraFeed] = useState('Cam 02: Sector 2 Chicane');
  const [trackTemp, setTrackTemp] = useState(28.5);
  const [airTemp, setAirTemp] = useState(21.0);
  const [humidity, setHumidity] = useState(65);
  const [windSpeed, setWindSpeed] = useState(18);
  const [rainRadar, setRainRadar] = useState('0.0mm (NO RAIN EXPECTED)');

  const [telemetry, setTelemetry] = useState({
    lap: 1,
    topCondition: 'DRY',
    alertMsg: 'TRACK OPTIMAL: Maximum mechanical & aerodynamic grip across racing line. Push stint pace.',
    statusColor: '#10b981',
    risk: '4%',
    window: 'CLOSED',
    tire: 'SOFT SLICK (C5)',
    compoundKey: 'SOFT',
    paceDelta: '-0.000s (Baseline Pace)',
    dryingRate: '+1.8%/lap',
    teamRadio: "📻 [RACE ENGINEER]: 'Track state is Dry. Surface temp is 28.5°C. Target tire: SOFT SLICK (C5). Keep pushing!'",
    scores: { Dry: 0.65, Damp: 0.20, Wet: 0.05, Drying: 0.10 },
    apiPayload: {}
  });

  const [history, setHistory] = useState([
    { lap: 1, Dry: 0.65, Damp: 0.20, Wet: 0.05, Drying: 0.10 }
  ]);

  const [loading, setLoading] = useState(false);
  const [radioPulse, setRadioPulse] = useState(false);

  const triggerRadioBeep = () => {
    setRadioPulse(true);
    setTimeout(() => setRadioPulse(false), 800);
  };

  const handleProcess = async (customScores = null) => {
    setLoading(true);
    triggerRadioBeep();
    try {
      const res = await fetch('http://localhost:5000/api/telemetry/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cameraFeed,
          trackTemp,
          airTemp,
          humidity,
          windSpeed,
          rainRadar,
          scores: customScores
        })
      });
      const json = await res.json();
      if (json.success) {
        setTelemetry(json.data);
        if (json.history) setHistory(json.history);
      }
    } catch (e) {
      console.error("Telemetry Processing Error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Quick Preset Scenarios for Hackathon Demo
  const loadScenario = (type) => {
    if (type === 'WET_STORM') {
      setRainRadar('4.5mm (HEAVY RAIN WARNING)');
      setTrackTemp(18.2);
      setAirTemp(16.5);
      setHumidity(92);
      setWindSpeed(32);
      handleProcess({ Dry: 0.02, Damp: 0.10, Wet: 0.85, Drying: 0.03 });
    } else if (type === 'DRYING_CROSSOVER') {
      setRainRadar('0.0mm (RAIN CLEARED)');
      setTrackTemp(31.4);
      setAirTemp(24.0);
      setHumidity(48);
      setWindSpeed(24);
      handleProcess({ Dry: 0.15, Damp: 0.25, Wet: 0.05, Drying: 0.55 });
    } else { // OPTIMAL DRY
      setRainRadar('0.0mm (NO RAIN EXPECTED)');
      setTrackTemp(28.5);
      setAirTemp(21.0);
      setHumidity(65);
      setWindSpeed(18);
      handleProcess({ Dry: 0.75, Damp: 0.15, Wet: 0.02, Drying: 0.08 });
    }
  };

  const compoundStyle = COMPOUND_STYLES[telemetry.compoundKey] || COMPOUND_STYLES.SOFT;

  return (
    <div style={{ padding: '20px', backgroundColor: '#05070a', minHeight: '100vh', color: '#e5e7eb', fontFamily: 'monospace' }}>
      
      {/* Pit-Wall HUD Top Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #1f2937', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🏎️</span>
            <h1 style={{ color: '#10b981', margin: 0, fontSize: '22px', fontWeight: 'bold', letterSpacing: '1px' }}>
              GRAND PRIX PIT-WALL TELEMETRY ENGINE v3.0
            </h1>
          </div>
          <p style={{ color: '#9ca3af', fontSize: '12px', margin: '4px 0 0 0' }}>
            Optical Surface Analytics & Thermodynamics Crossover Predictor | Hugging Face Hub (<code style={{ color: '#34d399' }}>google/siglip-base-patch16-224</code>)
          </p>
        </div>

        {/* Interactive Scenario Presets */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => loadScenario('DRY')} style={{ background: '#0b0e14', border: '1px solid #10b981', color: '#10b981', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
            ☀️ DRY LINE
          </button>
          <button onClick={() => loadScenario('DRYING_CROSSOVER')} style={{ background: '#0b0e14', border: '1px solid #06b6d4', color: '#06b6d4', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
            🔥 CROSSOVER
          </button>
          <button onClick={() => loadScenario('WET_STORM')} style={{ background: '#0b0e14', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
            🌧️ HEAVY WET
          </button>
        </div>
      </header>

      {/* Main Pit Strategy Directive Alert Banner */}
      <div style={{ backgroundColor: '#0b0e14', border: `2px solid ${telemetry.statusColor}`, borderRadius: '8px', padding: '16px', textAlign: 'center', marginBottom: '20px', boxShadow: `0 0 20px ${telemetry.statusColor}22` }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ height: '10px', width: '10px', borderRadius: '50%', backgroundColor: telemetry.statusColor, display: 'inline-block', boxShadow: `0 0 10px ${telemetry.statusColor}` }}></span>
          <h2 style={{ color: telemetry.statusColor, margin: 0, fontSize: '18px', letterSpacing: '2px' }}>
            {telemetry.topCondition ? telemetry.topCondition.toUpperCase() : 'DRY'} SURFACE DETECTED
          </h2>
        </div>
        <p style={{ margin: 0, color: '#d1d5db', fontSize: '14px', fontFamily: 'sans-serif' }}>
          <b>Strategy Directive:</b> {telemetry.alertMsg}
        </p>
      </div>

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '20px' }}>
        
        {/* LEFT COLUMN: Controls & Circuit Map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Interactive Track Map SVG */}
          <div style={{ backgroundColor: '#0b0e14', border: '1px solid #1f2937', borderRadius: '8px', padding: '16px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>
              📍 Circuit Hotspots (Interactive Track Map)
            </h3>
            <svg viewBox="0 0 400 160" style={{ width: '100%', height: 'auto', background: '#05070a', borderRadius: '6px', border: '1px solid #111827' }}>
              {/* Circuit Track Path */}
              <path d="M 40 80 Q 80 20, 160 30 T 280 40 Q 360 50, 340 100 T 220 130 Q 140 140, 80 120 Z" fill="none" stroke="#374151" strokeWidth="12" strokeLinecap="round" />
              <path d="M 40 80 Q 80 20, 160 30 T 280 40 Q 360 50, 340 100 T 220 130 Q 140 140, 80 120 Z" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="4 4" />
              
              {/* Sector 1 Hotspot */}
              <g onClick={() => { setActiveSector('Sector 1 (Turn 1 Apex)'); setCameraFeed('Cam 01: Turn 1 Apex'); handleProcess(); }} style={{ cursor: 'pointer' }}>
                <circle cx="80" cy="40" r="14" fill={activeSector.includes('Sector 1') ? '#10b981' : '#1f2937'} stroke="#10b981" strokeWidth="2" />
                <text x="80" y="44" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">S1</text>
              </g>

              {/* Sector 2 Hotspot */}
              <g onClick={() => { setActiveSector('Sector 2 (Chicane)'); setCameraFeed('Cam 02: Sector 2 Chicane'); handleProcess(); }} style={{ cursor: 'pointer' }}>
                <circle cx="280" cy="45" r="14" fill={activeSector.includes('Sector 2') ? '#10b981' : '#1f2937'} stroke="#10b981" strokeWidth="2" />
                <text x="280" y="49" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">S2</text>
              </g>

              {/* Sector 3 Hotspot */}
              <g onClick={() => { setActiveSector('Sector 3 (Car #16)'); setCameraFeed('Cam 03: Onboard Car #16'); handleProcess(); }} style={{ cursor: 'pointer' }}>
                <circle cx="200" cy="132" r="14" fill={activeSector.includes('Sector 3') ? '#10b981' : '#1f2937'} stroke="#10b981" strokeWidth="2" />
                <text x="200" y="136" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">S3</text>
              </g>
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af', marginTop: '8px' }}>
              <span>Active Camera: <b style={{ color: '#34d399' }}>{cameraFeed}</b></span>
            </div>
          </div>

          {/* Meteorological & Environmental Controls */}
          <div style={{ backgroundColor: '#0b0e14', border: '1px solid #1f2937', borderRadius: '8px', padding: '16px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#9ca3af', textTransform: 'uppercase' }}>
              ⚙️ Met-Office Telemetry Sensors
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#9ca3af' }}>Track Temp (°C)</label>
                <input type="number" value={trackTemp} onChange={(e) => setTrackTemp(e.target.value)} style={{ width: '100%', background: '#151a23', border: '1px solid #374151', color: '#fff', padding: '6px', borderRadius: '4px', fontSize: '12px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#9ca3af' }}>Ambient Air (°C)</label>
                <input type="number" value={airTemp} onChange={(e) => setAirTemp(e.target.value)} style={{ width: '100%', background: '#151a23', border: '1px solid #374151', color: '#fff', padding: '6px', borderRadius: '4px', fontSize: '12px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#9ca3af' }}>Humidity (%)</label>
                <input type="number" value={humidity} onChange={(e) => setHumidity(e.target.value)} style={{ width: '100%', background: '#151a23', border: '1px solid #374151', color: '#fff', padding: '6px', borderRadius: '4px', fontSize: '12px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#9ca3af' }}>Wind Speed (km/h)</label>
                <input type="number" value={windSpeed} onChange={(e) => setWindSpeed(e.target.value)} style={{ width: '100%', background: '#151a23', border: '1px solid #374151', color: '#fff', padding: '6px', borderRadius: '4px', fontSize: '12px' }} />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', color: '#9ca3af' }}>Rain Radar Target</label>
              <input type="text" value={rainRadar} onChange={(e) => setRainRadar(e.target.value)} style={{ width: '100%', background: '#151a23', border: '1px solid #374151', color: '#fff', padding: '6px', borderRadius: '4px', fontSize: '12px' }} />
            </div>

            <button onClick={() => handleProcess()} disabled={loading} style={{ width: '100%', backgroundColor: '#10b981', border: 'none', color: '#000', fontWeight: 'bold', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', letterSpacing: '1px' }}>
              {loading ? 'CALCULATING TELEMETRY...' : '⚡ PROCESS OPTICAL TELEMETRY'}
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Strategy Telemetry & F1 HUD Directives */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Radio Transmission HUD */}
          <div style={{ backgroundColor: '#111827', borderLeft: `4px solid ${radioPulse ? '#ef4444' : '#f59e0b'}`, borderRadius: '6px', padding: '14px', transition: 'border-color 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: '#fcd34d', fontWeight: 'bold', letterSpacing: '1px' }}>
                📻 AUTOMATED TEAM RADIO TRANSCRIPT
              </span>
              <span style={{ height: '8px', width: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></span>
            </div>
            <p style={{ margin: 0, color: '#fef3c7', fontSize: '13px', lineHeight: '1.4' }}>
              {telemetry.teamRadio}
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            
            {/* Hydroplaning Risk */}
            <div style={{ backgroundColor: '#0b0e14', border: '1px solid #1f2937', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block' }}>Aquaplaning Hazard</span>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: parseInt(telemetry.risk) > 50 ? '#ef4444' : '#f59e0b' }}>
                {telemetry.risk}
              </span>
            </div>

            {/* Pit Crossover Window */}
            <div style={{ backgroundColor: '#0b0e14', border: '1px solid #1f2937', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block' }}>Pit Crossover Window</span>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#06b6d4' }}>
                {telemetry.window}
              </span>
            </div>

          </div>

          {/* Pirelli Compound Directive Card */}
          <div style={{ backgroundColor: compoundStyle.bg, border: `2px solid ${compoundStyle.border}`, borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>TARGET PIRELLI COMPOUND</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: compoundStyle.text }}>
              {telemetry.tire}
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px', fontSize: '11px', color: '#d1d5db', borderTop: '1px solid #1f2937', paddingTop: '8px' }}>
              <span>Pace Delta: <b>{telemetry.paceDelta}</b></span>
              <span>Drying Rate: <b style={{ color: '#06b6d4' }}>{telemetry.dryingRate}</b></span>
            </div>
          </div>

          {/* SigLIP Softmax Probabilities Bar Breakdown */}
          <div style={{ backgroundColor: '#0b0e14', border: '1px solid #1f2937', borderRadius: '8px', padding: '16px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase' }}>
              Temperature-Calibrated Probabilities ($\tau = 5.0$)
            </h4>
            {telemetry.scores && Object.entries(telemetry.scores).map(([label, score]) => (
              <div key={label} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                  <span>{label} Surface</span>
                  <span>{(score * 100).toFixed(1)}%</span>
                </div>
                <div style={{ width: '100%', background: '#1f2937', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${score * 100}%`, background: label === 'Dry' ? '#10b981' : label === 'Wet' ? '#ef4444' : label === 'Damp' ? '#f59e0b' : '#06b6d4', height: '100%', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Enterprise JSON Transmission Stream */}
          <div style={{ backgroundColor: '#0b0e14', border: '1px solid #1f2937', borderRadius: '8px', padding: '12px' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>
              📡 LIVE ENTERPRISE API PAYLOAD (JSON Payload Stream)
            </span>
            <pre style={{ backgroundColor: '#05070a', padding: '10px', borderRadius: '4px', color: '#34d399', fontSize: '10px', overflowX: 'auto', maxHeight: '120px', margin: 0 }}>
              {JSON.stringify(telemetry.apiPayload, null, 2)}
            </pre>
          </div>

        </div>

      </div>
    </div>
  );
}
