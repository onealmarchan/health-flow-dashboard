/**
 * Singleton del ApiClient con token dinámico.
 * Lee VITE_API_BASE_URL desde variables de entorno de Vite.
 * Si no está configurado, usa el mismo hostname del navegador en el puerto 3000.
 */
import { ApiClient } from '@/api';

function getBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl !== 'http://localhost:3000') {
    return envUrl;
  }
  // Si estamos en localhost (desarrollo), usar localhost:3000
  // Si estamos en otra IP (red local), usar esa IP con puerto 3000
  return `http://${window.location.hostname}:3000`;
}

export const api = new ApiClient({
  baseURL: getBaseUrl(),
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
  api.setToken('');
}

/**
 * Extrae el token JWT de una respuesta de API.
 * Busca en access_token, token, o data.accessToken.
 */
export function extractAuthToken(payload: any): string | null {
  if (!payload || typeof payload !== 'object') return null;
  if (typeof payload.access_token === 'string') return payload.access_token;
  if (typeof payload.token === 'string') return payload.token;
  if (payload.data && typeof payload.data.accessToken === 'string') return payload.data.accessToken;
  return null;
}
