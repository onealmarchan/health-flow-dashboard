import { api } from './api';
import { Paciente, CreatePacienteDto, UpdatePacienteDto } from '@/types';

export const pacienteService = {
  // Obtener todos los pacientes
  getAll: () => api.get<Paciente[]>('/paciente'),
  
  // Obtener paciente por ID
  getById: (id: number) => api.get<Paciente>(`/paciente/${id}`),
  
  // Crear nuevo paciente
  create: (data: CreatePacienteDto) => api.post<Paciente>('/paciente', data),
  
  // Actualizar paciente
  update: (id: number, data: UpdatePacienteDto) => api.patch<Paciente>(`/paciente/${id}`, data),
  
  // Eliminar paciente
  delete: (id: number) => api.delete<{ mensaje: string }>(`/paciente/${id}`),
  
  // Obtener citas médicas del paciente
  getCitasMedicas: (id: number) => api.get(`/paciente/${id}/citas-medicas`),
  
  // Obtener diagnósticos del paciente
  getDiagnosticos: (id: number) => api.get(`/paciente/${id}/diagnosticos`),
};