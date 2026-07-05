import { z } from 'zod';

const soloLetras = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;
const soloDigitos = /^\d+$/;

const nombreField = (label: string) =>
  z.string().min(2, `${label} debe tener al menos 2 caracteres`).regex(soloLetras, `${label} solo admite letras y espacios`);

// -------- Paciente --------
export const pacienteSchema = z.object({
  ciTipo: z.enum(['V', 'E'], { required_error: 'Selecciona el tipo de cédula' }),
  ci: z.string().regex(soloDigitos, 'La cédula solo admite números').min(6, 'Mínimo 6 dígitos').max(8, 'Máximo 8 dígitos'),
  nombres: nombreField('Los nombres'),
  apellidos: nombreField('Los apellidos'),
  fechaNac: z.string().refine(v => !!v && new Date(v) <= new Date(), 'Fecha inválida o mayor a hoy'),
  sexo: z.enum(['M', 'F'], { required_error: 'Selecciona el sexo' }),
  nacionalidad: z.enum(['Venezolano', 'Extranjero'], { required_error: 'Selecciona la nacionalidad' }),
  estadoCivil: z.enum(['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a'], { required_error: 'Selecciona el estado civil' }),
  telefono: z.string().regex(/^\d{11}$/, 'El teléfono debe tener 11 dígitos numéricos'),
  direccion: z.string().min(10, 'La dirección debe tener al menos 10 caracteres'),
  comunidad: z.string().regex(soloLetras, 'La comunidad solo admite letras'),
  estadoGeo: z.string().regex(soloLetras, 'El estado solo admite letras'),
  municipio: z.string().regex(soloLetras, 'El municipio solo admite letras'),
  parroquia: z.string().regex(soloLetras, 'La parroquia solo admite letras'),
});
export type PacienteInput = z.infer<typeof pacienteSchema>;

// -------- Motivo de Consulta --------
export const motivoConsultaSchema = z.object({
  descripcion: z.string().min(10, 'Mínimo 10 caracteres').max(200, 'Máximo 200 caracteres'),
  urgencia: z.enum(['Bajo', 'Medio', 'Alto'], { required_error: 'Selecciona nivel de urgencia' }),
  fecha: z.string().min(1, 'Fecha requerida'),
  observacion: z.string().max(200, 'Máximo 200 caracteres').optional().or(z.literal('')),
});
export type MotivoConsultaInput = z.infer<typeof motivoConsultaSchema>;

// -------- Especialista --------
export const especialistaSchema = (mppsExistentes: Set<string> = new Set()) => z.object({
  mpps: z.string().regex(/^\d{4,6}$/, 'MPPS entre 4 y 6 dígitos numéricos').refine(v => !mppsExistentes.has(v), 'Este Nº MPPS ya existe'),
  nombre: nombreField('El nombre'),
  apellido: nombreField('El apellido'),
  telefono: z.string().regex(/^\d{11}$/, 'El teléfono debe tener 11 dígitos numéricos'),
  especialidadId: z.string().min(1, 'La especialidad es requerida'),
});

// -------- Especialidad médica --------
export const especialidadSchema = z.object({
  nombre: z.string().regex(soloLetras, 'Solo letras y espacios').min(3, 'Mínimo 3 caracteres').max(100, 'Máximo 100 caracteres'),
  descripcion: z.string().min(1, 'Descripción requerida').max(100, 'Máximo 100 caracteres'),
});

// -------- Diagnóstico --------
export const sintomaSchema = z.object({
  nombre: z.string().min(3, 'Nombre mínimo 3 caracteres'),
  descripcion: z.string().max(100, 'Máximo 100 caracteres').optional().or(z.literal('')),
  gravedad: z.number().int().min(1, 'Gravedad 1–5').max(5, 'Gravedad 1–5'),
});

export const diagnosticoSchema = z.object({
  sintomas: z.array(sintomaSchema).min(1, 'Agrega al menos un síntoma'),
  enfermedad: z.string().min(1, 'Selecciona la enfermedad'),
  cronico: z.boolean({ required_error: 'Indica si es crónico' }),
  descripcion: z.string().min(15, 'Descripción mínima 15 caracteres'),
});

// -------- Usuario --------
export const usuarioSchema = (emailsExistentes: Set<string> = new Set()) => z.object({
  nombreCompleto: z.string().regex(soloLetras, 'Solo letras y espacios').min(5, 'Mínimo 5 caracteres (nombre y apellido)'),
  email: z.string().email('Email inválido').refine(v => !emailsExistentes.has(v.toLowerCase()), 'Este correo ya está registrado'),
  rol: z.enum(['Administrador', 'Auxiliar Administrativo'], { required_error: 'Selecciona un rol' }),
});
