import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { alSesionExpirada, fijarToken, login as apiLogin } from './api';
import { AuthContext, useAuth } from './contextos';

const CLAVE = 'cocinas_uis_sesion';

function leer() {
  try {
    const s = JSON.parse(localStorage.getItem(CLAVE) || 'null');
    if (!s?.access) return null;
    const exp = JSON.parse(atob(s.access.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).exp;
    if (exp && exp * 1000 <= Date.now()) return null;       // el token de 12 h ya venció
    return s;
  } catch {
    return null;
  }
}
const guardar = (s) => { try { s ? localStorage.setItem(CLAVE, JSON.stringify(s)) : localStorage.removeItem(CLAVE); } catch { /* sin almacenamiento: la sesión dura lo que la pestaña */ } };

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(() => { const s = leer(); fijarToken(s?.access ?? null); return s; });
  const [aviso, setAviso] = useState(null);

  const salir = useCallback((mensaje = null) => {
    fijarToken(null); guardar(null); setSesion(null); setAviso(mensaje);
  }, []);

  useEffect(() => { alSesionExpirada(() => salir('La sesión expiró. Ingrese de nuevo.')); }, [salir]);

  const entrar = useCallback(async (username, password) => {
    const datos = await apiLogin(username, password);
    fijarToken(datos.access); guardar(datos); setSesion(datos); setAviso(null);
  }, []);

  const valor = useMemo(() => ({ sesion, usuario: sesion?.user ?? null, token: sesion?.access ?? null, entrar, salir, aviso }), [sesion, entrar, salir, aviso]);
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function RutaProtegida({ children }) {
  const { sesion } = useAuth();
  const ubicacion = useLocation();
  return sesion ? children : <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
}
