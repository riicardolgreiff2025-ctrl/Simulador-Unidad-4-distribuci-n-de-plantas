import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { TIMINGS, KPIS } from '../data/constants';

const CHART_STYLE = {
  background: 'transparent',
  fontFamily: 'Inter, sans-serif',
};

const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(15,22,40,0.95)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  color: '#e8eaf0',
  fontSize: '12px',
};

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div style={TOOLTIP_STYLE} className="p-2">
        <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: <strong>{p.value}</strong> {p.unit || ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

// ── TIME PER STAGE CHART ──
function TimeChart() {
  const data = [
    { stage: 'Recepción', asis: TIMINGS.asis.recepcion, tobe: TIMINGS.tobe.recepcion },
    { stage: 'Almacenamiento', asis: TIMINGS.asis.almacenamiento, tobe: TIMINGS.tobe.almacenamiento },
    { stage: 'Picking', asis: TIMINGS.asis.picking, tobe: TIMINGS.tobe.picking },
    { stage: 'Packing', asis: TIMINGS.asis.packing, tobe: TIMINGS.tobe.packing },
    { stage: 'Despacho', asis: TIMINGS.asis.despacho, tobe: TIMINGS.tobe.despacho },
  ];
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} style={CHART_STYLE}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="stage" tick={{ fill: '#7a859a', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#7a859a', fontSize: 11 }} axisLine={false} tickLine={false} unit=" min" />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, color: '#7a859a' }} />
        <Bar dataKey="asis" name="AS-IS" fill="#f97316" radius={[4, 4, 0, 0]} />
        <Bar dataKey="tobe" name="TO-BE" fill="#4f8ef7" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── KPI COMPARISON CHART ──
function KPIChart() {
  const data = [
    { name: 'Distancia (m)', asis: KPIS.distancia.asis, tobe: KPIS.distancia.tobe },
    { name: 'Tiempo total (min)', asis: KPIS.tiempoTotal.asis, tobe: KPIS.tiempoTotal.tobe },
    { name: 'Errores (× 10)', asis: KPIS.errores.asis * 10, tobe: KPIS.errores.tobe * 10 },
  ];
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} style={CHART_STYLE} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis type="number" tick={{ fill: '#7a859a', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis dataKey="name" type="category" tick={{ fill: '#7a859a', fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, color: '#7a859a' }} />
        <Bar dataKey="asis" name="AS-IS" fill="#f97316" radius={[0, 4, 4, 0]} />
        <Bar dataKey="tobe" name="TO-BE" fill="#10b981" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── PERFORMANCE RADAR ──
function RadarKPI() {
  const data = [
    { subject: 'Productividad', asis: 57, tobe: 100 },
    { subject: 'OTIF', asis: 91, tobe: 100 },
    { subject: 'Sin Errores', asis: 65, tobe: 92 },
    { subject: 'Espacio', asis: 25, tobe: 78 },
    { subject: 'Distancia', asis: 36, tobe: 100 },
  ];
  return (
    <ResponsiveContainer width="100%" height={240}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#7a859a', fontSize: 11 }} />
        <PolarRadiusAxis tick={{ fill: '#475569', fontSize: 9 }} angle={30} domain={[0, 100]} />
        <Radar name="AS-IS" dataKey="asis" stroke="#f97316" fill="#f97316" fillOpacity={0.25} />
        <Radar name="TO-BE" dataKey="tobe" stroke="#4f8ef7" fill="#4f8ef7" fillOpacity={0.3} />
        <Legend wrapperStyle={{ fontSize: 12, color: '#7a859a' }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export default function MetricsPage() {
  const pctSaving = Math.round(((TIMINGS.asis.total - TIMINGS.tobe.total) / TIMINGS.asis.total) * 100);
  const distSaving = Math.round(((KPIS.distancia.asis - KPIS.distancia.tobe) / KPIS.distancia.asis) * 100);
  const errSaving = Math.round(((KPIS.errores.asis - KPIS.errores.tobe) / KPIS.errores.asis) * 100);
  const prodGain = Math.round(((KPIS.productividad.tobe - KPIS.productividad.asis) / KPIS.productividad.asis) * 100);

  return (
    <div className="metrics-page">
      <div className="metrics-header">
        <h1>Comparativa de Indicadores de Desempeño</h1>
        <p>Compara los KPIs del modelo actual con la propuesta de layout en U optimizado.</p>
      </div>

      {/* Summary Cards */}
      <div className="kpi-summary">
        <div className="kpi-card">
          <div className="kpi-card-label">Reducción tiempo de ciclo</div>
          <div className="kpi-card-improvement">-{pctSaving}%</div>
          <div className="kpi-card-detail">{TIMINGS.asis.total} min → {TIMINGS.tobe.total} min por pedido</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-label">Reducción de recorridos</div>
          <div className="kpi-card-improvement">-{distSaving}%</div>
          <div className="kpi-card-detail">{KPIS.distancia.asis}m → {KPIS.distancia.tobe}m por pedido</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-label">Reducción de errores</div>
          <div className="kpi-card-improvement">-{errSaving}%</div>
          <div className="kpi-card-detail">{KPIS.errores.asis}% → {KPIS.errores.tobe}% de errores</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-label">Aumento de productividad</div>
          <div className="kpi-card-improvement">+{prodGain}%</div>
          <div className="kpi-card-detail">{KPIS.productividad.asis} → {KPIS.productividad.tobe} ped/h/op</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-label">Mejora nivel de servicio</div>
          <div className="kpi-card-improvement">{KPIS.otif.tobe}%</div>
          <div className="kpi-card-detail">OTIF: {KPIS.otif.asis}% → {KPIS.otif.tobe}%</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-label">Ocupación del espacio</div>
          <div className="kpi-card-improvement" style={{ color: '#4f8ef7' }}>{KPIS.ocupacion.tobe}%</div>
          <div className="kpi-card-detail">Uso racional: {KPIS.ocupacion.asis}% → {KPIS.ocupacion.tobe}%</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>⏱️ Tiempo por Etapa (min/pedido)</h3>
          <TimeChart />
        </div>
        <div className="chart-card">
          <h3>📊 KPIs Comparativos</h3>
          <KPIChart />
        </div>
        <div className="chart-card">
          <h3>🎯 Perfil de Desempeño General</h3>
          <RadarKPI />
        </div>
        <div className="chart-card narrative-card" style={{ background: 'linear-gradient(135deg, rgba(79,142,247,0.08), rgba(16,185,129,0.08))' }}>
          <h3>💡 Análisis de la Mejora</h3>
          <p>
            La implementación del layout en U en TecnoLogística S.A. transforma radicalmente la operación del almacén.
            Al eliminar el flujo cruzado y segmentar el almacenamiento en zonas ABC, los operarios recorren{' '}
            <strong style={{ color: '#10b981' }}>{distSaving}% menos distancia</strong> por pedido,
            reduciendo la fatiga y aumentando la velocidad de cada ciclo logístico.
          </p>
          <br />
          <p>
            La incorporación de tecnologías como Pick-to-Light, RFID y los 3 robots AGV no solo acelera el proceso,
            sino que lleva la tasa de errores de picking del <strong style={{ color: '#f97316' }}>{KPIS.errores.asis}%</strong>{' '}
            al <strong style={{ color: '#10b981' }}>{KPIS.errores.tobe}%</strong>, eliminando prácticamente los retrabájos.
            El resultado: <strong style={{ color: '#4f8ef7' }}>los mismos 20 colaboradores producen un {prodGain}% más</strong> sin necesidad de
            ampliar la plantilla.
          </p>
        </div>
      </div>
    </div>
  );
}
