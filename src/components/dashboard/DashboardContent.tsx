import { useState } from 'react';
import { Users, CalendarCheck, AlertTriangle, Activity, Stethoscope, Clock, Settings } from 'lucide-react';
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

// 5 dashboard slot host-components (each slot may rotate through several KPIs)
const SLOT_COMPONENTS = [
  AgeTreeMap,             // slot 1
  RetentionChartKPI,      // slot 2
  StackedBarChartComponent, // slot 3
  DecisionMatrix,         // slot 4
  GeographicKPI,          // slot 5
];

export function DashboardContent() {
  const [config, setConfig] = useState<KPIConfigValue>({ types: 'random', count: 5 });
  const [showConfig, setShowConfig] = useState(false);

  // Determine which slots to render based on filter
  const eligibleSlots = (() => {
    if (config.types === 'random') return [1, 2, 3, 4, 5];
    const selected = config.types;
    const slots = new Set(KPI_CATALOG.filter(k => selected.includes(k.type)).map(k => k.slot));
    return Array.from(slots).sort();
  })();

  const visibleSlots = eligibleSlots.slice(0, config.count);
  // Dynamic grid columns
  const cols = visibleSlots.length === 1 ? 'lg:grid-cols-1' :
               visibleSlots.length === 2 ? 'lg:grid-cols-2' :
               visibleSlots.length === 3 ? 'lg:grid-cols-3' :
                                            'lg:grid-cols-2';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard title="Total Pacientes" value="1,255" subtitle="Registrados" icon={Users} trend={{ value: 12, isPositive: true }} variant="primary" />
        <MetricCard title="Citas Hoy" value="48" subtitle="Programadas" icon={CalendarCheck} variant="success" />
        <MetricCard title="Urgencias" value="156" subtitle="Este mes" icon={AlertTriangle} trend={{ value: 8, isPositive: false }} variant="warning" />
        <MetricCard title="Consultas" value="892" subtitle="Completadas" icon={Activity} variant="accent" />
        <MetricCard title="Especialistas" value="24" subtitle="Activos" icon={Stethoscope} variant="default" />
        <MetricCard title="Tiempo Espera" value="15m" subtitle="Promedio" icon={Clock} trend={{ value: 5, isPositive: true }} variant="default" />
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
