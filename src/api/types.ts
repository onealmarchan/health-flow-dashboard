// Auto-generado desde OpenAPI spec
// NO EDITAR MANUALMENTE - Los cambios se sobrescribirán

import type { AxiosInstance, AxiosResponse } from 'axios';

export interface createEspecialidadDTO {
}

export interface updateEspecialidadDTO {
}

export interface CreateMedicoDTO {
  /** Número de registro único del médico en el Ministerio de Salud */
  pk_num_medico_ministerio_salud: number;
  /** ID de la especialidad médica del doctor */
  fk_cm_a001_num_especialidad: number;
  /** Nombre del médico */
  nombre: string;
  /** Apellido del médico */
  apellido: string;
  /** Número de teléfono del médico */
  telefono: string;
  /** Cantidad actual de pacientes asignados al médico (opcional, máximo 16) */
  carga_paciente?: number;
}

export interface UpdateMedicoDTO {
}

export interface createEnfermedadDTO {
  /** Nombre de la enfermedad */
  nombre: string;
  /** Indica si la enfermedad es crónica o no cronica */
  enfermedad_cronica: boolean;
  /** Descripción detallada de la enfermedad */
  descripcion?: string;
}

export interface updateEnfermedadDTO {
  /** Nombre de la enfermedad */
  nombre?: string;
  /** Indica si la enfermedad es crónica o no cronica */
  enfermedad_cronica?: boolean;
  /** Descripción detallada de la enfermedad */
  descripcion?: string;
}

export interface CreateComunidadDTO {
  /** Nombre de la comunidad */
  nombre_comunidad: string;
  /** Estado donde se ubica la comunidad */
  estado: string;
  /** Municipio donde se ubica la comunidad */
  municipio: string;
  /** Parroquia donde se ubica la comunidad */
  parroquia: string;
}

export interface UpdateComunidadDTO {
  /** Nombre de la comunidad */
  nombre_comunidad?: string;
  /** Estado donde se ubica la comunidad */
  estado?: string;
  /** Municipio donde se ubica la comunidad */
  municipio?: string;
  /** Parroquia donde se ubica la comunidad */
  parroquia?: string;
}

export interface CreatePacienteDTO {
  /** ID de la comunidad a la que pertenece el paciente */
  fk_ps_a001_num_comunidad: number;
  /** Cédula de identidad del paciente. Formato: 7 o más dígitos, opcionalmente seguido de guión y más dígitos */
  ci: string;
  /** Nombres del paciente */
  nombres: string;
  /** Apellidos del paciente */
  apellidos: string;
  /** Fecha de nacimiento del paciente en formato ISO (YYYY-MM-DD) */
  fecha_nacimiento: string;
  /** Sexo del paciente */
  sexo: 'masculino' | 'femenino';
  /** Dirección de residencia del paciente */
  direccion: string;
  /** Número de teléfono del paciente */
  telefono: string;
  /** Nacionalidad del paciente */
  nacionalidad: 'venezolano' | 'extranjero';
  /** Estado de salud del paciente */
  estado_paciente: 'activo' | 'encamado';
  /** Estado civil del paciente */
  estado_civil: 'soltero' | 'casado' | 'divorciado' | 'viudo';
}

export interface UpdatePacienteDTO {
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RequestCodeDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  /** Código OTP de 6 dígitos */
  code: string;
  password: string;
  confirmPassword: string;
}

export interface CreateUsuarioDto {
  email: string;
  cedula: string;
  nombre: string;
  apellido?: string;
  telefono?: string;
  password: string;
  rol: 'ADMIN' | 'ADMIN_AUXILIAR';
}

export interface UpdateUsuarioDto {
  email?: string;
  cedula?: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  password?: string;
  rol?: 'ADMIN' | 'ADMIN_AUXILIAR';
}

export interface CreateCita_MedicaDTO {
  /** ID del paciente */
  fk_ps_b001_num_paciente: number;
  /** ID de la sesión médica a la que pertenece esta cita */
  fk_cm_b005_num_sesion: number;
  /** ID del motivo de consulta asociado a esta cita */
  fk_cm_b004_num_motivo_consulta: number;
  /** Estado actual de la cita */
  estado_cita: 'agendada' | 'atendida' | 'cancelada';
  /** Fecha de la cita médica (YYYY-MM-DD) */
  fecha: string;
  /** Hora de la cita en formato HH:mm o HH:mm:ss */
  hora: string;
  /** Tipo de cita médica */
  tipo_cita: 'control' | 'primera vez' | 'emergencia';
  /** Estado del caso médico */
  estado_caso: 'nuevo' | 'sucesivo';
  /** Indica si el paciente fue remitido de otro centro */
  remitido: boolean;
}

