// URL base de la API. En desarrollo, '/api' pasa por el proxy de Vite (vite.config.js → localhost:8000).
// En producción defina VITE_API_URL (p. ej. https://servidor.ejemplo.com/api) al compilar.
export const API_URL = String(import.meta.env?.VITE_API_URL || '/api').replace(/\/+$/, '');
