import { api } from './api';
import { DiagnosticoEnfermedad, CreateDiagnosticoEnfermedadDto, UpdateDiagnosticoEnfermedadDto } from '@/types';

// Extendemos el DTO para incluir los campos que la UI recopila y asumiendo que el backend los interceptará
export interface DiagnosticoCompletoPayload extends CreateDiagnosticoEnfermedadDto {
  sintomas?: { nombre: string; descripcion: string; gravedad: number }[];
  motivo?: string;
  urgencia?: boolean;
}

export const diagnosticoService = {
  // Obtener todos los diagnósticos
  getAll: () => api.get<any[]>('/diagnostico-enfermedad'),
  
  // Obtener diagnóstico por ID
  getById: (id: number) => api.get<any>(`/diagnostico-enfermedad/${id}`),
  
  // Crear nuevo diagnóstico
  create: (data: any) => api.post<any>('/diagnostico-enfermedad', data),
  
  // Actualizar diagnóstico
  update: (id: number, data: any) => api.patch<any>(`/diagnostico-enfermedad/${id}`, data),
  
  // Eliminar diagnóstico
  delete: (id: number) => api.delete<{ mensaje: string }>(`/diagnostico-enfermedad/${id}`),
};
