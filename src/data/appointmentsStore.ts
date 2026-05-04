import { useSyncExternalStore } from 'react';

export type Appointment = {
  id: number;
  patient: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: 'confirmada' | 'pendiente' | 'cancelada' | string;
};

let _appointments: Appointment[] = [
  { id: 1, patient: 'María García', doctor: 'Dr. López', specialty: 'Cardiología', date: '2024-01-28', time: '09:00', status: 'confirmada' },
  { id: 2, patient: 'Carlos Ruiz', doctor: 'Dra. Martínez', specialty: 'Pediatría', date: '2024-01-28', time: '09:30', status: 'pendiente' },
  { id: 3, patient: 'Ana Torres', doctor: 'Dr. Sánchez', specialty: 'Dermatología', date: '2024-01-28', time: '10:00', status: 'confirmada' },
  { id: 4, patient: 'Pedro Fernández', doctor: 'Dra. Díaz', specialty: 'Neurología', date: '2024-01-28', time: '10:30', status: 'cancelada' },
  { id: 5, patient: 'Laura Jiménez', doctor: 'Dr. López', specialty: 'Cardiología', date: '2024-01-28', time: '11:00', status: 'confirmada' },
];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

export const getAppointments = () => _appointments;
export const addAppointment = (a: Omit<Appointment, 'id'>) => {
  const id = (_appointments.at(-1)?.id ?? 0) + 1;
  _appointments = [..._appointments, { ...a, id }];
  emit();
};
export const useAppointments = () => useSyncExternalStore(subscribe, getAppointments, getAppointments);
