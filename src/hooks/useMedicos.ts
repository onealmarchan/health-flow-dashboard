import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicoService } from '@/services/medico.service';
import { especialidadService } from '@/services/especialidad.service';
import { toast } from 'sonner';
import { 
  CreateMedicoDto, 
  UpdateMedicoDto, 
  CreateEspecialidadDto, 
  UpdateEspecialidadDto 
} from '@/types';
import { AxiosError } from 'axios';

// =====================================
// Hooks para Médicos
// =====================================

export const useMedicos = () => {
  return useQuery({
    queryKey: ['medicos'],
    queryFn: async () => {
      return await medicoService.getAll();
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useMedico = (id: number) => {
  return useQuery({
    queryKey: ['medicos', id],
    queryFn: async () => {
      return await medicoService.getById(id);
    },
    enabled: !!id,
  });
};

export const useCreateMedico = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMedicoDto) => {
      return await medicoService.create(data);
    },
    onSuccess: () => {
      toast.success('Especialista médico registrado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['medicos'] });
    },
    onError: (error: AxiosError<{ message?: string | string[] }>) => {
      const message = error.response?.data?.message || 'Error al registrar al especialista médico';
      toast.error(typeof message === 'string' ? message : message.join(', '));
    },
  });
};

export const useUpdateMedico = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateMedicoDto }) => {
      return await medicoService.update(id, data);
    },
    onSuccess: () => {
      toast.success('Datos del especialista médico actualizados adecuadamente');
      queryClient.invalidateQueries({ queryKey: ['medicos'] });
    },
    onError: (error: AxiosError<{ message?: string | string[] }>) => {
      const message = error.response?.data?.message || 'Error al actualizar especialista médico';
      toast.error(typeof message === 'string' ? message : message.join(', '));
    },
  });
};

// =====================================
// Hooks para Especialidades
// =====================================

export const useEspecialidades = () => {
  return useQuery({
    queryKey: ['especialidades'],
    queryFn: async () => {
      return await especialidadService.getAll();
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useCreateEspecialidad = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEspecialidadDto) => {
      return await especialidadService.create(data);
    },
    onSuccess: () => {
      toast.success('Especialidad médica registrada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['especialidades'] });
    },
    onError: (error: AxiosError<{ message?: string | string[] }>) => {
      const message = error.response?.data?.message || 'Error al registrar la especialidad. Es posible que ya exista.';
      toast.error(typeof message === 'string' ? message : message.join(', '));
    },
  });
};
