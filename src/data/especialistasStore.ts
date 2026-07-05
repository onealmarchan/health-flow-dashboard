import { useDemoStore, type Especialista as StoreEspecialista } from '@/store/useDemoStore';

export type Especialista = StoreEspecialista;

export const useEspecialistas = () => useDemoStore(s => s.especialistas);
export const getEspecialistas = () => useDemoStore.getState().especialistas;
export const addEspecialista = (e: Omit<Especialista, 'id' | 'createdAt'>) =>
  useDemoStore.getState().addEspecialista(e);
export const updateEspecialista = (id: number, patch: Partial<Especialista>) =>
  useDemoStore.getState().updateEspecialista(id, patch);
