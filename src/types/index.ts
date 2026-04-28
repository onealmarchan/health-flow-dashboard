// ==========================================
// Tipos de Autenticación
// ==========================================
export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    nombre: string;
    rol: UserRole;
  };
}

export enum UserRole {
  ADMIN = 'ADMIN',
  ADMIN_AUXILIAR = 'ADMIN_AUXILIAR',
}

export interface User {
  id: number;
  email: string;
  nombre: string;
  rol: UserRole;
}

// ==========================================
// Tipos de Usuario
// ==========================================
export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: UserRole;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUsuarioDto {
  email: string;
  password: string;
  nombre: string;
  rol: UserRole;
}

// ==========================================
// Tipos de Paciente
// ==========================================
export enum Sexo {
  MASCULINO = 'masculino',
  FEMENINO = 'femenino',
}

export enum Nacionalidad {
  VENEZOLANO = 'venezolano',
  EXTRANJERO = 'extranjero',
}

export enum EstadoPaciente {
  ACTIVO = 'activo',
  ENCAMA = 'encamado',
}

export enum EstadoCivil {
  SOLTERO = 'soltero',
  CASADO = 'casado',
  DIVORCIADO = 'divorciado',
  VIUDO = 'viudo',
}

export interface Paciente {
  pk_num_paciente: number;
  ci: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  sexo: Sexo;
  direccion: string;
  telefono: string;
  nacionalidad: Nacionalidad;
  estado_paciente: EstadoPaciente;
  estado_civil: EstadoCivil;
  fk_ps_a001_num_comunidad: number;
}

export interface CreatePacienteDto {
  ci: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  sexo: Sexo;
  direccion: string;
  telefono: string;
  nacionalidad: Nacionalidad;
  estado_paciente: EstadoPaciente;
  estado_civil: EstadoCivil;
  fk_ps_a001_num_comunidad: number;
}

export interface UpdatePacienteDto {
  ci?: string;
  nombres?: string;
  apellidos?: string;
  fecha_nacimiento?: string;
  sexo?: Sexo;
  direccion?: string;
  telefono?: string;
  nacionalidad?: Nacionalidad;
  estado_paciente?: EstadoPaciente;
  estado_civil?: EstadoCivil;
  fk_ps_a001_num_comunidad?: number;
}

// ==========================================
// Tipos de Médico
// ==========================================
export interface Medico {
  pk_num_medico_ministerio_salud: number;
  fk_cm_a001_num_especialidad: number;
  nombre: string;
  apellido: string;
  telefono: string;
  carga_paciente: number;
  especialidad?: Especialidad;
}

export interface CreateMedicoDto {
  pk_num_medico_ministerio_salud: number;
  fk_cm_a001_num_especialidad: number;
  nombre: string;
  apellido: string;
  telefono: string;
  carga_paciente?: number;
}

export interface UpdateMedicoDto {
  fk_cm_a001_num_especialidad?: number;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  carga_paciente?: number;
}

// ==========================================
// Tipos de Especialidad
// ==========================================
export interface Especialidad {
  pk_num_especialidad: number;
  nombre: string;
  descripcion: string;
}

export interface CreateEspecialidadDto {
  nombre: string;
  descripcion?: string;
}

export interface UpdateEspecialidadDto {
  nombre?: string;
  descripcion?: string;
}

// ==========================================
// Tipos de Sesión Médica
// ==========================================
export enum TurnoSesion {
  MANANA = 'mañana',
  TARDE = 'tarde',
  NOCHE = 'noche',
}

export enum DiaSemana {
  LUNES = 'Lunes',
  MARTES = 'Martes',
  MIERCOLES = 'Miercoles',
  JUEVES = 'Jueves',
  VIERNES = 'Viernes',
  SABADO = 'Sabado',
  DOMINGO = 'Domingo',
}

export interface SesionMedica {
  pk_num_sesion_medica: number;
  fk_cm_b001_num_medico_ministerio_salud: number;
  turno: TurnoSesion;
  dias_semana: DiaSemana;
  hora_inicio: string;
  hora_fin: string;
  medico?: Medico;
}

export interface CreateSesionMedicaDto {
  fk_cm_b001_num_medico_ministerio_salud: number;
  turno: TurnoSesion;
  dias_semana: DiaSemana;
  hora_inicio: string;
  hora_fin: string;
}

export interface UpdateSesionMedicaDto {
  turno?: TurnoSesion;
  dias_semana?: DiaSemana;
  hora_inicio?: string;
  hora_fin?: string;
}

// ==========================================
// Tipos de Cita Médica
// ==========================================
export enum EstadoCita {
  AGENDADA = 'agendada',
  ATENDIDA = 'atendida',
  CANCELADA = 'cancelada',
}

export enum TipoCita {
  CONTROL = 'control',
  PRIMERA_VEZ = 'primera vez',
  EMERGENCIA = 'emergencia',
}

export enum EstadoCaso {
  NUEVO = 'nuevo',
  SUCESIVO = 'sucesivo',
}

