import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================================================
// Types (mirror existing stores so wrappers can re-export types unchanged)
// ============================================================================

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
  createdAt: number;
};

export type Appointment = {
  id: number;
  patient: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: 'confirmada' | 'pendiente' | 'cancelada' | string;
  createdAt: number;
};

export type Especialista = {
  id: number;
  mpps: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  pacientes: number;
  telefono: string;
  disponible: boolean;
  fechaIngreso: string;
  createdAt: number;
};

export type Rol = 'Administrador' | 'Auxiliar Administrativo';
export type EstadoUsuario = 'Activo' | 'Inhabilitado';

export interface Usuario {
  num: number;
  email: string;
  nombreCompleto: string;
  rol: Rol;
  miembroDesde: string;
  ultimaActualizacion: string;
  estado: EstadoUsuario;
  createdAt: number;
}

export type AccionRealizada = 'Crear' | 'Editar' | 'Eliminar';

export interface HistorialEntry {
  id: number;
  seccion: string;
  registroAfectado: string;
  accion: AccionRealizada;
  cambio: string;
  responsable: string;
  fechaHora: string;
  createdAt: number;
}

export interface AgendaBloqueo {
  id: string;
  mpps: string;
  fechaInicio: string;
  fechaFin: string;
  razon: string;
  turno: string;
  createdAt: number;
}

// ============================================================================
// Seed data
// ============================================================================

const now = () => Date.now();

const seedPatients: Patient[] = [
  { num: 1, ci: '12345678', nombres: 'María', apellidos: 'García López', fechaNac: '1990-05-15', sexo: 'F', direccion: 'Calle 1', telefono: '04141234567', nacionalidad: 'Venezolano', estadoCivil: 'Soltero/a', estado: 'Activo', comunidad: 'Centro', estadoGeo: 'Caracas', municipio: 'Libertador', parroquia: 'San Pedro', createdAt: now() },
  { num: 2, ci: '23456789', nombres: 'Carlos', apellidos: 'Ruiz Pérez', fechaNac: '1985-08-22', sexo: 'M', direccion: 'Calle 2', telefono: '04141234568', nacionalidad: 'Venezolano', estadoCivil: 'Casado/a', estado: 'Activo', comunidad: 'Norte', estadoGeo: 'Miranda', municipio: 'Sucre', parroquia: 'Petare', createdAt: now() },
  { num: 3, ci: '34567890', nombres: 'Ana', apellidos: 'Torres Díaz', fechaNac: '1978-12-03', sexo: 'F', direccion: 'Calle 3', telefono: '04141234569', nacionalidad: 'Venezolano', estadoCivil: 'Casado/a', estado: 'Encamado', comunidad: 'Sur', estadoGeo: 'Caracas', municipio: 'Libertador', parroquia: 'El Valle', createdAt: now() },
  { num: 4, ci: '45678901', nombres: 'Pedro', apellidos: 'Fernández Gil', fechaNac: '1995-03-10', sexo: 'M', direccion: 'Calle 4', telefono: '04141234570', nacionalidad: 'Extranjero', estadoCivil: 'Soltero/a', estado: 'Activo', comunidad: 'Este', estadoGeo: 'Vargas', municipio: 'Vargas', parroquia: 'Maiquetía', createdAt: now() },
  { num: 5, ci: '56789012', nombres: 'Laura', apellidos: 'Jiménez Soto', fechaNac: '1992-07-19', sexo: 'F', direccion: 'Av. Bolívar 22', telefono: '04141234571', nacionalidad: 'Venezolano', estadoCivil: 'Divorciado/a', estado: 'Activo', comunidad: 'Oeste', estadoGeo: 'Caracas', municipio: 'Libertador', parroquia: 'La Pastora', createdAt: now() },
];

