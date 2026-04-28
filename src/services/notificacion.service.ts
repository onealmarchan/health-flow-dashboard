import { api } from './api';
import { Notificacion } from '@/types';

export const notificacionService = {
  // Obtener todas las notificaciones
  getAll: () => api.get<Notificacion[]>('/notificacion/todas'),

  // Obtener notificaciones no leídas
  getUnread: () =>
    api.get<{ notificaciones: Notificacion[]; total: number }>(
      '/notificacion/no-leidas'
    ),

  // Marcar una notificación como leída
  markAsRead: (id: number) =>
    api.patch<Notificacion>(`/notificacion/leer/${id}`, {}),

  // Marcar todas como leídas
  markAllAsRead: () =>
    api.patch<{ mensaje: string; afectadas: number }>(
      '/notificacion/leer-todas',
      {}
    ),

  // Eliminar una notificación
  delete: (id: number) =>
    api.delete<{ mensaje: string }>(`/notificacion/${id}`),
};
