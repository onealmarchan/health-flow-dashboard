import { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { KPIWrapper } from './KPIWrapper';
import { useCitas } from '@/services/useCitas';
import { useMedicos } from '@/services/useMedicos';
import { useSesionesMedicas } from '@/services/useJornadas';

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
  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Distribución de Enfermedades</h3>
        <p className="text-sm text-muted-foreground">No disponible (requiere módulo de diagnósticos clínicos)</p>
      </div>
      <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-secondary/20">
        <span className="text-muted-foreground">Sin datos clínicos suficientes</span>
      </div>
    </div>
  );
}

function ReconsultaFrequency() {
  const { data: citas = [] } = useCitas();
  const { data: medicos = [] } = useMedicos();
  const { data: sesiones = [] } = useSesionesMedicas();

  const reconsultaData = useMemo(() => {
    const sesMap = new Map();
    sesiones.forEach((s: any) => sesMap.set(String(s.pk_num_sesion_medica ?? s.id), String(s.fk_cm_b001_num_medico_ministerio_salud ?? '')));
    const medMap = new Map();
    medicos.forEach((m: any) => medMap.set(String(m.pk_num_medico_ministerio_salud ?? m.id), m?.especialidad?.nombre || 'General'));

    const counts: Record<string, Record<string, number>> = {};
    const patientSeen: Record<string, Set<string>> = {};

    citas.forEach((c: any) => {
      const month = (c.fecha || c.date || '').substring(0, 7);
      if (!month) return;
      const pId = String(c.fk_ps_b001_num_paciente ?? '');
      const sId = String(c.fk_cm_b005_num_sesion ?? '');
      const spec = medMap.get(sesMap.get(sId)) || 'General';

      if (!counts[month]) counts[month] = {};
      if (!counts[month][spec]) counts[month][spec] = 0;
      
      const key = `${spec}-${pId}`;
      if (!patientSeen[key]) {
        patientSeen[key] = new Set();
      } else {
        // Already seen this patient in this specialty = reconsulta
        counts[month][spec]++;
      }
      patientSeen[key].add(c.id);
    });

    const results = Object.keys(counts).sort().map(month => ({
      month,
      ...counts[month]
    }));
    return results.length ? results : [{ month: 'Sin datos', General: 0 }];
  }, [citas, medicos, sesiones]);

  // Extract all unique specialties to generate lines
  const specialties = useMemo(() => {
    const specs = new Set<string>();
    reconsultaData.forEach(d => {
      Object.keys(d).forEach(k => { if (k !== 'month') specs.add(k); });
    });
    return Array.from(specs);
  }, [reconsultaData]);

  const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Frecuencia de Reconsultas</h3>
        <p className="text-sm text-muted-foreground">Pacientes críticos reconsultados por especialidad</p>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={reconsultaData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid {...chartStyle.grid} />
            <XAxis dataKey="month" tick={chartStyle.xAxis} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} />
            <YAxis tick={chartStyle.xAxis} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={chartStyle.tooltip} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            {specialties.map((spec, idx) => (
              <Line key={spec} type="monotone" dataKey={spec} stroke={colors[idx % colors.length]} name={spec} strokeWidth={2} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TrimestralTrend() {
  const { data: citas = [] } = useCitas();
  const { data: medicos = [] } = useMedicos();
  const { data: sesiones = [] } = useSesionesMedicas();

  const trimestralData = useMemo(() => {
    const sesMap = new Map();
    sesiones.forEach((s: any) => sesMap.set(String(s.pk_num_sesion_medica ?? s.id), String(s.fk_cm_b001_num_medico_ministerio_salud ?? '')));
    const medMap = new Map();
    medicos.forEach((m: any) => medMap.set(String(m.pk_num_medico_ministerio_salud ?? m.id), m?.especialidad?.nombre || 'General'));

    const counts: Record<string, Record<string, number>> = {};
    
    citas.forEach((c: any) => {
      const dateStr = c.fecha || c.date || '';
      if (!dateStr) return;
      const month = parseInt(dateStr.substring(5, 7));
      const year = dateStr.substring(0, 4);
      const quarter = Math.ceil(month / 3);
      const qStr = `Q${quarter} ${year}`;
      
      const sId = String(c.fk_cm_b005_num_sesion ?? '');
      const spec = medMap.get(sesMap.get(sId)) || 'General';

      if (!counts[qStr]) counts[qStr] = {};
      if (!counts[qStr][spec]) counts[qStr][spec] = 0;
      counts[qStr][spec]++;
    });

    const results = Object.keys(counts).sort().map(q => ({
      trimestre: q,
      ...counts[q]
    }));
    return results.length ? results : [{ trimestre: 'Sin datos', General: 0 }];
  }, [citas, medicos, sesiones]);

  const specialties = useMemo(() => {
    const specs = new Set<string>();
    trimestralData.forEach(d => {
      Object.keys(d).forEach(k => { if (k !== 'trimestre') specs.add(k); });
    });
    return Array.from(specs);
  }, [trimestralData]);

  const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Tasa Trimestral por Especialidad</h3>
        <p className="text-sm text-muted-foreground">Aumento/decremento de enfermedades</p>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trimestralData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid {...chartStyle.grid} />
            <XAxis dataKey="trimestre" tick={{ ...chartStyle.xAxis, fontSize: 10 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} />
            <YAxis tick={chartStyle.xAxis} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={chartStyle.tooltip} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            {specialties.map((spec, idx) => (
              <Bar key={spec} dataKey={spec} fill={colors[idx % colors.length]} name={spec} maxBarSize={40} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function StackedBarChartComponent() {
  return (
    <KPIWrapper views={[
      { label: 'Distribución Enfermedades', component: <DiseaseDistribution /> },
      { label: 'Reconsultas', component: <ReconsultaFrequency /> },
      { label: 'Tendencia Trimestral', component: <TrimestralTrend /> },
    ]} />
  );
}
