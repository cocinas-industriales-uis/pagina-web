import React, { useEffect, useRef, useState } from 'react';
import { reconocerAlarma } from '../services/api';
import { mensajeReconocer } from '../utils/estado';

/** Pide el código personal y reconoce la alarma. Reconocer NO manda ninguna orden al ESP32. */
export default function ModalReconocer({ alarma, alCerrar, alReconocida }) {
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const campo = useRef(null);
  useEffect(() => { campo.current?.focus(); }, []);

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true); setError(null);
    try {
      const actualizada = await reconocerAlarma(alarma.id, codigo);
      alReconocida(actualizada);
    } catch (err) {
      setError(mensajeReconocer(err.response?.status, err.response?.data));
      setCodigo('');
    }
    setEnviando(false);
  };

  return (
    <div className="modal-fondo" role="dialog" aria-modal="true" aria-label="Reconocer alarma">
      <form className="modal" onSubmit={enviar}>
        <h3>Reconocer alarma #{alarma.id}</h3>
        <p>{alarma.tipo} · {alarma.cocina_id}</p>
        <p className="modal-nota">Reconocer indica que usted tomó conocimiento. <strong>No envía ninguna orden al sistema</strong> (válvula, ventiladores ni aspersor).</p>
        <label htmlFor="codigo-reconocimiento">Su código de reconocimiento</label>
        <input id="codigo-reconocimiento" ref={campo} type="password" autoComplete="off" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
        {error && <p className="error-form" role="alert">{error}</p>}
        <div className="modal-acciones">
          <button type="button" onClick={alCerrar} disabled={enviando}>Cancelar</button>
          <button type="submit" className="primario" disabled={enviando || !codigo}>{enviando ? 'Enviando…' : 'Reconocer'}</button>
        </div>
      </form>
    </div>
  );
}
