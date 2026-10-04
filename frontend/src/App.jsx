import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Activity, ShieldAlert, Cpu, Radio, Gauge, Thermometer, Wind, Droplets, Zap, ChevronRight } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const COMPOUND_STYLES = {
  SOFT: { border: '#ef4444', text: '#f87171', label: 'SOFT SLICK (C5)', bg: 'rgba(239, 68, 68, 0.08)', badge: '🔴' },
  MEDIUM: { border: '#eab308', text: '#facc15', label: 'MEDIUM SLICK (C3)', bg: 'rgba(234, 179, 8, 0.08)', badge: '🟡' },
  INTERMEDIATE: { border: '#10b981', text: '#34d399', label: 'INTERMEDIATE (Cinturato Green)', bg: 'rgba(16, 185, 129, 0.08)', badge: '🟢' },
  WET: { border: '#3b82f6', text: '#60a5fa', label: 'FULL WET (Cinturato Blue)', bg: 'rgba(59, 130, 246, 0.08)', badge: '🔵' }
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
    { lap: 1, Dry: 0.65, Damp: 0.20, Wet: 0.05, Drying: 0.10 },
    { lap: 2, Dry: 0.68, Damp: 0.18, Wet: 0.04, Drying: 0.10 },
    { lap: 3, Dry: 0.72, Damp: 0.15, Wet: 0.03, Drying: 0.10 }
  ]);

  const [loading, setLoading] = useState(false);

  const handleProcess = async (customScores = null) => {
    setLoading(true);
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
        if (json.history && json.history.length > 0) {
          setHistory(json.history);
        }
      }
    } catch (e) {
      console.error("Telemetry API Error:", e);
    } finally {
      setLoading(false);
    }
  };

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
    } else {
      setRainRadar('0.0mm (NO RAIN EXPECTED)');
      setTrackTemp(28.5);
      setAirTemp(21.0);
      setHumidity(65);
      setWindSpeed(18);
      handleProcess({ Dry: 0.75, Damp: 0.15, Wet: 0.02, Drying: 0.08 });
    }
  };

  const compoundStyle = COMPOUND_STYLES[telemetry.compoundKey] || COMPOUND_STYLES.SOFT;

  // Chart.js Telemetry Graph Data
  const chartData = {
    labels: history.map(h => `Lap ${h.lap}`),
    datasets: [
      {
        label: 'Dry Grip %',
        data: history.map(h => ((h.Dry || 0) * 100).toFixed(1)),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Drying Line %',
        data: history.map(h => ((h.Drying || 0) * 100).toFixed(1)),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Aquaplaning Wet %',
        data: history.map(h => ((h.Wet || 0) * 100).toFixed(1)),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#9ca3af', font: { family: 'monospace', size: 11 } }
      },
      tooltip: {
        backgroundColor: '#0b0e14',
        borderColor: '#1f2937',
        borderWidth: 1,
        titleFont: { family: 'monospace' },
        bodyFont: { family: 'monospace' }
      }
    },
    scales: {
      x: { grid: { color: '#111827' }, ticks: { color: '#6b7280', font: { family: 'monospace', size: 10 } } },
      y: { grid: { color: '#111827' }, ticks: { color: '#6b7280', font: { family: 'monospace', size: 10 } }, max: 100, min: 0 }
    }
  };

  return (
    <div style={{ backgroundColor: '#030508', color: '#e5e7eb', minHeight: '100vh', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', padding: '24px' }}>
      
      {/* Top Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0b0e14', border: '1px solid #1f2937', borderRadius: '12px', padding: '14px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)' }}>
            <Activity color="#000" size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, letterSpacing: '0.5px', color: '#fff', fontFamily: 'monospace' }}>
              GRAND PRIX <span style={{ color: '#10b981' }}>TELEMETRY OS v3.2</span>
            </h1>
            <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace' }}>
              Enterprise F1 Optical Surface & Thermodynamics Pit-Wall Engine
            </span>
          </div>
        </div>

        {/* Live System Status Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#05070a', border: '1px solid #1f2937', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}>
            <Cpu size={14} color="#10b981" />
            <span style={{ color: '#9ca3af' }}>MODEL:</span>
            <span style={{ color: '#34d399', fontWeight: 'bold' }}>SigLIP-224 Zero-Shot</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#05070a', border: '1px solid #1f2937', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
            <span style={{ color: '#34d399', fontWeight: 'bold' }}>SYSTEM ONLINE</span>
          </div>
        </div>
      </nav>

      {/* Preset Strategy Scenario Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace' }}>
          <Zap size={14} color="#f59e0b" />
          <span>SIMULATION SCENARIOS:</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => loadScenario('DRY')} style={{ background: '#0b0e14', border: '1px solid #10b98133', color: '#10b981', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ☀️ DRY STINT
          </button>
          <button onClick={() => loadScenario('DRYING_CROSSOVER')} style={{ background: '#0b0e14', border: '1px solid #06b6d433', color: '#06b6d4', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🔥 CROSSOVER WINDOW
          </button>
          <button onClick={() => loadScenario('WET_STORM')} style={{ background: '#0b0e14', border: '1px solid #ef444433', color: '#ef4444', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🌧️ HEAVY AQUAPLANING
          </button>
        </div>
      </div>

      {/* Main Alert Directive Banner */}
      <div style={{ backgroundColor: '#0b0e14', border: `1.5px solid ${telemetry.statusColor}`, borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: `0 0 30px ${telemetry.statusColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: telemetry.statusColor, boxShadow: `0 0 12px ${telemetry.statusColor}` }}></span>
            <span style={{ color: telemetry.statusColor, fontSize: '13px', fontWeight: 800, letterSpacing: '2px', fontFamily: 'monospace' }}>
              {telemetry.topCondition ? telemetry.topCondition.toUpperCase() : 'DRY'} SURFACE CONDITION DETECTED
            </span>
          </div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '16px', fontWeight: 600 }}>
            {telemetry.alertMsg}
          </h2>
        </div>
        <div style={{ backgroundColor: '#05070a', border: '1px solid #1f2937', padding: '10px 18px', borderRadius: '8px', textAlign: 'right' }}>
          <span style={{ fontSize: '10px', color: '#6b7280', display: 'block', fontFamily: 'monospace' }}>ACTIVE LAP</span>
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>LAP {telemetry.lap || 1}</span>
        </div>
      </div>

      {/* 3-Column Dashboard Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* COLUMN 1: Circuit Map & Environmental Telemetry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Track Map Card */}
          <div style={{ backgroundColor: '#0b0e14', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af', fontFamily: 'monospace', letterSpacing: '1px' }}>
                📍 SECTOR OPTICAL HOTSPOTS
              </span>
              <span style={{ fontSize: '11px', color: '#10b981', fontFamily: 'monospace' }}>Silverstone Circuit</span>
            </div>

            <svg viewBox="0 0 400 160" style={{ width: '100%', height: 'auto', background: '#05070a', borderRadius: '8px', border: '1px solid #111827' }}>
              <path d="M 40 80 Q 80 20, 160 30 T 280 40 Q 360 50, 340 100 T 220 130 Q 140 140, 80 120 Z" fill="none" stroke="#1f2937" strokeWidth="12" strokeLinecap="round" />
              <path d="M 40 80 Q 80 20, 160 30 T 280 40 Q 360 50, 340 100 T 220 130 Q 140 140, 80 120 Z" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="4 4" />
              
              <g onClick={() => { setActiveSector('Sector 1 (Turn 1 Apex)'); setCameraFeed('Cam 01: Turn 1 Apex'); handleProcess(); }} style={{ cursor: 'pointer' }}>
                <circle cx="80" cy="40" r="14" fill={activeSector.includes('Sector 1') ? '#10b981' : '#111827'} stroke="#10b981" strokeWidth="2" />
                <text x="80" y="44" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">S1</text>
              </g>

              <g onClick={() => { setActiveSector('Sector 2 (Chicane)'); setCameraFeed('Cam 02: Sector 2 Chicane'); handleProcess(); }} style={{ cursor: 'pointer' }}>
                <circle cx="280" cy="45" r="14" fill={activeSector.includes('Sector 2') ? '#10b981' : '#111827'} stroke="#10b981" strokeWidth="2" />
                <text x="280" y="49" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">S2</text>
              </g>

              <g onClick={() => { setActiveSector('Sector 3 (Car #16)'); setCameraFeed('Cam 03: Onboard Car #16'); handleProcess(); }} style={{ cursor: 'pointer' }}>
                <circle cx="200" cy="132" r="14" fill={activeSector.includes('Sector 3') ? '#10b981' : '#111827'} stroke="#10b981" strokeWidth="2" />
                <text x="200" y="136" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">S3</text>
              </g>
            </svg>
            <div style={{ marginTop: '12px', fontSize: '11px', color: '#6b7280', fontFamily: 'monospace', display: 'flex', justifyContent: 'space-between' }}>
              <span>ACTIVE FEED: <b style={{ color: '#e5e7eb' }}>{cameraFeed}</b></span>
            </div>
          </div>

          {/* Telemetry Sensor Inputs */}
          <div style={{ backgroundColor: '#0b0e14', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af', fontFamily: 'monospace', letterSpacing: '1px', display: 'block', marginBottom: '16px' }}>
              ⚙️ METEOROLOGICAL TELEMETRY SENSORS
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <Thermometer size={12} /> Track Temp (°C)
                </label>
                <input type="number" value={trackTemp} onChange={(e) => setTrackTemp(e.target.value)} style={{ width: '100%', background: '#05070a', border: '1px solid #1f2937', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', fontFamily: 'monospace' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <Thermometer size={12} /> Air Temp (°C)
                </label>
                <input type="number" value={airTemp} onChange={(e) => setAirTemp(e.target.value)} style={{ width: '100%', background: '#05070a', border: '1px solid #1f2937', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', fontFamily: 'monospace' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <Droplets size={12} /> Humidity (%)
                </label>
                <input type="number" value={humidity} onChange={(e) => setHumidity(e.target.value)} style={{ width: '100%', background: '#05070a', border: '1px solid #1f2937', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', fontFamily: 'monospace' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <Wind size={12} /> Wind (km/h)
                </label>
                <input type="number" value={windSpeed} onChange={(e) => setWindSpeed(e.target.value)} style={{ width: '100%', background: '#05070a', border: '1px solid #1f2937', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', fontFamily: 'monospace' }} />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace', display: 'block', marginBottom: '4px' }}>Met-Office Rain Radar Vector</label>
              <input type="text" value={rainRadar} onChange={(e) => setRainRadar(e.target.value)} style={{ width: '100%', background: '#05070a', border: '1px solid #1f2937', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', fontFamily: 'monospace' }} />
            </div>

            <button onClick={() => handleProcess()} disabled={loading} style={{ width: '100%', backgroundColor: '#10b981', border: 'none', color: '#000', fontWeight: 800, padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontFamily: 'monospace', letterSpacing: '1px' }}>
              {loading ? 'CALCULATING TELEMETRY...' : '⚡ COMPUTE SURFACE TELEMETRY'}
            </button>
          </div>

        </div>

        {/* COLUMN 2: Strategy Directives & Telemetry Graph */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* F1 Team Radio HUD */}
          <div style={{ backgroundColor: '#0b0e14', borderLeft: '4px solid #f59e0b', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Radio size={16} color="#f59e0b" />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#fcd34d', letterSpacing: '1px', fontFamily: 'monospace' }}>
                AUTOMATED TEAM RADIO TRANSCRIPT
              </span>
            </div>
            <p style={{ margin: 0, color: '#fef3c7', fontSize: '13px', lineHeight: '1.5', fontFamily: 'monospace' }}>
              {telemetry.teamRadio}
            </p>
          </div>

          {/* Pirelli Compound Card */}
          <div style={{ backgroundColor: compoundStyle.bg, border: `1.5px solid ${compoundStyle.border}`, borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>RECOMMENDED PIRELLI COMPOUND</span>
              <span style={{ fontSize: '14px' }}>{compoundStyle.badge}</span>
            </div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: compoundStyle.text, fontFamily: 'monospace' }}>
              {telemetry.tire}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px', borderTop: '1px solid #1f2937', paddingTop: '12px', fontSize: '12px', fontFamily: 'monospace' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#6b7280', display: 'block' }}>PROJECTED LAP DELTA</span>
                <b style={{ color: '#fff' }}>{telemetry.paceDelta}</b>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#6b7280', display: 'block' }}>DRYING EVAPORATION RATE</span>
                <b style={{ color: '#06b6d4' }}>{telemetry.dryingRate}</b>
              </div>
            </div>
          </div>

          {/* Real-Time Telemetry Line Chart */}
          <div style={{ backgroundColor: '#0b0e14', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px', height: '260px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af', fontFamily: 'monospace', letterSpacing: '1px', display: 'block', marginBottom: '12px' }}>
              📈 MULTI-LAP SURFACE PROGRESSION MATRIX
            </span>
            <div style={{ height: '190px' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

        </div>

        {/* COLUMN 3: Hydroplaning Metrics & API Payload */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Key Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            
            <div style={{ backgroundColor: '#0b0e14', border: '1px solid #1f2937', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <ShieldAlert size={20} color={parseInt(telemetry.risk) > 50 ? '#ef4444' : '#f59e0b'} style={{ marginBottom: '6px' }} />
              <span style={{ fontSize: '10px', color: '#6b7280', display: 'block', fontFamily: 'monospace' }}>AQUAPLANING HAZARD</span>
              <span style={{ fontSize: '22px', fontWeight: 800, color: parseInt(telemetry.risk) > 50 ? '#ef4444' : '#f59e0b', fontFamily: 'monospace' }}>
                {telemetry.risk}
              </span>
            </div>

            <div style={{ backgroundColor: '#0b0e14', border: '1px solid #1f2937', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <Gauge size={20} color="#06b6d4" style={{ marginBottom: '6px' }} />
              <span style={{ fontSize: '10px', color: '#6b7280', display: 'block', fontFamily: 'monospace' }}>PIT CROSSOVER WINDOW</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#06b6d4', fontFamily: 'monospace' }}>
                {telemetry.window}
              </span>
            </div>

          </div>

          {/* Probabilities Breakdown */}
          <div style={{ backgroundColor: '#0b0e14', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af', fontFamily: 'monospace', letterSpacing: '1px', display: 'block', marginBottom: '14px' }}>
              TEMPERATURE-CALIBRATED PROBABILITIES (Tau = 5.0)
            </span>
            {telemetry.scores && Object.entries(telemetry.scores).map(([label, score]) => (
              <div key={label} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'monospace', marginBottom: '4px' }}>
                  <span>{label} Surface</span>
                  <span style={{ fontWeight: 'bold' }}>{(score * 100).toFixed(1)}%</span>
                </div>
                <div style={{ width: '100%', background: '#05070a', height: '6px', borderRadius: '3px', overflow: 'hidden', border: '1px solid #111827' }}>
                  <div style={{ width: `${score * 100}%`, background: label === 'Dry' ? '#10b981' : label === 'Wet' ? '#ef4444' : label === 'Damp' ? '#f59e0b' : '#06b6d4', height: '100%', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Enterprise JSON Stream */}
          <div style={{ backgroundColor: '#0b0e14', border: '1px solid #1f2937', borderRadius: '12px', padding: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', fontFamily: 'monospace', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
              📡 LIVE ENTERPRISE API PAYLOAD
            </span>
            <pre style={{ backgroundColor: '#05070a', padding: '12px', borderRadius: '8px', border: '1px solid #111827', color: '#34d399', fontSize: '10px', fontFamily: 'monospace', overflowX: 'auto', maxHeight: '180px', margin: 0 }}>
              {JSON.stringify(telemetry.apiPayload, null, 2)}
            </pre>
          </div>

        </div>

      </div>
    </div>
  );
}
