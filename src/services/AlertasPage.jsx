import React, { useState } from 'react';
import Encabezado from '../components/Encabezado';
import ListaAlarmas from '../components/ListaAlarmas';
import { useEnVivo } from '../services/contextos';
import '../styles/Dashboard.css';
import '../styles/Nuevo.css';

const FILTROS = [['TODAS', 'Todas'], ['ACTIVA', 'Activas'], ['RECONOCIDA', 'Reconocidas']];

export default function AlertasPage() {
  const { alarmas, cargado } = useEnVivo();
  const [filtro, setFiltro] = useState('TODAS');
  const visibles = filtro === 'TODAS' ? alarmas : alarmas.filter((a) => a.estado === filtro);

  return (
    <main className="terminal-layout">
      <Encabezado titulo="Alarmas" />
      {!cargado ? (
        <div className="loading-panel">Conectando con servidor...</div>
      ) : (
        <div className="terminal-content">
          <section className="panel-alarmas">
            <div className="filtros">
              {FILTROS.map(([valor, texto]) => (
                <button key={valor} className={filtro === valor ? 'activo' : ''} onClick={() => setFiltro(valor)}>{texto}</button>
              ))}
            </div>
            <ListaAlarmas alarmas={visibles} vacio="No hay alarmas con este filtro." />
            <p className="nota">Una alarma permanece activa hasta que un usuario con código de reconocimiento la reconoce. Reconocer no envía órdenes al ESP32.</p>
          </section>
        </div>
      )}
    </main>
  );
}
