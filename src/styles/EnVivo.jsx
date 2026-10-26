import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { alarmas as apiAlarmas, ultimasLecturas, urlStream } from './api';
import { conectarStream } from './sse';
import { upsertAlarma, ordenarAlarmas } from '../utils/estado';
import { EnVivoContext, useAuth } from './contextos';

const SONDEO_SIN_STREAM_MS = 5000;

/** Estado en vivo compartido: última lectura por cocina, alarmas y conexión al stream (con sondeo de respaldo). */
export function EnVivoProvider({ children }) {
  const { token } = useAuth();
  const [ultimas, setUltimas] = useState({});          // { cocina_id: lectura }
  const [alarmas, setAlarmas] = useState([]);
  const [enVivo, setEnVivo] = useState(false);
  const [errorApi, setErrorApi] = useState(null);
  const [cargado, setCargado] = useState(false);
  const [cocinaSel, setCocinaSel] = useState(null);
  const [ahora, setAhora] = useState(Date.now());
  const enVivoRef = useRef(false);

  const refrescar = useCallback(async () => {
    try {
      const [u, a] = await Promise.all([ultimasLecturas(), apiAlarmas({ limit: 200 })]);
      setUltimas(Object.fromEntries(u.map((l) => [l.cocina_id, l])));
      setAlarmas(ordenarAlarmas(a));
      setErrorApi(null);
    } catch (e) {
      setErrorApi(e.response ? `El servidor respondió ${e.response.status}` : 'No se puede conectar al servidor');
    }
    setCargado(true);
  }, []);

  useEffect(() => {
    if (!token) return undefined;
    refrescar();
    const cerrar = conectarStream({
      url: urlStream(), token,
      onEstado: (v) => { const antes = enVivoRef.current; enVivoRef.current = v; setEnVivo(v); if (v && !antes) refrescar(); }, // al (re)conectar, sin huecos
      onEvento: (nombre, d) => {
        if (nombre === 'reading') {
          setUltimas((prev) => (prev[d.cocina_id] && prev[d.cocina_id].id > d.id ? prev : { ...prev, [d.cocina_id]: d }));
        } else if (nombre === 'alarm') {
          setAlarmas((prev) => upsertAlarma(prev, d));
        }
      },
    });
    return cerrar;
  }, [token, refrescar]);

  // Respaldo: mientras no haya stream, se consulta cada 5 s. El reloj sirve para detectar datos obsoletos.
  useEffect(() => {
    if (!token) return undefined;
    let ticks = 0;
    const id = setInterval(() => {
      setAhora(Date.now());
      ticks += 1;
      if (!enVivoRef.current && ticks % (SONDEO_SIN_STREAM_MS / 1000) === 0) refrescar();
    }, 1000);
    return () => clearInterval(id);
  }, [token, refrescar]);

  const cocinas = useMemo(() => Object.keys(ultimas).sort(), [ultimas]);
  const cocina = cocinaSel && ultimas[cocinaSel] ? cocinaSel : cocinas[0] ?? null;
  const alarmasActivas = useMemo(() => alarmas.filter((a) => a.estado === 'ACTIVA'), [alarmas]);

  const valor = useMemo(() => ({
    ultimas, alarmas, alarmasActivas, cocinas, cocina, setCocinaSel, lectura: cocina ? ultimas[cocina] : null,
    enVivo, errorApi, cargado, ahora, refrescar,
  }), [ultimas, alarmas, alarmasActivas, cocinas, cocina, enVivo, errorApi, cargado, ahora, refrescar]);
  return <EnVivoContext.Provider value={valor}>{children}</EnVivoContext.Provider>;
}
