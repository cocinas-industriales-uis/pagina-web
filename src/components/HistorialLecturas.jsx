import React from 'react';
import { SEVERIDADES, MENSAJE_POR_PRIORIDAD, fmtFecha, num, severidadDe } from '../utils/estado';
import '../styles/HistorialLecturas.css';

/** Tabla de lecturas (la paginación la hace el servidor: ver HistorialPage). */
const HistorialLecturas = ({ lecturas }) => {
  if (!lecturas || lecturas.length === 0) {
    return <div className="historial-lecturas"><h3>Historial de Lecturas</h3><div className="historial-vacio"><p>No hay lecturas con ese filtro.</p></div></div>;
  }
  return (
    <div className="historial-lecturas">
      <div className="tabla-contenedor">
        <table className="tabla-historial">
          <thead>
            <tr>
              <th>Fecha / Hora</th><th>Cocina</th><th>Temp.</th><th>Gas</th><th>Presión</th><th>Llama</th>
              <th>Inyección</th><th>Extracción</th><th>Emergencia</th><th>Válvula</th><th>Aspersor</th><th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {lecturas.map((l) => (
              <tr key={l.id}>
                <td className="celda-fecha">{fmtFecha(l.timestamp)}</td>
                <td>{l.cocina_id}</td>
                <td className="celda-numero">{l.sensor_ok === false ? 'Sensor ✗' : `${num(l.temperatura)} °C`}</td>
                <td className="celda-numero">{l.gas_pct} %</td>
                <td className="celda-numero">{l.presion_pct} %</td>
                <td className="celda-booleano">{l.llama ? '🔥' : '—'}</td>
                <td className="celda-numero">{l.v1_pct} %</td>
                <td className="celda-numero">{l.v2_pct} %</td>
                <td className="celda-numero">{l.v3_pct} %</td>
                <td className="celda-booleano">{l.valvula ? 'Cerrada' : 'Abierta'}</td>
                <td className="celda-booleano">{l.aspersor ? 'Sí' : '—'}</td>
                <td>
                  <span className="estado-badge" style={{ backgroundColor: SEVERIDADES[severidadDe(l)].color, color: '#111' }}>
                    P{l.prioridad} · {MENSAJE_POR_PRIORIDAD[l.prioridad] || l.estado_sistema}{l.confirmando ? ' (confirmando)' : ''}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistorialLecturas;
