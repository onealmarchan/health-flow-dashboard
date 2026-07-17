import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './apiClient';
import type {
  CreateMedicoDTO,
  UpdateMedicoDTO,
  createEspecialidadDTO,
  updateEspecialidadDTO,
} from '@/api';

export const MEDICOS_KEY = ['medicos'] as const;
export const ESPECIALIDADES_KEY = ['especialidades'] as const;

// ===== MÉDICOS =====

export function useMedicos() {
  return useQuery({
    queryKey: MEDICOS_KEY,
    queryFn: async () => {
      const res = await api.MedicoController_getAllMedicos();
      return res.data as any[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useMedicoById(id: number) {
  return useQuery({
    queryKey: [...MEDICOS_KEY, id],
    queryFn: async () => {
      const res = await api.MedicoController_getMedicoById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateMedico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateMedicoDTO) => {
      const res = await api.MedicoController_createMedico(data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: MEDICOS_KEY }),
  });
}

export function useUpdateMedico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateMedicoDTO }) => {
      const res = await api.MedicoController_updateMedico(id, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: MEDICOS_KEY }),
  });
}

export function useDeleteMedico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.MedicoController_deleteMedico(id);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: MEDICOS_KEY }),
  });
}

// ===== ESPECIALIDADES =====

export function useEspecialidades() {
  return useQuery({
    queryKey: ESPECIALIDADES_KEY,
    queryFn: async () => {
      const res = await api.EspecialidadController_getAllEspecialidades();
      return res.data as any[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateEspecialidad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: createEspecialidadDTO) => {
      const res = await api.EspecialidadController_createEspecialidad(data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ESPECIALIDADES_KEY }),
  });
}

export function useUpdateEspecialidad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: updateEspecialidadDTO }) => {
      const res = await api.EspecialidadController_updateEspecialidad(id, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ESPECIALIDADES_KEY }),
  });
}

export function useDeleteEspecialidad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.EspecialidadController_deleteEspecialidad(id);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ESPECIALIDADES_KEY }),
  });
}
