import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { KPIWrapper } from './KPIWrapper';
import { EarlyDetectionGauge } from './EarlyDetectionGauge';
import { AgeGroupTrendChart } from './AgeGroupTrendChart';
import { useCitas } from '@/services/useCitas';
import { useMedicos, useEspecialidades } from '@/services/useMedicos';
import { useSesionesMedicas } from '@/services/useJornadas';
import { useRetencionEspecialidad } from '@/services/useIndicadores';

function RetentionView() {
  const { data: backendData, isLoading } = useRetencionEspecialidad();
  const { data: citas = [] } = useCitas();
  const { data: medicos = [] } = useMedicos();
  const { data: sesiones = [] } = useSesionesMedicas();
  const { data: especialidades = [] } = useEspecialidades();

  const retentionData = useMemo(() => {
    if (backendData) {
      const items = backendData?.especialidades || backendData?.items || (Array.isArray(backendData) ? backendData : []);
      if (Array.isArray(items) && items.length > 0) {
        const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
        const results = items.map((d: any, idx: number) => ({
          name: typeof d.especialidad === 'object' ? 'General' : (d.especialidad || d.nombre || 'General'),
          value: typeof d.porcentaje === 'object' ? 0 : Number(d.porcentaje || d.retencion || d.valor) || 0,
          fill: colors[idx % colors.length],
        })).filter((d: any) => d.value > 0);
        if (results.length > 0) return results;
      }
    }

    const espMap = new Map<string, string>();
    especialidades.forEach((e: any) => {
      const id = String(e.pk_num_especialidad ?? e.id ?? '');
      if (id) espMap.set(id, e.nombre || e.name || 'General');
    });
    const sesMap = new Map<string, string>();
    sesiones.forEach((s: any) => sesMap.set(String(s.pk_num_sesion_medica ?? s.id), String(s.fk_cm_b001_num_medico_ministerio_salud ?? '')));
    const medMap = new Map<string, any>();
    medicos.forEach((m: any) => medMap.set(String(m.pk_num_medico_ministerio_salud ?? m.id), m));

    const specTotalPatients: Record<string, Set<string>> = {};
    const specSuccessivePatients: Record<string, Set<string>> = {};

    citas.forEach((c: any) => {
      const pId = String(c.fk_ps_b001_num_paciente ?? '');
      const sId = String(c.fk_cm_b005_num_sesion ?? '');
      if (!pId) return;
      const mId = sesMap.get(sId);
      const m = medMap.get(mId || '');
      let spec = m?.especialidad?.nombre;
      if (!spec && m?.fk_cm_a001_num_especialidad) {
        spec = espMap.get(String(m.fk_cm_a001_num_especialidad)) || 'General';
      }
      spec = spec || 'General';
      if (!specTotalPatients[spec]) specTotalPatients[spec] = new Set();
      if (!specSuccessivePatients[spec]) specSuccessivePatients[spec] = new Set();
      if (specTotalPatients[spec].has(pId)) {
        specSuccessivePatients[spec].add(pId);
      }
      specTotalPatients[spec].add(pId);
    });

    const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
    const results = Object.keys(specTotalPatients).map((spec, idx) => {
      const total = specTotalPatients[spec].size;
      const retained = specSuccessivePatients[spec].size;
      const retentionRate = total > 0 ? Math.round((retained / total) * 100) : 0;
      return { name: spec, value: retentionRate, fill: colors[idx % colors.length] };
    }).filter(d => d.value > 0);

    if (results.length === 0) {
       return [{ name: 'Sin retención', value: 100, fill: 'hsl(var(--muted))' }];
    }
    return results;
  }, [backendData, citas, medicos, sesiones, especialidades]);

  if (isLoading) {
    return (
      <div>
        <div className="mb-4 pr-8">
          <h3 className="text-lg font-semibold text-foreground">Tasa de Retención por Especialidad</h3>
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
        <div className="h-[260px] flex items-center justify-center">
          <span className="text-muted-foreground animate-pulse">Cargando indicador...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Tasa de Retención por Especialidad</h3>
        <p className="text-sm text-muted-foreground">Pacientes que regresan a control/seguimiento</p>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={retentionData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
              paddingAngle={3} dataKey="value" label={({ value }) => `${value}%`}
            >
              {retentionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={({ payload }) => {
              if (payload && payload.length) {
                const d = payload[0].payload as { name: string; value: number };
                return (
                  <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
                    <p className="font-medium text-foreground text-sm">{d.name}</p>
                    <p className="text-lg font-bold text-primary">{d.value}% retención</p>
                  </div>
                );
              }
              return null;
            }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 mt-2">
        {retentionData.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
            <span className="text-muted-foreground">{item.name}</span>
            <span className="font-medium text-foreground">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RetentionChartKPI() {
  return (
    <KPIWrapper views={[
      { id: 'retencion-especialidad', label: 'Tasa de retención por especialidad', component: <RetentionView /> },
      { id: 'deteccion-temprana',     label: 'Tasa de detección temprana',         component: <EarlyDetectionGauge /> },
      { id: 'tendencia-etaria',       label: 'Tendencia de consultas por grupo etario', component: <AgeGroupTrendChart /> },
    ]} />
  );
}
