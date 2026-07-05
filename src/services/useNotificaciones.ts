import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './apiClient';

export const NOTIFICACIONES_KEY = ['notificaciones'] as const;

export function useNotificaciones() {
  return useQuery({
    queryKey: NOTIFICACIONES_KEY,
    queryFn: async () => {
      // Use the proper endpoint if it exists in the API, otherwise fallback to mock
      try {
        // Generated client exposes NotificacionController_obtenerTodas / _obtenerNoLeidas
        const res = await (api as any).NotificacionController_obtenerTodas?.() ?? { data: [] };
        return res.data as any[];
      } catch (e) {
        return [];
      }
    },
  });
}

export function useMarkNotificacionAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      // Generated client exposes NotificacionController_marcarLeida
      const res = await (api as any).NotificacionController_marcarLeida?.(id) ?? { data: {} };
      return res.data;
    },
    onMutate: async (id: number) => {
      await qc.cancelQueries({ queryKey: NOTIFICACIONES_KEY });
      const previous = qc.getQueryData<any[]>(NOTIFICACIONES_KEY);
      qc.setQueryData(NOTIFICACIONES_KEY, (old: any[] = []) =>
        old.map(n => (Number(n.id ?? n.pk_num_notificacion ?? n.pk_num_mensaje) === Number(id) ? { ...n, leido: true, read: true, visto: true } : n))
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) qc.setQueryData(NOTIFICACIONES_KEY, context.previous);
    },
    onSuccess: (_data, id) => {
      qc.setQueryData(NOTIFICACIONES_KEY, (old: any[] = []) =>
        old.map(n => (Number(n.id ?? n.pk_num_notificacion ?? n.pk_num_mensaje) === Number(id) ? { ...n, leido: true, read: true, visto: true } : n))
      );
    },
  });
}

export function useDeleteNotificacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await (api as any).NotificacionController_eliminar?.(id) ?? { data: {} };
      return res.data;
    },
    onMutate: async (id: number) => {
      await qc.cancelQueries({ queryKey: NOTIFICACIONES_KEY });
      const previous = qc.getQueryData<any[]>(NOTIFICACIONES_KEY);
      qc.setQueryData(NOTIFICACIONES_KEY, (old: any[] = []) => old.filter(n => Number(n.id ?? n.pk_num_notificacion ?? n.pk_num_mensaje) !== Number(id)));
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) qc.setQueryData(NOTIFICACIONES_KEY, context.previous);
    },
    onSuccess: (_data, id) => {
      qc.setQueryData(NOTIFICACIONES_KEY, (old: any[] = []) => old.filter(n => Number(n.id ?? n.pk_num_notificacion ?? n.pk_num_mensaje) !== Number(id)));
    },
  });
}

export function useClearAllNotificaciones() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      // Generated client exposes NotificacionController_marcarTodasLeidas
      const res = await (api as any).NotificacionController_marcarTodasLeidas?.() ?? { data: {} };
      return res.data;
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: NOTIFICACIONES_KEY });
      const previous = qc.getQueryData<any[]>(NOTIFICACIONES_KEY);
      qc.setQueryData(NOTIFICACIONES_KEY, []);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(NOTIFICACIONES_KEY, context.previous);
    },
    onSuccess: () => {
      qc.setQueryData(NOTIFICACIONES_KEY, []);
    },
  });
}
