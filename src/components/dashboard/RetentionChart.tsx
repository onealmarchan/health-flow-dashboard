import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { KPIWrapper } from './KPIWrapper';
import { EarlyDetectionGauge } from './EarlyDetectionGauge';
import { AgeGroupTrendChart } from './AgeGroupTrendChart';

const retentionData = [
  { name: 'Cardiología', value: 78, fill: 'hsl(var(--chart-1))' },
  { name: 'Pediatría', value: 85, fill: 'hsl(var(--chart-2))' },
  { name: 'Dermatología', value: 62, fill: 'hsl(var(--chart-3))' },
  { name: 'Neurología', value: 71, fill: 'hsl(var(--chart-4))' },
  { name: 'Traumatología', value: 55, fill: 'hsl(var(--chart-5))' },
];

function RetentionView() {
  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Tasa de Retención por Especialidad</h3>
        <p className="text-sm text-muted-foreground">Pacientes que regresan a control/seguimiento</p>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={retentionData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
              paddingAngle={3} dataKey="value" label={({ value }) => `${value}%`}
            >
              {retentionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={({ payload }) => {
              if (payload && payload.length) {
                const d = payload[0].payload as { name: string; value: number };
                return (
                  <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
                    <p className="font-medium text-foreground text-sm">{d.name}</p>
                    <p className="text-lg font-bold text-primary">{d.value}% retención</p>
                  </div>
                );
              }
              return null;
            }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 mt-2">
        {retentionData.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
            <span className="text-muted-foreground">{item.name}</span>
            <span className="font-medium text-foreground">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RetentionChartKPI() {
  return (
    <KPIWrapper views={[
      { id: 'retencion-especialidad', label: 'Tasa de retención por especialidad', component: <RetentionView /> },
      { id: 'deteccion-temprana',     label: 'Tasa de detección temprana',         component: <EarlyDetectionGauge /> },
      { id: 'tendencia-etaria',       label: 'Tendencia de consultas por grupo etario', component: <AgeGroupTrendChart /> },
    ]} />
  );
}
