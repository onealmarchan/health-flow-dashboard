import { api } from './api';
import { Especialidad, CreateEspecialidadDto, UpdateEspecialidadDto } from '@/types';

export const especialidadService = {
  // Obtener todas las especialidades
  getAll: () => api.get<Especialidad[]>('/especialidad'),
  
  // Obtener especialidad por ID
  getById: (id: number) => api.get<Especialidad>(`/especialidad/${id}`),
  
  // Crear nueva especialidad
  create: (data: CreateEspecialidadDto) => api.post<Especialidad>('/especialidad', data),
  
  // Actualizar especialidad
  update: (id: number, data: UpdateEspecialidadDto) => api.patch<Especialidad>(`/especialidad/${id}`, data),
  
  // Eliminar especialidad
  delete: (id: number) => api.delete<{ mensaje: string }>(`/especialidad/${id}`),
};