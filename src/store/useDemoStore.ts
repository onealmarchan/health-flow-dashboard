import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================================================
// Types
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

export type Sintoma = { nombre: string; descripcion: string; gravedad: number };
export type Diagnostico = {
  id: number;
  numCitaOrigen: string;
  paciente: string;
  ci: string;
  nombres: string;
  apellidos: string;
  fechaCita: string;
  fechaDiagnostico: string;
  motivo: string;
  tratamientoPrevio: string;
  urgencia: boolean;
  sintomas: Sintoma[];
  enfermedad: { nombre: string; descripcion: string; cronico: boolean };
  critico: boolean;
  etapa: 'Inicial' | 'Avanzada' | string;
  estado: 'Activo' | 'Resuelto' | string;
  createdAt: number;
};

// ============================================================================
// Seed data
// ============================================================================

const now = () => Date.now();
const fmtNow = () => new Date().toLocaleString('es-VE', { hour12: false }).replace(',', '');

const SESSION_USER = 'Roberto García';

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

const seedDiagnosticos: Diagnostico[] = [
  {
    id: 1, numCitaOrigen: 'CITA-001', paciente: 'Carlos Pérez', ci: 'V-12345678',
    nombres: 'Carlos', apellidos: 'Pérez', fechaCita: '2026-04-10', fechaDiagnostico: '2026-04-10',
    motivo: 'Dolor torácico recurrente', tratamientoPrevio: 'Ninguno', urgencia: true,
    sintomas: [
      { nombre: 'Dolor en el pecho', descripcion: 'Intermitente, opresivo', gravedad: 4 },
      { nombre: 'Disnea', descripcion: 'Al esfuerzo moderado', gravedad: 3 },
    ],
    enfermedad: { nombre: 'Angina de pecho', descripcion: 'Sospecha de cardiopatía isquémica', cronico: true },
    critico: true, etapa: 'Inicial', estado: 'Activo', createdAt: now(),
  },
  {
    id: 2, numCitaOrigen: 'CITA-002', paciente: 'María González', ci: 'V-23456789',
    nombres: 'María', apellidos: 'González', fechaCita: '2026-04-12', fechaDiagnostico: '2026-04-12',
    motivo: 'Erupción cutánea', tratamientoPrevio: 'Antihistamínico oral', urgencia: false,
    sintomas: [
      { nombre: 'Prurito', descripcion: 'En zona de brazos', gravedad: 2 },
      { nombre: 'Enrojecimiento', descripcion: 'Localizado', gravedad: 2 },
    ],
    enfermedad: { nombre: 'Dermatitis alérgica', descripcion: 'Reacción a contacto', cronico: false },
    critico: false, etapa: 'Avanzada', estado: 'Resuelto', createdAt: now(),
  },
  {
    id: 3, numCitaOrigen: 'CITA-003', paciente: 'Luis Rodríguez', ci: 'V-34567890',
    nombres: 'Luis', apellidos: 'Rodríguez', fechaCita: '2026-04-15', fechaDiagnostico: '2026-04-15',
    motivo: 'Cefalea persistente', tratamientoPrevio: 'Analgésicos', urgencia: false,
    sintomas: [{ nombre: 'Dolor de cabeza', descripcion: 'Diario', gravedad: 3 }],
    enfermedad: { nombre: 'Migraña', descripcion: 'Sin signos focales', cronico: true },
    critico: false, etapa: 'Inicial', estado: 'Activo', createdAt: now(),
  },
];

// ============================================================================
// Store
// ============================================================================

interface DemoState {
  patients: Patient[];
  appointments: Appointment[];
  especialistas: Especialista[];
  usuarios: Usuario[];
  historial: HistorialEntry[];
  bloqueos: AgendaBloqueo[];
  diagnosticos: Diagnostico[];

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

  addDiagnostico: (d: Omit<Diagnostico, 'id' | 'createdAt'>) => void;
  updateDiagnostico: (id: number, patch: Partial<Diagnostico>) => void;
  removeDiagnostico: (id: number) => void;

  addHistorial: (h: Omit<HistorialEntry, 'id' | 'createdAt'>) => void;

  addBloqueo: (b: Omit<AgendaBloqueo, 'id' | 'createdAt'>) => void;
  removeBloqueo: (id: string) => void;

  removeExpired: () => void;
}

const TTL = 40 * 60 * 1000;

