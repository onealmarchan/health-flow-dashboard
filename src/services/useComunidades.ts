import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './apiClient';
import type { CreateComunidadDTO } from '@/api';

export const COMUNIDADES_KEY = ['comunidades'] as const;

export function useComunidades() {
  return useQuery({
    queryKey: COMUNIDADES_KEY,
    queryFn: async () => {
      const res = await api.ComunidadController_getAllComunidades();
      return res.data as any[];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateComunidad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateComunidadDTO) => {
      const res = await api.ComunidadController_createComunidad(data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: COMUNIDADES_KEY }),
  });
}
