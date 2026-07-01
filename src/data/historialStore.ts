export type AccionRealizada = 'Crear' | 'Editar' | 'Eliminar';

export interface HistorialEntry {
  id: number;
  seccion: string;
  registroAfectado: string;
  accion: AccionRealizada;
  cambio: string;
  responsable: string;
  fechaHora: string;
}

export const historialMock: HistorialEntry[] = [
  { id: 1, seccion: 'Citas',           registroAfectado: 'CITA-000123',    accion: 'Crear',   cambio: 'Nueva cita creada para Carlos Pérez',                          responsable: 'Roberto García',  fechaHora: '2024-01-28 14:32:15' },
  { id: 2, seccion: 'Pacientes',       registroAfectado: 'V-12345678',     accion: 'Editar',  cambio: 'Teléfono: 555-0011 → 555-0099',                                 responsable: 'Carmen Ruiz',     fechaHora: '2024-01-28 14:28:10' },
  { id: 3, seccion: 'Citas',           registroAfectado: 'CITA-000098',    accion: 'Eliminar', cambio: 'Cita cancelada por solicitud del paciente',                    responsable: 'Miguel Torres',   fechaHora: '2024-01-28 14:15:33' },
  { id: 4, seccion: 'Diagnósticos',    registroAfectado: 'DIAG-0045',      accion: 'Editar',  cambio: 'Estado: Activo → Resuelto',                                     responsable: 'Patricia López',  fechaHora: '2024-01-28 13:30:00' },
  { id: 5, seccion: 'Jornadas',        registroAfectado: 'MPPS-002',       accion: 'Editar',  cambio: 'Horario Lunes: 08:00-12:00 → 08:00-14:00',                     responsable: 'Fernando Díaz',   fechaHora: '2024-01-28 12:55:18' },
  { id: 6, seccion: 'Especialistas',   registroAfectado: 'MPPS-006',       accion: 'Crear',   cambio: 'Registro de nuevo especialista (Ginecología)',                 responsable: 'Sandra Moreno',   fechaHora: '2024-01-28 12:40:05' },
  { id: 7, seccion: 'Usuarios',        registroAfectado: 'plopez@medicitas.com', accion: 'Editar', cambio: 'Estado: Activo → Inhabilitado',                            responsable: 'Roberto García',  fechaHora: '2024-01-28 11:10:44' },
  { id: 8, seccion: 'Diagnósticos',    registroAfectado: 'DIAG-0047',      accion: 'Crear',   cambio: 'Nuevo diagnóstico: Angina de pecho',                            responsable: 'Carmen Ruiz',     fechaHora: '2024-01-28 10:02:19' },
];
