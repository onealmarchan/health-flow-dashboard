import { api } from './api';
import { Usuario, CreateUsuarioDto } from '@/types';

export const usuarioService = {
  // Obtener todos los usuarios (protegido con JWT)
  getAll: () => api.get<Usuario[]>('/usuario'),
  
  // Crear nuevo usuario
  create: (data: CreateUsuarioDto) => api.post<Usuario>('/usuario', data),
};