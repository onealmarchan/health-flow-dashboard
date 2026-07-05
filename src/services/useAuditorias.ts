import { useQuery } from '@tanstack/react-query';
import { api } from './apiClient';

export const AUDITORIAS_KEY = ['auditorias'] as const;

interface AuditoriaFilters {
  entidad?: string;
  accion?: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  usuarioId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  pagina?: number;
  limite?: number;
}

export function useAuditorias(filters: AuditoriaFilters = {}) {
  return useQuery({
    queryKey: [...AUDITORIAS_KEY, filters],
    queryFn: async () => {
      const res = await api.AuditoriaController_findAll(
        filters.entidad,
        filters.accion,
        filters.usuarioId,
        filters.fechaDesde,
        filters.fechaHasta,
        filters.pagina,
        filters.limite,
      );
      return res.data;
    },
  });
}

export function useAuditoriaByEntidad(entidad: string, id: string) {
  return useQuery({
    queryKey: [...AUDITORIAS_KEY, entidad, id],
    queryFn: async () => {
      const res = await api.AuditoriaController_findByEntidadId(entidad, id);
      return res.data;
    },
    enabled: !!entidad && !!id,
  });
}
