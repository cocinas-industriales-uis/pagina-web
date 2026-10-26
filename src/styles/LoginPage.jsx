import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/contextos';
import '../styles/Nuevo.css';

export default function LoginPage() {
  const { sesion, entrar, aviso } = useAuth();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  if (sesion) return <Navigate to={ubicacion.state?.desde || '/'} replace />;

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true); setError(null);
    try {
      await entrar(usuario.trim(), clave);
      navegar(ubicacion.state?.desde || '/', { replace: true });
    } catch (err) {
      const s = err.response?.status;
      setError(s === 401 ? 'Usuario o contraseña incorrectos' : s === 429 ? 'Demasiados intentos. Espere un minuto.' : s ? `El servidor respondió ${s}` : 'No se puede conectar al servidor');
      setClave('');
    }
    setEnviando(false);
  };

  return (
    <main className="login-pagina">
      <form className="login-caja" onSubmit={enviar}>
        <h1>Cocinas Industriales UIS</h1>
        <p>Ingrese con su usuario del sistema</p>
        {aviso && <p className="aviso-form" role="status">{aviso}</p>}
        <label htmlFor="usuario">Usuario</label>
        <input id="usuario" autoComplete="username" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
        <label htmlFor="clave">Contraseña</label>
        <input id="clave" type="password" autoComplete="current-password" value={clave} onChange={(e) => setClave(e.target.value)} />
        {error && <p className="error-form" role="alert">{error}</p>}
        <button type="submit" className="primario" disabled={enviando || !usuario || !clave}>{enviando ? 'Ingresando…' : 'Ingresar'}</button>
      </form>
    </main>
  );
}
