import { useMemo } from 'react';

interface JwtPayload {
  sub?: number;
  email?: string;
  rol?: string;
  iat?: number;
  exp?: number;
}

export function useCurrentUser() {
  return useMemo(() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload: JwtPayload = JSON.parse(atob(parts[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) return null;
      return {
        id: payload.sub ?? null,
        email: payload.email ?? null,
        rol: payload.rol ?? null,
      };
    } catch {
      return null;
    }
  }); // no deps — re-reads token on each render so login/logout updates propagate
}
