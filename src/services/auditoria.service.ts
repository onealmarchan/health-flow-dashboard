import { api } from './api';
import { Auditoria, QueryAuditoriaDto } from '@/types';

export const auditoriaService = {
  // Obtener todos los registros de auditoría con filtros opcionales
  getAll: (params?: QueryAuditoriaDto) => api.get<Auditoria[]>('/auditoria', { params }),
  
  // Obtener historial de un registro específico por entidad e ID
  getByEntidadId: (entidad: string, id: string) => api.get<Auditoria[]>(`/auditoria/${entidad}/${id}`),
};