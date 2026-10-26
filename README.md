# Web — Monitoreo de cocinas industriales UIS

React 19 + Vite. Consume la API del backend (`servidor/`): **todo requiere iniciar sesión**.

## Uso
```bash
npm install
npm run dev          # http://localhost:5173 ; /api se reenvía a http://localhost:8000 (vite.config.js)
npm test             # pruebas de lógica pura (node --test, sin dependencias extra)
npm run lint
npm run build        # para producción defina antes VITE_API_URL (ver .env.example)
```
Requisitos: backend en marcha (`python manage.py runserver`), un usuario de Django y, para reconocer alarmas,
su código personal (`python manage.py fijar_codigo_reconocimiento <usuario>`).

## Páginas
| Ruta | Contenido |
|---|---|
| `/login` | Usuario y contraseña (`POST /api/auth/login/`). Token en `localStorage`; si vence o el servidor responde 401 se vuelve al login |
| `/` Monitoreo | Estado real de la cocina elegida, alarmas activas con **Reconocer**, última lectura, actuadores (ventiladores, válvula, aspersor) y gráficas de las últimas 60 lecturas |
| `/historial` | Lecturas con paginación del servidor y filtro por cocina |
| `/alertas` | Alarmas P0–P5 activas y reconocidas; reconocer pide el código personal. **Reconocer no envía órdenes al ESP32** |

## Datos en vivo
`src/services/EnVivo.jsx` carga el estado inicial por REST y escucha `GET /api/stream/` (SSE con `fetch`, porque
`EventSource` no permite la cabecera `Authorization`). Si el stream cae, reconecta con espera creciente, consulta cada 5 s
y muestra «Reconectando…». Si una cocina lleva más de 30 s sin lecturas nuevas, la web avisa que el dato **no es actual**.

## Qué se corrigió respecto de la versión anterior (Fase 4 de la auditoría)
Sin login (la API ahora lo exige); campos antiguos (`nivel_gas` en «ppm», `presion` en «hPa», `ventilador_*`) por los del firmware
(`gas_pct`, `presion_pct`, `v1_pct`…, `valvula`, `aspersor`); estados antiguos que caían en «Sistema Normal» cuando no los
reconocían; texto fijo «Sistema Normal» / «parámetros dentro de los rangos»; botón «Emergencia» sin acción; gráficas que
mostraban las 20 lecturas MÁS ANTIGUAS; mezcla de cocinas; URL de la API fija en el código; `POST /lecturas/` (ya no existe).
Ver `investigacion/docs/auditoria/SEGUIMIENTO_AUDITORIA.md`, sección 18.

## Pruebas
`src/test/*.test.js`: severidad, datos obsoletos, alarmas, orden de gráficas, analizador SSE y reconexión del stream.
