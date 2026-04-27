// All simulation data hardcoded from context.md
// Timings are in minutes, converted to seconds for the simulation (1 min real = 1.5s sim)
export const TIME_SCALE = 1.5; // seconds per minute

export const SCENARIOS = {
  ASIS: 'asis',
  TOBE: 'tobe',
  METRICS: 'metrics',
};

// ── LAYOUT DIMENSIONS ──
export const ASIS_LAYOUT = {
  width: 50,
  height: 35,
  label: 'Modelo Actual (AS-IS)',
  description: 'Flujo desordenado · Sin sistema definido · TecnoLogística S.A.',
};

export const TOBE_LAYOUT = {
  width: 55,
  height: 70,
  label: 'Propuesta en U (TO-BE)',
  description: 'Flujo en U · Optimizado · Con AGVs y Pick-to-Light',
};

// ── TIMINGS (minutes per order) ──
export const TIMINGS = {
  asis: {
    recepcion: 7,
    almacenamiento: 10,
    picking: 15,
    packing: 6,
    despacho: 8,
    total: 46,
    errorRate: 0.035,
  },
  tobe: {
    recepcion: 4,
    almacenamiento: 5,
    picking: 7,
    packing: 4,
    despacho: 4,
    total: 24,
    errorRate: 0.008,
  },
};

// ── KPIs ──
export const KPIS = {
  distancia: { asis: 250, tobe: 90, unit: 'm/pedido', label: 'Distancia recorrida' },
  errores: { asis: 3.5, tobe: 0.8, unit: '%', label: 'Tasa de errores' },
  productividad: { asis: 4, tobe: 7, unit: 'ped/h/op', label: 'Productividad' },
  otif: { asis: 90, tobe: 99, unit: '%', label: 'Nivel de servicio (OTIF)' },
  ocupacion: { asis: 95, tobe: 78, unit: '%', label: 'Ocupación del espacio' },
  tiempoTotal: { asis: 46, tobe: 24, unit: 'min', label: 'Tiempo total por pedido' },
};

// ── STAFF DISTRIBUTION ──
export const STAFF = {
  total: 20,
  zones: {
    recepcion: 7,
    almacenamiento: 5,
    picking: 3,
    packing: 2,
    despacho: 3,
  },
  robots: 10, // 5 Yellow, 5 Blue (TO-BE only)
};

// ── ZONE COLORS ──
export const COLORS = {
  recepcion: '#f97316',
  storageC: '#86efac',
  storageB: '#22c55e',
  storageA: '#16a34a',
  picking: '#06b6d4',
  dispatch: '#3b82f6',
  floor: '#1e293b',
  wall: '#334155',
  rack: '#475569',
  agv: '#facc15',
  truck: '#94a3b8',
  employee: '#f8fafc',
  box: '#c2410c',
};
