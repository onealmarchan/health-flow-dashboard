import { useDemoStore, type HistorialEntry as StoreHistorial, type AccionRealizada as StoreAccion } from '@/store/useDemoStore';

export type HistorialEntry = StoreHistorial;
export type AccionRealizada = StoreAccion;

export const useHistorial = () => useDemoStore(s => s.historial);

// Legacy proxy so existing `historialMock` reads stay dynamic.
export const historialMock: HistorialEntry[] = new Proxy([] as HistorialEntry[], {
  get(_t, prop) {
    const arr = useDemoStore.getState().historial;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (arr as any)[prop];
  },
});
