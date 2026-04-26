import { api } from './api';
import { MotivoConsulta, CreateMotivoConsultaDto, UpdateMotivoConsultaDto } from '@/types';

export const motivoConsultaService = {
  // Obtener todos los motivos de consulta
  getAll: () => api.get<MotivoConsulta[]>('/motivo-consulta'),
  
  // Obtener motivo de consulta por ID
  getById: (id: number) => api.get<MotivoConsulta>(`/motivo-consulta/${id}`),
  
  // Obtener motivos de consulta por cédula de paciente
  getByPacienteCi: (ci: string) => api.get<MotivoConsulta[]>(`/motivo-consulta/paciente/${ci}`),
  
  // Crear nuevo motivo de consulta
  create: (data: CreateMotivoConsultaDto) => api.post<MotivoConsulta>('/motivo-consulta', data),
  
  // Actualizar motivo de consulta
  update: (id: number, data: UpdateMotivoConsultaDto) => api.patch<MotivoConsulta>(`/motivo-consulta/${id}`, data),
  
  // Eliminar motivo de consulta
  delete: (id: number) => api.delete<{ mensaje: string }>(`/motivo-consulta/${id}`),
};