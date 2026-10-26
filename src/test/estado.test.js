import test from 'node:test';
import assert from 'node:assert/strict';
import {
  severidadDe, resumenEstado, esObsoleta, nombreCocina, ordenarAlarmas, upsertAlarma, serieParaGrafica, mensajeReconocer, num,
} from '../utils/estado.js';

const AHORA = Date.parse('2026-10-22T12:00:00Z');
const lec = (o = {}) => ({ id: 1, cocina_id: 'cocina_01', timestamp: '2026-10-22T11:59:58Z', prioridad: 9, severidad: 'NORMAL', sensor_ok: true, confirmando: false, estado_sistema: 'NORMAL', ...o });

test('severidad: usa la de la API y nunca muestra un valor desconocido como normal', () => {
  assert.equal(severidadDe(lec({ prioridad: 1, severidad: 'EMERGENCIA' })), 'EMERGENCIA');
  assert.equal(severidadDe(lec({ severidad: 'RARO', prioridad: 4 })), 'RIESGO');
  assert.equal(severidadDe(lec({ severidad: undefined, prioridad: 99 })), 'SIN_DATOS');
  assert.equal(severidadDe(null), 'SIN_DATOS');
});

test('sensor averiado sube de normal a advertencia pero no baja una emergencia', () => {
  assert.equal(severidadDe(lec({ sensor_ok: false })), 'ADVERTENCIA');
  assert.equal(severidadDe(lec({ sensor_ok: false, prioridad: 3, severidad: 'EMERGENCIA' })), 'EMERGENCIA');
});

test('resumen: dato actual vs dato obsoleto', () => {
  const ok = resumenEstado(lec(), { ahora: AHORA });
  assert.equal(ok.obsoleta, false);
  assert.match(ok.detalle, /Operación normal/);
  const viejo = resumenEstado(lec({ timestamp: '2026-10-22T11:58:00Z' }), { ahora: AHORA });
  assert.equal(viejo.obsoleta, true);
  assert.match(viejo.detalle, /NO es actual/);
  assert.equal(esObsoleta(lec({ timestamp: 'basura' }), AHORA), true);
});

test('resumen: confirmando, sin conexión en vivo, sin datos', () => {
  assert.match(resumenEstado(lec({ prioridad: 3, severidad: 'EMERGENCIA', confirmando: true }), { ahora: AHORA }).detalle, /confirmando/);
  assert.match(resumenEstado(lec(), { ahora: AHORA, enVivo: false }).detalle, /sin conexión en vivo/);
  assert.equal(resumenEstado(null).sev, 'SIN_DATOS');
});

test('nombres y números', () => {
  assert.equal(nombreCocina('cocina_01'), 'Cocina 01');
  assert.equal(nombreCocina('sector-b'), 'sector b');
  assert.equal(nombreCocina(''), '—');
  assert.equal(num(12.345), '12.3');
  assert.equal(num(null), '--');
});

test('alarmas: activas primero, más grave primero, upsert por id', () => {
  const a = [
    { id: '1', estado: 'RECONOCIDA', prioridad: 1, inicio: '2026-10-22T10:00:00.000Z' },
    { id: '2', estado: 'ACTIVA', prioridad: 4, inicio: '2026-10-22T11:00:00.000Z' },
    { id: '3', estado: 'ACTIVA', prioridad: 1, inicio: '2026-10-22T09:00:00.000Z' },
  ];
  assert.deepEqual(ordenarAlarmas(a).map((x) => x.id), ['3', '2', '1']);
  const reconocida = upsertAlarma(a, { id: '3', estado: 'RECONOCIDA', prioridad: 1, inicio: '2026-10-22T09:00:00.000Z' });
  assert.equal(reconocida.length, 3);
  assert.deepEqual(reconocida.map((x) => x.id), ['2', '1', '3']);
  assert.equal(upsertAlarma(a, { id: '4', estado: 'ACTIVA', prioridad: 0, inicio: '2026-10-22T12:00:00.000Z' })[0].id, '4');
});

test('gráfica: orden cronológico (la API entrega lo más reciente primero)', () => {
  const lecturas = [3, 2, 1].map((i) => lec({ id: i, temperatura: 20 + i, gas_pct: i, presion_pct: i, timestamp: `2026-10-22T11:59:0${i}Z` }));
  assert.deepEqual(serieParaGrafica(lecturas).map((p) => p.id), [1, 2, 3]);
  assert.equal(serieParaGrafica(lecturas, 2).length, 2);
  assert.deepEqual(serieParaGrafica(lecturas, 2).map((p) => p.id), [2, 3]);   // se conservan las MÁS recientes
});

test('mensajes de error de reconocimiento', () => {
  assert.match(mensajeReconocer(429, { reintentar_en_s: 120 }), /120/);
  assert.equal(mensajeReconocer(403, { detalle: 'Código inválido' }), 'Código inválido');
  assert.match(mensajeReconocer(500, {}), /No se pudo/);
});
