import { Users, CalendarCheck, AlertTriangle, Activity, Stethoscope, Clock } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { AgeTreeMap } from './AgeTreeMap';
import { UrgencyChart } from './UrgencyChart';
import { StackedBarChartComponent } from './StackedBarChart';
import { DecisionMatrix } from './DecisionMatrix';
import { PatientTable } from './PatientTable';

export function DashboardContent() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Pacientes"
          value="1,255"
          subtitle="Registrados"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          variant="primary"
        />
        <MetricCard
          title="Citas Hoy"
          value="48"
          subtitle="Programadas"
          icon={CalendarCheck}
          variant="success"
        />
        <MetricCard
          title="Urgencias"
          value="156"
          subtitle="Este mes"
          icon={AlertTriangle}
          trend={{ value: 8, isPositive: false }}
          variant="warning"
        />
        <MetricCard
          title="Consultas"
          value="892"
          subtitle="Completadas"
          icon={Activity}
          variant="accent"
        />
        <MetricCard
          title="Especialistas"
          value="24"
          subtitle="Activos"
          icon={Stethoscope}
          variant="default"
        />
        <MetricCard
          title="Tiempo Espera"
          value="15m"
          subtitle="Promedio"
          icon={Clock}
          trend={{ value: 5, isPositive: true }}
          variant="default"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgeTreeMap />
        <UrgencyChart />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StackedBarChartComponent />
        <DecisionMatrix />
      </div>

      {/* Patient Table */}
      <PatientTable />
    </div>
  );
}
