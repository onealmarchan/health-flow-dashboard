import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuarioService } from '@/services/usuario.service';
import { useToast } from '@/hooks/use-toast';
import { Usuario, CreateUsuarioDto, UserRole } from '@/types';
import { AxiosError } from 'axios';

/**
 * Hook para obtener la lista de usuarios
 */
export function useUsuarios() {
  return useQuery<Usuario[]>({
    queryKey: ['usuarios'],
    queryFn: () => usuarioService.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutos de caché
  });
}

/**
 * Hook para crear un nuevo usuario
 */
export function useCreateUsuario() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateUsuarioDto) => usuarioService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast({
        title: 'Usuario creado',
        description: 'El usuario ha sido registrado exitosamente.',
      });
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      const msg = err?.response?.data?.message || 'Error al crear el usuario.';
      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para actualizar un usuario existente
 */
export function useUpdateUsuario() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateUsuarioDto> }) =>
      usuarioService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast({
        title: 'Usuario actualizado',
        description: 'Los cambios se han guardado correctamente.',
      });
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      const msg = err?.response?.data?.message || 'Error al actualizar el usuario.';
      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para alternar el estado (activar/desactivar) de un usuario
 */
export function useToggleUsuarioStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => usuarioService.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast({
        title: 'Estado actualizado',
        description: 'El estado del usuario ha sido modificado.',
      });
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      const msg = err?.response?.data?.message || 'No se pudo cambiar el estado.';
      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para eliminar un usuario
 */
export function useDeleteUsuario() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => usuarioService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast({
        title: 'Usuario eliminado',
        description: 'El usuario ha sido removido del sistema.',
      });
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      const msg = err?.response?.data?.message || 'No se pudo eliminar el usuario.';
      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive',
      });
    },
  });
}
