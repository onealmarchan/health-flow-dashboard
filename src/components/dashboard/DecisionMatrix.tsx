import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { KPIWrapper } from './KPIWrapper';
import { DivergingBar } from '@/components/pages/especialistas/DivergingBar';
import { useMedicos, useEspecialidades } from '@/services/useMedicos';
import { useCitas } from '@/services/useCitas';
import { useSesionesMedicas } from '@/services/useJornadas';
import { useInterconsultaEspecialidades, useDesviacionCargaEspecialidad } from '@/services/useIndicadores';

const chartStyle = {
  grid: { strokeDasharray: "3 3", stroke: 'hsl(var(--border))', vertical: false as const },
  xAxis: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 },
  tooltip: { backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' },
};

function DivergingBarView() {
  const { data: apiMedicos = [] } = useMedicos();
  const { data: apiCitas = [] } = useCitas();
  const { data: apiSesiones = [] } = useSesionesMedicas();
  const { data: apiEspecialidades = [] } = useEspecialidades();
  const { data: desviacionData } = useDesviacionCargaEspecialidad();

  const specialists = useMemo(() => {
    const espMap = new Map<string, string>();
    apiEspecialidades.forEach((e: any) => {
      const id = String(e.pk_num_especialidad ?? e.id ?? '');
      if (id) espMap.set(id, e.nombre || e.name || 'General');
    });
    const sesMap = new Map<string, string>();
    apiSesiones.forEach((s: any) => sesMap.set(String(s.pk_num_sesion_medica ?? s.id), String(s.fk_cm_b001_num_medico_ministerio_salud ?? '')));

    const docPatients = new Map<string, Set<string>>();
    apiCitas.forEach((c: any) => {
      const pId = String(c.fk_ps_b001_num_paciente ?? '');
      const sId = String(c.fk_cm_b005_num_sesion ?? '');
      if (!pId) return;
      const mId = sesMap.get(sId);
      if (mId) {
        if (!docPatients.has(mId)) docPatients.set(mId, new Set());
        docPatients.get(mId)!.add(pId);
      }
    });

    const backendBySpec = new Map<string, number>();
    if (desviacionData) {
      const items = desviacionData?.especialidades || desviacionData?.items || (Array.isArray(desviacionData) ? desviacionData : []);
      if (Array.isArray(items)) {
        items.forEach((d: any) => {
          const spec = d.especialidad || d.nombre || '';
          const dev = d.desviacion || d.porcentaje || d.valor || 0;
          if (spec) backendBySpec.set(spec, dev);
        });
      }
    }

    return apiMedicos.map((m: any, idx: number) => {
      const mId = String(m.pk_num_medico_ministerio_salud ?? m.id ?? '');
      let spec = m.especialidad?.nombre;
      if (!spec && m.fk_cm_a001_num_especialidad) {
        spec = espMap.get(String(m.fk_cm_a001_num_especialidad)) || 'General';
      }
      spec = spec || 'General';
      return {
        id: m.id || idx,
        mpps: m.mpps || mId || '',
        nombre: m.nombre || m.nombres || '',
        apellido: m.apellido || m.apellidos || '',
        especialidad: spec,
        pacientes: docPatients.get(mId)?.size || 0,
        telefono: m.telefono || '',
        disponible: true,
        fechaIngreso: '',
        createdAt: Date.now(),
        desviacionBackend: backendBySpec.get(spec),
      };
    });
  }, [apiMedicos, apiCitas, apiSesiones, apiEspecialidades, desviacionData]);

  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Diverging Bar — Ratio vs Meta</h3>
        <p className="text-sm text-muted-foreground">Desviación de carga por especialidad frente a la meta institucional</p>
      </div>
      <DivergingBar specialists={specialists} />
    </div>
  );
}

const barColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

