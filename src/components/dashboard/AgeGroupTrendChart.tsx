import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useCitas } from '@/services/useCitas';
import { usePacientes } from '@/services/usePacientes';

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

function CustomTip({ active, payload, label, data }: { active?: boolean; payload?: TipPayload[]; label?: string; data: any[] }) {
  if (!active || !payload || !payload.length) return null;
  const idx = data.findIndex((d: any) => d.periodo === label);
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
  const { data: citas = [] } = useCitas();
  const { data: pacientes = [] } = usePacientes();

  const data = useMemo(() => {
    // Map patient ID to age group
    const patientAges = new Map<string, string>();
    const currentYear = new Date().getFullYear();
    pacientes.forEach((p: any) => {
      const id = String(p.pk_num_paciente ?? p.id ?? '');
      if (!id) return;
      if (p.fecha_nacimiento) {
        const age = currentYear - new Date(p.fecha_nacimiento).getFullYear();
        if (age <= 12) patientAges.set(id, '0-12');
        else if (age <= 18) patientAges.set(id, '13-18');
        else if (age <= 59) patientAges.set(id, '19-59');
        else patientAges.set(id, '60+');
      } else {
        patientAges.set(id, '19-59'); // default
      }
    });

    // Group citas by month
    const monthCounts: Record<string, { '0-12': number, '13-18': number, '19-59': number, '60+': number }> = {};
    
    citas.forEach((c: any) => {
      const dateStr = c.fecha || c.date;
      if (!dateStr) return;
      const month = dateStr.substring(0, 7); // YYYY-MM
      const pId = String(c.fk_ps_b001_num_paciente ?? '');
      const group = patientAges.get(pId) || '19-59';
      
      if (!monthCounts[month]) monthCounts[month] = { '0-12': 0, '13-18': 0, '19-59': 0, '60+': 0 };
      monthCounts[month][group as keyof typeof monthCounts[string]]++;
    });

    const results = Object.keys(monthCounts).sort().map(month => ({
      periodo: month,
      ...monthCounts[month]
    }));

    if (results.length === 0) {
      return [{ periodo: 'Sin datos', '0-12': 0, '13-18': 0, '19-59': 0, '60+': 0 }];
    }
    return results;
  }, [citas, pacientes]);

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
            <Tooltip content={<CustomTip data={data} />} />
            <Legend wrapperStyle={{ paddingTop: '8px', fontSize: 11 }} />
            {series.map(s => (
              <Bar key={s.key} dataKey={s.key} fill={s.color} radius={[4, 4, 0, 0]} maxBarSize={40} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
