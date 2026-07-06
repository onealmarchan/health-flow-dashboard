/**
 * Tasa de detección temprana — casos en etapa "Inicial" / total diagnósticos.
 * Semáforo: Verde >10% · Ámbar 5–9.9% · Rojo <5%.
 */
import { useMemo } from 'react';
import { getSemaforo } from '@/lib/kpi-semaforos';
import { useDemoStore } from '@/store/useDemoStore';

function bandColor(v: number) {
  const sem = getSemaforo('porcentajeAlto', v);
  return sem === 'verde' ? 'hsl(var(--success))'
       : sem === 'ambar' ? 'hsl(var(--warning))'
       : 'hsl(var(--destructive))';
}

export function EarlyDetectionGauge() {
  const diagnosticos = useDemoStore(s => s.diagnosticos);
  const v = useMemo(() => {
    if (diagnosticos.length === 0) return 0;
    const tempranos = diagnosticos.filter(d => (d.etapa || '').toLowerCase() === 'inicial').length;
    return Math.round((tempranos / diagnosticos.length) * 1000) / 10;
  }, [diagnosticos]);

  const clamped = Math.max(0, Math.min(100, v));
  const color = bandColor(clamped);

  const W = 240, H = 170;
  const cx = 120, cy = 130, r = 78;
  const arc = (start: number, end: number, stroke: string, width = 14) => {
    const a1 = (start * Math.PI) / 180;
    const a2 = (end * Math.PI) / 180;
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    const large = end - start > 180 ? 1 : 0;
    return <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" />;
  };
  const pct = (p: number) => 180 + (Math.min(p, 100) / 100) * 180;
  const angle = -90 + (clamped / 100) * 180;

  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Tasa de detección temprana</h3>
        <p className="text-sm text-muted-foreground">Casos detectados en etapa inicial / Total del periodo</p>
      </div>
      <div className="flex items-center justify-center h-[220px]">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[340px]">
          {arc(180, pct(5),  'hsl(var(--destructive) / 0.28)')}
          {arc(pct(5), pct(10), 'hsl(var(--warning) / 0.28)')}
          {arc(pct(10), 360, 'hsl(var(--success) / 0.28)')}
          {arc(180, 180 + (clamped / 100) * 180, color, 16)}
          <g transform={`translate(${cx},${cy}) rotate(${angle})`}>
            <line x1={0} y1={0} x2={0} y2={-r + 8} stroke="hsl(var(--foreground))" strokeWidth={3} strokeLinecap="round" />
            <circle r={5} fill="hsl(var(--foreground))" />
          </g>
          <text x={cx} y={cy - 14} textAnchor="middle" className="fill-foreground" style={{ fontSize: 24, fontWeight: 700 }}>{clamped.toFixed(1)}%</text>
          <text x={cx} y={cy + 4} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 9 }}>Polaridad ↑</text>
        </svg>
      </div>
      <div className="mt-6 flex flex-wrap justify-around gap-2 px-4 text-xs">
        <span className="text-destructive">● Rojo &lt; 5%</span>
        <span className="text-warning">● Ámbar 5–9.9%</span>
        <span className="text-success">● Verde &gt; 10%</span>
      </div>
    </div>
  );
}
