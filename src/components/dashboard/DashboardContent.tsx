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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const allKPIs = [
  { id: 'treemap', label: 'TreeMap Etario', component: AgeTreeMap },
  { id: 'retention', label: 'Retención', component: RetentionChartKPI },
  { id: 'trend', label: 'Tendencia Mensual', component: StackedBarChartComponent },
  { id: 'matrix', label: 'Matriz de Prioridades', component: DecisionMatrix },
  { id: 'geographic', label: 'Indicadores Geográficos', component: GeographicKPI },
];

export function DashboardContent() {
  const [kpiCount, setKpiCount] = useState(5);
  const [showConfig, setShowConfig] = useState(false);

  const visibleKPIs = allKPIs.slice(0, kpiCount);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard title="Total Pacientes" value="1,255" subtitle="Registrados" icon={Users} trend={{ value: 12, isPositive: true }} variant="primary" />
        <MetricCard title="Citas Hoy" value="48" subtitle="Programadas" icon={CalendarCheck} variant="success" />
        <MetricCard title="Urgencias" value="156" subtitle="Este mes" icon={AlertTriangle} trend={{ value: 8, isPositive: false }} variant="warning" />
        <MetricCard title="Consultas" value="892" subtitle="Completadas" icon={Activity} variant="accent" />
        <MetricCard title="Especialistas" value="24" subtitle="Activos" icon={Stethoscope} variant="default" />
        <MetricCard title="Tiempo Espera" value="15m" subtitle="Promedio" icon={Clock} trend={{ value: 5, isPositive: true }} variant="default" />
      </div>

      {/* KPI Config */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Indicadores Clave</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowConfig(!showConfig)}>
            <Settings className="w-4 h-4 mr-1" />
            Configurar KPIs
          </Button>
          {showConfig && (
            <Select value={String(kpiCount)} onValueChange={(v) => setKpiCount(Number(v))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border z-50">
                {[1, 2, 3, 4, 5].map(n => (
                  <SelectItem key={n} value={String(n)}>{n} KPI{n > 1 ? 's' : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* KPI Charts - dynamic grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visibleKPIs.map(kpi => {
          const KPIComponent = kpi.component;
          return <KPIComponent key={kpi.id} />;
        })}
      </div>

      {/* Patient Table */}
      <PatientTable />
    </div>
  );
}
