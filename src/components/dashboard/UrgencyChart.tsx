import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const urgencyData = [
  { name: 'Urgencia Inmediata', value: 156, fill: 'hsl(var(--destructive))' },
  { name: 'No Urgente', value: 1099, fill: 'hsl(var(--chart-3))' },
];

const diseaseData = [
  { name: 'Enfermedades Virales', value: 324, fill: 'hsl(var(--chart-4))' },
  { name: 'Transmisión Directa', value: 187, fill: 'hsl(var(--chart-5))' },
  { name: 'Otras Condiciones', value: 744, fill: 'hsl(var(--chart-2))' },
];

export function UrgencyChart() {
  return (
    <div className="chart-container animate-fade-in">
      <h3 className="text-lg font-semibold text-foreground mb-1">Clasificación de Condiciones</h3>
      <p className="text-sm text-muted-foreground mb-4">Urgencias y tipos de enfermedades</p>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Urgency Pie */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground text-center mb-2">Por Urgencia</h4>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={urgencyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {urgencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
                          <p className="font-medium text-foreground text-sm">{data.name}</p>
                          <p className="text-lg font-bold text-primary">{data.value} casos</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-1.5 mt-2">
            {urgencyData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="text-muted-foreground truncate">{item.name}</span>
                <span className="font-medium text-foreground ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Disease Types Pie */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground text-center mb-2">Por Tipo</h4>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={diseaseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {diseaseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
                          <p className="font-medium text-foreground text-sm">{data.name}</p>
                          <p className="text-lg font-bold text-primary">{data.value} casos</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-1.5 mt-2">
            {diseaseData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="text-muted-foreground truncate">{item.name}</span>
                <span className="font-medium text-foreground ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
