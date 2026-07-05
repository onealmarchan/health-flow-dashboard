import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './apiClient';
import type { CreateUsuarioDto, UpdateUsuarioDto } from '@/api';

export const USUARIOS_KEY = ['usuarios'] as const;

export function useUsuarios() {
  return useQuery({
    queryKey: USUARIOS_KEY,
    queryFn: async () => {
      const res = await api.UsuarioController_findAll();
      return res.data as any[];
    },
  });
}

export function useCreateUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateUsuarioDto) => {
      const res = await api.UsuarioController_create(data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: USUARIOS_KEY }),
  });
}

export function useUpdateUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateUsuarioDto }) => {
      const res = await api.UsuarioController_update(id, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: USUARIOS_KEY }),
  });
}

export function useToggleUsuarioEstado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.UsuarioController_toggleEstado(id);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: USUARIOS_KEY }),
  });
}
