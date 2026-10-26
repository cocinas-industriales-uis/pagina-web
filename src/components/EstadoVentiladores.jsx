import React from 'react';
import '../styles/EstadoVentiladores.css';

// v1/v2/v3 según el firmware: inyección, extracción y emergencia (% de velocidad; la emergencia/boost puede superar 100).
const VENTILADORES = [
  { clave: 'v1_pct', nombre: 'Ventilador de inyección', icono: '➡️' },
  { clave: 'v2_pct', nombre: 'Ventilador de extracción', icono: '⬆️' },
  { clave: 'v3_pct', nombre: 'Ventilador de emergencia', icono: '🌀' },
];

const EstadoVentiladores = ({ lectura }) => {
  if (!lectura) return <div className="estado-ventiladores"><h3>Actuadores</h3><p>Sin lecturas.</p></div>;
  return (
    <div className="estado-ventiladores">
      <h3>Actuadores</h3>
      <div className="ventiladores-grid">
        {VENTILADORES.map(({ clave, nombre, icono }) => {
          const pct = Number(lectura[clave]) || 0;
          return (
            <div key={clave} className={`ventilador-card ${pct > 0 ? 'activo' : 'inactivo'}`}>
              <div className="ventilador-icono">{icono}</div>
              <div className="ventilador-nombre">{nombre}</div>
              <div className="ventilador-estado">
                <span className={`estado-badge ${pct > 0 ? 'encendido' : 'apagado'}`}>{pct > 0 ? `${pct} %` : 'APAGADO'}</span>
              </div>
              <div className={`ventilador-indicador ${pct > 0 ? 'activo' : ''}`} />
            </div>
          );
        })}
        <div className={`ventilador-card ${lectura.valvula ? 'activo' : 'inactivo'}`}>
          <div className="ventilador-icono">🚰</div>
          <div className="ventilador-nombre">Válvula de gas</div>
          <div className="ventilador-estado"><span className={`estado-badge ${lectura.valvula ? 'encendido' : 'apagado'}`}>{lectura.valvula ? 'CERRADA' : 'ABIERTA'}</span></div>
        </div>
        <div className={`ventilador-card ${lectura.aspersor ? 'activo' : 'inactivo'}`}>
          <div className="ventilador-icono">💧</div>
          <div className="ventilador-nombre">Aspersor</div>
          <div className="ventilador-estado"><span className={`estado-badge ${lectura.aspersor ? 'encendido' : 'apagado'}`}>{lectura.aspersor ? 'ACTIVO' : 'INACTIVO'}</span></div>
        </div>
      </div>
    </div>
  );
};

export default EstadoVentiladores;
