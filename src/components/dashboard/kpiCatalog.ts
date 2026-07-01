export type KPIType = 'mensual' | 'trimestral' | 'bimensual' | 'semestral';

export interface KPIDef {
  id: string;
  label: string;
  type: KPIType;
  /** Slot grouping — multiple KPIs in same slot rotate via nav. */
  slot: number;
}

/**
 * KPI catalog: classified by reporting cadence. The slot defines which dashboard
 * card hosts the KPI (KPIs with the same slot rotate via prev/next nav).
 */
export const KPI_CATALOG: KPIDef[] = [
  // Slot 1 — distribución etaria & condiciones (bimensuales)
  { id: 'treemap-etario',      label: 'Distribución etaria por edad',          type: 'bimensual',  slot: 1 },
  { id: 'treemap-especialidad', label: 'Distribución etaria por especialidad', type: 'bimensual',  slot: 1 },
  { id: 'treemap-condiciones', label: 'Concentración de condiciones por edad', type: 'bimensual',  slot: 1 },

  // Slot 2 — retención + detección + tendencia etaria (mensuales/trimestrales)
  { id: 'retencion-especialidad', label: 'Tasa de retención por especialidad', type: 'trimestral', slot: 2 },
  { id: 'deteccion-temprana',     label: 'Tasa de detección temprana',         type: 'mensual',    slot: 2 },
  { id: 'tendencia-etaria',       label: 'Tendencia de consultas por grupo etario', type: 'trimestral', slot: 2 },

  // Slot 3 — enfermedades / reconsultas / trimestral (mensuales y trimestrales)
  { id: 'distribucion-enfermedades', label: 'Distribución porcentual de enfermedades',     type: 'mensual',    slot: 3 },
  { id: 'reconsultas-criticos',      label: 'Frecuencia de reconsultas de pacientes críticos', type: 'mensual',  slot: 3 },
  { id: 'tendencia-trimestral',      label: 'Tasa de aumento/decremento por especialidad', type: 'trimestral', slot: 3 },

  // Slot 4 — Matriz prioridades / interconsulta / comorbilidad geográfica
  { id: 'matriz-prioridades', label: 'Matriz de prioridades',                  type: 'trimestral', slot: 4 },
  { id: 'interconsulta',      label: 'Interconsulta entre especialidades',     type: 'trimestral', slot: 4 },
  { id: 'ratio-vs-meta',      label: 'Diverging Bar — Ratio vs Meta',          type: 'trimestral', slot: 4 },

  // Slot 5 — geografía / densidad / vulnerabilidad
  { id: 'densidad-comunidad', label: 'Densidad epidemiológica por comunidad',  type: 'trimestral', slot: 5 },
  { id: 'concentracion-geo',  label: 'Índice de concentración geográfica',     type: 'semestral',  slot: 5 },
  { id: 'crecimiento-zona',   label: 'Tasa de crecimiento epidemiológico por zona', type: 'trimestral', slot: 5 },
  { id: 'vulnerabilidad-com', label: 'Tasa de vulnerabilidad comunitaria',     type: 'semestral',  slot: 5 },
];

export const KPI_TYPE_LABELS: Record<KPIType, string> = {
  mensual:    'Mensual',
  trimestral: 'Trimestral',
  bimensual:  'Bimensual',
  semestral:  'Semestral o Anual',
};

/** Default summary content per KPI for the “Incluir resumen de datos” option. */
export function summaryForKPI(kpiId: string): string {
  const map: Record<string, string> = {
    'treemap-etario': 'Distribución de pacientes por rangos etarios; los rectángulos proporcionales muestran la cohorte dominante.',
    'treemap-especialidad': 'Distribución etaria agrupada por especialidad médica, útil para detectar concentraciones de demanda.',
    'treemap-condiciones': 'Condiciones más frecuentes asociadas a cada grupo de edad.',
    'retencion-especialidad': 'Porcentaje de pacientes que regresan a control por especialidad, indicador de calidad y seguimiento.',
    'deteccion-temprana': 'Porcentaje acumulado de casos detectados en fase temprana frente al objetivo institucional.',
    'tendencia-etaria': 'Comparativa de consultas por cohorte etaria entre periodos, con variación porcentual.',
    'distribucion-enfermedades': 'Composición porcentual mensual de los diagnósticos más prevalentes.',
    'reconsultas-criticos': 'Frecuencia con la que pacientes críticos reconsultan, por especialidad.',
    'tendencia-trimestral': 'Aumento o decremento trimestral de diagnósticos por especialidad.',
    'matriz-prioridades': 'Cruce urgencia × impacto para priorizar atención por especialidad.',
    'interconsulta': 'Volumen de remisiones entre especialidades comparado con el periodo anterior.',
    'ratio-vs-meta': 'Desviación de la carga promedio de pacientes por especialidad frente a la meta institucional (250 pac./médico).',
    'densidad-comunidad': 'Casos por comunidad ponderados por población.',
    'concentracion-geo': 'Concentración de casos por zona geográfica.',
    'crecimiento-zona': 'Crecimiento trimestral de casos epidemiológicos por zona.',
    'vulnerabilidad-com': 'Pacientes encamados o dependientes como proporción de la comunidad.',
  };
  return map[kpiId] ?? 'Indicador clínico con datos agregados del periodo seleccionado.';
}