function PriorityMatrix() {
  const { data: desviacionData, isLoading } = useDesviacionCargaEspecialidad();
  const { data: apiCitas = [] } = useCitas();
  const { data: apiMedicos = [] } = useMedicos();
  const { data: apiSesiones = [] } = useSesionesMedicas();
  const { data: apiEspecialidades = [] } = useEspecialidades();

  const chartData = useMemo(() => {
    if (desviacionData) {
      const items = desviacionData?.especialidades || desviacionData?.items || (Array.isArray(desviacionData) ? desviacionData : []);
      if (Array.isArray(items) && items.length > 0) {
        const mapped = items.map((d: any) => ({
          especialidad: typeof d.especialidad === 'object' ? 'General' : (d.especialidad || d.nombre || 'General'),
          desviacion: d.porcentajeDesviacionCarga != null ? Number(d.porcentajeDesviacionCarga) || 0 : (d.brote ? 999 : Number(d.desviacion || d.porcentaje) || 0),
          carga: d.cargaActualPacientes != null ? Number(d.cargaActualPacientes) || 0 : Number(d.cargaActual || d.carga) || 0,
        })).filter((d: any) => d.desviacion !== 0 || d.carga > 0);
        const hasPositive = mapped.some((d: any) => d.desviacion > 0);
        if (mapped.length > 0 && hasPositive) return mapped;
      }
    }
    const espMap = new Map<string, string>();
    apiEspecialidades.forEach((e: any) => {
      const id = String(e.pk_num_especialidad ?? e.id ?? '');
      if (id) espMap.set(id, e.nombre || e.name || 'General');
    });
    const sesMap = new Map<string, string>();
    apiSesiones.forEach((s: any) => sesMap.set(String(s.pk_num_sesion_medica ?? s.id), String(s.fk_cm_b001_num_medico_ministerio_salud ?? '')));
    const medMap = new Map<string, any>();
    apiMedicos.forEach((m: any) => medMap.set(String(m.pk_num_medico_ministerio_salud ?? m.id), m));
    const specCounts: Record<string, number> = {};
    apiCitas.forEach((c: any) => {
      const sId = String(c.fk_cm_b005_num_sesion ?? '');
      const mId = sesMap.get(sId);
      const m = medMap.get(mId || '');
      let spec = m?.especialidad?.nombre;
      if (!spec && m?.fk_cm_a001_num_especialidad) {
        spec = espMap.get(String(m.fk_cm_a001_num_especialidad)) || 'General';
      }
      spec = spec || 'General';
      specCounts[spec] = (specCounts[spec] || 0) + 1;
    });
    const totalCitas = Object.values(specCounts).reduce((a, b) => a + b, 0) || 1;
    const nSpecs = Object.keys(specCounts).length || 1;
    const expectedPct = 100 / nSpecs;
    return Object.entries(specCounts).map(([especialidad, carga]) => ({
      especialidad,
      carga,
      desviacion: Math.round(((carga / totalCitas * 100) - expectedPct) * 10) / 10,
    })).sort((a, b) => Math.abs(b.desviacion) - Math.abs(a.desviacion));
  }, [desviacionData, apiCitas, apiMedicos, apiSesiones, apiEspecialidades]);

  if (isLoading) {
    return (
      <div>
        <div className="mb-4 pr-8">
          <h3 className="text-lg font-semibold text-foreground">Matriz de Prioridades</h3>
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
        <div className="h-[260px] flex items-center justify-center">
          <span className="text-muted-foreground animate-pulse">Cargando indicador...</span>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div>
        <div className="mb-4 pr-8">
          <h3 className="text-lg font-semibold text-foreground">Matriz de Prioridades</h3>
          <p className="text-sm text-muted-foreground">Desviación de carga por especialidad — urgencia × impacto</p>
        </div>
        <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-secondary/20">
          <span className="text-muted-foreground">Sin datos de desviación de carga</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Matriz de Prioridades</h3>
        <p className="text-sm text-muted-foreground">Desviación de carga por especialidad — valores positivos = sobrecarga</p>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid {...chartStyle.grid} horizontal={false} />
            <XAxis type="number" tick={chartStyle.xAxis} axisLine={false} tickLine={false} unit="%" />
            <YAxis type="category" dataKey="especialidad" tick={{ ...chartStyle.xAxis, fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
            <Tooltip contentStyle={chartStyle.tooltip} formatter={(value: any) => [`${Number(value) || 0}%`, 'Desviación']} />
            <Bar dataKey="desviacion" name="Desviación %" radius={[0, 4, 4, 0]} barSize={20}>
              {chartData.map((entry: any, idx: number) => (
                <Cell key={idx} fill={entry.desviacion > 0 ? 'hsl(var(--destructive))' : 'hsl(var(--success))'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function InterconsultaMatrix() {
  const { data, isLoading } = useInterconsultaEspecialidades();
  const { data: apiCitas = [] } = useCitas();
  const { data: apiMedicos = [] } = useMedicos();
  const { data: apiSesiones = [] } = useSesionesMedicas();
  const { data: apiEspecialidades = [] } = useEspecialidades();

  const chartData = useMemo(() => {
    if (data) {
      const items = data?.especialidades || data?.items || data?.interconsultas || (Array.isArray(data) ? data : []);
      if (Array.isArray(items) && items.length > 0) {
        const mapped = items.map((d: any) => ({
          especialidad: typeof d.especialidad === 'object' ? 'N/A' : (d.especialidad || d.nombre || 'N/A'),
          totalActual: typeof d.totalActual === 'object' ? 0 : Number(d.totalActual || d.cantidad || d.total) || 0,
          totalAnterior: typeof d.totalAnterior === 'object' ? 0 : Number(d.totalAnterior || d.cantidadAnterior) || 0,
          tasaCambio: typeof d.tasaCambio === 'object' ? 0 : Number(d.tasaCambio || 0),
        })).filter((d: any) => d.especialidad !== 'N/A');
        if (mapped.length > 0) return mapped;
      }
    }
    return [];
    const espMap = new Map<string, string>();
    apiEspecialidades.forEach((e: any) => {
      const id = String(e.pk_num_especialidad ?? e.id ?? '');
      if (id) espMap.set(id, e.nombre || e.name || 'General');
    });
    const sesMap = new Map<string, string>();
    apiSesiones.forEach((s: any) => sesMap.set(String(s.pk_num_sesion_medica ?? s.id), String(s.fk_cm_b001_num_medico_ministerio_salud ?? '')));
    const medMap = new Map<string, any>();
    apiMedicos.forEach((m: any) => medMap.set(String(m.pk_num_medico_ministerio_salud ?? m.id), m));
    const crossRef: Record<string, number> = {};
    apiCitas.forEach((c: any) => {
      const sId = String(c.fk_cm_b005_num_sesion ?? '');
      const mId = sesMap.get(sId);
      const m = medMap.get(mId || '');
      let spec = m?.especialidad?.nombre;
      if (!spec && m?.fk_cm_a001_num_especialidad) {
        spec = espMap.get(String(m.fk_cm_a001_num_especialidad)) || 'General';
      }
      spec = spec || 'General';
      if (c.especialidadDestino || c.especialidad_referencia) {
        const destino = c.especialidadDestino || c.especialidad_referencia;
        const key = `${spec} → ${destino}`;
        crossRef[key] = (crossRef[key] || 0) + 1;
      }
    });
    return Object.entries(crossRef).map(([flujo, cantidad]) => {
      const [origen, destino] = flujo.split(' → ');
      return { origen, destino, cantidad };
    });
  }, [data]);

  if (isLoading) {
    return (
      <div>
        <div className="mb-4 pr-8">
          <h3 className="text-lg font-semibold text-foreground">Matriz de Interconsulta</h3>
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
        <div className="h-[260px] flex items-center justify-center">
          <span className="text-muted-foreground animate-pulse">Cargando indicador...</span>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div>
        <div className="mb-4 pr-8">
          <h3 className="text-lg font-semibold text-foreground">Matriz de Interconsulta</h3>
          <p className="text-sm text-muted-foreground">Flujo de remisiones entre especialidades</p>
        </div>
        <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-secondary/20">
          <span className="text-muted-foreground">Sin datos de interconsultas en el período</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Matriz de Interconsulta</h3>
        <p className="text-sm text-muted-foreground">Remisiones por especialidad en el trimestre</p>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid {...chartStyle.grid} horizontal={false} />
            <XAxis type="number" tick={chartStyle.xAxis} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="especialidad" tick={{ ...chartStyle.xAxis, fontSize: 9 }} axisLine={false} tickLine={false} width={100} />
            <Tooltip contentStyle={chartStyle.tooltip} formatter={(value: any) => [Number(value) || 0, 'Remisiones']} />
            <Bar dataKey="totalActual" name="Actual" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


export function DecisionMatrix({ selectedKpiIds }: { selectedKpiIds?: string[] }) {
  return (
    <KPIWrapper selectedKpiIds={selectedKpiIds} views={[
      { id: 'matriz-prioridades', label: 'Matriz de prioridades', component: <PriorityMatrix /> },
      { id: 'interconsulta',      label: 'Interconsulta entre especialidades', component: <InterconsultaMatrix /> },
      { id: 'ratio-vs-meta',      label: 'Diverging Bar — Ratio vs Meta', component: <DivergingBarView /> },
    ]} />
  );
}
