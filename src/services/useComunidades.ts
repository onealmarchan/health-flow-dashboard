import { useQuery } from '@tanstack/react-query';
import { api } from './apiClient';

export const COMUNIDADES_KEY = ['comunidades'] as const;

export function useComunidades() {
  return useQuery({
    queryKey: COMUNIDADES_KEY,
    queryFn: async () => {
      const res = await api.ComunidadController_getAllComunidades();
      return res.data as any[];
    },
    staleTime: 10 * 60 * 1000, // cache 10 mins — data rarely changes
  });
}