export interface CitaMedica {
  pk_num_cita_medica: number;
  fk_ps_b001_num_paciente: number;
  fk_cm_b005_num_sesion: number;
  fk_cm_b004_num_motivo_consulta: number;
  estado_cita: EstadoCita;
  fecha: string;
  hora: string;
  tipo_cita: TipoCita;
  estado_caso: EstadoCaso;
  remitido: boolean;
  paciente?: Paciente;
  sesionMedica?: SesionMedica;
  motivoConsulta?: MotivoConsulta;
}

export interface CreateCitaMedicaDto {
  fk_ps_b001_num_paciente: number;
  fk_cm_b005_num_sesion: number;
  fk_cm_b004_num_motivo_consulta: number;
  estado_cita: EstadoCita;
  fecha: string;
  hora: string;
  tipo_cita: TipoCita;
  estado_caso: EstadoCaso;
  remitido: boolean;
}

export interface UpdateCitaMedicaDto {
  estado_cita?: EstadoCita;
  fecha?: string;
  hora?: string;
  tipo_cita?: TipoCita;
  estado_caso?: EstadoCaso;
  remitido?: boolean;
}

// ==========================================
// Tipos de Motivo Consulta
// ==========================================
export enum NivelUrgencia {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
}

export interface MotivoConsulta {
  pk_num_motivo_consulta: number;
  fk_ps_b001_num_paciente: number;
  descripcion_motivo: string;
  nivel_urgencia: NivelUrgencia;
  fecha_motivo: string;
  observacion_motivo: string;
  paciente?: Paciente;
}

export interface CreateMotivoConsultaDto {
  fk_ps_b001_num_paciente: number;
  descripcion_motivo: string;
  nivel_urgencia: NivelUrgencia;
  fecha_motivo: string;
  observacion_motivo: string;
}

export interface UpdateMotivoConsultaDto {
  descripcion_motivo?: string;
  nivel_urgencia?: NivelUrgencia;
  observacion_motivo?: string;
}

// ==========================================
// Tipos de Diagnóstico
// ==========================================
export interface Enfermedad {
  pk_num_enfermedad: number;
  nombre: string;
  descripcion: string;
  enfermedad_cronica: boolean;
}

export interface DiagnosticoEnfermedad {
  pk_num_diagnostico_enfermedad: number;
  fk_ps_b001_num_paciente: number;
  fk_cm_a002_num_enfermedad: number;
  fk_cm_b002_num_cita_medica: number;
  critico: boolean;
  tratamiento: string;
  etapa: string;
  fecha_diagnostico: string;
  paciente?: Paciente;
  enfermedad?: Enfermedad;
}

export interface CreateDiagnosticoEnfermedadDto {
  fk_ps_b001_num_paciente: number;
  fk_cm_a002_num_enfermedad: number;
  fk_cm_b002_num_cita_medica: number;
  critico: boolean;
  tratamiento: string;
  etapa: string;
  fecha_diagnostico: string;
}

export interface UpdateDiagnosticoEnfermedadDto {
  critico?: boolean;
  tratamiento?: string;
  etapa?: string;
}

// ==========================================
// Tipos de Auditoría
// ==========================================
export interface Auditoria {
  id: number;
  entidad: string;
  id_registro: number;
  accion: string;
  datos_anteriores: Record<string, unknown>;
  datos_nuevos: Record<string, unknown>;
  usuario_id: number;
  fecha: string;
}

export interface QueryAuditoriaDto {
  pagina?: number;
  limite?: number;
  entidad?: string;
  accion?: string;
  usuarioId?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
}

// ==========================================
// Tipos de Indicadores
// ==========================================
export interface IndicadorEnfermedad {
  nombre: string;
  casos: number;
  porcentaje: number;
}

export interface IndicadorEspecialidad {
  nombre: string;
  variacion?: string;
  casos_actuales?: number;
  casos_anteriores?: number;
  pacientes_totales?: number;
  pacientes_retenidos?: number;
  porcentaje_retencion?: number;
  grupos_etarios?: Record<string, number>;
}

export interface IndicadorGrupoEtario {
  rango: string;
  consultas: number;
  tendencia?: string;
}

export interface IndicadorConcentracion {
  rango: string;
  casos: number;
  porcentaje: number;
}

// ==========================================
// Tipos de Notificación
// ==========================================
export enum RolDestinatario {
  ADMIN = 'admin',
  ADMIN_AUXILIAR = 'admin_auxiliar',
  TODOS = 'todos',
}

export enum TipoNotificacion {
  CITA_HOY = 'cita_hoy',
  CITA_INCOMPLETA = 'cita_incompleta',
  RECORDATORIO_ESTADISTICO = 'recordatorio_estadistico',
  BLOQUEO_PROXIMO = 'bloqueo_proximo',
  SISTEMA = 'sistema',
}

export enum PrioridadNotificacion {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
}

export interface Notificacion {
  pk_num_notificacion: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  prioridad: PrioridadNotificacion;
  leida: boolean;
  referencia_id: number | null;
  referencia_tipo: string | null;
  rol_destinatario: RolDestinatario;
  usuario_id: number | null;
  createdAt: string;
}