import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth, useEnVivo } from '../services/contextos';
import '../styles/Navbar.css';

export default function Navbar() {
  const { usuario, salir } = useAuth();
  const { alarmasActivas } = useEnVivo();
  const clase = ({ isActive }) => `sidebar-link ${isActive ? 'activo' : ''}`;
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-title">Cocinas Industriales UIS</div>
        <div className="brand-subtitle">Monitoreo de seguridad</div>
      </div>

      <nav className="sidebar-menu">
        <NavLink to="/" end className={clase}><span>▦</span> Monitoreo</NavLink>
        <NavLink to="/historial" className={clase}><span>▤</span> Historial</NavLink>
        <NavLink to="/alertas" className={clase}>
          <span>△</span> Alarmas
          {alarmasActivas.length > 0 && <b className="insignia" data-testid="insignia-alarmas">{alarmasActivas.length}</b>}
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-link muted" data-testid="usuario-actual"><span>☺</span> {usuario?.nombre || usuario?.username} · {usuario?.rol}</div>
        <button className="sidebar-link salir" onClick={() => salir()}><span>↪</span> Cerrar sesión</button>
      </div>
    </aside>
  );
}
