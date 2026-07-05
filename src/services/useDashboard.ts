import { useMemo } from 'react';
import { usePacientes } from './usePacientes';
import { useCitas } from './useCitas';
import { useMedicos } from './useMedicos';
import { useSesionesMedicas } from './useJornadas';

export const DASHBOARD_KEY = ['dashboard'] as const;

export function useDashboardMetrics() {
  const { data: pacientes = [], isLoading: isLoadingPacientes } = usePacientes();
  const { data: citas = [], isLoading: isLoadingCitas } = useCitas();
  const { data: medicos = [], isLoading: isLoadingMedicos } = useMedicos();
  const { data: sesiones = [], isLoading: isLoadingSesiones } = useSesionesMedicas();

  const data = useMemo(() => {
    const totalPacientes = pacientes.length;
    const totalConsultas = citas.length;

    // Citas de hoy
    const hoyStr = new Date().toISOString().split('T')[0];
    const citasHoyList = citas.filter((c: any) => (c.fecha || c.date) === hoyStr);
    const citasHoyAtendidas = citasHoyList.filter((c: any) => c.estado_cita === 'atendida' || c.estado_cita === 'confirmada' || c.status === 'confirmada');
    const citasHoyPct = citasHoyList.length > 0 ? (citasHoyAtendidas.length / citasHoyList.length) * 100 : 0;

    // Consultas Mensuales (del mes actual)
    const mesActual = hoyStr.substring(0, 7); // YYYY-MM
    const consultasMensuales = citas.filter((c: any) => (c.fecha || c.date)?.startsWith(mesActual)).length;

    // Urgencias (emergencia)
    const urgencias = citas.filter((c: any) => c.tipo_cita === 'emergencia').length;
    const urgenciasPct = totalConsultas > 0 ? (urgencias / totalConsultas) * 100 : 0;

    // Carga media (promedio de pacientes por médico)
    const cargaMedia = medicos.length > 0 ? (totalPacientes / medicos.length) : 0;

    return {
      totalPacientes: { total: totalPacientes, change: 0 },
      citasHoy: { total: citasHoyList.length, percentage: citasHoyPct, change: 0 },
      consultasMensuales: { total: consultasMensuales, change: 0 },
      ocupacionAgenda: { percentage: urgenciasPct, change: 0 },
      bloqueosAgenda: { percentage: 0, change: 0 },
      cargaMedia: { total: cargaMedia, change: 0 }
    };
  }, [pacientes, citas, medicos, sesiones]);

  return {
    data,
    isLoading: isLoadingPacientes || isLoadingCitas || isLoadingMedicos || isLoadingSesiones,
  };
}
