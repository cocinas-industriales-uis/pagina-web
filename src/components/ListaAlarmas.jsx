import React, { useState } from 'react';
import ModalReconocer from './ModalReconocer';
import { useEnVivo } from '../services/contextos';
import { SEVERIDADES, fmtFecha, nombreCocina } from '../utils/estado';

const SEV_POR_PRIORIDAD = (p) => (p <= 3 ? 'EMERGENCIA' : 'RIESGO');

/** Alarmas P0–P5 con botón de reconocimiento. `alarmas` ya viene filtrado por la página. */
export default function ListaAlarmas({ alarmas, vacio = 'No hay alarmas.' }) {
  const { refrescar } = useEnVivo();
  const [seleccion, setSeleccion] = useState(null);

  if (alarmas.length === 0) return <div className="sin-alertas"><p>{vacio}</p></div>;
  return (
    <>
      <ul className="lista-alarmas">
        {alarmas.map((a) => {
          const sev = SEVERIDADES[SEV_POR_PRIORIDAD(a.prioridad)];
          const activa = a.estado === 'ACTIVA';
          return (
            <li key={a.id} className={`alarma ${activa ? 'activa' : 'reconocida'}`} style={{ borderLeftColor: sev.color }} data-testid="alarma">
              <div className="alarma-cuerpo">
                <div className="alarma-titulo">
                  <span style={{ color: sev.color }}>{sev.icono} P{a.prioridad} · {a.tipo}</span>
                  <span className="alarma-cocina">{nombreCocina(a.cocina_id)}</span>
                  <span className={`alarma-estado ${activa ? 'activa' : ''}`}>{activa ? 'ACTIVA' : 'RECONOCIDA'}</span>
                </div>
                <div className="alarma-detalle">{a.variable} · {a.valor}{a.umbral ? ` · umbral: ${a.umbral}` : ''}</div>
                <div className="alarma-detalle">Inicio: {fmtFecha(a.inicio)}{a.sensor ? ` · Sensor: ${a.sensor}` : ''}</div>
                {!activa && <div className="alarma-detalle">Reconocida por {a.reconocida_por || '—'} el {fmtFecha(a.reconocida_en)}</div>}
              </div>
              {activa && <button className="btn-reconocer" onClick={() => setSeleccion(a)}>Reconocer</button>}
            </li>
          );
        })}
      </ul>
      {seleccion && (
        <ModalReconocer
          alarma={seleccion}
          alCerrar={() => setSeleccion(null)}
          alReconocida={() => { setSeleccion(null); refrescar(); }}
        />
      )}
    </>
  );
}
