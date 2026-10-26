import React, { useEffect, useState } from 'react';
import Encabezado from '../components/Encabezado';
import LecturaActual from '../components/LecturaActual';
import EstadoVentiladores from '../components/EstadoVentiladores';
import Graficas from '../components/Graficas';
import ListaAlarmas from '../components/ListaAlarmas';
import { lecturas as apiLecturas } from '../services/api';
import { useEnVivo } from '../services/contextos';
import { serieParaGrafica } from '../utils/estado';
import '../styles/Dashboard.css';
import '../styles/Nuevo.css';

const REFRESCO_GRAFICAS_MS = 10000;

export default function DashboardPage() {
  const { cocina, lectura, alarmasActivas, cargado } = useEnVivo();
  const [serie, setSerie] = useState([]);

  useEffect(() => {
    if (!cocina) return undefined;
    let vivo = true;
    const cargar = async () => {
      try {
        const datos = await apiLecturas({ cocina_id: cocina, limit: 60 });
        if (vivo) setSerie(serieParaGrafica(datos.results ?? datos));
      } catch { /* las gráficas se reintentan solas; el estado de conexión lo muestra el encabezado */ }
    };
    cargar();
    const id = setInterval(cargar, REFRESCO_GRAFICAS_MS);
    return () => { vivo = false; clearInterval(id); };
  }, [cocina]);

  return (
    <main className="terminal-layout">
      <Encabezado titulo="Monitoreo" />
      {!cargado ? (
        <div className="loading-panel">Conectando con servidor...</div>
      ) : (
        <div className="terminal-content">
          <section className="panel-alarmas">
            <h3>Alarmas activas{cocina ? ' de esta cocina' : ''}</h3>
            <ListaAlarmas alarmas={alarmasActivas.filter((a) => a.cocina_id === cocina)} vacio="No hay alarmas activas en esta cocina." />
          </section>
          <LecturaActual lectura={lectura} />
          <EstadoVentiladores lectura={lectura} />
          <Graficas datos={cocina ? serie : []} />
        </div>
      )}
    </main>
  );
}
