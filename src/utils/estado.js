// Lógica de presentación SIN dependencias (se prueba con `node --test`). Fuente de verdad: la API.
// Severidad: igual que el backend (cocina/models.py → severidad_de) y que la app móvil.

export const STALE_S = 30; // segundos sin lecturas nuevas para considerar que la cocina dejó de reportar

export const SEVERIDADES = {
  EMERGENCIA: { orden: 0, titulo: 'Emergencia', color: '#e53935', icono: '🚨' },
  RIESGO: { orden: 1, titulo: 'Riesgo', color: '#fb8c00', icono: '⚠️' },
  ADVERTENCIA: { orden: 2, titulo: 'Advertencia', color: '#fdd835', icono: '🔔' },
  NORMAL: { orden: 3, titulo: 'Normal', color: '#43a047', icono: '✅' },
  SIN_DATOS: { orden: 4, titulo: 'Sin datos', color: '#757575', icono: '❔' },
};

// Mismo texto que cocina/serializers.py → MENSAJE_POR_PRIORIDAD
export const MENSAJE_POR_PRIORIDAD = {
  0: 'Gas y llama simultáneos: evacuar',
  1: 'Fuga de gas crítica',
  2: 'Incendio severo',
  3: 'Incendio moderado',
  4: 'Prealerta de gas',
  5: 'Presión alta con gas',
  6: 'Presión alta',
  7: 'Ventilación por temperatura',
  8: 'Llama detectada en monitoreo',
  9: 'Operación normal',
};

const SEVERIDAD_POR_PRIORIDAD = { 0: 'EMERGENCIA', 1: 'EMERGENCIA', 2: 'EMERGENCIA', 3: 'EMERGENCIA', 4: 'RIESGO', 5: 'RIESGO', 6: 'ADVERTENCIA', 7: 'NORMAL', 8: 'ADVERTENCIA', 9: 'NORMAL' };

/** Severidad de una lectura. Un valor desconocido NUNCA se muestra como normal. */
export function severidadDe(lectura) {
  if (!lectura) return 'SIN_DATOS';
  let sev = SEVERIDADES[lectura.severidad] ? lectura.severidad : SEVERIDAD_POR_PRIORIDAD[lectura.prioridad];
  if (!sev || !SEVERIDADES[sev]) return 'SIN_DATOS';
  if (lectura.sensor_ok === false && SEVERIDADES[sev].orden > SEVERIDADES.ADVERTENCIA.orden) sev = 'ADVERTENCIA';
  return sev;
}

export function segundosDesde(timestamp, ahora = Date.now()) {
  const t = Date.parse(timestamp);
  return Number.isNaN(t) ? null : Math.max(0, Math.round((ahora - t) / 1000));
}

export function esObsoleta(lectura, ahora = Date.now(), limiteS = STALE_S) {
  if (!lectura) return false;
  const s = segundosDesde(lectura.timestamp, ahora);
  return s === null || s > limiteS;
}

/** Resumen para el encabezado/banners de una cocina. */
export function resumenEstado(lectura, { ahora = Date.now(), enVivo = true } = {}) {
  if (!lectura) return { sev: 'SIN_DATOS', titulo: 'Sin datos', detalle: 'Aún no hay lecturas de esta cocina.', obsoleta: false };
  const sev = severidadDe(lectura);
  const obsoleta = esObsoleta(lectura, ahora);
  const mensaje = MENSAJE_POR_PRIORIDAD[lectura.prioridad] || lectura.estado_sistema || 'Estado desconocido';
  let detalle = mensaje;
  if (lectura.confirmando) detalle += ' (confirmando durante 10 s)';
  if (lectura.sensor_ok === false) detalle += ' · sensor de temperatura averiado';
  if (obsoleta) {
    const s = segundosDesde(lectura.timestamp, ahora);
    detalle = `Sin lecturas nuevas${s === null ? '' : ` hace ${s} s`}: el último dato recibido NO es actual. Último estado: ${mensaje}`;
  } else if (!enVivo) {
    detalle += ' · sin conexión en vivo con el servidor';
  }
  return { sev, titulo: SEVERIDADES[sev].titulo, detalle, obsoleta };
}

export function nombreCocina(id) {
  if (!id) return '—';
  return String(id).replace(/^cocina[_-]?/i, 'Cocina ').replace(/[_-]+/g, ' ').trim() || String(id);
}

export function fmtFecha(timestamp, locale = 'es-CO') {
  const d = new Date(timestamp);
  return Number.isNaN(d.getTime()) ? '--' : d.toLocaleString(locale);
}

export function fmtHora(timestamp, locale = 'es-CO') {
  const d = new Date(timestamp);
  return Number.isNaN(d.getTime()) ? '--' : d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export const num = (v, dec = 1) => (v === null || v === undefined || Number.isNaN(Number(v)) ? '--' : Number(v).toFixed(dec));

/** Alarmas activas primero y, dentro de cada grupo, la más grave (prioridad menor) y la más reciente. */
export function ordenarAlarmas(alarmas) {
  return [...alarmas].sort((a, b) => {
    if (a.estado !== b.estado) return a.estado === 'ACTIVA' ? -1 : 1;
    if (a.estado === 'ACTIVA' && a.prioridad !== b.prioridad) return a.prioridad - b.prioridad;
    return String(b.inicio).localeCompare(String(a.inicio));
  });
}

/** Inserta o reemplaza una alarma por id (eventos `alarm` del stream). */
export function upsertAlarma(lista, alarma) {
  const i = lista.findIndex((x) => String(x.id) === String(alarma.id));
  if (i === -1) return ordenarAlarmas([alarma, ...lista]);
  const copia = lista.slice();
  copia[i] = alarma;
  return ordenarAlarmas(copia);
}

/** Datos para gráficas: la API entrega lo más reciente primero; la gráfica va en orden cronológico. */
export function serieParaGrafica(lecturas, max = 60) {
  return lecturas.slice(0, max).reverse().map((l) => ({
    id: l.id,
    tiempo: fmtHora(l.timestamp),
    temperatura: Number(l.temperatura),
    gas: Number(l.gas_pct),
    presion: Number(l.presion_pct),
  }));
}

/** Mensaje de error de la API de reconocimiento (403/400/429) para mostrar al operador. */
export function mensajeReconocer(status, datos) {
  if (status === 429) return `Demasiados intentos. Espere ${datos?.reintentar_en_s ?? 'unos'} s antes de reintentar.`;
  if (status === 403) return datos?.detalle || 'Código inválido';
  if (status === 400) return datos?.detalle || 'Escriba el código de reconocimiento';
  if (status === 404) return 'La alarma ya no existe';
  return 'No se pudo reconocer la alarma. Intente de nuevo.';
}
