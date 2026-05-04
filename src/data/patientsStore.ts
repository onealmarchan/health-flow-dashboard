import { useSyncExternalStore } from 'react';

export type Patient = {
  num: number;
  ci: string;
  nombres: string;
  apellidos: string;
  fechaNac: string;
  sexo: 'M' | 'F';
  direccion: string;
  telefono: string;
  nacionalidad: 'Venezolano' | 'Extranjero' | string;
  estadoCivil: string;
  estado: 'Activo' | 'Encamado' | string;
  comunidad: string;
  estadoGeo: string;
  municipio: string;
  parroquia: string;
};

let _patients: Patient[] = [
  { num: 1, ci: '12345678', nombres: 'María', apellidos: 'García López', fechaNac: '1990-05-15', sexo: 'F', direccion: 'Calle 1', telefono: '555-0101', nacionalidad: 'Venezolano', estadoCivil: 'Soltero/a', estado: 'Activo', comunidad: 'Centro', estadoGeo: 'Caracas', municipio: 'Libertador', parroquia: 'San Pedro' },
  { num: 2, ci: '23456789', nombres: 'Carlos', apellidos: 'Ruiz Pérez', fechaNac: '1985-08-22', sexo: 'M', direccion: 'Calle 2', telefono: '555-0102', nacionalidad: 'Venezolano', estadoCivil: 'Casado/a', estado: 'Activo', comunidad: 'Norte', estadoGeo: 'Miranda', municipio: 'Sucre', parroquia: 'Petare' },
  { num: 3, ci: '34567890', nombres: 'Ana', apellidos: 'Torres Díaz', fechaNac: '1978-12-03', sexo: 'F', direccion: 'Calle 3', telefono: '555-0103', nacionalidad: 'Venezolano', estadoCivil: 'Casado/a', estado: 'Encamado', comunidad: 'Sur', estadoGeo: 'Caracas', municipio: 'Libertador', parroquia: 'El Valle' },
  { num: 4, ci: '45678901', nombres: 'Pedro', apellidos: 'Fernández Gil', fechaNac: '1995-03-10', sexo: 'M', direccion: 'Calle 4', telefono: '555-0104', nacionalidad: 'Extranjero', estadoCivil: 'Soltero/a', estado: 'Activo', comunidad: 'Este', estadoGeo: 'Vargas', municipio: 'Vargas', parroquia: 'Maiquetía' },
  { num: 5, ci: '56789012', nombres: 'Laura', apellidos: 'Jiménez Soto', fechaNac: '1992-07-19', sexo: 'F', direccion: 'Av. Bolívar 22', telefono: '555-0105', nacionalidad: 'Venezolano', estadoCivil: 'Divorciado/a', estado: 'Activo', comunidad: 'Oeste', estadoGeo: 'Caracas', municipio: 'Libertador', parroquia: 'La Pastora' },
];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());

export const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const getPatients = () => _patients;

export const addPatient = (p: Omit<Patient, 'num'>) => {
  const num = (_patients.at(-1)?.num ?? 0) + 1;
  _patients = [..._patients, { ...p, num }];
  emit();
};

export const usePatients = () => useSyncExternalStore(subscribe, getPatients, getPatients);
