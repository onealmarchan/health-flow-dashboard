import { useQuery } from '@tanstack/react-query';
import { api } from './apiClient';

const now = new Date();
const currentMonth = now.getMonth() + 1;
const currentYear = now.getFullYear();

export const DASHBOARD_KEY = ['dashboard'] as const;

export function useDashboardMetrics() {
  const pacientes = useQuery({
    queryKey: [...DASHBOARD_KEY, 'total-pacientes'],
    queryFn: async () => {
      const res = await api.DashboardController_getTotalPacientes();
      return res.data;
    },
  });

  const consultas = useQuery({
    queryKey: [...DASHBOARD_KEY, 'total-consultas'],
    queryFn: async () => {
      const res = await api.DashboardController_getTotalConsultas();
      return res.data;
    },
  });

  const citasHoy = useQuery({
    queryKey: [...DASHBOARD_KEY, 'citas-hoy'],
    queryFn: async () => {
      const res = await api.DashboardController_getCitasHoy();
      return res.data;
    },
  });

  const ocupacion = useQuery({
    queryKey: [...DASHBOARD_KEY, 'ocupacion-agenda'],
    queryFn: async () => {
      const res = await api.DashboardController_getOcupacionAgenda();
      return res.data;
    },
  });

  const bloqueos = useQuery({
    queryKey: [...DASHBOARD_KEY, 'bloqueos-agenda'],
    queryFn: async () => {
      const res = await api.DashboardController_getBloqueoAgenda();
      return res.data;
    },
  });

  const cargaPromedio = useQuery({
    queryKey: [...DASHBOARD_KEY, 'carga-promedio'],
    queryFn: async () => {
      const res = await api.IndicadoresDosController_cargaPromedioPorEspecialista();
      return res.data;
    },
  });

  const urgencias = useQuery({
    queryKey: [...DASHBOARD_KEY, 'urgencias'],
    queryFn: async () => {
      const res = await api.IndicadoresDosController_porcentajeUrgenciasSobreTotalConsultas();
      return res.data;
    },
  });

  const desviacionCarga = useQuery({
    queryKey: [...DASHBOARD_KEY, 'desviacion-carga', currentMonth, currentYear],
    queryFn: async () => {
      const res = await api.IndicadoresController_desviacionCargaEspecialidad(currentMonth, currentYear);
      return res.data;
    },
  });

  const isLoading = pacientes.isLoading || consultas.isLoading || citasHoy.isLoading || ocupacion.isLoading || bloqueos.isLoading || cargaPromedio.isLoading || urgencias.isLoading || desviacionCarga.isLoading;

  const toDelta = (variacion?: { porcentaje: number; tendencia: string } | null): number => {
    if (!variacion) return 0;
    const pct = variacion.porcentaje || 0;
    return variacion.tendencia === 'bajo' ? -pct : pct;
  };

  const data = {
    totalPacientes: {
      total: pacientes.data?.totalPacientes ?? 0,
      change: toDelta(pacientes.data?.variacionMensual),
    },
    citasHoy: {
      total: citasHoy.data?.totalCitasHoy ?? 0,
      change: toDelta(citasHoy.data?.variacion),
    },
    consultasMensuales: {
      total: consultas.data?.totalConsultas ?? 0,
      change: toDelta(consultas.data?.variacionMensual),
    },
    ocupacionAgenda: {
      percentage: ocupacion.data?.valorIndicador ?? 0,
      horasActivas: ocupacion.data?.horasSesionActiva ?? 0,
      horasTotales: ocupacion.data?.horasTotalesConfiguradas ?? 0,
    },
    bloqueosAgenda: {
      percentage: bloqueos.data?.valorIndicador ?? 0,
      horasBloqueadas: bloqueos.data?.horasBloqueadas ?? 0,
      horasTotales: bloqueos.data?.horasTotalesAgenda ?? 0,
    },
    cargaMedia: {
      total: cargaPromedio.data?.valorIndicador ?? 0,
      totalPacientes: cargaPromedio.data?.totalPacientes ?? 0,
      totalEspecialistas: cargaPromedio.data?.totalEspecialistasActivos ?? 0,
      meta: 250,
    },
    urgencias: {
      percentage: urgencias.data?.valorIndicador ?? urgencias.data?.porcentaje ?? 0,
      totalConsultas: urgencias.data?.totalConsultas ?? 0,
      totalUrgencias: urgencias.data?.totalUrgencias ?? 0,
    },
    desviacionCargaEspecialidad: (() => {
      const raw = desviacionCarga.data;
      if (!raw) return [];
      const items = raw?.especialidades || raw?.items || (Array.isArray(raw) ? raw : []);
      return items.map((d: any) => ({
        especialidad: d.especialidad?.nombre || d.especialidad || d.nombre || d.name || 'Sin nombre',
        desviacion: d.porcentajeDesviacionCarga != null ? Number(d.porcentajeDesviacionCarga) : (Number(d.desviacion) || Number(d.porcentaje) || 0),
        carga: d.cargaActual || d.carga || 0,
        meta: d.capacidadMeta || d.meta || 250,
      }));
    })(),
  };

  return { data, isLoading };
}
