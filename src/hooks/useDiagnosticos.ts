import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { diagnosticoService } from '@/services/diagnostico.service';
import { citaMedicaService } from '@/services/cita-medica.service';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

// =====================================
// Hooks para Diagnósticos
// =====================================

export const useDiagnosticos = () => {
  return useQuery({
    queryKey: ['diagnosticos'],
    queryFn: async () => {
      const resp = await diagnosticoService.getAll();
      return resp;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useDiagnostico = (id: number) => {
  return useQuery({
    queryKey: ['diagnosticos', id],
    queryFn: async () => {
      return await diagnosticoService.getById(id);
    },
    enabled: !!id,
  });
};

export const useCreateDiagnostico = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      return await diagnosticoService.create(data);
    },
    onSuccess: () => {
      toast.success('Diagnóstico registrado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['diagnosticos'] });
    },
    onError: (error: AxiosError<{ message?: string | string[] }>) => {
      const message = error.response?.data?.message || 'Error al registrar el diagnóstico';
      toast.error(typeof message === 'string' ? message : message.join(', '));
    },
  });
};

export const useUpdateDiagnostico = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await diagnosticoService.update(id, data);
    },
    onSuccess: () => {
      toast.success('Diagnóstico actualizado adecuadamente');
      queryClient.invalidateQueries({ queryKey: ['diagnosticos'] });
    },
    onError: (error: AxiosError<{ message?: string | string[] }>) => {
      const message = error.response?.data?.message || 'Error al actualizar el diagnóstico';
      toast.error(typeof message === 'string' ? message : message.join(', '));
    },
  });
};

// =====================================
// Hooks para Citas Médicas
// =====================================

export const useCitasMedicas = () => {
  return useQuery({
    queryKey: ['citas-medicas'],
    queryFn: async () => {
      // Intenta traer de backend realista
      if (citaMedicaService.getAll) {
        return await citaMedicaService.getAll();
      }
      return [];
    },
    staleTime: 5 * 60 * 1000,
  });
};
