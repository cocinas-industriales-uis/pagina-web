import React from 'react';
import { useEnVivo } from '../services/contextos';
import { SEVERIDADES, fmtFecha, nombreCocina, resumenEstado } from '../utils/estado';

/** Encabezado común: estado REAL de la cocina elegida (nada fijo), selector de cocina y alarmas activas. */
export default function Encabezado({ titulo }) {
  const { lectura, cocina, cocinas, setCocinaSel, enVivo, errorApi, cargado, ahora, alarmasActivas } = useEnVivo();
  const r = resumenEstado(lectura, { ahora, enVivo });
  const sev = SEVERIDADES[r.sev];
  const sinServidor = Boolean(errorApi) && !lectura;
  const color = r.obsoleta || sinServidor ? SEVERIDADES.ADVERTENCIA.color : sev.color;

  let etiqueta = r.titulo;
  if (sinServidor) etiqueta = 'API desconectada';
  else if (r.obsoleta) etiqueta = 'Sin datos recientes';

  return (
    <>
      <header className="terminal-topbar">
        <div className="topbar-left">
          <h1>{titulo}</h1>
          <span className="topbar-status" style={{ color }} data-testid="estado-cabecera">● {etiqueta}</span>
          {cocinas.length > 0 && (
            <select className="selector-cocina" value={cocina ?? ''} onChange={(e) => setCocinaSel(e.target.value)} aria-label="Cocina">
              {cocinas.map((c) => <option key={c} value={c}>{nombreCocina(c)}</option>)}
            </select>
          )}
        </div>
        <div className="topbar-actions">
          <span className={`conexion ${enVivo ? 'ok' : 'caida'}`} title="Conexión en vivo (stream) con el servidor">
            {enVivo ? '● En vivo' : '○ Reconectando…'}
          </span>
          <span className={`system-pill ${alarmasActivas.length ? 'con-alarmas' : ''}`} data-testid="pill-alarmas">
            {alarmasActivas.length ? `${alarmasActivas.length} alarma(s) activa(s)` : 'Sin alarmas activas'}
          </span>
        </div>
      </header>

      <section className="operation-banner" style={{ borderLeft: `6px solid ${color}` }}>
        <div>
          <h2>{sev.icono} Estado operativo{cocina ? ` · ${nombreCocina(cocina)}` : ''}: {etiqueta}</h2>
          <p data-testid="detalle-estado">{sinServidor ? errorApi : (cargado ? r.detalle : 'Conectando con el servidor…')}</p>
        </div>
        <div className="last-reading">
          <span>Última lectura recibida</span>
          <strong>{lectura ? fmtFecha(lectura.timestamp) : '--'}</strong>
        </div>
      </section>
    </>
  );
}
