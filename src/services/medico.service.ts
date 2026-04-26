import { api } from './api';
import { Medico, CreateMedicoDto, UpdateMedicoDto } from '@/types';

export const medicoService = {
  // Obtener todos los médicos
  getAll: () => api.get<Medico[]>('/medico'),
  
  // Obtener médico por ID (número de registro del Ministerio de Salud)
  getById: (id: number) => api.get<Medico>(`/medico/${id}`),
  
  // Crear nuevo médico
  create: (data: CreateMedicoDto) => api.post<Medico>('/medico', data),
  
  // Actualizar médico
  update: (id: number, data: UpdateMedicoDto) => api.patch<Medico>(`/medico/${id}`, data),
  
  // Eliminar médico
  delete: (id: number) => api.delete<{ mensaje: string }>(`/medico/${id}`),
};