export interface UpdateCita_MedicaDTO {
  /** ID del paciente */
  fk_ps_b001_num_paciente?: number;
  /** ID de la sesión médica */
  fk_cm_b005_num_sesion?: number;
  /** ID del motivo de consulta */
  fk_cm_b004_num_motivo_consulta?: number;
  /** Estado actual de la cita */
  estado_cita?: 'agendada' | 'atendida' | 'cancelada';
  /** Fecha de la cita médica (YYYY-MM-DD) */
  fecha?: string;
  /** Hora de la cita en formato HH:mm o HH:mm:ss */
  hora?: string;
  /** Tipo de cita médica */
  tipo_cita?: 'control' | 'primera vez' | 'emergencia';
  /** Estado del caso médico */
  estado_caso?: 'nuevo' | 'sucesivo';
  /** Indica si el paciente fue remitido de otro centro */
  remitido?: boolean;
}

export interface CreateSesionMedicaDTO {
  /** ID del médico (número ministerio de salud) asociado a la sesión */
  fk_cm_b001_num_medico_ministerio_salud: number;
  /** Turno de la sesión médica */
  turno: 'mañana' | 'tarde' | 'noche';
  /** Días de la semana para la sesión médica */
  dias_semana: 'Lunes' | 'Martes' | 'Miercoles' | 'Jueves' | 'Viernes' | 'Sabado' | 'Domingo';
  /** Hora de inicio de la sesión médica (formato HH:MM o HH:MM:SS) */
  hora_inicio: string;
  /** Hora de fin de la sesión médica (formato HH:MM o HH:MM:SS) */
  hora_fin: string;
}

export interface UpdateSesionMedicaDTO {
  /** ID del médico (número ministerio de salud) asociado a la sesión */
  fk_cm_b001_num_medico_ministerio_salud?: number;
  /** Turno de la sesión médica */
  turno?: 'mañana' | 'tarde' | 'noche';
  /** Días de la semana para la sesión médica */
  dias_semana?: 'Lunes' | 'Martes' | 'Miercoles' | 'Jueves' | 'Viernes' | 'Sabado' | 'Domingo';
  /** Hora de inicio de la sesión médica (formato HH:MM o HH:MM:SS) */
  hora_inicio?: string;
  /** Hora de fin de la sesión médica (formato HH:MM o HH:MM:SS) */
  hora_fin?: string;
}

export interface CreateMotivoConsultaDTO {
  /** ID de la persona (paciente) asociada al motivo de consulta */
  fk_ps_b001_num_paciente: number;
  /** Descripción del motivo de consulta */
  descripcion_motivo?: string;
  /** Nivel de urgencia establecido */
  nivel_urgencia: 'baja' | 'media' | 'alta';
  /** Fecha en que se presenta el motivo de consulta (ISO 8601) */
  fecha_motivo: string;
  /** Observaciones adicionales sobre el motivo */
  observacion_motivo?: string;
}

export interface UpdateMotivoConsultaDTO {
  /** ID de la persona (paciente) asociada al motivo de consulta */
  fk_ps_b001_num_paciente?: number;
  /** Descripción del motivo de consulta */
  descripcion_motivo?: string;
  /** Nivel de urgencia establecido */
  nivel_urgencia?: 'baja' | 'media' | 'alta';
  /** Fecha en que se presenta el motivo de consulta (ISO 8601) */
  fecha_motivo?: string;
  /** Observaciones adicionales sobre el motivo */
  observacion_motivo?: string;
}

export interface CreateBloqueoAgendaDTO {
  /** ID del médico (número ministerio de salud) al que se aplica el bloqueo */
  fk_cm_b001_num_medico_ministerio_salud: number;
  /** ID de la sesión médica a bloquear (opcional, si es null bloquea todas las sesiones del médico) */
  fk_cm_b005_num_sesion?: number;
  /** Fecha de inicio del bloqueo (ISO 8601: YYYY-MM-DD) */
  fecha_inicio: string;
  /** Fecha de fin del bloqueo (ISO 8601: YYYY-MM-DD) */
  fecha_fin: string;
  /** Razón del bloqueo de agenda */
  razon_bloqueo: 'vacaciones' | 'permiso' | 'reposo' | 'cirugia' | 'capacitacion' | 'congreso' | 'bloqueo_manual' | 'mantenimiento' | 'rotacion';
  /** Descripción del motivo del bloqueo */
  motivo_bloqueo: string;
}

