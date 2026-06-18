import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { periodo: 'Q1', '0-12': 120, '13-18': 80,  '19-59': 240, '60+': 140 },
  { periodo: 'Q2', '0-12': 132, '13-18': 92,  '19-59': 268, '60+': 158 },
  { periodo: 'Q3', '0-12': 118, '13-18': 88,  '19-59': 252, '60+': 172 },
  { periodo: 'Q4', '0-12': 145, '13-18': 95,  '19-59': 285, '60+': 190 },
];

const series = [
  { key: '0-12',  color: 'hsl(var(--chart-1))' },
  { key: '13-18', color: 'hsl(var(--chart-2))' },
  { key: '19-59', color: 'hsl(var(--chart-3))' },
  { key: '60+',   color: 'hsl(var(--chart-4))' },
];

interface TipPayload {
  payload: Record<string, number | string>;
  name?: string;
  value?: number;
  color?: string;
}

function CustomTip({ active, payload, label }: { active?: boolean; payload?: TipPayload[]; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  const idx = data.findIndex(d => d.periodo === label);
  const prev = idx > 0 ? data[idx - 1] : null;
  return (
    <div className="bg-popover border border-border rounded-md p-2 shadow-lg text-xs">
      <div className="font-semibold text-foreground mb-1">{label}</div>
      {payload.map((p) => {
        const prevVal = prev ? Number(prev[p.name as keyof typeof prev]) : null;
        const curVal = Number(p.value ?? 0);
        const variation = prevVal && prevVal !== 0 ? ((curVal - prevVal) / prevVal) * 100 : null;
        return (
          <div key={p.name} className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-muted-foreground">{p.name}:</span>
            <span className="text-foreground font-medium">{p.value}</span>
            {variation !== null && (
              <span className={variation >= 0 ? 'text-success' : 'text-destructive'}>
                ({variation >= 0 ? '+' : ''}{variation.toFixed(1)}%)
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function AgeGroupTrendChart() {
  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Tendencia de consultas por grupo etario</h3>
        <p className="text-sm text-muted-foreground">Comparativa porcentual entre periodos por cohorte</p>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="periodo" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} />
            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTip />} />
            <Legend wrapperStyle={{ paddingTop: '8px', fontSize: 11 }} />
            {series.map(s => (
              <Bar key={s.key} dataKey={s.key} fill={s.color} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
