/**
 * Singleton del ApiClient con token dinámico.
 * Lee VITE_API_BASE_URL desde variables de entorno de Vite.
 */
import { ApiClient } from '@/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const api = new ApiClient({
  baseURL: BASE_URL,
});

/**
 * Actualiza el token JWT usado por la instancia.
 * Se debe llamar después de un login exitoso.
 */
export function setAuthToken(token: string) {
  localStorage.setItem('token', token);
  api.setToken(token);
}

/**
 * Elimina el token JWT (logout).
 */
export function clearAuthToken() {
  localStorage.removeItem('token');
}
