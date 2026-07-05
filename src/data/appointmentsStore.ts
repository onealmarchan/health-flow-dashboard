import { useDemoStore, type Appointment as StoreAppointment } from '@/store/useDemoStore';

export type Appointment = StoreAppointment;

export const useAppointments = () => useDemoStore(s => s.appointments);
export const getAppointments = () => useDemoStore.getState().appointments;
export const addAppointment = (a: Omit<Appointment, 'id' | 'createdAt'>) =>
  useDemoStore.getState().addAppointment(a);
export const updateAppointment = (id: number, patch: Partial<Appointment>) =>
  useDemoStore.getState().updateAppointment(id, patch);
export const removeAppointment = (id: number) =>
  useDemoStore.getState().removeAppointment(id);
