import { useDemoStore, type HistorialEntry as StoreHistorial, type AccionRealizada as StoreAccion } from '@/store/useDemoStore';

export type HistorialEntry = StoreHistorial;
export type AccionRealizada = StoreAccion;

export const useHistorial = () => useDemoStore(s => s.historial);
