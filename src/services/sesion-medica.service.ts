import { api } from './api';
import { SesionMedica, CreateSesionMedicaDto, UpdateSesionMedicaDto } from '@/types';

export const sesionMedicaService = {
  // Obtener todas las sesiones médicas
  getAll: () => api.get<SesionMedica[]>('/sesion-medica'),
  
  // Obtener sesión médica por ID
  getById: (id: number) => api.get<SesionMedica>(`/sesion-medica/${id}`),
  
  // Obtener sesiones médicas por médico
  getByMedico: (medicoId: number) => api.get<SesionMedica[]>(`/sesion-medica/medico/${medicoId}`),
  
  // Crear nueva sesión médica
  create: (data: CreateSesionMedicaDto) => api.post<SesionMedica>('/sesion-medica', data),
  
  // Actualizar sesión médica
  update: (id: number, data: UpdateSesionMedicaDto) => api.patch<SesionMedica>(`/sesion-medica/${id}`, data),
  
  // Eliminar sesión médica
  delete: (id: number) => api.delete<{ mensaje: string }>(`/sesion-medica/${id}`),
};