const seedAppointments: Appointment[] = [
  { id: 1, patient: 'María García', doctor: 'Dr. López', specialty: 'Cardiología', date: '2024-01-28', time: '09:00', status: 'confirmada', createdAt: now() },
  { id: 2, patient: 'Carlos Ruiz', doctor: 'Dra. Martínez', specialty: 'Pediatría', date: '2024-01-28', time: '09:30', status: 'pendiente', createdAt: now() },
  { id: 3, patient: 'Ana Torres', doctor: 'Dr. Sánchez', specialty: 'Dermatología', date: '2024-01-28', time: '10:00', status: 'confirmada', createdAt: now() },
  { id: 4, patient: 'Pedro Fernández', doctor: 'Dra. Díaz', specialty: 'Neurología', date: '2024-01-28', time: '10:30', status: 'cancelada', createdAt: now() },
  { id: 5, patient: 'Laura Jiménez', doctor: 'Dr. López', specialty: 'Cardiología', date: '2024-01-28', time: '11:00', status: 'confirmada', createdAt: now() },
];

const seedEspecialistas: Especialista[] = [
  { id: 1, mpps: 'MPPS-001', nombre: 'Juan',   apellido: 'López',     especialidad: 'Cardiología',    pacientes: 245, telefono: '04141234567', disponible: true,  fechaIngreso: '2022-03-15', createdAt: now() },
  { id: 2, mpps: 'MPPS-002', nombre: 'Ana',    apellido: 'Martínez',  especialidad: 'Pediatría',      pacientes: 312, telefono: '04141234568', disponible: true,  fechaIngreso: '2021-07-22', createdAt: now() },
  { id: 3, mpps: 'MPPS-003', nombre: 'Carlos', apellido: 'Sánchez',   especialidad: 'Dermatología',   pacientes: 189, telefono: '04141234569', disponible: false, fechaIngreso: '2023-01-10', createdAt: now() },
  { id: 4, mpps: 'MPPS-004', nombre: 'María',  apellido: 'Díaz',      especialidad: 'Neurología',     pacientes: 156, telefono: '04141234570', disponible: true,  fechaIngreso: '2020-11-05', createdAt: now() },
  { id: 5, mpps: 'MPPS-005', nombre: 'Pedro',  apellido: 'Torres',    especialidad: 'Traumatología',  pacientes: 278, telefono: '04141234571', disponible: true,  fechaIngreso: '2019-09-30', createdAt: now() },
  { id: 6, mpps: 'MPPS-006', nombre: 'Laura',  apellido: 'Fernández', especialidad: 'Ginecología',    pacientes: 298, telefono: '04141234572', disponible: true,  fechaIngreso: '2022-06-18', createdAt: now() },
];

const seedUsuarios: Usuario[] = [
  { num: 1, email: 'rgarcia@medicitas.com',  nombreCompleto: 'Roberto García',   rol: 'Administrador',           miembroDesde: '2022-03-15 09:14', ultimaActualizacion: '2024-01-20 16:42', estado: 'Activo',        createdAt: now() },
  { num: 2, email: 'cruiz@medicitas.com',    nombreCompleto: 'Carmen Ruiz',      rol: 'Auxiliar Administrativo', miembroDesde: '2021-08-20 11:05', ultimaActualizacion: '2024-01-18 10:21', estado: 'Activo',        createdAt: now() },
  { num: 3, email: 'mtorres@medicitas.com',  nombreCompleto: 'Miguel Torres',    rol: 'Administrador',           miembroDesde: '2020-01-10 08:30', ultimaActualizacion: '2024-01-15 14:55', estado: 'Activo',        createdAt: now() },
  { num: 4, email: 'plopez@medicitas.com',   nombreCompleto: 'Patricia López',   rol: 'Auxiliar Administrativo', miembroDesde: '2019-05-22 13:18', ultimaActualizacion: '2023-12-01 09:00', estado: 'Inhabilitado',  createdAt: now() },
  { num: 5, email: 'fdiaz@medicitas.com',    nombreCompleto: 'Fernando Díaz',    rol: 'Auxiliar Administrativo', miembroDesde: '2023-02-01 07:45', ultimaActualizacion: '2024-01-22 18:10', estado: 'Activo',        createdAt: now() },
  { num: 6, email: 'smoreno@medicitas.com',  nombreCompleto: 'Sandra Moreno',    rol: 'Auxiliar Administrativo', miembroDesde: '2022-11-30 12:20', ultimaActualizacion: '2024-01-10 15:30', estado: 'Activo',        createdAt: now() },
];

