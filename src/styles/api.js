import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({ baseURL: API_URL, timeout: 15000, headers: { 'Content-Type': 'application/json' } });

// El token vive en AuthProvider; aquí solo se guarda una referencia para las cabeceras.
let token = null;
let alExpirar = () => {};
export const fijarToken = (t) => { token = t; };
export const alSesionExpirada = (fn) => { alExpirar = fn; };

api.interceptors.request.use((config) => {
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    // 401 con sesión abierta = token vencido o inválido. El login fallido (401) no cierra nada.
    if (error.response?.status === 401 && token && !String(error.config?.url).includes('auth/login')) alExpirar();
    return Promise.reject(error);
  },
);

export const login = (username, password) => api.post('/auth/login/', { username, password }).then((r) => r.data);
export const ultimasLecturas = () => api.get('/lecturas/ultimas/').then((r) => r.data);
/** Lecturas más recientes primero. Devuelve {count, results}. */
export const lecturas = ({ cocina_id, limit = 100, offset = 0, prioridad } = {}) =>
  api.get('/lecturas/', { params: { cocina_id, limit, offset, prioridad } }).then((r) => r.data);
export const alarmas = ({ estado, cocina_id, limit = 200 } = {}) =>
  api.get('/alarmas/', { params: { estado, cocina_id, limit } }).then((r) => r.data);
export const reconocerAlarma = (id, codigo) => api.post(`/alarmas/${id}/reconocer/`, { codigo }).then((r) => r.data);
export const urlStream = () => `${API_URL}/stream/`;

export default api;
