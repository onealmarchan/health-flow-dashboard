import { useRef, useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { toPng } from 'html-to-image';

const PALETTE = [
  '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6',
];

export type ChartKind = 'barras' | 'pie' | 'linea';

export interface ChartSpec {
  kind: ChartKind;
  title: string;
  dataKey: string;
  labelKey: string;
}

interface Props {
  charts: ChartSpec[];
  rows: Record<string, any>[];
  onCapture: (images: { spec: ChartSpec; dataUrl: string }[]) => void;
}

/** Agrega filas contando ocurrencias por label (siempre cuenta, no lee un campo numérico). */
function aggregateByLabel(rows: Record<string, any>[], labelKey: string) {
  const counts: Record<string, number> = {};
  rows.forEach(r => {
    const label = String(r[labelKey] ?? 'N/D');
    counts[label] = (counts[label] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 12);
}

const chartBoxStyle: React.CSSProperties = {
  width: 820,
  height: 420,
  background: '#ffffff',
  padding: '20px 28px',
  borderRadius: 8,
  boxSizing: 'border-box',
};

function BarChartComponent({ chart, rows }: { chart: ChartSpec; rows: Record<string, any>[] }) {
  const data = aggregateByLabel(rows, chart.labelKey);
  return (
    <div style={chartBoxStyle}>
      <h4 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: '#1e293b' }}>{chart.title}</h4>
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 15 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 13 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} angle={-25} textAnchor="end" height={65} />
          <YAxis tick={{ fill: '#475569', fontSize: 13 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }} />
          <Bar dataKey="value" name="Cantidad" radius={[5, 5, 0, 0]} maxBarSize={50}>
            {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function PieChartComponent({ chart, rows }: { chart: ChartSpec; rows: Record<string, any>[] }) {
  const data = aggregateByLabel(rows, chart.labelKey);
  return (
    <div style={chartBoxStyle}>
      <h4 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: '#1e293b' }}>{chart.title}</h4>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={65} outerRadius={115} paddingAngle={3} dataKey="value"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
          >
            {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 6 }}>
        {data.map((d, i) => (
          <span key={d.name} style={{ fontSize: 13, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: PALETTE[i % PALETTE.length], display: 'inline-block' }} />
            {d.name} ({d.value})
          </span>
        ))}
      </div>
    </div>
  );
}

function LineChartComponent({ chart, rows }: { chart: ChartSpec; rows: Record<string, any>[] }) {
  const data = aggregateByLabel(rows, chart.labelKey);
  return (
    <div style={chartBoxStyle}>
      <h4 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: '#1e293b' }}>{chart.title}</h4>
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 15 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 13 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} angle={-25} textAnchor="end" height={65} />
          <YAxis tick={{ fill: '#475569', fontSize: 13 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }} />
          <Line type="monotone" dataKey="value" name="Cantidad" stroke={PALETTE[0]} strokeWidth={3} dot={{ r: 6, fill: PALETTE[0] }} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ReportChartCapture({ charts, rows, onCapture }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'idle' | 'rendering' | 'capturing'>('idle');

  // Start rendering after charts/rows change
  useEffect(() => {
    if (charts.length === 0) { onCapture([]); return; }
    setPhase('rendering');
  }, [charts, rows, onCapture]);

  // Once rendered, wait a beat then capture
  useEffect(() => {
    if (phase !== 'rendering') return;
    const t = setTimeout(() => setPhase('capturing'), 500);
    return () => clearTimeout(t);
  }, [phase]);

  const captureAll = useCallback(async () => {
    if (!containerRef.current || charts.length === 0) return;
    const results: { spec: ChartSpec; dataUrl: string }[] = [];
    const nodes = containerRef.current.querySelectorAll<HTMLElement>('[data-chart-idx]');
    for (let i = 0; i < nodes.length; i++) {
      try {
        const dataUrl = await toPng(nodes[i], {
          pixelRatio: 3,
          backgroundColor: '#ffffff',
          skipFonts: true,
          skipAutoStyling: true,
          excludeQuery: (rule) => rule.href != null && rule.href.includes('fonts.googleapis.com'),
        });
        results.push({ spec: charts[i], dataUrl });
      } catch { /* skip */ }
    }
    onCapture(results);
    setPhase('idle');
  }, [charts, onCapture]);

  useEffect(() => {
    if (phase === 'capturing') {
      const t = setTimeout(captureAll, 100);
      return () => clearTimeout(t);
    }
  }, [phase, captureAll]);

  if (charts.length === 0) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 870,
        zIndex: -1,
        pointerEvents: 'none',
        opacity: phase === 'idle' ? 0 : 1,
      }}
    >
      {charts.map((chart, idx) => (
        <div key={`${chart.kind}-${chart.labelKey}-${idx}`} data-chart-idx={idx} style={{ marginBottom: 20 }}>
          {chart.kind === 'barras' && <BarChartComponent chart={chart} rows={rows} />}
          {chart.kind === 'pie' && <PieChartComponent chart={chart} rows={rows} />}
          {chart.kind === 'linea' && <LineChartComponent chart={chart} rows={rows} />}
        </div>
      ))}
    </div>
  );
}
