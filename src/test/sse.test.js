import test from 'node:test';
import assert from 'node:assert/strict';
import { AnalizadorSSE, conectarStream } from '../services/sse.js';

test('analizador: eventos completos, fragmentados, comentarios y CRLF', () => {
  const a = new AnalizadorSSE();
  assert.deepEqual(a.alimentar('retry: 3000\n\n'), []);
  assert.deepEqual(a.alimentar(': keep-alive\n\n'), []);
  assert.deepEqual(a.alimentar('event: reading\ndata: {"id"'), []);
  assert.deepEqual(a.alimentar(': 1}\n\nevent: alarm\r\ndata: {"id": "7"}\r\n\r\n'), [
    { event: 'reading', data: '{"id": 1}', id: null },
    { event: 'alarm', data: '{"id": "7"}', id: null },
  ]);
});

function respuestaConTrozos(trozos, status = 200) {
  const enc = new TextEncoder();
  let i = 0;
  return {
    status, ok: status >= 200 && status < 300,
    body: { getReader: () => ({ read: async () => (i < trozos.length ? { done: false, value: enc.encode(trozos[i++]) } : { done: true }) }) },
  };
}

test('stream: entrega eventos, ignora JSON corrupto, reconecta al caerse y envía el token', async () => {
  const recibidos = []; const estados = []; const cabeceras = [];
  let llamadas = 0;
  const cierre = await new Promise((resolver) => {
    const cerrar = conectarStream({
      url: 'http://x/api/stream/', token: 'TOK',
      fetchImpl: async (url, opts) => {
        cabeceras.push(opts.headers.Authorization); llamadas += 1;
        if (llamadas === 1) return respuestaConTrozos(['event: reading\ndata: {"id":1}\n\n', 'event: reading\ndata: {malo\n\nevent: alarm\ndata: {"id":"2"}\n\n']);
        if (llamadas === 2) throw new Error('red caída');
        return respuestaConTrozos(['event: reading\ndata: {"id":3}\n\n']);
      },
      onEvento: (n, d) => { recibidos.push([n, d.id]); if (d.id === 3) resolver(cerrar); },
      onEstado: (v) => estados.push(v),
      dormir: async () => {},
    });
  });
  cierre();
  assert.deepEqual(recibidos, [['reading', 1], ['alarm', '2'], ['reading', 3]]);
  assert.ok(llamadas >= 3);
  assert.ok(cabeceras.every((h) => h === 'Bearer TOK'));
  assert.equal(estados[0], true);
  assert.ok(estados.includes(false));
});

test('stream: 401 avisa y no reconecta', async () => {
  let llamadas = 0; let avisado = false;
  await new Promise((resolver) => {
    conectarStream({
      url: 'x', token: 't', fetchImpl: async () => { llamadas += 1; return { status: 401, ok: false, body: null }; },
      onEvento() {}, onNoAutorizado: () => { avisado = true; resolver(); }, dormir: async () => {},
    });
  });
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(avisado, true);
  assert.equal(llamadas, 1);
});
