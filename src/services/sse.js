// Cliente SSE con fetch: EventSource del navegador no permite la cabecera Authorization.
// Sin dependencias (se prueba con `node --test`).

/** Analizador incremental del formato text/event-stream. */
export class AnalizadorSSE {
  constructor() { this.buffer = ''; }

  /** Recibe texto; devuelve los eventos completos: [{event, data, id}] (los comentarios `:` se ignoran). */
  alimentar(texto) {
    this.buffer += texto.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const eventos = [];
    let corte;
    while ((corte = this.buffer.indexOf('\n\n')) !== -1) {
      const bloque = this.buffer.slice(0, corte);
      this.buffer = this.buffer.slice(corte + 2);
      let event = 'message';
      let id = null;
      const datos = [];
      for (const linea of bloque.split('\n')) {
        if (!linea || linea.startsWith(':')) continue;
        const i = linea.indexOf(':');
        const campo = i === -1 ? linea : linea.slice(0, i);
        const valor = i === -1 ? '' : linea.slice(i + 1).replace(/^ /, '');
        if (campo === 'event') event = valor;
        else if (campo === 'data') datos.push(valor);
        else if (campo === 'id') id = valor;
      }
      if (datos.length) eventos.push({ event, data: datos.join('\n'), id });
    }
    return eventos;
  }
}

/**
 * Mantiene abierto el stream y reconecta con espera creciente.
 * onEvento(nombre, datosJSON) · onEstado(true|false) · onNoAutorizado() si el servidor responde 401.
 * Devuelve una función para cerrarlo.
 */
export function conectarStream({
  url, token, onEvento, onEstado = () => {}, onNoAutorizado = () => {},
  fetchImpl = (...a) => fetch(...a), esperaInicialMs = 1000, esperaMaxMs = 15000, dormir = (ms) => new Promise((r) => setTimeout(r, ms)),
}) {
  const control = new AbortController();
  let cerrado = false;

  const ciclo = async () => {
    let espera = esperaInicialMs;
    while (!cerrado) {
      try {
        const resp = await fetchImpl(url, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'text/event-stream' },
          signal: control.signal,
        });
        if (resp.status === 401) { onEstado(false); onNoAutorizado(); return; }
        if (!resp.ok || !resp.body) throw new Error(`HTTP ${resp.status}`);
        onEstado(true);
        espera = esperaInicialMs;
        const lector = resp.body.getReader();
        const decodificador = new TextDecoder();
        const analizador = new AnalizadorSSE();
        for (;;) {
          const { done, value } = await lector.read();
          if (done) break;
          for (const e of analizador.alimentar(decodificador.decode(value, { stream: true }))) {
            let datos;
            try { datos = JSON.parse(e.data); } catch { continue; } // un evento corrupto no corta el flujo
            try { onEvento(e.event, datos); } catch (err) { console.error('Error al procesar evento', err); }
          }
        }
      } catch {
        if (cerrado) return;
      }
      if (cerrado) return;
      onEstado(false);
      await dormir(espera);
      espera = Math.min(espera * 2, esperaMaxMs);
    }
  };
  ciclo();
  return () => { cerrado = true; control.abort(); };
}
