import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './apiClient';

export const NOTIFICACIONES_KEY = ['notificaciones'] as const;

function extractId(n: any): number {
  return Number(n.id ?? n.pk_num_notificacion ?? n.pk_num_mensaje ?? 0);
}

export function useNotificaciones() {
  return useQuery({
    queryKey: NOTIFICACIONES_KEY,
    queryFn: async () => {
      try {
        const res = await api.NotificacionController_obtenerTodas();
        return res.data as any[];
      } catch {
        return [];
      }
    },
    refetchInterval: 30_000,
  });
}

export function useMarkNotificacionAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.NotificacionController_marcarLeida(id);
      return res.data;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: NOTIFICACIONES_KEY });
      const previous = qc.getQueryData<any[]>(NOTIFICACIONES_KEY);
      qc.setQueryData(NOTIFICACIONES_KEY, (old: any[] = []) =>
        old.map(n => extractId(n) === id ? { ...n, leida: true, leido: true, read: true, visto: true } : n)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) qc.setQueryData(NOTIFICACIONES_KEY, context.previous);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFICACIONES_KEY });
    },
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.NotificacionController_marcarTodasLeidas();
      return res.data;
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: NOTIFICACIONES_KEY });
      const previous = qc.getQueryData<any[]>(NOTIFICACIONES_KEY);
      qc.setQueryData(NOTIFICACIONES_KEY, (old: any[] = []) =>
        old.map(n => ({ ...n, leida: true, leido: true, read: true, visto: true }))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(NOTIFICACIONES_KEY, context.previous);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFICACIONES_KEY });
    },
  });
}

export function useDeleteNotificacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.NotificacionController_eliminar(id);
      return res.data;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: NOTIFICACIONES_KEY });
      const previous = qc.getQueryData<any[]>(NOTIFICACIONES_KEY);
      qc.setQueryData(NOTIFICACIONES_KEY, (old: any[] = []) =>
        old.filter(n => extractId(n) !== id)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) qc.setQueryData(NOTIFICACIONES_KEY, context.previous);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFICACIONES_KEY });
    },
  });
}

export function useDeleteAllNotificaciones() {
  const qc = useQueryClient();
  let cachedNotifs: any[] = [];
  return useMutation({
    mutationFn: async () => {
      if (cachedNotifs.length === 0) return;
      await Promise.allSettled(
        cachedNotifs.map(n => api.NotificacionController_eliminar(extractId(n)))
      );
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: NOTIFICACIONES_KEY });
      const previous = qc.getQueryData<any[]>(NOTIFICACIONES_KEY);
      cachedNotifs = previous || [];
      qc.setQueryData(NOTIFICACIONES_KEY, []);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(NOTIFICACIONES_KEY, context.previous);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFICACIONES_KEY });
    },
  });
}
