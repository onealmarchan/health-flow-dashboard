// Auto-generado desde OpenAPI spec
// NO EDITAR MANUALMENTE - Los cambios se sobrescribirán

import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import * as types from './types';

export interface ApiConfig {
  baseURL?: string;
  apiKey?: string;
  token?: string;
  timeout?: number;
}

export class ApiClient {
  private client: AxiosInstance;

  constructor(config: ApiConfig = {}) {
    this.client = axios.create({
      baseURL: config.baseURL || 'http://localhost:3000',
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para añadir token JWT automáticamente
    this.client.interceptors.request.use((reqConfig) => {
      const token = config.token || localStorage.getItem('token');
      if (token) {
        reqConfig.headers.Authorization = `Bearer ${token}`;
      }
      return reqConfig;
    });

    // Interceptor de respuesta: si el token expira (401), limpiar sesión y redirigir
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          try {
            localStorage.removeItem('token');
          } catch {}
          // Solo redirigir si no estamos ya en login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Método para actualizar el token
  setToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // ===== APP =====
  /**
   * Mensaje de bienvenida
   * Retorna un mensaje de bienvenida del servidor
   */
  async AppController_getHello(): Promise<AxiosResponse<string>> {
    return this.client.get(`/`);
  }

  /**
   * Perfil del usuario
   * Retorna la información del usuario autenticado
   */
  async AppController_getProfile(): Promise<AxiosResponse<any>> {
    return this.client.get(`/profile`);
  }

  // ===== ESPECIALIDADES =====
  /**
   * Obtener todas las especialidades
   * Retorna una lista completa de todas las especialidades médicas disponibles en el sistema.
   */
  async EspecialidadController_getAllEspecialidades(): Promise<AxiosResponse<any>> {
    return this.client.get(`/especialidad`);
  }

  /**
   * Crear nueva especialidad
   * Registra una nueva especialidad médica en el sistema.
   */
  async EspecialidadController_createEspecialidad(data: createEspecialidadDTO): Promise<AxiosResponse<any>> {
    return this.client.post(`/especialidad`, data);
  }

  /**
   * Obtener especialidad por ID
   * Retorna la información de una especialidad específica.
   */
  async EspecialidadController_getEspecialidadById(id: number): Promise<AxiosResponse<any>> {
    return this.client.get(`/especialidad/${id}`);
  }

  /**
   * Eliminar especialidad
   * Elimina una especialidad del sistema.
   */
  async EspecialidadController_deleteEspecialidad(id: number): Promise<AxiosResponse<any>> {
    return this.client.delete(`/especialidad/${id}`);
  }

  /**
   * Actualizar especialidad
   * Actualiza la información de una especialidad existente.
   */
  async EspecialidadController_updateEspecialidad(id: number, data: updateEspecialidadDTO): Promise<AxiosResponse<any>> {
    return this.client.patch(`/especialidad/${id}`, data);
  }

  // ===== MÉDICOS =====
  /**
   * Obtener todos los médicos
   * Retorna una lista completa de todos los médicos registrados en el sistema con su información profesional.
   */
  async MedicoController_getAllMedicos(): Promise<AxiosResponse<any>> {
    return this.client.get(`/medico`);
  }

  /**
   * Registrar nuevo médico
   * Registra un nuevo médico en el sistema con su información profesional.
   */
  async MedicoController_createMedico(data: CreateMedicoDTO): Promise<AxiosResponse<any>> {
    return this.client.post(`/medico`, data);
  }

  /**
   * Obtener médico por ID
   * Retorna la información completa de un médico específico basándose en su número de registro del Ministerio de Salud.
   */
  async MedicoController_getMedicoById(id: number): Promise<AxiosResponse<any>> {
    return this.client.get(`/medico/${id}`);
  }

  /**
   * Eliminar médico
   * Elimina un médico del sistema de forma permanente.
   */
  async MedicoController_deleteMedico(id: number): Promise<AxiosResponse<any>> {
    return this.client.delete(`/medico/${id}`);
  }

  /**
   * Actualizar médico
   * Actualiza la información de un médico existente. Todos los campos son opcionales.
   */
  async MedicoController_updateMedico(id: number, data: UpdateMedicoDTO): Promise<AxiosResponse<any>> {
    return this.client.patch(`/medico/${id}`, data);
  }

  // ===== ENFERMEDADES =====
  /**
   * Obtener todas las enfermedades
   * Retorna una lista completa de todas las enfermedades registradas en el sistema.
   */
  async EnfermedadController_getAllEnfermedades(): Promise<AxiosResponse<any>> {
    return this.client.get(`/enfermedad`);
  }

  /**
   * Crear nueva enfermedad
   * Registra una nueva enfermedad en el catálogo del sistema.
   */
  async EnfermedadController_createEnfermedad(data: createEnfermedadDTO): Promise<AxiosResponse<any>> {
    return this.client.post(`/enfermedad`, data);
  }

  /**
   * Obtener enfermedad por ID
   * Retorna la información de una enfermedad específica.
   */
  async EnfermedadController_getEnfermedadById(id: number): Promise<AxiosResponse<any>> {
    return this.client.get(`/enfermedad/${id}`);
  }

  /**
   * Eliminar enfermedad
   * Elimina una enfermedad del catálogo del sistema.
   */
  async EnfermedadController_deleteEnfermedad(id: number): Promise<AxiosResponse<any>> {
    return this.client.delete(`/enfermedad/${id}`);
  }

  /**
   * Actualizar enfermedad
   * Actualiza la información de una enfermedad existente.
   */
  async EnfermedadController_updateEnfermedad(id: number, data: updateEnfermedadDTO): Promise<AxiosResponse<any>> {
    return this.client.patch(`/enfermedad/${id}`, data);
  }

  // ===== COMUNIDADES =====
  /**
   * Obtener todas las comunidades
   * Retorna una lista completa de todas las comunidades registradas en el sistema con su ubicación geográfica.
   */
  async ComunidadController_getAllComunidades(): Promise<AxiosResponse<any>> {
    return this.client.get(`/comunidad`);
  }

  /**
   * Crear nueva comunidad
   * Registra una nueva comunidad en el sistema con su ubicación geográfica completa (estado, municipio, parroquia).
   */
  async ComunidadController_createComunidad(data: CreateComunidadDTO): Promise<AxiosResponse<any>> {
    return this.client.post(`/comunidad`, data);
  }

  /**
   * Obtener comunidad por ID
   * Retorna la información completa de una comunidad específica incluyendo su ubicación geográfica.
   */
  async ComunidadController_getComunidadById(id: number): Promise<AxiosResponse<any>> {
    return this.client.get(`/comunidad/${id}`);
  }

  /**
   * Eliminar comunidad
   * Elimina una comunidad del sistema.
   */
  async ComunidadController_deleteComunidad(id: number): Promise<AxiosResponse<any>> {
    return this.client.delete(`/comunidad/${id}`);
  }

  /**
   * Actualizar comunidad
   * Actualiza la información de una comunidad existente. Se valida que no exista otra comunidad con el mismo nombre en la misma ubicación.
   */
  async ComunidadController_updateComunidad(id: number, data: UpdateComunidadDTO): Promise<AxiosResponse<any>> {
    return this.client.patch(`/comunidad/${id}`, data);
  }

  // ===== PACIENTES =====
  /**
   * Obtener todos los pacientes
   * Retorna una lista completa de todos los pacientes registrados en el sistema con su información básica.
   */
  async PacienteController_getAllPacientes(): Promise<AxiosResponse<any>> {
    return this.client.get(`/paciente`);
  }

  /**
   * Crear nuevo paciente
   * Registra un nuevo paciente en el sistema con toda su información personal y médica. Requiere autenticación.
   */
  async PacienteController_createPaciente(data: CreatePacienteDTO): Promise<AxiosResponse<any>> {
    return this.client.post(`/paciente`, data);
  }

  /**
   * Obtener paciente por ID
   * Retorna la información completa de un paciente específico basándose en su ID único.
   */
  async PacienteController_getPacienteById(id: number): Promise<AxiosResponse<any>> {
    return this.client.get(`/paciente/${id}`);
  }

  /**
   * Eliminar paciente
   * Elimina un paciente del sistema de forma permanente. Requiere autenticación.
   */
  async PacienteController_deletePaciente(id: number): Promise<AxiosResponse<any>> {
    return this.client.delete(`/paciente/${id}`);
  }

  /**
   * Actualizar paciente
   * Actualiza la información de un paciente existente. Requiere autenticación.
   */
  async PacienteController_updatePaciente(id: number, data: UpdatePacienteDTO): Promise<AxiosResponse<any>> {
    return this.client.patch(`/paciente/${id}`, data);
  }

  /**
   * Obtener citas médicas del paciente
   * Retorna todas las citas médicas (pasadas, presentes y futuras) de un paciente específico.
   */
  async PacienteController_getCitasMedicas(id: number): Promise<AxiosResponse<any>> {
    return this.client.get(`/paciente/${id}/citas-medicas`);
  }

  /**
   * Obtener diagnósticos del paciente
   * Retorna el historial completo de diagnósticos médicos del paciente.
   */
  async PacienteController_getDiagnosticos(id: number): Promise<AxiosResponse<any>> {
    return this.client.get(`/paciente/${id}/diagnosticos`);
  }

  // ===== NOTIFICACIONES =====
  /**
   * Obtener todas las notificaciones disponibles
   */
  async NotificacionController_obtenerTodas(): Promise<AxiosResponse<any>> {
    return this.client.get(`/notificacion/todas`);
  }

  /**
   * Obtener todas las notificaciones no leídas
   */
  async NotificacionController_obtenerNoLeidas(): Promise<AxiosResponse<any>> {
    return this.client.get(`/notificacion/no-leidas`);
  }

  /**
   * Marcar una notificación como leída
   */
  async NotificacionController_marcarLeida(id: number): Promise<AxiosResponse<any>> {
    return this.client.patch(`/notificacion/leer/${id}`);
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async NotificacionController_marcarTodasLeidas(): Promise<AxiosResponse<any>> {
    return this.client.patch(`/notificacion/leer-todas`);
  }

  /**
   * Eliminar una notificación
   */
  async NotificacionController_eliminar(id: number): Promise<AxiosResponse<any>> {
    return this.client.delete(`/notificacion/${id}`);
  }

  // ===== AUTENTICACIÓN =====
  /**
   * Iniciar sesión y obtener token JWT
   * Autentica a un usuario con su email y contraseña, retornando un token JWT para acceder a las rutas protegidas de la API.
   */
  async AuthController_login(data: LoginDto): Promise<AxiosResponse<any>> {
    return this.client.post(`/auth/login`, data);
  }

  /**
   * Cerrar sesión y registrar en auditoría
   * Registra el evento de logout para el usuario autenticado.
   */
  async AuthController_logout(): Promise<AxiosResponse<any>> {
    return this.client.post(`/auth/logout`);
  }

  /**
   * Solicitar código OTP de recuperación de contraseña
   * Genera un código de 6 dígitos con vigencia de 15 minutos y lo envía al correo indicado. La respuesta es siempre la misma para no revelar si el email existe en el sistema.
   */
  async AuthController_requestCode(data: RequestCodeDto): Promise<AxiosResponse<any>> {
    return this.client.post(`/auth/request-code`, data);
  }

  /**
   * Restablecer contraseña usando el código OTP
   * Valida el código OTP recibido por correo y, si es correcto y no ha expirado, actualiza la contraseña del usuario. Limpia el código tras el uso.
   */
  async AuthController_resetPassword(data: ResetPasswordDto): Promise<AxiosResponse<any>> {
    return this.client.post(`/auth/reset-password`, data);
  }

  // ===== USUARIOS =====
  /**
   * Registrar un nuevo usuario (Solo ADMIN)
   * Crea un nuevo usuario en el sistema con email y contraseña. La contraseña se almacena de forma segura usando hash.
   */
  async UsuarioController_create(data: CreateUsuarioDto): Promise<AxiosResponse<any>> {
    return this.client.post(`/usuario`, data);
  }

  /**
   * Obtener todos los usuarios (Protegido)
   * Retorna una lista de todos los usuarios registrados. Requiere autenticación JWT.
   */
  async UsuarioController_findAll(): Promise<AxiosResponse<any>> {
    return this.client.get(`/usuario`);
  }

  /**
   * Habilitar o inhabilitar un usuario (Solo ADMIN)
   * Cambia el estado de acceso de un usuario. Si se inhabilita, el usuario no podrá iniciar sesión.
   */
  async UsuarioController_toggleEstado(id: number): Promise<AxiosResponse<any>> {
    return this.client.patch(`/usuario/${id}/estado`);
  }

  /**
   * Modificar un usuario (Solo ADMIN)
   * Permite actualizar la información de un usuario existente.
   */
  async UsuarioController_update(id: number, data: UpdateUsuarioDto): Promise<AxiosResponse<any>> {
    return this.client.patch(`/usuario/${id}`, data);
  }

  // ===== AUDITORÍA =====
  /**
   * Listar registros de auditoría
   * Retorna todos los cambios registrados del sistema con filtros opcionales (entidad, accion, usuarioId, rango de fechas) y paginación.
   */
  async AuditoriaController_findAll(entidad?: string, accion?: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT', usuarioId?: number, fechaDesde?: string, fechaHasta?: string, pagina?: number, limite?: number): Promise<AxiosResponse<any>> {
    const queryParams = { entidad, accion, usuarioId, fechaDesde, fechaHasta, pagina, limite };
    return this.client.get(`/auditoria`, { params: queryParams });
  }

  /**
   * Historial de un registro
   * Retorna todos los cambios históricos de un registro específico identificado por su entidad y su ID.
   */
  async AuditoriaController_findByEntidadId(entidad: string, id: string): Promise<AxiosResponse<any>> {
    return this.client.get(`/auditoria/${entidad}/${id}`);
  }

  // ===== CITAS MÉDICAS =====
  /**
   * Obtener todas las citas médicas
   * Retorna una lista completa de todas las citas médicas programadas en el sistema.
   */
  async CitaMedicaController_getAllCitas(): Promise<AxiosResponse<any>> {
    return this.client.get(`/cita-medica`);
  }

  /**
   * Crear nueva cita médica
   * Programa una nueva cita médica en el sistema para un paciente con un médico específico. Requiere autenticación.
   */
  async CitaMedicaController_createCita(data: CreateCita_MedicaDTO): Promise<AxiosResponse<any>> {
    return this.client.post(`/cita-medica`, data);
  }

  /**
   * Obtener cita médica por ID
   * Retorna la información completa de una cita médica específica.
   */
  async CitaMedicaController_getCitaById(id: number): Promise<AxiosResponse<any>> {
    return this.client.get(`/cita-medica/${id}`);
  }

  /**
   * Cancelar cita médica
   * Cancela o elimina una cita médica del sistema. Requiere autenticación.
   */
  async CitaMedicaController_deleteCita(id: number): Promise<AxiosResponse<any>> {
    return this.client.delete(`/cita-medica/${id}`);
  }

  /**
   * Actualizar cita médica
   * Actualiza la información de una cita médica existente (fecha, hora, estado, etc.). Requiere autenticación.
   */
  async CitaMedicaController_updateCita(id: number, data: UpdateCita_MedicaDTO): Promise<AxiosResponse<any>> {
    return this.client.patch(`/cita-medica/${id}`, data);
  }

  // ===== SESIÓN MÉDICA =====
  /**
   * Crear nueva sesión médica
   * Registra una nueva sesión médica para un médico específico, con validación de solapamiento de sesiones. El ID se asigna automáticamente. Requiere autenticación.
   */
  async SesionMedicaController_create(data: CreateSesionMedicaDTO): Promise<AxiosResponse<any>> {
    return this.client.post(`/sesion-medica`, data);
  }

  /**
   * Obtener todas las sesiones médicas
   * Retorna una lista de todas las sesiones médicas registradas con información del médico asociado.
   */
  async SesionMedicaController_findAll(): Promise<AxiosResponse<any>> {
    return this.client.get(`/sesion-medica`);
  }

  /**
   * Obtener sesiones médicas por médico
   * Retorna todas las sesiones médicas asociadas a un médico específico.
   */
  async SesionMedicaController_findByMedico(medicoId: number): Promise<AxiosResponse<any>> {
    return this.client.get(`/sesion-medica/medico/${medicoId}`);
  }

  /**
   * Obtener sesión médica por ID
   * Retorna la información detallada de una sesión médica específica.
   */
  async SesionMedicaController_findOne(id: number): Promise<AxiosResponse<any>> {
    return this.client.get(`/sesion-medica/${id}`);
  }

  /**
   * Actualizar sesión médica
   * Actualiza la información de una sesión médica existente. Requiere autenticación.
   */
  async SesionMedicaController_update(id: number, data: UpdateSesionMedicaDTO): Promise<AxiosResponse<any>> {
    return this.client.patch(`/sesion-medica/${id}`, data);
  }

  /**
   * Eliminar sesión médica
   * Elimina un registro de sesión médica del sistema.
   */
  async SesionMedicaController_remove(id: number): Promise<AxiosResponse<any>> {
    return this.client.delete(`/sesion-medica/${id}`);
  }

  // ===== MOTIVO CONSULTA =====
  /**
   * Crear nuevo motivo de consulta
   * Registra un nuevo motivo de consulta para un paciente específico.
   */
  async MotivoConsultaController_create(data: CreateMotivoConsultaDTO): Promise<AxiosResponse<any>> {
    return this.client.post(`/motivo-consulta`, data);
  }

  /**
   * Obtener todos los motivos de consulta
   * Retorna una lista de todos los motivos de consulta registrados.
   */
  async MotivoConsultaController_findAll(): Promise<AxiosResponse<any>> {
    return this.client.get(`/motivo-consulta`);
  }

  /**
   * Obtener motivo de consulta por ID
   * Retorna la información detallada de un motivo de consulta específico.
   */
  async MotivoConsultaController_findOne(id: number): Promise<AxiosResponse<any>> {
    return this.client.get(`/motivo-consulta/${id}`);
  }

  /**
   * Actualizar motivo de consulta
   * Actualiza la información de un motivo de consulta existente.
   */
  async MotivoConsultaController_update(id: number, data: UpdateMotivoConsultaDTO): Promise<AxiosResponse<any>> {
    return this.client.patch(`/motivo-consulta/${id}`, data);
  }

  /**
   * Eliminar motivo de consulta
   * Elimina un registro de motivo de consulta del sistema.
   */
  async MotivoConsultaController_remove(id: number): Promise<AxiosResponse<any>> {
    return this.client.delete(`/motivo-consulta/${id}`);
  }

  /**
   * Obtener motivos de consulta por Cedula de paciente
   * Retorna la lista de motivos de consulta asociados a un paciente específico por su cédula.
   */
  async MotivoConsultaController_findByPacienteCedula(ci: string): Promise<AxiosResponse<any>> {
    return this.client.get(`/motivo-consulta/paciente/${ci}`);
  }

  // ===== BLOQUEO AGENDA =====
  /**
   * Crear nuevo bloqueo de agenda
   * Registra un bloqueo de agenda para una sesión médica en un rango de fechas determinado. El ID se asigna automáticamente. Requiere autenticación.
   */
  async BloqueoAgendaController_create(data: CreateBloqueoAgendaDTO): Promise<AxiosResponse<any>> {
    return this.client.post(`/bloqueo-agenda`, data);
  }

  /**
   * Obtener todos los bloqueos de agenda
   * Retorna la lista completa de bloqueos de agenda con datos del médico y sesión asociados.
   */
  async BloqueoAgendaController_findAll(): Promise<AxiosResponse<any>> {
    return this.client.get(`/bloqueo-agenda`);
  }

  /**
   * Obtener bloqueos de agenda por médico
   * Retorna todos los bloqueos de agenda asociados a un médico específico.
   */
  async BloqueoAgendaController_findByMedico(medicoId: number): Promise<AxiosResponse<any>> {
    return this.client.get(`/bloqueo-agenda/medico/${medicoId}`);
  }

  /**
   * Obtener bloqueos de agenda por sesión médica
   * Retorna todos los bloqueos de agenda para una sesión médica específica.
   */
  async BloqueoAgendaController_findBySesion(sesionId: number): Promise<AxiosResponse<any>> {
    return this.client.get(`/bloqueo-agenda/sesion/${sesionId}`);
  }

  /**
   * Obtener bloqueo de agenda por ID
   * Retorna la información detallada de un bloqueo de agenda específico.
   */
  async BloqueoAgendaController_findOne(id: number): Promise<AxiosResponse<any>> {
    return this.client.get(`/bloqueo-agenda/${id}`);
  }

  /**
   * Actualizar bloqueo de agenda
   * Actualiza parcialmente un bloqueo de agenda existente. Requiere autenticación.
   */
  async BloqueoAgendaController_update(id: number, data: UpdateBloqueoAgendaDTO): Promise<AxiosResponse<any>> {
    return this.client.patch(`/bloqueo-agenda/${id}`, data);
  }

  /**
   * Eliminar bloqueo de agenda
   * Elimina un registro de bloqueo de agenda del sistema.
   */
  async BloqueoAgendaController_remove(id: number): Promise<AxiosResponse<any>> {
    return this.client.delete(`/bloqueo-agenda/${id}`);
  }

  // ===== DIAGNÓSTICOS DE ENFERMEDADES =====
  /**
   * Crear nuevo diagnóstico de enfermedad
   * Registra un nuevo diagnóstico de enfermedad para un paciente.
   */
  async DiagnosticoEnfermedadController_create(data: CreateDiagnosticoEnfermedadDTO): Promise<AxiosResponse<any>> {
    return this.client.post(`/diagnostico-enfermedad`, data);
  }

  /**
   * Obtener todos los diagnósticos de enfermedades
   * Retorna una lista completa de todos los diagnósticos de enfermedades registrados.
   */
  async DiagnosticoEnfermedadController_findAll(): Promise<AxiosResponse<any>> {
    return this.client.get(`/diagnostico-enfermedad`);
  }

  /**
   * Obtener diagnóstico por ID
   * Retorna la información completa de un diagnóstico específico.
   */
  async DiagnosticoEnfermedadController_findOne(id: number): Promise<AxiosResponse<any>> {
    return this.client.get(`/diagnostico-enfermedad/${id}`);
  }

  /**
   * Actualizar diagnóstico
   * Actualiza la información de un diagnóstico existente.
   */
  async DiagnosticoEnfermedadController_updateAll(id: number, data: UpdateDiagnosticoEnfermedadDTO): Promise<AxiosResponse<any>> {
    return this.client.patch(`/diagnostico-enfermedad/${id}`, data);
  }

  /**
   * Eliminar diagnóstico
   * Elimina un diagnóstico del sistema.
   */
  async DiagnosticoEnfermedadController_remove(id: number): Promise<AxiosResponse<any>> {
    return this.client.delete(`/diagnostico-enfermedad/${id}`);
  }

  // ===== INDICADORES Y ESTADÍSTICAS =====
  /**
   * Distribución porcentual de enfermedades (Mensual)
   * Obtiene la distribución porcentual de enfermedades diagnosticadas durante un mes específico.
   */
  async IndicadoresController_distribucionEnfermedadesMensual(mes: number, anio: number): Promise<AxiosResponse<any>> {
    const queryParams = { mes, anio };
    return this.client.get(`/indicadores/distribucion-enfermedades`, { params: queryParams });
  }

  /**
   * Tasa de demanda por especialidad (Trimestral)
   * Calcula la tasa de aumento o decremento de casos por especialidad médica en un trimestre.
   */
  async IndicadoresController_tasaDemandaEspecialidad(trimestre: number, anio: number): Promise<AxiosResponse<any>> {
    const queryParams = { trimestre, anio };
    return this.client.get(`/indicadores/tasa-demanda-especialidad`, { params: queryParams });
  }

  /**
   * Distribución etaria por especialidad (Bimensual)
   * Muestra la distribución de edades de pacientes atendidos por especialidad en un bimestre.
   */
  async IndicadoresController_distribucionEtariaEspecialidad(bimestre: number, anio: number): Promise<AxiosResponse<any>> {
    const queryParams = { bimestre, anio };
    return this.client.get(`/indicadores/distribucion-etaria-especialidad`, { params: queryParams });
  }

  /**
   * Tendencia de consultas por grupo etario (Trimestral)
   * Analiza la tendencia de consultas médicas segmentada por rangos de edad.
   */
  async IndicadoresController_tendenciaConsultasGrupoEtario(trimestre: number, anio: number): Promise<AxiosResponse<any>> {
    const queryParams = { trimestre, anio };
    return this.client.get(`/indicadores/tendencia-consultas-grupo-etario`, { params: queryParams });
  }

  /**
   * Porcentaje de retención por especialidad (Trimestral)
   * Calcula el porcentaje de pacientes que regresan a consulta en la misma especialidad.
   */
  async IndicadoresController_porcentajeRetencionEspecialidad(trimestre: number, anio: number): Promise<AxiosResponse<any>> {
    const queryParams = { trimestre, anio };
    return this.client.get(`/indicadores/porcentaje-retencion-especialidad`, { params: queryParams });
  }

  /**
   * Concentración de condiciones por edad (Bimensual)
   * Analiza la concentración de una enfermedad específica por grupos de edad.
   */
  async IndicadoresController_concentracionCondicionEdad(bimestre: number, anio: number, enfermedadId: number): Promise<AxiosResponse<any>> {
    const queryParams = { bimestre, anio, enfermedadId };
    return this.client.get(`/indicadores/concentracion-condicion-edad`, { params: queryParams });
  }

  /**
   * Variación porcentual de reconsultas en pacientes críticos (Mensual)
   * Calcula la variación porcentual en la frecuencia de reconsultas de pacientes en estado crítico.
   */
  async IndicadoresController_frecuenciaReconsultasCriticos(mes: number, anio: number): Promise<AxiosResponse<any>> {
    const queryParams = { mes, anio };
    return this.client.get(`/indicadores/variacion-reconsultas-criticos`, { params: queryParams });
  }

  /**
   * Porcentaje de Desviación de Carga por Especialidad (Mensual)
   * Calcula el porcentaje de sobrecarga o capacidad disponible de cada especialidad médica durante un mes determinado. Fórmula: ((Carga Actual de Pacientes / Capacidad Meta Total) - 1) × 100, donde Capacidad Meta Total = Número de médicos × 250 (meta institucional). Valores positivos indican sobrecarga; negativos, capacidad disponible.
   */
  async IndicadoresController_desviacionCargaEspecialidad(mes: number, anio: number): Promise<AxiosResponse<any>> {
    const queryParams = { mes, anio };
    return this.client.get(`/indicadores/desviacion-carga-especialidad`, { params: queryParams });
  }

  /**
   * Interconsulta entre especialidades (Trimestral)
   * Analiza el flujo de interconsultas entre diferentes especialidades médicas durante un trimestre.
   */
  async IndicadoresDosController_interconsultaEspecialidades(trimestre: number, anio: number): Promise<AxiosResponse<any>> {
    const queryParams = { trimestre, anio };
    return this.client.get(`/indicadores-dos/interconsulta-especialidades`, { params: queryParams });
  }

  /**
   * Tasa de detección temprana (Mensual)
   * Calcula la tasa de detección temprana de enfermedades basándose en el tiempo entre la primera consulta y el diagnóstico.
   */
  async IndicadoresDosController_tasaDeteccionTemprana(mes: number, anio: number): Promise<AxiosResponse<any>> {
    const queryParams = { mes, anio };
    return this.client.get(`/indicadores-dos/tasa-deteccion-temprana`, { params: queryParams });
  }

  /**
   * Densidad Epidemiológica por Comunidad (Trimestral)
   * Calcula el porcentaje de casos de enfermedades detectadas respecto al total de pacientes por comunidad. Tipo: Eficacia | Frecuencia: Trimestral | Dirección deseada: Descendente.
   */
  async IndicadoresDosController_densidadEpidemiologicaComunidad(trimestre: number, anio: number): Promise<AxiosResponse<any>> {
    const queryParams = { trimestre, anio };
    return this.client.get(`/indicadores-dos/densidad-epidemiologica-comunidad`, { params: queryParams });
  }

  /**
   * Índice de Concentración Comunitaria de Casos (Semestral)
   * Compara los casos detectados en cada comunidad entre el período actual y el período anterior de la misma duración. Tipo: Efectividad | Frecuencia: Semestral | Dirección deseada: Descendente. Si el período anterior es cero y el actual es mayor, se marca como brote (indicador: null).
   */
  async IndicadoresDosController_indiceConcentracionComunitaria(semestre: number, anio: number): Promise<AxiosResponse<any>> {
    const queryParams = { semestre, anio };
    return this.client.get(`/indicadores-dos/indice-concentracion-comunitaria`, { params: queryParams });
  }

  /**
   * Tasa de Crecimiento Epidemiológico por Comunidad (Trimestral)
   * Compara el total de casos por comunidad entre el trimestre actual y el trimestre anterior. Tipo: Eficiencia | Frecuencia: Trimestral | Dirección deseada: Descendente. Si el período anterior es cero y el actual es mayor, se marca como brote (indicador: null).
   */
  async IndicadoresDosController_tasaCrecimientoEpidemiologico(trimestre: number, anio: number): Promise<AxiosResponse<any>> {
    const queryParams = { trimestre, anio };
    return this.client.get(`/indicadores-dos/tasa-crecimiento-epidemiologico`, { params: queryParams });
  }

  /**
   * Tasa de Vulnerabilidad Comunitaria - Pacientes Encamados (Semestral)
   * Calcula el porcentaje de pacientes con estado "encamado" respecto al total de pacientes por comunidad. Tipo: Eficacia | Frecuencia: Semestral | Dirección deseada: Descendente. El estado "encamado" es un atributo del registro del paciente (campo estado_paciente).
   */
  async IndicadoresDosController_vulnerabilidadComunitariaEncamados(semestre: number, anio: number): Promise<AxiosResponse<any>> {
    const queryParams = { semestre, anio };
    return this.client.get(`/indicadores-dos/vulnerabilidad-comunitaria-encamados`, { params: queryParams });
  }

  /**
   * Carga promedio por especialista (Global o Mensual)
   * Calcula el promedio de pacientes atendidos por cada especialista activo en el sistema. Tipo: Razón / Promedio | Dirección: Informativo. Un especialista activo es aquel que tiene al menos una sesión médica registrada. Si no se proporcionan mes y anio, el indicador se calcula sobre el total histórico.
   */
  async IndicadoresDosController_cargaPromedioPorEspecialista(mes?: number, anio?: number): Promise<AxiosResponse<any>> {
    const queryParams = { mes, anio };
    return this.client.get(`/indicadores-dos/carga-promedio-especialista`, { params: queryParams });
  }

  /**
   * Porcentaje de urgencias sobre total de consultas (Global o Mensual)
   * Determina qué porcentaje del total de consultas realizadas corresponde a consultas de urgencia (emergencia). Tipo: Porcentaje | Dirección: Descendente. Una consulta de urgencia es aquella cuyo tipo_cita es "emergencia". Si no se proporcionan mes y anio, el indicador se calcula sobre el total histórico.
   */
  async IndicadoresDosController_porcentajeUrgenciasSobreTotalConsultas(mes?: number, anio?: number): Promise<AxiosResponse<any>> {
    const queryParams = { mes, anio };
    return this.client.get(`/indicadores-dos/porcentaje-urgencias-consultas`, { params: queryParams });
  }

  // ===== INDICADORES DASHBOARD =====
  /**
   * Total de Pacientes
   * Retorna el total de pacientes registrados en el sistema, la distribución porcentual por comunidad y la variación mensual respecto al mes anterior (basada en pacientes con citas en cada período).
   */
  async DashboardController_getTotalPacientes(): Promise<AxiosResponse<TotalPacientesResponseDto>> {
    return this.client.get(`/indicadores/dashboard/total-pacientes`);
  }

  /**
   * Total de Consultas del Período Actual (Mensual)
   * Retorna el total de consultas (citas médicas) realizadas durante el mes actual, la distribución porcentual por especialidad y la variación porcentual respecto al mes anterior.
   */
  async DashboardController_getTotalConsultas(): Promise<AxiosResponse<TotalConsultasResponseDto>> {
    return this.client.get(`/indicadores/dashboard/total-consultas`);
  }

  /**
   * Citas de Hoy
   * Retorna el total de citas médicas programadas para el día actual, la distribución porcentual por especialidad y la variación porcentual respecto al día anterior.
   */
  async DashboardController_getCitasHoy(): Promise<AxiosResponse<CitasHoyResponseDto>> {
    return this.client.get(`/indicadores/dashboard/citas-hoy`);
  }

  /**
   * Porcentaje de ocupación de agenda
   * Calcula el porcentaje de ocupación de las agendas médicas configuradas. Compara las horas de sesiones con al menos una cita activa (agendada o atendida) respecto al total de horas configuradas en todas las sesiones médicas del sistema. Un valor más alto indica mayor aprovechamiento de la agenda. (Comportamiento: ascendente)
   */
  async DashboardController_getOcupacionAgenda(): Promise<AxiosResponse<OcupacionAgendaResponseDto>> {
    return this.client.get(`/indicadores/dashboard/ocupacion-agenda`);
  }

  /**
   * Porcentaje de bloqueos sobre agenda total
   * Calcula qué porcentaje de las horas disponibles de las agendas médicas se encuentran bloqueadas. Considera tanto bloqueos específicos de sesión como bloqueos generales del médico, ponderados por la duración del rango de bloqueo. Un valor más alto indica mayor inactividad programada. (Comportamiento: descendente)
   */
  async DashboardController_getBloqueoAgenda(): Promise<AxiosResponse<BloqueoAgendaResponseDto>> {
    return this.client.get(`/indicadores/dashboard/bloqueos-agenda`);
  }

  // ===== SÍNTOMAS =====
  /**
   * Obtener todos los síntomas
   * Retorna una lista completa de todos los síntomas registrados en el sistema.
   */
  async SintomaController_getAllSintomas(): Promise<AxiosResponse<any>> {
    return this.client.get(`/sintoma`);
  }

  /**
   * Crear nuevo síntoma
   * Registra un nuevo síntoma en el sistema.
   */
  async SintomaController_createSintoma(data: createSintomaDTO): Promise<AxiosResponse<any>> {
    return this.client.post(`/sintoma`, data);
  }

  /**
   * Obtener síntoma por ID
   * Retorna la información de un síntoma específico.
   */
  async SintomaController_getSintomaById(id: number): Promise<AxiosResponse<any>> {
    return this.client.get(`/sintoma/${id}`);
  }

  /**
   * Eliminar síntoma
   * Elimina un síntoma del sistema.
   */
  async SintomaController_deleteSintoma(id: number): Promise<AxiosResponse<any>> {
    return this.client.delete(`/sintoma/${id}`);
  }

  /**
   * Actualizar síntoma
   * Actualiza la información de un síntoma existente.
   */
  async SintomaController_updateSintoma(id: number, data: updateSintomaDTO): Promise<AxiosResponse<any>> {
    return this.client.patch(`/sintoma/${id}`, data);
  }

  // ===== DIAGNÓSTICOS DE SÍNTOMAS =====
  /**
   * Registrar síntoma en diagnóstico
   * Asocia un síntoma a un diagnóstico de enfermedad existente.
   */
  async DiagnosticoSintomaController_create(data: CreateDiagnosticoSintomaDTO): Promise<AxiosResponse<any>> {
    return this.client.post(`/diagnostico-sintoma`, data);
  }

  /**
   * Obtener todos los síntomas de diagnósticos
   * Retorna una lista completa de todos los síntomas asociados a diagnósticos.
   */
  async DiagnosticoSintomaController_getAll(): Promise<AxiosResponse<any>> {
    return this.client.get(`/diagnostico-sintoma`);
  }

  /**
   * Obtener síntomas por diagnóstico
   * Retorna todos los síntomas asociados a un diagnóstico específico.
   */
  async DiagnosticoSintomaController_getByDiagnostico(id: number): Promise<AxiosResponse<any>> {
    return this.client.get(`/diagnostico-sintoma/diagnostico/${id}`);
  }

  /**
   * Actualizar síntoma de diagnóstico
   * Actualiza la información de un síntoma específico en un diagnóstico.
   */
  async DiagnosticoSintomaController_partialUpdate(diagnosticoId: number, sintomaId: number, data: UpdateDiagnosticoSintomaDTO): Promise<AxiosResponse<any>> {
    return this.client.patch(`/diagnostico-sintoma/${diagnosticoId}/${sintomaId}`, data);
  }

  /**
   * Eliminar síntoma de diagnóstico
   * Elimina la asociación de un síntoma con un diagnóstico.
   */
  async DiagnosticoSintomaController_remove(diagnosticoId: number, sintomaId: number): Promise<AxiosResponse<any>> {
    return this.client.delete(`/diagnostico-sintoma/${diagnosticoId}/${sintomaId}`);
  }

  // ===== MOTIVOS DE SÍNTOMAS =====
  /**
   * Registrar síntoma en motivo de consulta
   * Asocia un síntoma a un motivo de consulta existente.
   */
  async MotivoSintomaController_create(data: CreateMotivoSintomaDTO): Promise<AxiosResponse<any>> {
    return this.client.post(`/motivo-sintoma`, data);
  }

  /**
   * Obtener todos los síntomas de motivos de consulta
   * Retorna una lista completa de todos los síntomas asociados a motivos de consulta.
   */
  async MotivoSintomaController_getAll(): Promise<AxiosResponse<any>> {
    return this.client.get(`/motivo-sintoma`);
  }

  /**
   * Obtener síntomas por motivo de consulta
   * Retorna todos los síntomas asociados a un motivo de consulta específico.
   */
  async MotivoSintomaController_getByMotivoConsulta(id: number): Promise<AxiosResponse<any>> {
    return this.client.get(`/motivo-sintoma/motivo/${id}`);
  }

  /**
   * Actualizar síntoma de motivo de consulta
   * Actualiza la información de un síntoma específico en un motivo de consulta.
   */
  async MotivoSintomaController_partialUpdate(motivoId: number, sintomaId: number, data: UpdateMotivoSintomaDTO): Promise<AxiosResponse<any>> {
    return this.client.patch(`/motivo-sintoma/${motivoId}/${sintomaId}`, data);
  }

  /**
   * Eliminar síntoma de motivo de consulta
   * Elimina la asociación de un síntoma con un motivo de consulta.
   */
  async MotivoSintomaController_remove(motivoId: number, sintomaId: number): Promise<AxiosResponse<any>> {
    return this.client.delete(`/motivo-sintoma/${motivoId}/${sintomaId}`);
  }

  // ===== REPORTES =====
  /**
   * Reporte 1: Total de Diagnósticos Realizados
   * Genera un PDF con el total de diagnósticos realizados en un rango de fechas.
   */
  async ReportesController_diagnosticosTotales(startDate: string, endDate: string, token?: string, diseaseId?: number): Promise<AxiosResponse<any>> {
    const queryParams = { startDate, endDate, token, diseaseId };
    return this.client.get(`/reportes/diagnosticos/totales`, { params: queryParams });
  }

  /**
   * Reporte 2: Diagnósticos con Menor Frecuencia
   * Genera un PDF con las enfermedades menos diagnosticadas en un rango de fechas.
   */
  async ReportesController_diagnosticosMinimos(startDate: string, endDate: string, token?: string, diseaseId?: number): Promise<AxiosResponse<any>> {
    const queryParams = { startDate, endDate, token, diseaseId };
    return this.client.get(`/reportes/diagnosticos/minimos`, { params: queryParams });
  }

  /**
   * Reporte 3: Promedio de Diagnósticos
   * Genera un PDF con el promedio de diagnósticos realizados por especialidad.
   */
  async ReportesController_diagnosticosPromedio(startDate: string, endDate: string, token?: string, specialtyId?: number): Promise<AxiosResponse<any>> {
    const queryParams = { startDate, endDate, token, specialtyId };
    return this.client.get(`/reportes/diagnosticos/promedio`, { params: queryParams });
  }

  /**
   * Reporte 4: Enfermedad Más Diagnosticada
   * Genera un PDF con la enfermedad más frecuentemente diagnosticada.
   */
  async ReportesController_enfermedadMasDiagnosticada(startDate: string, endDate: string, token?: string, specialtyId?: number): Promise<AxiosResponse<any>> {
    const queryParams = { startDate, endDate, token, specialtyId };
    return this.client.get(`/reportes/diagnosticos/enfermedad-top`, { params: queryParams });
  }

  /**
   * Reporte 5: Total de Citas Médicas
   * Genera un PDF con el total de citas médicas registradas en un rango de fechas.
   */
  async ReportesController_citasTotales(startDate: string, endDate: string, token?: string, status?: 'agendada' | 'atendida' | 'cancelada', specialtyId?: number): Promise<AxiosResponse<any>> {
    const queryParams = { startDate, endDate, token, status, specialtyId };
    return this.client.get(`/reportes/citas/totales`, { params: queryParams });
  }

  /**
   * Reporte 6: Citas con Menor Frecuencia por Especialidad
   * Genera un PDF con las especialidades que tienen menos citas programadas.
   */
  async ReportesController_citasMinimas(startDate: string, endDate: string, token?: string, status?: 'agendada' | 'atendida' | 'cancelada', specialtyId?: number): Promise<AxiosResponse<any>> {
    const queryParams = { startDate, endDate, token, status, specialtyId };
    return this.client.get(`/reportes/citas/minimas`, { params: queryParams });
  }

  /**
   * Reporte 7: Promedio de Citas por Especialidad
   * Genera un PDF con el promedio de citas por especialidad en el período.
   */
  async ReportesController_citasPromedioEspecialidad(startDate: string, endDate: string, token?: string, status?: 'agendada' | 'atendida' | 'cancelada', specialtyId?: number): Promise<AxiosResponse<any>> {
    const queryParams = { startDate, endDate, token, status, specialtyId };
    return this.client.get(`/reportes/citas/promedio-especialidad`, { params: queryParams });
  }

  /**
   * Reporte 8: Especialidades con Más Citas
   * Genera un PDF con las especialidades que tienen mayor cantidad de citas.
   */
  async ReportesController_citasMaximasEspecialidad(startDate: string, endDate: string, token?: string, status?: 'agendada' | 'atendida' | 'cancelada', specialtyId?: number): Promise<AxiosResponse<any>> {
    const queryParams = { startDate, endDate, token, status, specialtyId };
    return this.client.get(`/reportes/citas/maximas-especialidad`, { params: queryParams });
  }

  /**
   * Reporte 9: Médicos con Citas Asignadas
   * Genera un PDF con el total de médicos que tienen citas asignadas.
   */
  async ReportesController_medicosAsignados(startDate: string, endDate: string, token?: string, status?: 'agendada' | 'atendida' | 'cancelada', specialtyId?: number): Promise<AxiosResponse<any>> {
    const queryParams = { startDate, endDate, token, status, specialtyId };
    return this.client.get(`/reportes/medicos/asignados`, { params: queryParams });
  }

  /**
   * Reporte 10: Médico con Menos Citas Atendidas
   * Genera un PDF identificando al médico con menor cantidad de citas atendidas.
   */
  async ReportesController_medicoCitasMinimas(startDate: string, endDate: string, token?: string, status?: 'agendada' | 'atendida' | 'cancelada', specialtyId?: number): Promise<AxiosResponse<any>> {
    const queryParams = { startDate, endDate, token, status, specialtyId };
    return this.client.get(`/reportes/medicos/citas-minimas`, { params: queryParams });
  }

  /**
   * Reporte 11: Promedio de Pacientes por Médico
   * Genera un PDF con el promedio de pacientes atendidos por cada médico.
   */
  async ReportesController_medicoPacientesPromedio(startDate: string, endDate: string, token?: string, status?: 'agendada' | 'atendida' | 'cancelada', specialtyId?: number): Promise<AxiosResponse<any>> {
    const queryParams = { startDate, endDate, token, status, specialtyId };
    return this.client.get(`/reportes/medicos/pacientes-promedio`, { params: queryParams });
  }

  /**
   * Reporte 12: Médicos con Más Citas Atendidas
   * Genera un PDF identificando a los médicos con mayor cantidad de citas atendidas.
   */
  async ReportesController_medicosCitasMaximas(startDate: string, endDate: string, token?: string, status?: 'agendada' | 'atendida' | 'cancelada', specialtyId?: number): Promise<AxiosResponse<any>> {
    const queryParams = { startDate, endDate, token, status, specialtyId };
    return this.client.get(`/reportes/medicos/citas-maximas`, { params: queryParams });
  }

}

// Instancia por defecto
export const api = new ApiClient();

export * from './types';