export interface UpdateBloqueoAgendaDTO {
  /** ID del médico (número ministerio de salud) al que se aplica el bloqueo */
  fk_cm_b001_num_medico_ministerio_salud?: number;
  /** ID de la sesión médica a bloquear (opcional, si es null bloquea todas las sesiones del médico) */
  fk_cm_b005_num_sesion?: number;
  /** Fecha de inicio del bloqueo (ISO 8601: YYYY-MM-DD) */
  fecha_inicio?: string;
  /** Fecha de fin del bloqueo (ISO 8601: YYYY-MM-DD) */
  fecha_fin?: string;
  /** Razón del bloqueo de agenda */
  razon_bloqueo?: 'vacaciones' | 'permiso' | 'reposo' | 'cirugia' | 'capacitacion' | 'congreso' | 'bloqueo_manual' | 'mantenimiento' | 'rotacion';
  /** Descripción del motivo del bloqueo */
  motivo_bloqueo?: string;
}

export interface CreateDiagnosticoEnfermedadDTO {
  /** ID del paciente */
  fk_ps_b001_num_paciente: number;
  /** ID de la enfermedad */
  fk_cm_a002_num_enfermedad: number;
  /** ID de la cita médica */
  fk_cm_b002_num_cita_medica: number;
  /** Indica si el caso es crítico */
  critico: boolean;
  /** Tratamiento asignado */
  tratamiento: string;
  /** Etapa del diagnóstico */
  etapa: 'leve' | 'inicial' | 'avanzada';
  /** Fecha del diagnóstico (YYYY-MM-DD) */
  fecha_diagnostico: string;
}

export interface UpdateDiagnosticoEnfermedadDTO {
  /** ID del paciente */
  fk_ps_b001_num_paciente?: number;
  /** ID de la enfermedad */
  fk_cm_a002_num_enfermedad?: number;
  /** ID de la cita médica */
  fk_cm_b002_num_cita_medica?: number;
  /** Indica si el caso es crítico */
  critico?: boolean;
  /** Tratamiento asignado */
  tratamiento?: string;
  /** Etapa del diagnóstico */
  etapa?: 'leve' | 'inicial' | 'avanzada';
  /** Fecha del diagnóstico (YYYY-MM-DD) */
  fecha_diagnostico?: string;
}

export interface VariacionDto {
  porcentaje: number;
  tendencia: 'subio' | 'bajo' | 'sin cambios';
}

export interface DesgloseComunidadDto {
  comunidadId: number;
  comunidad: string;
  cantidad: number;
  porcentaje: number;
}

export interface TotalPacientesResponseDto {
  totalPacientes: number;
  variacionMensual: VariacionDto;
  desglose: DesgloseComunidadDto[];
}

export interface DesgloseEspecialidadDto {
  especialidadId: number;
  especialidad: string;
  cantidad: number;
  porcentaje: number;
}

export interface TotalConsultasResponseDto {
  totalConsultas: number;
  variacionMensual: VariacionDto;
  desglose: DesgloseEspecialidadDto[];
}

export interface CitasHoyResponseDto {
  totalCitasHoy: number;
  variacion: VariacionDto;
  desglose: DesgloseEspecialidadDto[];
}

export interface OcupacionAgendaResponseDto {
  nombreIndicador: string;
  horasSesionActiva: number;
  horasTotalesConfiguradas: number;
  valorIndicador: number;
  unidad: string;
}

export interface BloqueoAgendaResponseDto {
  nombreIndicador: string;
  horasBloqueadas: number;
  horasTotalesAgenda: number;
  valorIndicador: number;
  unidad: string;
}

export interface createSintomaDTO {
  /** Nombre del síntoma */
  nombre: string;
  /** Nivel de gravedad del síntoma (1=muy leve, 5=muy grave) */
  gravedad: '1' | '2' | '3' | '4' | '5';
  /** Descripción detallada del síntoma */
  descripcion?: string;
}

export interface updateSintomaDTO {
  /** Nombre del síntoma */
  nombre?: string;
  /** Nivel de gravedad del síntoma (1=muy leve, 5=muy grave) */
  gravedad?: '1' | '2' | '3' | '4' | '5';
  /** Descripción detallada del síntoma */
  descripcion?: string;
}

export interface CreateDiagnosticoSintomaDTO {
  /** ID del diagnóstico de enfermedad */
  fk_cm_b003_num_diagnostico: number;
  /** ID del síntoma */
  fk_cm_a003_num_sintoma: number;
}

export interface UpdateDiagnosticoSintomaDTO {
}

export interface CreateMotivoSintomaDTO {
  /** ID del motivo de consulta */
  fk_cm_b004_num_motivo_consulta: number;
  /** ID del síntoma */
  fk_cm_a003_num_sintoma: number;
}

export interface UpdateMotivoSintomaDTO {
  /** ID del motivo de consulta */
  fk_cm_b004_num_motivo_consulta?: number;
  /** ID del síntoma */
  fk_cm_a003_num_sintoma?: number;
}

