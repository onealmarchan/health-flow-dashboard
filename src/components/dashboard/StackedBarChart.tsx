import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const monthlyData = [
  { month: 'Ene', urgente: 12, noUrgente: 85, viral: 28, transmision: 15 },
  { month: 'Feb', urgente: 15, noUrgente: 92, viral: 32, transmision: 18 },
  { month: 'Mar', urgente: 18, noUrgente: 110, viral: 45, transmision: 22 },
  { month: 'Abr', urgente: 14, noUrgente: 95, viral: 38, transmision: 20 },
  { month: 'May', urgente: 20, noUrgente: 105, viral: 42, transmision: 25 },
  { month: 'Jun', urgente: 16, noUrgente: 88, viral: 30, transmision: 17 },
  { month: 'Jul', urgente: 13, noUrgente: 78, viral: 26, transmision: 14 },
  { month: 'Ago', urgente: 11, noUrgente: 82, viral: 24, transmision: 12 },
  { month: 'Sep', urgente: 14, noUrgente: 90, viral: 28, transmision: 16 },
  { month: 'Oct', urgente: 17, noUrgente: 98, viral: 35, transmision: 19 },
  { month: 'Nov', urgente: 12, noUrgente: 86, viral: 22, transmision: 13 },
  { month: 'Dic', urgente: 14, noUrgente: 90, viral: 24, transmision: 16 },
];

export function StackedBarChartComponent() {
  return (
    <div className="chart-container animate-fade-in">
      <h3 className="text-lg font-semibold text-foreground mb-1">Tendencia Mensual</h3>
      <p className="text-sm text-muted-foreground mb-4">Registros por tipo de condición</p>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              vertical={false}
            />
            <XAxis 
              dataKey="month" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => (
                <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '12px' }}>
                  {value}
                </span>
              )}
            />
            <Bar 
              dataKey="urgente" 
              stackId="a" 
              fill="hsl(var(--destructive))" 
              name="Urgente"
              radius={[0, 0, 0, 0]}
            />
            <Bar 
              dataKey="noUrgente" 
              stackId="a" 
              fill="hsl(var(--chart-3))" 
              name="No Urgente"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
