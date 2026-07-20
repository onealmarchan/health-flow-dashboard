import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { api } from './apiClient';
import type {
  CreateDiagnosticoEnfermedadDTO,
  UpdateDiagnosticoEnfermedadDTO,
  createEnfermedadDTO,
  createSintomaDTO,
} from '@/api';

export const PLACEHOLDER_NAME = 'Pendiente por determinar';

export const DIAGNOSTICOS_KEY = ['diagnosticos'] as const;
export const ENFERMEDADES_KEY = ['enfermedades'] as const;
export const SINTOMAS_KEY = ['sintomas'] as const;

// ===== DIAGNÓSTICOS DE ENFERMEDADES =====

export function useDiagnosticos() {
  return useQuery({
    queryKey: DIAGNOSTICOS_KEY,
    queryFn: async () => {
      const res = await api.DiagnosticoEnfermedadController_findAll();
      return res.data as any[];
    },
  });
}

export function useCreateDiagnostico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateDiagnosticoEnfermedadDTO) => {
      const res = await api.DiagnosticoEnfermedadController_create(data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: DIAGNOSTICOS_KEY }),
  });
}

export function useUpdateDiagnostico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateDiagnosticoEnfermedadDTO }) => {
      const res = await api.DiagnosticoEnfermedadController_updateAll(id, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: DIAGNOSTICOS_KEY }),
  });
}

export function useDeleteDiagnostico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.DiagnosticoEnfermedadController_remove(id);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: DIAGNOSTICOS_KEY }),
  });
}

// ===== ENFERMEDADES =====

export function useEnfermedades() {
  return useQuery({
    queryKey: ENFERMEDADES_KEY,
    queryFn: async () => {
      const res = await api.EnfermedadController_getAllEnfermedades();
      return res.data as any[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateEnfermedad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: createEnfermedadDTO) => {
      const res = await api.EnfermedadController_createEnfermedad(data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ENFERMEDADES_KEY }),
  });
}

// ===== SÍNTOMAS =====

export function useSintomas() {
  return useQuery({
    queryKey: SINTOMAS_KEY,
    queryFn: async () => {
      const res = await api.SintomaController_getAllSintomas();
      return res.data as any[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateSintoma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: createSintomaDTO) => {
      const res = await api.SintomaController_createSintoma(data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: SINTOMAS_KEY }),
  });
}

// ===== DIAGNÓSTICO-SÍNTOMA (asociar síntoma a diagnóstico) =====

export const DIAGNOSTICO_SINTOMA_KEY = ['diagnostico-sintoma'] as const;

export function useCreateDiagnosticoSintoma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { fk_cm_b003_num_diagnostico: number; fk_cm_a003_num_sintoma: number }) => {
      const res = await api.DiagnosticoSintomaController_create(data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DIAGNOSTICO_SINTOMA_KEY });
      qc.invalidateQueries({ queryKey: DIAGNOSTICOS_KEY });
    },
  });
}

export function useDiagnosticoSintomas() {
  return useQuery({
    queryKey: DIAGNOSTICO_SINTOMA_KEY,
    queryFn: async () => {
      const res = await api.DiagnosticoSintomaController_getAll();
      return res.data as any[];
    },
  });
}

// ===== PLACEHOLDER ENFERMEDAD (diagnóstico inicial sin enfermedad definitiva) =====

export function usePlaceholderEnfermedad() {
  const { data: enfermedades = [], isLoading } = useEnfermedades();
  const createEnfermedadMut = useCreateEnfermedad();
  const [creationAttempted, setCreationAttempted] = useState(false);

  const placeholder = useMemo(() => {
    return enfermedades.find(
      (e: any) => e.nombre === PLACEHOLDER_NAME
    );
  }, [enfermedades]);

  const placeholderId = placeholder
    ? Number(placeholder.pk_num_enfermedad || placeholder.id)
    : undefined;

  useEffect(() => {
    if (!isLoading && !placeholder && !creationAttempted && !createEnfermedadMut.isPending) {
      setCreationAttempted(true);
      createEnfermedadMut.mutate(
        {
          nombre: PLACEHOLDER_NAME,
          enfermedad_cronica: false,
          descripcion: 'Diagnóstico inicial pendiente de determinación por especialista',
        },
        {
          onError: () => {
            // 409 = already exists → query refetch will find it
            setCreationAttempted(false);
          },
        },
      );
    }
  }, [isLoading, placeholder, creationAttempted, createEnfermedadMut]);

  return { placeholderId, isLoading: isLoading || createEnfermedadMut.isPending };
}
