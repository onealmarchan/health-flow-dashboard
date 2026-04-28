import { api } from './api';
import { Usuario, CreateUsuarioDto } from '@/types';

export const usuarioService = {
  // Obtener todos los usuarios (protegido con JWT)
  getAll: () => api.get<Usuario[]>('/usuario'),

  // Obtener usuario por ID
  getById: (id: number) => api.get<Usuario>(`/usuario/${id}`),

  // Crear nuevo usuario
  create: (data: CreateUsuarioDto) => api.post<Usuario>('/usuario', data),

  // Actualizar usuario
  update: (id: number, data: Partial<CreateUsuarioDto>) =>
    api.patch<Usuario>(`/usuario/${id}`, data),

  // Inhabilitar/cambiar estado de usuario
  toggleStatus: (id: number) =>
    api.patch<Usuario>(`/usuario/${id}/estado`, {}),

};