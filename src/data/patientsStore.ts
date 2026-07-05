import { useDemoStore, type Patient as StorePatient } from '@/store/useDemoStore';

export type Patient = StorePatient;

export const usePatients = () => useDemoStore(s => s.patients);
export const getPatients = () => useDemoStore.getState().patients;
export const addPatient = (p: Omit<Patient, 'num' | 'createdAt'>) =>
  useDemoStore.getState().addPatient(p);
export const updatePatient = (num: number, patch: Partial<Patient>) =>
  useDemoStore.getState().updatePatient(num, patch);
