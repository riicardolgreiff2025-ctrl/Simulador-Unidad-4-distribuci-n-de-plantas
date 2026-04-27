import { useState, useEffect, useRef } from 'react';
import SimulationCanvas from './components/SimulationCanvas';
import MetricsPage from './components/MetricsPage';
import { SCENARIOS, TIMINGS, STAFF } from './data/constants';
import './index.css';

function useSimStats(scenario, isRunning) {
  const [orders, setOrders] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    setOrders(0);
    if (!isRunning) { clearInterval(intervalRef.current); return; }
    const timing = scenario === SCENARIOS.ASIS ? TIMINGS.asis : TIMINGS.tobe;
    const ms = timing.total * 1200;
    intervalRef.current = setInterval(() => setOrders(p => p + 1), ms);
    return () => clearInterval(intervalRef.current);
  }, [scenario, isRunning]);

  return orders;
}

function ControlsPanel({ isAsIs, isFPV, setIsFPV, sensitivity, setSensitivity }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="legend-panel" style={{ minWidth: 210 }}>
      <div className="legend-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>🎮 Controles 3D</span>
        <button
          onClick={() => setOpen(o => !o)}
          style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#94a3b8', borderRadius: 4, padding: '2px 7px', cursor: 'pointer', fontSize: 11 }}
        >⚙️ Ajustes</button>
      </div>

      <div style={{ fontSize: 11, color: '#cbd5e1', lineHeight: 1.7 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2em 1fr', gap: '2px 6px', marginBottom: 6 }}>
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>W</span><span>Avanzar cámara</span>
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>S</span><span>Retroceder cámara</span>
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>A</span><span>Girar izquierda</span>
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>D</span><span>Girar derecha</span>
          <span style={{ color: '#a78bfa', fontWeight: 700 }}>🖱</span><span>Rotar vista</span>
          <span style={{ color: '#a78bfa', fontWeight: 700 }}>🔍</span><span>Scroll = zoom</span>
        </div>
        <div style={{ color: '#64748b', fontSize: 10, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 5 }}>
          📌 Arrastra con clic izquierdo para orbitar
        </div>
      </div>

      {open && (
        <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 5 }}>🎯 Sensibilidad del mouse: <strong style={{ color: '#38bdf8' }}>{sensitivity}%</strong></div>
          <input
            type="range" min={5} max={100} value={sensitivity}
            onChange={e => setSensitivity(+e.target.value)}
            style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
          />
          <div style={{ fontSize: 9, color: '#475569', marginTop: 4 }}>Lento ◄――――――――――――――► Rápido</div>
        </div>
      )}

      <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.07)', fontSize: 9, color: '#4b5563', lineHeight: 1.5 }}>
        {!isFPV ? (
          <button
            onClick={() => setIsFPV(true)}
            style={{ width: '100%', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: 4, padding: '4px 0', fontWeight: 'bold', cursor: 'pointer' }}
          >
            🚶‍♂️ Entrar en 1ª Persona
          </button>
        ) : (
          <div style={{ textAlign: 'center', color: '#38bdf8', fontWeight: 'bold' }}>
            🚶‍♂️ En 1ª Persona (Presiona ESC para salir)
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [scenario, setScenario] = useState(SCENARIOS.ASIS);
  const [isRunning, setIsRunning] = useState(true);
  const [isFPV, setIsFPV] = useState(false);
  const [fpvSensitivity, setFpvSensitivity] = useState(50);
  const orders = useSimStats(scenario, isRunning);
  const isMetrics = scenario === SCENARIOS.METRICS;
  const isAsIs = scenario === SCENARIOS.ASIS;

  const tabs = [
    { id: SCENARIOS.ASIS, label: 'Estado Actual', color: '#f97316', icon: '⚠️' },
    { id: SCENARIOS.TOBE, label: 'TO_BE', color: '#10b981', icon: '✅' },
    { id: SCENARIOS.METRICS, label: 'Métricas KPI', color: '#4f8ef7', icon: '📊' },
  ];

  // Pause → unmount old scene → resume when switching scenario
  const handleTabChange = (id) => {
    if (id === scenario) return;
    setIsRunning(false);          // pause & let GSAP kill tweens
    setTimeout(() => {
      setScenario(id);
      setIsRunning(true);         // resume for new scenario
    }, 80);                       // 80ms → one frame to unmount cleanly
  };

  return (
    <>
      {/* ── HEADER ── */}
      <header className="app-header">
        <div className="app-logo">
          <div className="app-logo-icon">🏭</div>
          <div>
            <div className="app-logo-text">Simulador empresa TecnoLogística S.A.</div>
            <div className="app-logo-sub">power by creative aima, to Grupo B08 Politecnico Gran Colombiano</div>
          </div>
        </div>

        <nav className="nav-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              className={`nav-tab ${scenario === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
              style={scenario === tab.id ? { background: tab.color } : {}}
            >
              <div className="nav-tab-dot" />
              <span>{tab.icon} {tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="status-bar">
          {/* ── PLAY / PAUSE ── */}
          {!isMetrics && (
            <button
              id="btn-play-pause"
              onClick={() => setIsRunning(r => !r)}
              className="play-pause-btn"
              title={isRunning ? 'Pausar simulación' : 'Reanudar simulación'}
            >
              {isRunning ? '⏸ Pausar' : '▶ Reanudar'}
            </button>
          )}
          <div className="status-badge">
            <div className="status-badge-dot" style={{ background: isRunning ? '#10b981' : '#f59e0b' }} />
            {isRunning ? 'Simulación activa' : 'Pausada'}
          </div>
        </div>
      </header>

      {/* ── SIMULATION ── */}
      {!isMetrics && (
        <>
          <div className="main-canvas">
            <SimulationCanvas scenario={scenario} isRunning={isRunning} isFPV={isFPV} setIsFPV={setIsFPV} sensitivity={fpvSensitivity} />
          </div>

          {/* Scenario label */}
          <div className="scenario-label">
            <div className="scenario-label-title">
              {isAsIs
                ? '⚠️ Flujo Desordenado – Sin Sistema Definido'
                : '✅ TO_BE – Flujo Optimizado · AGVs · Pick-to-Light · RFID'}
            </div>
            <div className="scenario-label-desc">
              {isAsIs
                ? 'Personal completo (20), recorridos largos y cruzados, sin zonas ABC ni control de picking.'
                : '20 empleados redistribuidos · 4 robots AGV · 3 brazos robóticos · flujo unidireccional sin cruces.'}
            </div>
          </div>

          {/* HUD */}
          <div className="hud-overlay">
            <div className="hud-card">
              <div className="hud-card-title">Pedidos Completados</div>
              <div className="hud-card-value">{orders}<span className="hud-card-unit"> ped</span></div>
            </div>
            <div className="hud-card">
              <div className="hud-card-title">Tiempo Prom. / Pedido</div>
              <div className="hud-card-value">
                {isAsIs ? '46.0' : '24.0'}
                <span className="hud-card-unit"> min</span>
              </div>
              {isAsIs
                ? <div className="hud-card-delta negative">Alto · propuesta = 24 min</div>
                : <div className="hud-card-delta positive">▼ 48% vs modelo actual</div>}
            </div>
            <div className="hud-card">
              <div className="hud-card-title">Personal</div>
              <div className="hud-card-value">{isAsIs ? 20 : 20}<span className="hud-card-unit"> emp</span></div>
              {!isAsIs && <div className="hud-card-delta positive">4 AGV · 3 brazos robóticos</div>}
            </div>
            <div className="hud-card">
              <div className="hud-card-title">Error Picking</div>
              <div className="hud-card-value">
                {isAsIs ? '3.5' : '0.8'}
                <span className="hud-card-unit"> %</span>
              </div>
              {isAsIs
                ? <div className="hud-card-delta negative">Sin control Pick-to-Light</div>
                : <div className="hud-card-delta positive">▼ 77% menos errores</div>}
            </div>
            <div className="hud-card">
              <div className="hud-card-title">Distancia Recorrida</div>
              <div className="hud-card-value">
                {isAsIs ? '250' : '90'}
                <span className="hud-card-unit"> m/ped</span>
              </div>
              {!isAsIs && <div className="hud-card-delta positive">▼ 64% menos</div>}
            </div>
          </div>

          {/* Controls Legend */}
          <ControlsPanel isAsIs={isAsIs} isFPV={isFPV} setIsFPV={setIsFPV} sensitivity={fpvSensitivity} setSensitivity={setFpvSensitivity} />
        </>
      )}

      {isMetrics && <MetricsPage />}
    </>
  );
}
