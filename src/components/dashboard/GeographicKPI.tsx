import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { KPIWrapper } from './KPIWrapper';
import { usePacientes } from '@/services/usePacientes';
import { useComunidades } from '@/services/useComunidades';

// Shared hook that returns patients already joined with community data
function usePatientsWithComunidad() {
  const { data: pacientes = [] } = usePacientes();
  const { data: comunidades = [] } = useComunidades();
  return useMemo(() => {
    const map = new Map<string, any>();
    comunidades.forEach((c: any) => {
      const id = String(c.pk_num_comunidad ?? c.id ?? '');
      if (id) map.set(id, c);
    });
    return pacientes.map((p: any) => {
      const com = map.get(String(p.fk_ps_a001_num_comunidad ?? ''));
      return { ...p, _com: com };
    });
  }, [pacientes, comunidades]);
}

const ts = {
  grid: { strokeDasharray: "3 3" as const, stroke: 'hsl(var(--border))', vertical: false as const },
  xTick: { fill: 'hsl(var(--muted-foreground))', fontSize: 11 },
  tooltip: { backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' },
};

function DensityView() {
  const patients = usePatientsWithComunidad();
  const densityData = useMemo(() => {
    const counts: Record<string, number> = {};
    patients.forEach((p: any) => {
      const c = p._com?.nombre_comunidad || p._com?.nombre || 'Desconocida';
      counts[c] = (counts[c] || 0) + 1;
    });
    const results = Object.entries(counts).map(([comunidad, casos]) => ({
      comunidad,
      casos,
      densidad: casos
    }));
    return results.length ? results : [{ comunidad: 'Sin datos', densidad: 0 }];
  }, [patients]);

  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Densidad Epidemiológica</h3>
        <p className="text-sm text-muted-foreground">Casos por comunidad / Población estimada × 100</p>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={densityData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid {...ts.grid} />
            <XAxis dataKey="comunidad" tick={ts.xTick} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} />
            <YAxis tick={ts.xTick} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={ts.tooltip} />
            <Bar dataKey="densidad" fill="hsl(var(--chart-1))" name="Casos Totales" radius={[4, 4, 0, 0]} maxBarSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ConcentrationView() {
  const patients = usePatientsWithComunidad();
  const concentrationData = useMemo(() => {
    const counts: Record<string, number> = {};
    patients.forEach((p: any) => {
      const c = p._com?.municipio || p._com?.nombre_comunidad || 'Desconocido';
      counts[c] = (counts[c] || 0) + 1;
    });
    const results = Object.entries(counts).map(([zona, actual]) => ({
      zona,
      actual,
      anterior: 0
    }));
    return results.length ? results : [{ zona: 'Sin datos', actual: 0, anterior: 0 }];
  }, [patients]);

  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Concentración Geográfica</h3>
        <p className="text-sm text-muted-foreground">Índice de concentración de casos por zona</p>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={concentrationData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid {...ts.grid} />
            <XAxis dataKey="zona" tick={ts.xTick} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} />
            <YAxis tick={ts.xTick} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={ts.tooltip} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar dataKey="actual" fill="hsl(var(--chart-1))" name="Actual" maxBarSize={40} />
            <Bar dataKey="anterior" fill="hsl(var(--chart-3))" name="Anterior" maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function GrowthView() {
  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Crecimiento Epidemiológico</h3>
        <p className="text-sm text-muted-foreground">No disponible (requiere historial extendido)</p>
      </div>
      <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-secondary/20">
        <span className="text-muted-foreground">Datos históricos insuficientes</span>
      </div>
    </div>
  );
}

function VulnerabilityView() {
  const patients = usePatientsWithComunidad();
  const vulnerabilityData = useMemo(() => {
    const counts: Record<string, { total: number, encamados: number }> = {};
    patients.forEach((p: any) => {
      const c = p._com?.nombre_comunidad || p._com?.nombre || 'Desconocida';
      if (!counts[c]) counts[c] = { total: 0, encamados: 0 };
      counts[c].total++;
      if (p.estado_paciente === 'encamado' || p.estado_paciente === 'discapacitado') {
        counts[c].encamados++;
      }
    });
    const results = Object.entries(counts).map(([comunidad, stats]) => ({
      comunidad,
      encamados: stats.encamados,
      tasa: stats.total > 0 ? (stats.encamados / stats.total) * 100 : 0
    }));
    return results.length ? results : [{ comunidad: 'Sin datos', encamados: 0, tasa: 0 }];
  }, [patients]);

  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Vulnerabilidad Comunitaria</h3>
        <p className="text-sm text-muted-foreground">Pacientes encamados/dependientes por comunidad</p>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={vulnerabilityData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid {...ts.grid} horizontal={false} />
            <XAxis type="number" tick={ts.xTick} axisLine={false} tickLine={false} unit="%" />
            <YAxis type="category" dataKey="comunidad" tick={ts.xTick} axisLine={false} tickLine={false} width={60} />
            <Tooltip contentStyle={ts.tooltip} />
            <Bar dataKey="tasa" fill="hsl(var(--chart-5))" name="Tasa %" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function GeographicKPI() {
  return (
    <KPIWrapper views={[
      { label: 'Densidad', component: <DensityView /> },
      { label: 'Concentración', component: <ConcentrationView /> },
      { label: 'Crecimiento', component: <GrowthView /> },
      { label: 'Vulnerabilidad', component: <VulnerabilityView /> },
    ]} />
  );
}
