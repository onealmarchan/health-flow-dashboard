import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './apiClient';
import type { CreatePacienteDTO, UpdatePacienteDTO } from '@/api';

export const PACIENTES_KEY = ['pacientes'] as const;

export function usePacientes() {
  return useQuery({
    queryKey: PACIENTES_KEY,
    queryFn: async () => {
      const res = await api.PacienteController_getAllPacientes();
      return res.data as any[];
    },
  });
}

export function usePacienteById(id: number) {
  return useQuery({
    queryKey: [...PACIENTES_KEY, id],
    queryFn: async () => {
      const res = await api.PacienteController_getPacienteById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreatePaciente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePacienteDTO) => {
      const res = await api.PacienteController_createPaciente(data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: PACIENTES_KEY }),
  });
}

export function useUpdatePaciente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdatePacienteDTO }) => {
      const res = await api.PacienteController_updatePaciente(id, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: PACIENTES_KEY }),
  });
}

export function useDeletePaciente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.PacienteController_deletePaciente(id);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: PACIENTES_KEY }),
  });
}
