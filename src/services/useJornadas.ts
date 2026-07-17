import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './apiClient';
import type {
  CreateSesionMedicaDTO,
  UpdateSesionMedicaDTO,
  CreateBloqueoAgendaDTO,
  UpdateBloqueoAgendaDTO,
} from '@/api';

export const SESIONES_KEY = ['sesiones-medicas'] as const;
export const BLOQUEOS_KEY = ['bloqueos-agenda'] as const;

export function normalizeCollectionPayload(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  if (payload && Array.isArray(payload.items)) return payload.items;
  if (payload && Array.isArray(payload.sesiones)) return payload.sesiones;
  if (payload && Array.isArray(payload.bloqueos)) return payload.bloqueos;
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

export function normalizeDiaSemana(dia: string | undefined): CreateSesionMedicaDTO['dias_semana'] {
  const normalized = (dia || '').trim().toLowerCase();
  const mapping: Record<string, CreateSesionMedicaDTO['dias_semana']> = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miercoles',
    miércoles: 'Miercoles',
    miécoles: 'Miercoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sabado',
    sábado: 'Sabado',
    domingo: 'Domingo',
    lun: 'Lunes',
    mar: 'Martes',
    mie: 'Miercoles',
    mié: 'Miercoles',
    jue: 'Jueves',
    vie: 'Viernes',
    sab: 'Sabado',
    dom: 'Domingo',
  };

  return mapping[normalized] ?? 'Lunes';
}

export function normalizeTurno(turno: string | undefined): CreateSesionMedicaDTO['turno'] {
  const normalized = (turno || '').trim().toLowerCase();
  if (normalized === 'tarde') return 'tarde';
  if (normalized === 'noche') return 'noche';
  return 'mañana';
}

export function buildCreateSesionPayload(params: {
  medicoId: number;
  turno: string;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
}) {
  return {
    fk_cm_b001_num_medico_ministerio_salud: params.medicoId,
    turno: normalizeTurno(params.turno),
    dias_semana: normalizeDiaSemana(params.diaSemana),
    hora_inicio: params.horaInicio,
    hora_fin: params.horaFin,
  } satisfies CreateSesionMedicaDTO;
}

// ===== SESIONES MÉDICAS =====

export function useSesionesMedicas() {
  return useQuery({
    queryKey: SESIONES_KEY,
    queryFn: async () => {
      const res = await api.SesionMedicaController_findAll();
      return normalizeCollectionPayload(res.data);
    },
  });
}

export function useSesionesByMedico(medicoId: number) {
  return useQuery({
    queryKey: [...SESIONES_KEY, 'medico', medicoId],
    queryFn: async () => {
      const res = await api.SesionMedicaController_findByMedico(medicoId);
      return normalizeCollectionPayload(res.data);
    },
    enabled: !!medicoId,
  });
}

export function useCreateSesion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSesionMedicaDTO) => {
      const res = await api.SesionMedicaController_create(data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: SESIONES_KEY }),
  });
}

export function useUpdateSesion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateSesionMedicaDTO }) => {
      const res = await api.SesionMedicaController_update(id, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: SESIONES_KEY }),
  });
}

export function useDeleteSesion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.SesionMedicaController_remove(id);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: SESIONES_KEY }),
  });
}

// ===== BLOQUEOS DE AGENDA =====

export function useBloqueos() {
  return useQuery({
    queryKey: BLOQUEOS_KEY,
    queryFn: async () => {
      const res = await api.BloqueoAgendaController_findAll();
      return normalizeCollectionPayload(res.data);
    },
  });
}

export function useBloqueosByMedico(medicoId: number) {
  return useQuery({
    queryKey: [...BLOQUEOS_KEY, 'medico', medicoId],
    queryFn: async () => {
      const res = await api.BloqueoAgendaController_findByMedico(medicoId);
      return normalizeCollectionPayload(res.data);
    },
    enabled: !!medicoId,
  });
}

export function useCreateBloqueo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateBloqueoAgendaDTO) => {
      const res = await api.BloqueoAgendaController_create(data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: BLOQUEOS_KEY }),
  });
}

export function useUpdateBloqueo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateBloqueoAgendaDTO }) => {
      const res = await api.BloqueoAgendaController_update(id, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: BLOQUEOS_KEY }),
  });
}

export function useDeleteBloqueo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.BloqueoAgendaController_remove(id);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: BLOQUEOS_KEY }),
  });
}
