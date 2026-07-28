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
import { KPIConfigModal, KPIConfigValue, isPresetType } from './KPIConfigModal';
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

const PRESET_KPI_IDS: Record<string, string[]> = {
  epidemiologicos: ['treemap-etario', 'distribucion-enfermedades', 'densidad-comunidad'],
  'carga-trabajo': ['treemap-especialidad', 'retencion-especialidad', 'matriz-prioridades'],
  seguimiento: ['deteccion-temprana', 'reconsultas-criticos', 'vulnerabilidad-com'],
  geografia: ['interconsulta', 'densidad-comunidad', 'concentracion-geo'],
};

export function DashboardContent() {
  const [config, setConfig] = useState<KPIConfigValue>({ types: 'random', count: 5 });
  const [showConfig, setShowConfig] = useState(false);

  const { data: dashData, isLoading } = useDashboardMetrics();

  const metrics = useMemo(() => {
    const citas = dashData?.citasHoy || { total: 0, change: 0 };
    const consultas = dashData?.consultasMensuales || { total: 0, change: 0 };
    const pacientes = dashData?.totalPacientes || { total: 0, change: 0 };
    const carga = dashData?.cargaMedia || { total: 0, totalPacientes: 0, totalEspecialistas: 0, meta: 250 };
    const urg = dashData?.urgencias || { percentage: 0, change: 0, totalConsultas: 0, totalUrgencias: 0 };
    const cargaEsp = dashData?.desviacionCargaEspecialidad || [];

    const topEspecialidad = cargaEsp.length > 0
      ? [...cargaEsp].sort((a, b) => Math.abs(b.desviacion) - Math.abs(a.desviacion))[0]
      : null;

    return {
      totalCitasHoy: citas.total || 0,
      citasHoyDelta: citas.change || 0,
      totalConsultas: consultas.total || 0,
      consultasDelta: consultas.change || 0,
      totalPacientes: pacientes.total || 0,
      pacientesDelta: pacientes.change || 0,
      cargaMedia: carga.total || 0,
      cargaMeta: carga.meta || 250,
      cargaPct: carga.total > 0 && carga.meta > 0
        ? Math.round((carga.total / carga.meta) * 1000) / 10
        : 0,
      desviacionCarga: cargaEsp.length > 0
        ? cargaEsp.reduce((sum, e) => sum + e.desviacion, 0) / cargaEsp.length
        : 0,
      topEspecialidad,
      urgenciasPct: urg.percentage || 0,
      urgenciasDelta: urg.change || 0,
      totalUrgencias: urg.totalUrgencias || 0,
      totalConsultasUrg: urg.totalConsultas || 0,
    };
  }, [dashData]);

  const eligibleSlots = (() => {
    if (config.types === 'random') return [1, 2, 3, 4, 5];
    if (isPresetType(config.types)) {
      const presetKpiIds = PRESET_KPI_IDS[config.types];
      const slots = new Set(KPI_CATALOG.filter(k => presetKpiIds.includes(k.id)).map(k => k.slot));
      return Array.from(slots).sort();
    }
    const selected = config.types;
    const slots = new Set(KPI_CATALOG.filter(k => selected.includes(k.type)).map(k => k.slot));
    return Array.from(slots).sort();
  })();

  const selectedKpiIds = (() => {
    if (config.types === 'random') return undefined;
    if (isPresetType(config.types)) return PRESET_KPI_IDS[config.types];
    return undefined;
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
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        <MetricCard
          title="Citas de Hoy"
          value={metrics.totalCitasHoy}
          subtitle="Programadas para hoy"
          icon={CalendarCheck}
          trend={{ value: metrics.citasHoyDelta }}
          semaforo={getSemaforo('citasHoy', metrics.totalCitasHoy)}
        />
        <MetricCard
          title="Consultas"
          value={metrics.totalConsultas}
          subtitle="Registradas"
          icon={Activity}
          trend={{ value: metrics.consultasDelta }}
          semaforo={getSemaforo('totalConsultas', metrics.consultasDelta)}
        />
        <MetricCard
          title="Pacientes"
          value={metrics.totalPacientes}
          subtitle="Registrados"
          icon={Users}
          trend={{ value: metrics.pacientesDelta }}
          semaforo={getSemaforo('totalPacientes', metrics.pacientesDelta)}
        />
        <MetricCard
          title="Carga / Esp."
          value={metrics.cargaMedia}
          subtitle={`${metrics.cargaPct.toFixed(0)}% de capacidad (meta: ${metrics.cargaMeta})`}
          icon={Stethoscope}
          semaforo={getSemaforo('cargaEspecialista', metrics.cargaPct)}
        />
        <MetricCard
          title="% Urgencias"
          value={`${metrics.urgenciasPct.toFixed(0)}%`}
          subtitle={metrics.totalUrgencias > 0 ? `${metrics.totalUrgencias} de ${metrics.totalConsultasUrg} consultas` : 'Sobre total'}
          icon={AlertTriangle}
          trend={{ value: metrics.urgenciasDelta }}
          semaforo={getSemaforo('urgencias', metrics.urgenciasPct)}
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="section-header">Indicadores Clave</h2>
        <Button variant="outline" size="sm" onClick={() => setShowConfig(true)} className="text-xs">
          <Settings className="w-3.5 h-3.5 mr-1" />
          Configurar KPIs
        </Button>
      </div>

      <div className={`grid grid-cols-1 ${cols} gap-6`}>
        {visibleSlots.map(slotIdx => {
          const Comp = SLOT_COMPONENTS[slotIdx - 1];
          return <Comp key={slotIdx} selectedKpiIds={selectedKpiIds} />;
        })}
      </div>

      <KPIConfigModal open={showConfig} onOpenChange={setShowConfig} value={config} onApply={setConfig} />

      <PatientTable />
    </div>
  );
}
