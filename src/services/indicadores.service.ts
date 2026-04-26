import { api } from './api';
import { IndicadorEnfermedad, IndicadorEspecialidad, IndicadorGrupoEtario, IndicadorConcentracion } from '@/types';

export const indicadoresService = {
  // Distribución porcentual de enfermedades (Mensual)
  distribucionEnfermedades: (mes: number, anio: number) => 
    api.get<{ mes: number; anio: number; enfermedades: IndicadorEnfermedad[] }>(
      '/indicadores/distribucion-enfermedades', 
      { params: { mes, anio } }
    ),
  
  // Tasa de demanda por especialidad (Trimestral)
  tasaDemandaEspecialidad: (trimestre: number, anio: number) => 
    api.get<{ trimestre: number; anio: number; especialidades: IndicadorEspecialidad[] }>(
      '/indicadores/tasa-demanda-especialidad', 
      { params: { trimestre, anio } }
    ),
  
  // Distribución etaria por especialidad (Bimensual)
  distribucionEtariaEspecialidad: (bimestre: number, anio: number) => 
    api.get<{ bimestre: number; anio: number; especialidades: IndicadorEspecialidad[] }>(
      '/indicadores/distribucion-etaria-especialidad', 
      { params: { bimestre, anio } }
    ),
  
  // Tendencia de consultas por grupo etario (Trimestral)
  tendenciaConsultasGrupoEtario: (trimestre: number, anio: number) => 
    api.get<{ trimestre: number; anio: number; grupos_etarios: IndicadorGrupoEtario[] }>(
      '/indicadores/tendencia-consultas-grupo-etario', 
      { params: { trimestre, anio } }
    ),
  
  // Porcentaje de retención por especialidad (Trimestral)
  porcentajeRetencionEspecialidad: (trimestre: number, anio: number) => 
    api.get<{ trimestre: number; anio: number; especialidades: IndicadorEspecialidad[] }>(
      '/indicadores/porcentaje-retencion-especialidad', 
      { params: { trimestre, anio } }
    ),
  
  // Concentración de condiciones por edad (Bimensual)
  concentracionCondicionEdad: (bimestre: number, anio: number, enfermedadId: number) => 
    api.get<{ bimestre: number; anio: number; enfermedad: string; concentracion_por_edad: IndicadorConcentracion[] }>(
      '/indicadores/concentracion-condicion-edad', 
      { params: { bimestre, anio, enfermedadId } }
    ),
  
  // Variación porcentual de reconsultas en pacientes críticos (Mensual)
  variacionReconsultasCriticos: (mes: number, anio: number) => 
    api.get<{ 
      mes: number; 
      anio: number; 
      pacientes_criticos_total: number; 
      reconsultas_total: number; 
      promedio_reconsultas_por_paciente: number; 
      pacientes_con_reconsultas: number; 
    }>(
      '/indicadores/variacion-reconsultas-criticos', 
      { params: { mes, anio } }
    ),
};