import { useSyncExternalStore } from 'react';

export type Especialista = {
  id: number;
  mpps: string; // e.g. MPPS-001
  nombre: string;
  apellido: string;
  especialidad: string;
  pacientes: number; // carga de pacientes
  telefono: string;
  disponible: boolean;
  fechaIngreso: string; // YYYY-MM-DD
};

let _list: Especialista[] = [
  { id: 1, mpps: 'MPPS-001', nombre: 'Juan',   apellido: 'López',     especialidad: 'Cardiología',    pacientes: 245, telefono: '555-0101', disponible: true,  fechaIngreso: '2022-03-15' },
  { id: 2, mpps: 'MPPS-002', nombre: 'Ana',    apellido: 'Martínez',  especialidad: 'Pediatría',      pacientes: 312, telefono: '555-0102', disponible: true,  fechaIngreso: '2021-07-22' },
  { id: 3, mpps: 'MPPS-003', nombre: 'Carlos', apellido: 'Sánchez',   especialidad: 'Dermatología',   pacientes: 189, telefono: '555-0103', disponible: false, fechaIngreso: '2023-01-10' },
  { id: 4, mpps: 'MPPS-004', nombre: 'María',  apellido: 'Díaz',      especialidad: 'Neurología',     pacientes: 156, telefono: '555-0104', disponible: true,  fechaIngreso: '2020-11-05' },
  { id: 5, mpps: 'MPPS-005', nombre: 'Pedro',  apellido: 'Torres',    especialidad: 'Traumatología',  pacientes: 278, telefono: '555-0105', disponible: true,  fechaIngreso: '2019-09-30' },
  { id: 6, mpps: 'MPPS-006', nombre: 'Laura',  apellido: 'Fernández', especialidad: 'Ginecología',    pacientes: 298, telefono: '555-0106', disponible: true,  fechaIngreso: '2022-06-18' },
];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

export const getEspecialistas = () => _list;
export const addEspecialista = (e: Omit<Especialista, 'id'>) => {
  const id = (_list.at(-1)?.id ?? 0) + 1;
  _list = [..._list, { ...e, id }];
  emit();
};
export const useEspecialistas = () => useSyncExternalStore(subscribe, getEspecialistas, getEspecialistas);