const seedHistorial: HistorialEntry[] = [
  { id: 1, seccion: 'Citas',         registroAfectado: 'CITA-000123',           accion: 'Crear',    cambio: 'Nueva cita creada para Carlos Pérez',                responsable: 'Roberto García',  fechaHora: '2024-01-28 14:32:15', createdAt: now() },
  { id: 2, seccion: 'Pacientes',     registroAfectado: 'V-12345678',            accion: 'Editar',   cambio: 'Teléfono: 555-0011 → 555-0099',                      responsable: 'Carmen Ruiz',     fechaHora: '2024-01-28 14:28:10', createdAt: now() },
  { id: 3, seccion: 'Citas',         registroAfectado: 'CITA-000098',           accion: 'Eliminar', cambio: 'Cita cancelada por solicitud del paciente',          responsable: 'Miguel Torres',   fechaHora: '2024-01-28 14:15:33', createdAt: now() },
  { id: 4, seccion: 'Diagnósticos',  registroAfectado: 'DIAG-0045',             accion: 'Editar',   cambio: 'Estado: Activo → Resuelto',                          responsable: 'Patricia López',  fechaHora: '2024-01-28 13:30:00', createdAt: now() },
  { id: 5, seccion: 'Jornadas',      registroAfectado: 'MPPS-002',              accion: 'Editar',   cambio: 'Horario Lunes: 08:00-12:00 → 08:00-14:00',           responsable: 'Fernando Díaz',   fechaHora: '2024-01-28 12:55:18', createdAt: now() },
  { id: 6, seccion: 'Especialistas', registroAfectado: 'MPPS-006',              accion: 'Crear',    cambio: 'Registro de nuevo especialista (Ginecología)',       responsable: 'Sandra Moreno',   fechaHora: '2024-01-28 12:40:05', createdAt: now() },
  { id: 7, seccion: 'Usuarios',      registroAfectado: 'plopez@medicitas.com',  accion: 'Editar',   cambio: 'Estado: Activo → Inhabilitado',                      responsable: 'Roberto García',  fechaHora: '2024-01-28 11:10:44', createdAt: now() },
  { id: 8, seccion: 'Diagnósticos',  registroAfectado: 'DIAG-0047',             accion: 'Crear',    cambio: 'Nuevo diagnóstico: Angina de pecho',                 responsable: 'Carmen Ruiz',     fechaHora: '2024-01-28 10:02:19', createdAt: now() },
];

// ============================================================================
// Store shape & actions
// ============================================================================

interface DemoState {
  patients: Patient[];
  appointments: Appointment[];
  especialistas: Especialista[];
  usuarios: Usuario[];
  historial: HistorialEntry[];
  bloqueos: AgendaBloqueo[];

  addPatient: (p: Omit<Patient, 'num' | 'createdAt'>) => void;
  updatePatient: (num: number, patch: Partial<Patient>) => void;

  addAppointment: (a: Omit<Appointment, 'id' | 'createdAt'>) => void;
  updateAppointment: (id: number, patch: Partial<Appointment>) => void;
  removeAppointment: (id: number) => void;

  addEspecialista: (e: Omit<Especialista, 'id' | 'createdAt'>) => void;
  updateEspecialista: (id: number, patch: Partial<Especialista>) => void;

  addUsuario: (u: Omit<Usuario, 'num' | 'createdAt'>) => void;
  updateUsuario: (num: number, patch: Partial<Usuario>) => void;
  toggleUsuarioEstado: (num: number) => void;

  addHistorial: (h: Omit<HistorialEntry, 'id' | 'createdAt'>) => void;

