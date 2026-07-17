import { useQueries } from '@tanstack/react-query';
import { api } from './apiClient';

const now = new Date();
const currentMonth = now.getMonth() + 1;
const currentYear = now.getFullYear();
const currentQuarter = Math.ceil(currentMonth / 3);
const currentBimester = Math.ceil(currentMonth / 2);
const currentSemester = currentMonth <= 6 ? 1 : 2;

export const INDICADORES_KEY = ['indicadores'] as const;

function useIndicatorQuery(
  key: string[],
  queryFn: () => Promise<any>,
  enabled = true,
) {
  const [result] = useQueries({
    queries: [{ queryKey: [...INDICADORES_KEY, ...key], queryFn, enabled, staleTime: 5 * 60 * 1000 }],
  });
  return result;
}

// ===== Slot 1: Distribución etaria & condiciones =====

export function useDistribucionEtariaEspecialidad() {
  return useIndicatorQuery(
    ['distribucion-etaria-especialidad', String(currentBimester), String(currentYear)],
    async () => {
      const res = await api.IndicadoresController_distribucionEtariaEspecialidad(currentBimester, currentYear);
      return res.data;
    },
  );
}

export function useConcentracionCondicionEdad(enfermedadId = 1) {
  return useIndicatorQuery(
    ['concentracion-condicion-edad', String(currentBimester), String(currentYear), String(enfermedadId)],
    async () => {
      const res = await api.IndicadoresController_concentracionCondicionEdad(currentBimester, currentYear, enfermedadId);
      return res.data;
    },
  );
}

// ===== Slot 2: Retención + detección + tendencia etaria =====

export function useRetencionEspecialidad() {
  return useIndicatorQuery(
    ['retencion-especialidad', String(currentQuarter), String(currentYear)],
    async () => {
      const res = await api.IndicadoresController_porcentajeRetencionEspecialidad(currentQuarter, currentYear);
      return res.data;
    },
  );
}

export function useTasaDeteccionTemprana() {
  return useIndicatorQuery(
    ['tasa-deteccion-temprana', String(currentMonth), String(currentYear)],
    async () => {
      const res = await api.IndicadoresDosController_tasaDeteccionTemprana(currentMonth, currentYear);
      return res.data;
    },
  );
}

export function useTendenciaConsultasGrupoEtario() {
  return useIndicatorQuery(
    ['tendencia-consultas-grupo-etario', String(currentQuarter), String(currentYear)],
    async () => {
      const res = await api.IndicadoresController_tendenciaConsultasGrupoEtario(currentQuarter, currentYear);
      return res.data;
    },
  );
}

// ===== Slot 3: Enfermedades / reconsultas / trimestral =====

export function useDistribucionEnfermedades() {
  return useIndicatorQuery(
    ['distribucion-enfermedades', String(currentMonth), String(currentYear)],
    async () => {
      const res = await api.IndicadoresController_distribucionEnfermedadesMensual(currentMonth, currentYear);
      return res.data;
    },
  );
}

export function useReconsultasCriticos() {
  return useIndicatorQuery(
    ['reconsultas-criticos', String(currentMonth), String(currentYear)],
    async () => {
      const res = await api.IndicadoresController_frecuenciaReconsultasCriticos(currentMonth, currentYear);
      return res.data;
    },
  );
}

export function useTasaDemandaEspecialidad() {
  return useIndicatorQuery(
    ['tasa-demanda-especialidad', String(currentQuarter), String(currentYear)],
    async () => {
      const res = await api.IndicadoresController_tasaDemandaEspecialidad(currentQuarter, currentYear);
      return res.data;
    },
  );
}

// ===== Slot 4: Matriz prioridades / interconsulta / diverging bar =====

export function useInterconsultaEspecialidades() {
  return useIndicatorQuery(
    ['interconsulta-especialidades', String(currentQuarter), String(currentYear)],
    async () => {
      const res = await api.IndicadoresDosController_interconsultaEspecialidades(currentQuarter, currentYear);
      return res.data;
    },
  );
}

export function useDesviacionCargaEspecialidad() {
  return useIndicatorQuery(
    ['desviacion-carga-especialidad', String(currentMonth), String(currentYear)],
    async () => {
      const res = await api.IndicadoresController_desviacionCargaEspecialidad(currentMonth, currentYear);
      return res.data;
    },
  );
}

// ===== Slot 5: Geografía / densidad / vulnerabilidad =====

export function useDensidadEpidemiologica() {
  return useIndicatorQuery(
    ['densidad-epidemiologica', String(currentQuarter), String(currentYear)],
    async () => {
      const res = await api.IndicadoresDosController_densidadEpidemiologicaComunidad(currentQuarter, currentYear);
      return res.data;
    },
  );
}

export function useIndiceConcentracionComunitaria() {
  return useIndicatorQuery(
    ['indice-concentracion-comunitaria', String(currentSemester), String(currentYear)],
    async () => {
      const res = await api.IndicadoresDosController_indiceConcentracionComunitaria(currentSemester, currentYear);
      return res.data;
    },
  );
}

export function useTasaCrecimientoEpidemiologico() {
  return useIndicatorQuery(
    ['tasa-crecimiento-epidemiologico', String(currentQuarter), String(currentYear)],
    async () => {
      const res = await api.IndicadoresDosController_tasaCrecimientoEpidemiologico(currentQuarter, currentYear);
      return res.data;
    },
  );
}

export function useVulnerabilidadComunitaria() {
  return useIndicatorQuery(
    ['vulnerabilidad-comunitaria', String(currentSemester), String(currentYear)],
    async () => {
      const res = await api.IndicadoresDosController_vulnerabilidadComunitariaEncamados(currentSemester, currentYear);
      return res.data;
    },
  );
}
