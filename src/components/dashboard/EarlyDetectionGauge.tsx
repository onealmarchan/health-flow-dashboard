/**
 * Tasa de detección temprana — gauge 0–100%.
 * Semáforo: Verde >10% · Ámbar 5–9.9% · Rojo <5% (polaridad ascendente).
 * (Sin meta 85%; los umbrales anteriores estaban mal.)
 */
import { getSemaforo } from '@/lib/kpi-semaforos';
import { useCitas } from '@/services/useCitas';

function computeValue(totalConsultas: number): number {
  return 0; // Datos reales: 0% hasta que haya diagnósticos tempranos en backend
}

function bandColor(v: number) {
  const sem = getSemaforo('porcentajeAlto', v);
  return sem === 'verde' ? 'hsl(var(--success))'
       : sem === 'ambar' ? 'hsl(var(--warning))'
       : 'hsl(var(--destructive))';
}

export function EarlyDetectionGauge() {
  const { data: citas = [] } = useCitas();
  const totalConsultas = citas.length;
  const v = Math.max(0, Math.min(100, computeValue(totalConsultas)));
  const angle = -90 + (v / 100) * 180;
  const color = bandColor(v);
  const cx = 120, cy = 120, r = 90;
  const arc = (start: number, end: number, stroke: string) => {
    const a1 = (start * Math.PI) / 180;
    const a2 = (end * Math.PI) / 180;
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    const large = end - start > 180 ? 1 : 0;
    return <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`} fill="none" stroke={stroke} strokeWidth={18} strokeLinecap="round" />;
  };
  // 3 bands mapped along the 180° arc (0-5 → 0-9%, 5-15 → 9-27%, >15 → rest)
  // Position color bands proportional to thresholds within 0–20% domain shown.
  // Simpler: red 0..5%, amber 5..10%, green 10..100% (visualized on the semicircle).
  const pct = (p: number) => 180 + (Math.min(p, 100) / 100) * 180;
  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Tasa de detección temprana</h3>
        <p className="text-sm text-muted-foreground">Casos detectados en etapa inicial / Total del periodo</p>
      </div>
      <div className="flex items-center justify-center h-[260px]">
        <svg viewBox="0 0 240 160" className="w-full max-w-[320px]">
          {arc(180, pct(5),  'hsl(var(--destructive) / 0.35)')}
          {arc(pct(5), pct(10), 'hsl(var(--warning) / 0.35)')}
          {arc(pct(10), 360, 'hsl(var(--success) / 0.35)')}
          {arc(180, 360, 'hsl(var(--muted))')}
          {arc(180, 180 + (v / 100) * 180, color)}
          <g transform={`translate(${cx},${cy}) rotate(${angle})`}>
            <line x1={0} y1={0} x2={0} y2={-r + 6} stroke="hsl(var(--foreground))" strokeWidth={3} strokeLinecap="round" />
            <circle r={6} fill="hsl(var(--foreground))" />
          </g>
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-foreground" style={{ fontSize: 26, fontWeight: 700 }}>{v}%</text>
          <text x={cx} y={cy + 16} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 10 }}>Polaridad ascendente ↑</text>
        </svg>
      </div>
      <div className="flex justify-around text-xs mt-1">
        <span className="text-destructive">● Rojo &lt; 5%</span>
        <span className="text-warning">● Ámbar 5–9.9%</span>
        <span className="text-success">● Verde &gt; 10%</span>
      </div>
    </div>
  );
}
