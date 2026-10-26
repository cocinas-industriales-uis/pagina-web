import React from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import '../styles/Graficas.css';

const SERIES = [
  { clave: 'temperatura', titulo: 'Temperatura vs Tiempo', unidad: '°C', color: '#ff6b6b', nombre: 'Temperatura', dec: 1 },
  { clave: 'gas', titulo: 'Gas vs Tiempo', unidad: '% escala ADC', color: '#ffd54f', nombre: 'Gas', dec: 0 },
  { clave: 'presion', titulo: 'Presión vs Tiempo', unidad: '% escala ADC', color: '#81c784', nombre: 'Presión', dec: 0 },
];

/** `datos`: serie cronológica (utils/estado.js → serieParaGrafica). */
const Graficas = ({ datos }) => {
  if (!datos || datos.length === 0) return <div className="graficas-contenedor"><p className="sin-datos">Sin lecturas para graficar.</p></div>;
  return (
    <div className="graficas-seccion">
      <h3>Gráficas de Monitoreo <small>(últimas {datos.length} lecturas)</small></h3>
      <div className="graficas-grid">
        {SERIES.map((s) => (
          <div className="grafica-card" key={s.clave}>
            <h4>{s.titulo}</h4>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={datos} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="tiempo" stroke="#90caf9" style={{ fontSize: '11px' }} />
                <YAxis stroke="#90caf9" style={{ fontSize: '11px' }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e1e1e', border: `1px solid ${s.color}`, borderRadius: '8px' }}
                  formatter={(v) => [`${Number(v).toFixed(s.dec)} ${s.unidad}`, s.nombre]}
                />
                <Legend />
                <Line type="monotone" dataKey={s.clave} stroke={s.color} dot={false} name={s.nombre} strokeWidth={2} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Graficas;