  addBloqueo: (b: Omit<AgendaBloqueo, 'id' | 'createdAt'>) => void;
  removeBloqueo: (id: string) => void;

  removeExpired: () => void;
}

const TTL = 40 * 60 * 1000; // 40 minutes

export const useDemoStore = create<DemoState>()(
  persist(
    (set) => ({
      patients: seedPatients,
      appointments: seedAppointments,
      especialistas: seedEspecialistas,
      usuarios: seedUsuarios,
      historial: seedHistorial,
      bloqueos: [],

      addPatient: (p) => set(s => ({
        patients: [...s.patients, { ...p, num: (s.patients.at(-1)?.num ?? 0) + 1, createdAt: Date.now() }],
      })),
      updatePatient: (num, patch) => set(s => ({
        patients: s.patients.map(p => p.num === num ? { ...p, ...patch } : p),
      })),

      addAppointment: (a) => set(s => ({
        appointments: [...s.appointments, { ...a, id: (s.appointments.at(-1)?.id ?? 0) + 1, createdAt: Date.now() }],
      })),
      updateAppointment: (id, patch) => set(s => ({
        appointments: s.appointments.map(a => a.id === id ? { ...a, ...patch } : a),
      })),
      removeAppointment: (id) => set(s => ({
        appointments: s.appointments.filter(a => a.id !== id),
      })),

      addEspecialista: (e) => set(s => ({
        especialistas: [...s.especialistas, { ...e, id: (s.especialistas.at(-1)?.id ?? 0) + 1, createdAt: Date.now() }],
      })),
      updateEspecialista: (id, patch) => set(s => ({
        especialistas: s.especialistas.map(e => e.id === id ? { ...e, ...patch } : e),
      })),

      addUsuario: (u) => set(s => ({
        usuarios: [...s.usuarios, { ...u, num: (s.usuarios.at(-1)?.num ?? 0) + 1, createdAt: Date.now() }],
      })),
      updateUsuario: (num, patch) => set(s => ({
        usuarios: s.usuarios.map(u => u.num === num ? { ...u, ...patch } : u),
      })),
      toggleUsuarioEstado: (num) => set(s => ({
        usuarios: s.usuarios.map(u => u.num === num
          ? { ...u, estado: u.estado === 'Activo' ? 'Inhabilitado' : 'Activo' }
          : u),
      })),

      addHistorial: (h) => set(s => ({
        historial: [{ ...h, id: (s.historial.at(-1)?.id ?? 0) + 1, createdAt: Date.now() }, ...s.historial],
      })),

      addBloqueo: (b) => set(s => ({
        bloqueos: [...s.bloqueos, { ...b, id: `BLQ-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, createdAt: Date.now() }],
      })),
      removeBloqueo: (id) => set(s => ({
        bloqueos: s.bloqueos.filter(b => b.id !== id),
      })),

      removeExpired: () => set(s => {
        const cutoff = Date.now() - TTL;
        // Only remove entries created during this session (after seed).
        // Seed entries created at store hydration are preserved by using createdAt only for user-added items
        // that exceed TTL.
        const keep = <T extends { createdAt: number }>(arr: T[], seedIds: Set<number | string>, idKey: keyof T) =>
          arr.filter(r => seedIds.has(r[idKey] as number | string) || r.createdAt >= cutoff);
        return {
          patients:      keep(s.patients,      new Set(seedPatients.map(p => p.num)),      'num'),
          appointments:  keep(s.appointments,  new Set(seedAppointments.map(a => a.id)),   'id'),
          especialistas: keep(s.especialistas, new Set(seedEspecialistas.map(e => e.id)),  'id'),
          usuarios:      keep(s.usuarios,      new Set(seedUsuarios.map(u => u.num)),      'num'),
          historial:     keep(s.historial,     new Set(seedHistorial.map(h => h.id)),      'id'),
          bloqueos:      s.bloqueos.filter(b => b.createdAt >= cutoff),
        };
      }),
    }),
    {
      name: 'medicitas-demo',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
