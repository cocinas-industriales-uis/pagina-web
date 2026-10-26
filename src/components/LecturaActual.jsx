import React from 'react';
import { SEVERIDADES, MENSAJE_POR_PRIORIDAD, fmtFecha, num, severidadDe } from '../utils/estado';
import '../styles/LecturaActual.css';

const LecturaActual = ({ lectura }) => {
  if (!lectura) return <div className="lectura-actual"><h2>Última lectura</h2><p>Sin lecturas de esta cocina.</p></div>;
  const sev = SEVERIDADES[severidadDe(lectura)];
  return (
    <div className="lectura-actual">
      <h2>Última Lectura</h2>
      <div className="lectura-timestamp"><span>{fmtFecha(lectura.timestamp)}</span></div>
      <div className="lectura-grid">
        <div className="lectura-card">
          <span className="lectura-label">🌡️ Temperatura</span>
          <span className="lectura-valor">{lectura.sensor_ok === false ? 'Sensor averiado' : `${num(lectura.temperatura)} °C`}</span>
          <span className="lectura-detalle">ΔT {num(lectura.delta_t)} °C/s</span>
        </div>
        <div className="lectura-card">
          <span className="lectura-label">💨 Gas</span>
          <span className="lectura-valor">{lectura.gas_pct} %</span>
          <span className="lectura-detalle">raw {lectura.gas_raw} / 4095 (prealerta 800 · crítico 1640)</span>
        </div>
        <div className="lectura-card">
          <span className="lectura-label">🌬️ Presión</span>
          <span className="lectura-valor">{lectura.presion_pct} %</span>
          <span className="lectura-detalle">raw {lectura.presion_raw} / 4095</span>
        </div>
        <div className="lectura-card">
          <span className="lectura-label">🔥 Llama</span>
          <span className={`lectura-valor ${lectura.llama ? 'alerta' : 'normal'}`}>{lectura.llama ? 'DETECTADA' : 'No detectada'}</span>
        </div>
        <div className="lectura-card">
          <span className="lectura-label">🖥️ Estado (P{lectura.prioridad})</span>
          <span className="lectura-valor estado" style={{ backgroundColor: sev.color, color: '#111' }}>
            {MENSAJE_POR_PRIORIDAD[lectura.prioridad] || lectura.estado_sistema}
          </span>
          {lectura.confirmando && <span className="lectura-detalle">Confirmando (10 s)</span>}
        </div>
      </div>
    </div>
  );
};

export default LecturaActual;
