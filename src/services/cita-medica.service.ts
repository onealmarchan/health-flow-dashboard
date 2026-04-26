import { api } from './api';
import { CitaMedica, CreateCitaMedicaDto, UpdateCitaMedicaDto } from '@/types';

export const citaMedicaService = {
  // Obtener todas las citas médicas
  getAll: () => api.get<CitaMedica[]>('/cita-medica'),
  
  // Obtener cita médica por ID
  getById: (id: number) => api.get<CitaMedica>(`/cita-medica/${id}`),
  
  // Crear nueva cita médica
  create: (data: CreateCitaMedicaDto) => api.post<CitaMedica>('/cita-medica', data),
  
  // Actualizar cita médica
  update: (id: number, data: UpdateCitaMedicaDto) => api.patch<CitaMedica>(`/cita-medica/${id}`, data),
  
  // Eliminar/cancelar cita médica
  delete: (id: number) => api.delete<{ mensaje: string }>(`/cita-medica/${id}`),
};