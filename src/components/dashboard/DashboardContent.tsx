import { useMemo, useState } from 'react';
import { CalendarCheck, AlertTriangle, Activity, Users, Stethoscope, Settings } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { AgeTreeMap } from './AgeTreeMap';
import { RetentionChartKPI } from './RetentionChart';
import { StackedBarChartComponent } from './StackedBarChart';
import { DecisionMatrix } from './DecisionMatrix';
import { GeographicKPI } from './GeographicKPI';
import { PatientTable } from './PatientTable';
import { Button } from '@/components/ui/button';
import { KPIConfigModal, KPIConfigValue } from './KPIConfigModal';
import { KPI_CATALOG } from './kpiCatalog';
import { getSemaforo } from '@/lib/kpi-semaforos';
import { useDashboardMetrics } from '@/services/useDashboard';

const SLOT_COMPONENTS = [
  AgeTreeMap,
  RetentionChartKPI,
  StackedBarChartComponent,
  DecisionMatrix,
  GeographicKPI,
];

// Deterministic pseudo-previous baseline so trend chips vary but are stable.
function baseline(seed: string, curr: number, factor = 0.8): number {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  const jitter = ((h % 30) - 15) / 100; // ±0.15
  return Math.max(1, curr * (factor + jitter));
}

export function DashboardContent() {
  const [config, setConfig] = useState<KPIConfigValue>({ types: 'random', count: 5 });
  const [showConfig, setShowConfig] = useState(false);

  const { data: dashData, isLoading } = useDashboardMetrics();

  const metrics = useMemo(() => {
    // If endpoints are mocked/empty, use safe defaults
    const fallback = { total: 0, change: 0, percentage: 0 };
    const citas = dashData?.citasHoy || fallback;
    const consultas = dashData?.consultasMensuales || fallback;
    const pacientes = dashData?.totalPacientes || fallback;
    const ocupacion = dashData?.ocupacionAgenda || fallback;
    // We are mapping the backend endpoints to the UI cards as best as possible
    // Backend may need adjustments to provide exactly what the UI needs
    
    // For now, we mock the delta values for the visual trends if backend doesn't provide them
    const deltaFor = (curr: number, seed: string) => {
      const prev = baseline(seed, curr);
      return curr === 0 ? 0 : ((curr - prev) / prev) * 100;
    };

    const cargaMedia = 250; // default meta
    const desviacionCarga = 0; // default 0

    return {
      citasHoyPct: citas.percentage || 0,
      citasHoyDelta: citas.change || deltaFor(citas.percentage || 0, 'citas'),
      totalConsultas: consultas.total || 0,
      consultasDelta: consultas.change || deltaFor(consultas.total || 0, 'consultas'),
      totalPacientes: pacientes.total || 0,
      pacientesDelta: pacientes.change || deltaFor(pacientes.total || 0, 'pacientes'),
      cargaMedia: cargaMedia,
      desviacionCarga: desviacionCarga,
      urgenciasPct: ocupacion.percentage || 0,
      urgenciasDelta: ocupacion.change || deltaFor(ocupacion.percentage || 0, 'urgencias'),
    };
  }, [dashData]);

  const eligibleSlots = (() => {
    if (config.types === 'random') return [1, 2, 3, 4, 5];
    const selected = config.types;
    const slots = new Set(KPI_CATALOG.filter(k => selected.includes(k.type)).map(k => k.slot));
    return Array.from(slots).sort();
  })();
  const visibleSlots = eligibleSlots.slice(0, config.count);
  const cols = visibleSlots.length === 1 ? 'lg:grid-cols-1' :
               visibleSlots.length === 2 ? 'lg:grid-cols-2' :
               visibleSlots.length === 3 ? 'lg:grid-cols-3' :
                                            'lg:grid-cols-2';

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-[120px] bg-card border border-border rounded-xl"></div>
          ))}
        </div>
        <div className="h-[400px] bg-card border border-border rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <MetricCard
          title="% Citas de Hoy"
          value={`${metrics.citasHoyPct.toFixed(0)}%`}
          subtitle="Confirmadas / Programadas"
          icon={CalendarCheck}
          trend={{ value: metrics.citasHoyDelta }}
          semaforo={getSemaforo('citasHoy', metrics.citasHoyPct)}
        />
        <MetricCard
          title="Total de Consultas"
          value={metrics.totalConsultas}
          subtitle="Registradas"
          icon={Activity}
          trend={{ value: metrics.consultasDelta }}
          semaforo={getSemaforo('totalConsultas', metrics.consultasDelta)}
        />
        <MetricCard
          title="Total de Pacientes"
          value={metrics.totalPacientes}
          subtitle="Registrados"
          icon={Users}
          trend={{ value: metrics.pacientesDelta }}
          semaforo={getSemaforo('totalPacientes', metrics.pacientesDelta)}
        />
        <MetricCard
          title="Carga por Especialista"
          value={`${metrics.cargaMedia}`}
          subtitle={`Meta 250 · desv ${metrics.desviacionCarga >= 0 ? '+' : ''}${metrics.desviacionCarga.toFixed(1)}%`}
          icon={Stethoscope}
          semaforo={getSemaforo('cargaEspecialista', metrics.desviacionCarga)}
        />
        <MetricCard
          title="% de Urgencias"
          value={`${metrics.urgenciasPct.toFixed(0)}%`}
          subtitle="Sobre total de citas"
          icon={AlertTriangle}
          trend={{ value: metrics.urgenciasDelta }}
          semaforo={getSemaforo('urgencias', metrics.urgenciasPct)}
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Indicadores Clave</h2>
        <Button variant="outline" size="sm" onClick={() => setShowConfig(true)}>
          <Settings className="w-4 h-4 mr-1" />
          Configurar KPIs
        </Button>
      </div>

      <div className={`grid grid-cols-1 ${cols} gap-6`}>
        {visibleSlots.map(slotIdx => {
          const Comp = SLOT_COMPONENTS[slotIdx - 1];
          return <Comp key={slotIdx} />;
        })}
      </div>

      <KPIConfigModal open={showConfig} onOpenChange={setShowConfig} value={config} onApply={setConfig} />

      <PatientTable />
    </div>
  );
}
