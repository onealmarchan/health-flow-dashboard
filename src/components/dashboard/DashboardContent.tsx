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

export function DashboardContent() {
  const [config, setConfig] = useState<KPIConfigValue>({ types: 'random', count: 5 });
  const [showConfig, setShowConfig] = useState(false);

  const { data: dashData, isLoading } = useDashboardMetrics();

  const metrics = useMemo(() => {
    const citas = dashData?.citasHoy || { total: 0, change: 0 };
    const consultas = dashData?.consultasMensuales || { total: 0, change: 0 };
    const pacientes = dashData?.totalPacientes || { total: 0, change: 0 };
    const carga = dashData?.cargaMedia || { total: 0, change: 0, meta: 250 };
    const urg = dashData?.urgencias || { percentage: 0, change: 0 };

    return {
      totalCitasHoy: citas.total || 0,
      citasHoyDelta: citas.change || 0,
      totalConsultas: consultas.total || 0,
      consultasDelta: consultas.change || 0,
      totalPacientes: pacientes.total || 0,
      pacientesDelta: pacientes.change || 0,
      cargaMedia: carga.total || 0,
      cargaMeta: carga.meta || 250,
      desviacionCarga: carga.change || 0,
      urgenciasPct: urg.percentage || 0,
      urgenciasDelta: urg.change || 0,
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
          title="Citas de Hoy"
          value={metrics.totalCitasHoy}
          subtitle="Programadas para hoy"
          icon={CalendarCheck}
          trend={{ value: metrics.citasHoyDelta }}
          semaforo={getSemaforo('citasHoy', metrics.totalCitasHoy)}
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
          value={metrics.cargaMedia}
          subtitle={`Meta ${metrics.cargaMeta} · desv ${metrics.desviacionCarga >= 0 ? '+' : ''}${metrics.desviacionCarga.toFixed(1)}%`}
          icon={Stethoscope}
          semaforo={getSemaforo('cargaEspecialista', metrics.desviacionCarga)}
        />
        <MetricCard
          title="% de Urgencias"
          value={`${metrics.urgenciasPct.toFixed(0)}%`}
          subtitle="Sobre total de consultas"
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
          return <Comp key={slotIdx} />;
        })}
      </div>

      <KPIConfigModal open={showConfig} onOpenChange={setShowConfig} value={config} onApply={setConfig} />

      <PatientTable />
    </div>
  );
}
