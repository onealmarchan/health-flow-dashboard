import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './apiClient';
import { useCurrentUser } from './useCurrentUser';

function buildNotificacionesKey(userId: number | null) {
  return ['notificaciones', userId ?? 'anonymous'] as const;
}

function extractId(n: any): number {
  return Number(n.id ?? n.pk_num_notificacion ?? n.pk_num_mensaje ?? 0);
}

export function useNotificacionesKey() {
  const user = useCurrentUser();
  return buildNotificacionesKey(user?.id ?? null);
}

export function useNotificaciones() {
  const user = useCurrentUser();
  const queryKey = buildNotificacionesKey(user?.id ?? null);

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const res = await api.NotificacionController_obtenerTodas();
        return res.data as any[];
      } catch {
        return [];
      }
    },
    refetchInterval: 30_000,
    enabled: !!user,
  });
}

export function useMarkNotificacionAsRead() {
  const qc = useQueryClient();
  const user = useCurrentUser();
  const queryKey = buildNotificacionesKey(user?.id ?? null);

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.NotificacionController_marcarLeida(id);
      return res.data;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey });
      const previous = qc.getQueryData<any[]>(queryKey);
      qc.setQueryData(queryKey, (old: any[] = []) =>
        old.map(n => extractId(n) === id ? { ...n, leida: true, leido: true, read: true, visto: true } : n)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) qc.setQueryData(buildNotificacionesKey(user?.id ?? null), context.previous);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: buildNotificacionesKey(user?.id ?? null) });
    },
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  const user = useCurrentUser();
  const queryKey = buildNotificacionesKey(user?.id ?? null);

  return useMutation({
    mutationFn: async () => {
      const res = await api.NotificacionController_marcarTodasLeidas();
      return res.data;
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey });
      const previous = qc.getQueryData<any[]>(queryKey);
      qc.setQueryData(queryKey, (old: any[] = []) =>
        old.map(n => ({ ...n, leida: true, leido: true, read: true, visto: true }))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(buildNotificacionesKey(user?.id ?? null), context.previous);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: buildNotificacionesKey(user?.id ?? null) });
    },
  });
}

export function useDeleteNotificacion() {
  const qc = useQueryClient();
  const user = useCurrentUser();
  const queryKey = buildNotificacionesKey(user?.id ?? null);

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.NotificacionController_eliminar(id);
      return res.data;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey });
      const previous = qc.getQueryData<any[]>(queryKey);
      qc.setQueryData(queryKey, (old: any[] = []) =>
        old.filter(n => extractId(n) !== id)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) qc.setQueryData(buildNotificacionesKey(user?.id ?? null), context.previous);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: buildNotificacionesKey(user?.id ?? null) });
    },
  });
}

export function useDeleteAllNotificaciones() {
  const qc = useQueryClient();
  const user = useCurrentUser();
  const queryKey = buildNotificacionesKey(user?.id ?? null);
  let cachedNotifs: any[] = [];

  return useMutation({
    mutationFn: async () => {
      if (cachedNotifs.length === 0) return;
      await Promise.allSettled(
        cachedNotifs.map(n => api.NotificacionController_eliminar(extractId(n)))
      );
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey });
      const previous = qc.getQueryData<any[]>(queryKey);
      cachedNotifs = previous || [];
      qc.setQueryData(queryKey, []);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(buildNotificacionesKey(user?.id ?? null), context.previous);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: buildNotificacionesKey(user?.id ?? null) });
    },
  });
}
