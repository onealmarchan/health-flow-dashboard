import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './apiClient';
import type {
  CreateCita_MedicaDTO,
  UpdateCita_MedicaDTO,
  CreateMotivoConsultaDTO,
  UpdateMotivoConsultaDTO,
} from '@/api';

export const CITAS_KEY = ['citas'] as const;
export const MOTIVOS_KEY = ['motivos-consulta'] as const;

export function normalizeCitasPayload(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  if (payload && Array.isArray(payload.items)) return payload.items;
  if (payload && Array.isArray(payload.citas)) return payload.citas;
  if (payload && Array.isArray(payload.results)) return payload.results;
  if (payload && Array.isArray(payload.content)) return payload.content;
  if (payload && Array.isArray(payload.records)) return payload.records;
  if (payload && typeof payload === 'object') {
    for (const value of Object.values(payload)) {
      if (Array.isArray(value)) return value as any[];
    }
  }
  return [];
}

export function buildCreateCitaPayload(params: {
  pacienteId: number;
  sesionId: number;
  motivoId: number;
  fecha: string;
  hora: string;
  tipoCita: string;
  estadoCita?: string;
  estadoCaso?: string;
  remitido?: boolean;
}) {
  return {
    fk_ps_b001_num_paciente: params.pacienteId,
    fk_cm_b005_num_sesion: params.sesionId,
    fk_cm_b004_num_motivo_consulta: params.motivoId,
    estado_cita: (params.estadoCita ?? 'agendada') as 'agendada' | 'atendida' | 'cancelada',
    fecha: params.fecha,
    hora: params.hora,
    tipo_cita: (() => {
      const v = (params.tipoCita || 'control').toString().trim().toLowerCase();
      if (!v) return 'control';
      if (v === 'control' || v === 'cont') return 'control';
      if (v === 'emergencia' || v === 'urgencia' || v === 'emerg') return 'emergencia';
      // normalize many variants to 'primera vez'
      if (v === 'primera vez' || v === 'primera_vez' || v === 'primera-vez' || v === 'primera' || v === 'primera.vez') return 'primera vez';
      // fallback: if it contains 'prim' assume primera vez
      if (v.includes('prim')) return 'primera vez';
      return 'control';
    })() as 'control' | 'primera vez' | 'emergencia',
    estado_caso: (params.estadoCaso ?? 'nuevo') as 'nuevo' | 'sucesivo',
    remitido: Boolean(params.remitido),
  };
}

// ===== CITAS MÉDICAS =====

export function useCitas() {
  return useQuery({
    queryKey: CITAS_KEY,
    queryFn: async () => {
      const res = await api.CitaMedicaController_getAllCitas();
      return normalizeCitasPayload(res.data);
    },
  });
}

export function useCitaById(id: number) {
  return useQuery({
    queryKey: [...CITAS_KEY, id],
    queryFn: async () => {
      const res = await api.CitaMedicaController_getCitaById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateCita() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCita_MedicaDTO) => {
      const res = await api.CitaMedicaController_createCita(data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CITAS_KEY }),
  });
}

export function useUpdateCita() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateCita_MedicaDTO }) => {
      const res = await api.CitaMedicaController_updateCita(id, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CITAS_KEY }),
  });
}

export function useDeleteCita() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.CitaMedicaController_deleteCita(id);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CITAS_KEY }),
  });
}

// ===== MOTIVOS DE CONSULTA =====

export function useMotivosConsulta() {
  return useQuery({
    queryKey: MOTIVOS_KEY,
    queryFn: async () => {
      const res = await api.MotivoConsultaController_findAll();
      return res.data as any[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateMotivoConsulta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateMotivoConsultaDTO) => {
      const res = await api.MotivoConsultaController_create(data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: MOTIVOS_KEY }),
  });
}

export function useUpdateMotivoConsulta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateMotivoConsultaDTO }) => {
      const res = await api.MotivoConsultaController_update(id, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: MOTIVOS_KEY }),
  });
}
