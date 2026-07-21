import { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { KPIWrapper } from './KPIWrapper';
import { useCitas } from '@/services/useCitas';
import { useMedicos, useEspecialidades } from '@/services/useMedicos';
import { useSesionesMedicas } from '@/services/useJornadas';
import { useDiagnosticos, useEnfermedades } from '@/services/useDiagnosticos';
import { useDistribucionEnfermedades, useReconsultasCriticos, useTasaDemandaEspecialidad } from '@/services/useIndicadores';
import type { KpiKind } from '@/lib/kpi-semaforos';
import { semaforoFill } from '@/lib/kpi-semaforos';

const chartStyle = {
  grid: { strokeDasharray: "3 3", stroke: 'hsl(var(--border))', vertical: false as const },
  xAxis: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 },
  tooltip: {
    backgroundColor: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
  },
};

function DiseaseDistribution() {
  const { data: backendData, isLoading } = useDistribucionEnfermedades();
  const { data: diagnosticos = [] } = useDiagnosticos();
  const { data: enfermedades = [] } = useEnfermedades();

  const chartData = useMemo(() => {
    if (backendData) {
      const items = backendData?.distribucion || backendData?.enfermedades || backendData?.items || backendData;
      if (Array.isArray(items) && items.length > 0) {
        const mapped = items.map((d: any) => ({
          nombre: typeof d.enfermedad === 'object' ? 'Desconocida' : (d.enfermedad || d.nombre || d.name || 'Desconocida'),
          porcentaje: typeof d.porcentaje === 'object' ? 0 : Number(d.porcentaje || d.pct || d.value) || 0,
          casos: typeof d.totalCasos === 'object' ? 0 : Number(d.totalCasos || d.casos || d.total || d.count) || 0,
        })).filter((d: any) => d.porcentaje > 0 || d.casos > 0);
        if (mapped.length > 0) return mapped;
      }
    }
    if (diagnosticos.length === 0) return [];
    const enfMap = new Map<string, string>();
    enfermedades.forEach((e: any) => {
      const id = String(e.pk_num_enfermedad ?? e.id ?? '');
      const name = e.nombre || e.name || 'Enfermedad';
      if (id) enfMap.set(id, name);
    });
    const counts: Record<string, number> = {};
    diagnosticos.forEach((d: any) => {
      const enfId = String(d.fk_cm_a001_num_enfermedad ?? '');
      const name = enfMap.get(enfId) || d.enfermedadNombre || d.nombre || 'Otra';
      counts[name] = (counts[name] || 0) + 1;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (total === 0) return [];
    return Object.entries(counts)
      .map(([nombre, casos]) => ({ nombre, casos, porcentaje: Math.round((casos / total) * 1000) / 10 }))
      .sort((a, b) => b.casos - a.casos)
      .slice(0, 10);
  }, [backendData, diagnosticos, enfermedades]);

  const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  if (isLoading) {
    return (
      <div>
        <div className="mb-4 pr-8">
          <h3 className="text-lg font-semibold text-foreground">Distribución de Enfermedades</h3>
          <p className="text-sm text-muted-foreground">Cargando datos...</p>
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
          <h3 className="text-lg font-semibold text-foreground">Distribución de Enfermedades</h3>
          <p className="text-sm text-muted-foreground">Distribución porcentual mensual de diagnósticos</p>
        </div>
        <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-secondary/20">
          <span className="text-muted-foreground">Sin diagnósticos registrados en el período</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Distribución de Enfermedades</h3>
        <p className="text-sm text-muted-foreground">Composición porcentual mensual de diagnósticos más prevalentes</p>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid {...chartStyle.grid} />
            <XAxis dataKey="nombre" tick={{ ...chartStyle.xAxis, fontSize: 10 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} angle={-20} textAnchor="end" height={60} />
            <YAxis tick={chartStyle.xAxis} axisLine={false} tickLine={false} unit="%" />
            <Tooltip contentStyle={chartStyle.tooltip} formatter={(value: number) => [`${value}%`, 'Porcentaje']} />
            <Bar dataKey="porcentaje" name="Porcentaje" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {chartData.map((entry: any, idx: number) => (
                <Cell key={idx} fill={semaforoFill('porcentajeBajo', entry.porcentaje)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 mt-2 max-h-[80px] overflow-y-auto">
        {chartData.map((item: any) => (
          <div key={item.nombre} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: semaforoFill('porcentajeBajo', item.porcentaje) }} />
            <span className="text-muted-foreground">{item.nombre}</span>
            <span className="font-medium text-foreground">{item.porcentaje}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReconsultaFrequency() {
  const { data: backendData, isLoading } = useReconsultasCriticos();

  const reconsultaData = useMemo(() => {
    if (backendData) {
      const items = Array.isArray(backendData) ? backendData : (backendData?.items || backendData?.rangos || []);
      if (Array.isArray(items) && items.length > 0) {
        return items.map((d: any) => ({
          rango: typeof d.rango === 'object' ? 'N/A' : (d.rango || d.grupo || 'N/A'),
          reconsultas: typeof d.reconsultas === 'object' ? 0 : Number(d.reconsultas || 0),
          totalCriticos: typeof d.totalCriticos === 'object' ? 0 : Number(d.totalCriticos || 0),
          tasaCambio: typeof d.tasaCambio === 'object' ? 0 : Number(d.tasaCambio || 0),
        })).filter((d: any) => d.rango !== 'N/A');
      }
    }
    return [];
  }, [backendData]);

  if (reconsultaData.length === 0) {
    return (
      <div>
        <div className="mb-4 pr-8">
          <h3 className="text-lg font-semibold text-foreground">Frecuencia de Reconsultas</h3>
          <p className="text-sm text-muted-foreground">Pacientes críticos reconsultados por grupo etario</p>
        </div>
        <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-secondary/20">
          <span className="text-muted-foreground">Sin datos de reconsultas en el período</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Frecuencia de Reconsultas</h3>
        <p className="text-sm text-muted-foreground">Pacientes críticos reconsultados por grupo etario</p>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={reconsultaData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid {...chartStyle.grid} />
            <XAxis dataKey="rango" tick={chartStyle.xAxis} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} />
            <YAxis tick={chartStyle.xAxis} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={chartStyle.tooltip} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar dataKey="totalCriticos" name="Total Críticos" maxBarSize={35} radius={[4, 4, 0, 0]}>
              {reconsultaData.map((entry: any, idx: number) => {
                const rate = entry.totalCriticos > 0 ? (entry.reconsultas / entry.totalCriticos) * 100 : 0;
                return <Cell key={idx} fill={semaforoFill('porcentajeBajo', rate)} />;
              })}
            </Bar>
            <Bar dataKey="reconsultas" name="Reconsultas" maxBarSize={35} radius={[4, 4, 0, 0]}>
              {reconsultaData.map((entry: any, idx: number) => {
                const rate = entry.totalCriticos > 0 ? (entry.reconsultas / entry.totalCriticos) * 100 : 0;
                return <Cell key={idx} fill={semaforoFill('porcentajeBajo', rate)} opacity={0.6} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TrimestralTrend() {
  const { data: backendData, isLoading } = useTasaDemandaEspecialidad();

  const trimestralData = useMemo(() => {
    if (backendData) {
      const items = Array.isArray(backendData) ? backendData : (backendData?.especialidades || backendData?.items || []);
      if (Array.isArray(items) && items.length > 0) {
        return items.map((d: any) => ({
          especialidad: typeof d.especialidad === 'object' ? 'N/A' : (d.especialidad || d.nombre || 'N/A'),
          totalActual: typeof d.totalActual === 'object' ? 0 : Number(d.totalActual || 0),
          totalAnterior: typeof d.totalAnterior === 'object' ? 0 : Number(d.totalAnterior || 0),
          tasaCambio: typeof d.tasaCambio === 'object' ? 0 : Number(d.tasaCambio || 0),
        })).filter((d: any) => d.especialidad !== 'N/A');
      }
    }
    return [];
  }, [backendData]);

  if (trimestralData.length === 0) {
    return (
      <div>
        <div className="mb-4 pr-8">
          <h3 className="text-lg font-semibold text-foreground">Tasa Trimestral por Especialidad</h3>
          <p className="text-sm text-muted-foreground">Aumento/decremento de enfermedades</p>
        </div>
        <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-secondary/20">
          <span className="text-muted-foreground">Sin datos de demanda en el período</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Tasa Trimestral por Especialidad</h3>
        <p className="text-sm text-muted-foreground">Tasa de cambio de demanda por especialidad</p>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trimestralData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid {...chartStyle.grid} />
            <XAxis dataKey="especialidad" tick={{ ...chartStyle.xAxis, fontSize: 10 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} />
            <YAxis tick={chartStyle.xAxis} axisLine={false} tickLine={false} unit="%" />
            <Tooltip contentStyle={chartStyle.tooltip} formatter={(value: any) => [`${Number(value) || 0}%`, 'Tasa']} />
            <Bar dataKey="tasaCambio" name="Tasa de Cambio %" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {trimestralData.map((entry: any, idx: number) => (
                <Cell key={idx} fill={semaforoFill('porcentajeBajo', Math.abs(entry.tasaCambio))} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function StackedBarChartComponent({ selectedKpiIds }: { selectedKpiIds?: string[] }) {
  const { data: distBackend } = useDistribucionEnfermedades();
  const { data: diagnosticos = [] } = useDiagnosticos();
  const { data: enfermedades = [] } = useEnfermedades();
  const { data: reconBackend } = useReconsultasCriticos();
  const { data: tendBackend } = useTasaDemandaEspecialidad();

  const semBajo: KpiKind = 'porcentajeBajo';

  const distribucionValue = useMemo(() => {
    if (distBackend) {
      const items = distBackend?.distribucion || distBackend?.enfermedades || distBackend?.items || distBackend;
      if (Array.isArray(items) && items.length > 0) {
        const pcts = items.map((d: any) => Number(d.porcentaje || d.pct || d.value) || 0).filter(v => v > 0);
        if (pcts.length > 0) return Math.max(...pcts);
      }
    }
    if (diagnosticos.length === 0) return 0;
    const enfMap = new Map<string, string>();
    enfermedades.forEach((e: any) => {
      const id = String(e.pk_num_enfermedad ?? e.id ?? '');
      if (id) enfMap.set(id, e.nombre || e.name || 'Enfermedad');
    });
    const counts: Record<string, number> = {};
    diagnosticos.forEach((d: any) => {
      const enfId = String(d.fk_cm_a001_num_enfermedad ?? '');
      const name = enfMap.get(enfId) || d.enfermedadNombre || d.nombre || 'Otra';
      counts[name] = (counts[name] || 0) + 1;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (total === 0) return 0;
    return Math.max(...Object.values(counts).map(c => Math.round((c / total) * 1000) / 10));
  }, [distBackend, diagnosticos, enfermedades]);

  const reconsultasValue = useMemo(() => {
    if (reconBackend) {
      const items = Array.isArray(reconBackend) ? reconBackend : (reconBackend?.items || reconBackend?.rangos || []);
      if (Array.isArray(items) && items.length > 0) {
        const totalRecon = items.reduce((s: number, d: any) => s + (Number(d.reconsultas) || 0), 0);
        const totalCrit = items.reduce((s: number, d: any) => s + (Number(d.totalCriticos) || 0), 0);
        return totalCrit > 0 ? Math.round((totalRecon / totalCrit) * 1000) / 10 : 0;
      }
    }
    return 0;
  }, [reconBackend]);

  const tendenciaValue = useMemo(() => {
    if (tendBackend) {
      const items = Array.isArray(tendBackend) ? tendBackend : (tendBackend?.especialidades || tendBackend?.items || []);
      if (Array.isArray(items) && items.length > 0) {
        const tasas = items.map((d: any) => Math.abs(Number(d.tasaCambio) || 0)).filter(v => v > 0);
        if (tasas.length > 0) return Math.round((tasas.reduce((a, b) => a + b, 0) / tasas.length) * 10) / 10;
      }
    }
    return 0;
  }, [tendBackend]);

  return (
    <KPIWrapper selectedKpiIds={selectedKpiIds} views={[
      { id: 'distribucion-enfermedades', label: 'Distribución Enfermedades', semaforoKind: semBajo, semaforoValue: distribucionValue, component: <DiseaseDistribution /> },
      { id: 'reconsultas-criticos',      label: 'Reconsultas',              semaforoKind: semBajo, semaforoValue: reconsultasValue, component: <ReconsultaFrequency /> },
      { id: 'tendencia-trimestral',      label: 'Tendencia Trimestral',     semaforoKind: semBajo, semaforoValue: tendenciaValue, component: <TrimestralTrend /> },
    ]} />
  );
}