// ---- audit helpers (module-scope, use getState so wrappers stay tiny) ----
function pushAudit(seccion: string, registroAfectado: string, accion: AccionRealizada, cambio: string) {
  useDemoStore.getState().addHistorial({
    seccion, registroAfectado, accion, cambio,
    responsable: SESSION_USER, fechaHora: fmtNow(),
  });
}
function diffFields<T extends Record<string, unknown>>(prev: T, patch: Partial<T>): string {
  const parts: string[] = [];
  for (const k of Object.keys(patch)) {
    const pv = prev[k as keyof T];
    const nv = (patch as Record<string, unknown>)[k];
    if (pv !== nv && typeof nv !== 'object') parts.push(`${k}: ${String(pv ?? '—')} → ${String(nv ?? '—')}`);
  }
  return parts.length ? parts.join(' · ') : 'Actualización sin cambios visibles';
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      patients: seedPatients,
      appointments: seedAppointments,
      especialistas: seedEspecialistas,
      usuarios: seedUsuarios,
      historial: seedHistorial,
      bloqueos: [],
      diagnosticos: seedDiagnosticos,

      addPatient: (p) => {
        const num = (get().patients.at(-1)?.num ?? 0) + 1;
        set(s => ({ patients: [...s.patients, { ...p, num, createdAt: Date.now() }] }));
        pushAudit('Pacientes', `V-${p.ci}`, 'Crear', `Nuevo paciente: ${p.nombres} ${p.apellidos}`);
      },
      updatePatient: (num, patch) => {
        const prev = get().patients.find(p => p.num === num);
        set(s => ({ patients: s.patients.map(p => p.num === num ? { ...p, ...patch } : p) }));
        if (prev) pushAudit('Pacientes', `V-${prev.ci}`, 'Editar', diffFields(prev as unknown as Record<string, unknown>, patch as Record<string, unknown>));
      },

      addAppointment: (a) => {
        const id = (get().appointments.at(-1)?.id ?? 0) + 1;
        set(s => ({ appointments: [...s.appointments, { ...a, id, createdAt: Date.now() }] }));
        pushAudit('Citas', `CITA-${String(id).padStart(6, '0')}`, 'Crear', `Nueva cita para ${a.patient} con ${a.doctor} (${a.specialty}) el ${a.date} ${a.time}`);
      },
      updateAppointment: (id, patch) => {
        const prev = get().appointments.find(a => a.id === id);
        set(s => ({ appointments: s.appointments.map(a => a.id === id ? { ...a, ...patch } : a) }));
        if (prev) pushAudit('Citas', `CITA-${String(id).padStart(6, '0')}`, 'Editar', diffFields(prev as unknown as Record<string, unknown>, patch as Record<string, unknown>));
      },
      removeAppointment: (id) => {
        const prev = get().appointments.find(a => a.id === id);
        set(s => ({ appointments: s.appointments.filter(a => a.id !== id) }));
        if (prev) pushAudit('Citas', `CITA-${String(id).padStart(6, '0')}`, 'Eliminar', `Cita cancelada (${prev.patient} · ${prev.date} ${prev.time})`);
      },

      addEspecialista: (e) => {
        const id = (get().especialistas.at(-1)?.id ?? 0) + 1;
        set(s => ({ especialistas: [...s.especialistas, { ...e, id, createdAt: Date.now() }] }));
        pushAudit('Especialistas', e.mpps, 'Crear', `Nuevo especialista: ${e.nombre} ${e.apellido} (${e.especialidad})`);
      },
      updateEspecialista: (id, patch) => {
        const prev = get().especialistas.find(e => e.id === id);
        set(s => ({ especialistas: s.especialistas.map(e => e.id === id ? { ...e, ...patch } : e) }));
        if (prev) pushAudit('Especialistas', prev.mpps, 'Editar', diffFields(prev as unknown as Record<string, unknown>, patch as Record<string, unknown>));
      },

      addUsuario: (u) => {
        const num = (get().usuarios.at(-1)?.num ?? 0) + 1;
        set(s => ({ usuarios: [...s.usuarios, { ...u, num, createdAt: Date.now() }] }));
        pushAudit('Usuarios', u.email, 'Crear', `Nuevo usuario: ${u.nombreCompleto} (${u.rol})`);
      },
      updateUsuario: (num, patch) => {
        const prev = get().usuarios.find(u => u.num === num);
        set(s => ({ usuarios: s.usuarios.map(u => u.num === num ? { ...u, ...patch, ultimaActualizacion: new Date().toISOString().slice(0, 16).replace('T', ' ') } : u) }));
        if (prev) pushAudit('Usuarios', prev.email, 'Editar', diffFields(prev as unknown as Record<string, unknown>, patch as Record<string, unknown>));
      },
      toggleUsuarioEstado: (num) => {
        const prev = get().usuarios.find(u => u.num === num);
        set(s => ({
          usuarios: s.usuarios.map(u => u.num === num
            ? { ...u, estado: u.estado === 'Activo' ? 'Inhabilitado' : 'Activo' }
            : u),
        }));
        if (prev) pushAudit('Usuarios', prev.email, 'Editar', `Estado: ${prev.estado} → ${prev.estado === 'Activo' ? 'Inhabilitado' : 'Activo'}`);
      },

      addDiagnostico: (d) => {
        const id = (get().diagnosticos.at(-1)?.id ?? 0) + 1;
        set(s => ({ diagnosticos: [{ ...d, id, createdAt: Date.now() }, ...s.diagnosticos] }));
        pushAudit('Diagnósticos', `DIAG-${String(id).padStart(4, '0')}`, 'Crear', `Nuevo diagnóstico: ${d.enfermedad.nombre} (${d.paciente})`);
      },
      updateDiagnostico: (id, patch) => {
        const prev = get().diagnosticos.find(d => d.id === id);
        set(s => ({ diagnosticos: s.diagnosticos.map(d => d.id === id ? { ...d, ...patch } : d) }));
        if (prev) pushAudit('Diagnósticos', `DIAG-${String(id).padStart(4, '0')}`, 'Editar', diffFields(prev as unknown as Record<string, unknown>, patch as Record<string, unknown>));
      },
      removeDiagnostico: (id) => {
        const prev = get().diagnosticos.find(d => d.id === id);
        set(s => ({ diagnosticos: s.diagnosticos.filter(d => d.id !== id) }));
        if (prev) pushAudit('Diagnósticos', `DIAG-${String(id).padStart(4, '0')}`, 'Eliminar', `Diagnóstico eliminado: ${prev.enfermedad.nombre}`);
      },

      addHistorial: (h) => set(s => ({
        historial: [{ ...h, id: (s.historial.at(-1)?.id ?? 0) + 1, createdAt: Date.now() }, ...s.historial],
      })),

      addBloqueo: (b) => {
        const id = `BLQ-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        set(s => ({ bloqueos: [...s.bloqueos, { ...b, id, createdAt: Date.now() }] }));
        pushAudit('Jornadas', b.mpps, 'Crear', `Bloqueo ${b.razon} ${b.fechaInicio} → ${b.fechaFin} (${b.turno})`);
      },
      removeBloqueo: (id) => {
        const prev = get().bloqueos.find(b => b.id === id);
        set(s => ({ bloqueos: s.bloqueos.filter(b => b.id !== id) }));
        if (prev) pushAudit('Jornadas', prev.mpps, 'Eliminar', `Bloqueo eliminado (${prev.razon})`);
      },

      removeExpired: () => set(s => {
        const cutoff = Date.now() - TTL;
        const keep = <T extends { createdAt: number }>(arr: T[], seedIds: Set<number | string>, idKey: keyof T) =>
          arr.filter(r => seedIds.has(r[idKey] as number | string) || r.createdAt >= cutoff);
        return {
          patients:      keep(s.patients,      new Set(seedPatients.map(p => p.num)),      'num'),
          appointments:  keep(s.appointments,  new Set(seedAppointments.map(a => a.id)),   'id'),
          especialistas: keep(s.especialistas, new Set(seedEspecialistas.map(e => e.id)),  'id'),
          usuarios:      keep(s.usuarios,      new Set(seedUsuarios.map(u => u.num)),      'num'),
          historial:     keep(s.historial,     new Set(seedHistorial.map(h => h.id)),      'id'),
          diagnosticos:  keep(s.diagnosticos,  new Set(seedDiagnosticos.map(d => d.id)),   'id'),
          bloqueos:      s.bloqueos.filter(b => b.createdAt >= cutoff),
        };
      }),
    }),
    {
      name: 'medicitas-demo',
      storage: createJSONStorage(() => sessionStorage),
      version: 2,
    },
  ),
);

// Selectors for diagnosticos
export const useDiagnosticos = () => useDemoStore(s => s.diagnosticos);
