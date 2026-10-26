import React, { useCallback, useEffect, useState } from 'react';
import Encabezado from '../components/Encabezado';
import HistorialLecturas from '../components/HistorialLecturas';
import { lecturas as apiLecturas } from '../services/api';
import { useEnVivo } from '../services/contextos';
import { nombreCocina } from '../utils/estado';
import '../styles/Dashboard.css';
import '../styles/HistorialPage.css';
import '../styles/Nuevo.css';

const POR_PAGINA = 25;

export default function HistorialPage() {
  const { cocinas } = useEnVivo();
  const [cocina, setCocina] = useState('');           // '' = todas
  const [pagina, setPagina] = useState(0);
  const [datos, setDatos] = useState({ count: 0, results: [] });
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    try {
      const r = await apiLecturas({ cocina_id: cocina || undefined, limit: POR_PAGINA, offset: pagina * POR_PAGINA });
      setDatos(r); setError(null);
    } catch (e) {
      setError(e.response ? `El servidor respondió ${e.response.status}` : 'No se puede conectar al servidor');
    }
    setCargando(false);
  }, [cocina, pagina]);

  useEffect(() => { cargar(); }, [cargar]);

  const totalPaginas = Math.max(1, Math.ceil(datos.count / POR_PAGINA));
  return (
    <main className="terminal-layout">
      <Encabezado titulo="Historial de lecturas" />
      <div className="terminal-content">
        <div className="historial-stats">
          <div className="stat-card"><span className="stat-label">Lecturas (con este filtro)</span><span className="stat-value">{datos.count}</span></div>
          <div className="stat-card">
            <span className="stat-label">Cocina</span>
            <select className="selector-cocina" value={cocina} onChange={(e) => { setCocina(e.target.value); setPagina(0); }} aria-label="Filtrar por cocina">
              <option value="">Todas</option>
              {cocinas.map((c) => <option key={c} value={c}>{nombreCocina(c)}</option>)}
            </select>
          </div>
          <div className="stat-card"><span className="stat-label">Página</span><span className="stat-value">{pagina + 1} / {totalPaginas}</span></div>
        </div>
        {error && <p className="error-form" role="alert">{error}</p>}
        {cargando ? <div className="loading-panel">Cargando…</div> : <HistorialLecturas lecturas={datos.results} />}
        <div className="paginacion">
          <button className="btn-pagina" onClick={() => setPagina((p) => Math.max(0, p - 1))} disabled={pagina === 0}>← Más recientes</button>
          <button className="btn-pagina" onClick={cargar}>Actualizar</button>
          <button className="btn-pagina" onClick={() => setPagina((p) => p + 1)} disabled={pagina + 1 >= totalPaginas}>Más antiguas →</button>
        </div>
      </div>
    </main>
  );
}
