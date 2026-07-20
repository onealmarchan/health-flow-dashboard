import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { KPIWrapper } from './KPIWrapper';
import { usePacientes } from '@/services/usePacientes';
import { useComunidades } from '@/services/useComunidades';
import { useDensidadEpidemiologica, useIndiceConcentracionComunitaria, useTasaCrecimientoEpidemiologico, useVulnerabilidadComunitaria } from '@/services/useIndicadores';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeValue(v: any): string | number {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'object') return 0;
  if (typeof v === 'number') return isNaN(v) ? 0 : v;
  const n = Number(v);
  return isNaN(n) ? String(v) : n;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeStr(v: any): string {
  if (v === null || v === undefined) return 'N/A';
  if (typeof v === 'object') return 'N/A';
  return String(v);
}

function DensityView() {
  const { data: backendData, isLoading } = useDensidadEpidemiologica();
  const patients = usePatientsWithComunidad();

  const densityData = useMemo(() => {
    if (backendData) {
      const items = backendData?.comunidades || backendData?.items || (Array.isArray(backendData) ? backendData : []);
      if (Array.isArray(items) && items.length > 0) {
        return items.map((d: any) => ({
          comunidad: safeStr(d.comunidad || d.nombre),
          densidad: safeValue(d.indicador || d.porcentaje || d.casosDetectados),
        })).filter((d: any) => d.comunidad !== 'N/A');
      }
    }
    const counts: Record<string, number> = {};
    patients.forEach((p: any) => {
      const c = p._com?.nombre_comunidad || p._com?.nombre || 'Desconocida';
      counts[c] = (counts[c] || 0) + 1;
    });
    const results = Object.entries(counts).map(([comunidad, casos]) => ({ comunidad, densidad: casos }));
    return results.length ? results : [{ comunidad: 'Sin datos', densidad: 0 }];
  }, [backendData, patients]);

  if (isLoading) {
    return (
      <div>
        <div className="mb-4 pr-8">
          <h3 className="text-lg font-semibold text-foreground">Densidad Epidemiológica</h3>
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
        <h3 className="text-lg font-semibold text-foreground">Densidad Epidemiológica</h3>
        <p className="text-sm text-muted-foreground">Casos por comunidad — % del total de pacientes</p>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={densityData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid {...ts.grid} />
            <XAxis dataKey="comunidad" tick={ts.xTick} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} />
            <YAxis tick={ts.xTick} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={ts.tooltip} formatter={(value: any) => [safeValue(value), undefined]} />
            <Bar dataKey="densidad" fill="hsl(var(--chart-1))" name="Densidad %" radius={[4, 4, 0, 0]} maxBarSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ConcentrationView() {
  const { data: backendData, isLoading } = useIndiceConcentracionComunitaria();
  const patients = usePatientsWithComunidad();

  const concentrationData = useMemo(() => {
    if (backendData) {
      const items = backendData?.comunidades || backendData?.items || (Array.isArray(backendData) ? backendData : []);
      if (Array.isArray(items) && items.length > 0) {
        return items.map((d: any) => ({
          zona: safeStr(d.comunidad || d.nombre),
          actual: safeValue(d.casosPeriodoActual || d.periodoActual || d.actual),
          anterior: safeValue(d.casosPeriodoAnterior || d.periodoAnterior || d.anterior),
        })).filter((d: any) => d.zona !== 'N/A');
      }
    }
    const counts: Record<string, number> = {};
    patients.forEach((p: any) => {
      const c = p._com?.municipio || p._com?.nombre_comunidad || 'Desconocido';
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts).map(([zona, actual]) => ({ zona, actual, anterior: 0 }));
  }, [backendData, patients]);

  if (isLoading) {
    return (
      <div>
        <div className="mb-4 pr-8">
          <h3 className="text-lg font-semibold text-foreground">Concentración Geográfica</h3>
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
        <h3 className="text-lg font-semibold text-foreground">Concentración Geográfica</h3>
        <p className="text-sm text-muted-foreground">Comparativa de casos por comunidad entre períodos</p>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={concentrationData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid {...ts.grid} />
            <XAxis dataKey="zona" tick={ts.xTick} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} />
            <YAxis tick={ts.xTick} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={ts.tooltip} formatter={(value: any) => [safeValue(value), undefined]} />
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
  const { data: backendData, isLoading } = useTasaCrecimientoEpidemiologico();

  const chartData = useMemo(() => {
    if (!backendData) return [];
    const items = backendData?.comunidades || backendData?.items || (Array.isArray(backendData) ? backendData : []);
    if (!Array.isArray(items) || items.length === 0) return [];
    return items.map((d: any) => ({
      comunidad: safeStr(d.comunidad || d.nombre),
      tasa: safeValue(d.indicador || d.tasaCrecimiento || d.porcentaje),
      actual: safeValue(d.casosActuales || d.periodoActual || d.actual),
      anterior: safeValue(d.casosAnteriores || d.periodoAnterior || d.anterior),
    })).filter((d: any) => d.comunidad !== 'N/A');
  }, [backendData]);

  if (isLoading) {
    return (
      <div>
        <div className="mb-4 pr-8">
          <h3 className="text-lg font-semibold text-foreground">Crecimiento Epidemiológico</h3>
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
          <h3 className="text-lg font-semibold text-foreground">Crecimiento Epidemiológico</h3>
          <p className="text-sm text-muted-foreground">Variación trimestral de casos por comunidad</p>
        </div>
        <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-secondary/20">
          <span className="text-muted-foreground">Sin datos de crecimiento en el período</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Crecimiento Epidemiológico</h3>
        <p className="text-sm text-muted-foreground">Tasa de crecimiento trimestral por comunidad</p>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid {...ts.grid} horizontal={false} />
            <XAxis type="number" tick={ts.xTick} axisLine={false} tickLine={false} unit="%" />
            <YAxis type="category" dataKey="comunidad" tick={ts.xTick} axisLine={false} tickLine={false} width={80} />
            <Tooltip contentStyle={ts.tooltip} formatter={(value: any) => [`${safeValue(value)}%`, 'Crecimiento']} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar dataKey="actual" fill="hsl(var(--chart-1))" name="Actual" maxBarSize={30} />
            <Bar dataKey="anterior" fill="hsl(var(--chart-3))" name="Anterior" maxBarSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function VulnerabilityView() {
  const { data: backendData, isLoading } = useVulnerabilidadComunitaria();
  const patients = usePatientsWithComunidad();

  const vulnerabilityData = useMemo(() => {
    if (backendData) {
      const items = backendData?.comunidades || backendData?.items || (Array.isArray(backendData) ? backendData : []);
      if (Array.isArray(items) && items.length > 0) {
        return items.map((d: any) => ({
          comunidad: safeStr(d.comunidad || d.nombre),
          tasa: safeValue(d.indicador || d.porcentaje || d.tasa),
          encamados: safeValue(d.pacientesEncamados || d.encamados || d.casos),
        })).filter((d: any) => d.comunidad !== 'N/A');
      }
    }
    const counts: Record<string, { total: number, encamados: number }> = {};
    patients.forEach((p: any) => {
      const c = p._com?.nombre_comunidad || p._com?.nombre || 'Desconocida';
      if (!counts[c]) counts[c] = { total: 0, encamados: 0 };
      counts[c].total++;
      if (p.estado_paciente === 'encamado' || p.estado_paciente === 'discapacitado') {
        counts[c].encamados++;
      }
    });
    return Object.entries(counts).map(([comunidad, stats]) => ({
      comunidad,
      encamados: stats.encamados,
      tasa: stats.total > 0 ? (stats.encamados / stats.total) * 100 : 0
    }));
  }, [backendData, patients]);

  if (isLoading) {
    return (
      <div>
        <div className="mb-4 pr-8">
          <h3 className="text-lg font-semibold text-foreground">Vulnerabilidad Comunitaria</h3>
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
        <h3 className="text-lg font-semibold text-foreground">Vulnerabilidad Comunitaria</h3>
        <p className="text-sm text-muted-foreground">Pacientes encamados/dependientes por comunidad</p>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={vulnerabilityData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid {...ts.grid} horizontal={false} />
            <XAxis type="number" tick={ts.xTick} axisLine={false} tickLine={false} unit="%" />
            <YAxis type="category" dataKey="comunidad" tick={ts.xTick} axisLine={false} tickLine={false} width={80} />
            <Tooltip contentStyle={ts.tooltip} formatter={(value: any) => [safeValue(value), undefined]} />
            <Bar dataKey="tasa" fill="hsl(var(--chart-5))" name="Tasa %" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function GeographicKPI({ selectedKpiIds }: { selectedKpiIds?: string[] }) {
  return (
    <KPIWrapper selectedKpiIds={selectedKpiIds} views={[
      { id: 'densidad-comunidad', label: 'Densidad', component: <DensityView /> },
      { id: 'concentracion-geo', label: 'Concentración', component: <ConcentrationView /> },
      { id: 'crecimiento-zona', label: 'Crecimiento', component: <GrowthView /> },
      { id: 'vulnerabilidad-com', label: 'Vulnerabilidad', component: <VulnerabilityView /> },
    ]} />
  );
}
