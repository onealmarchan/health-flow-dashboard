/**
 * Tasa de detección temprana — gauge / donut 0–100% vs objetivo.
 * Bandas de color por umbral clínico (rojo/amarillo/verde).
 */
const VALUE = 72;      // mock current
const TARGET = 85;     // mock objective

function bandColor(v: number) {
  if (v < 50) return 'hsl(var(--destructive))';
  if (v < 75) return 'hsl(var(--warning))';
  return 'hsl(var(--success))';
}

export function EarlyDetectionGauge() {
  const v = Math.max(0, Math.min(100, VALUE));
  const angle = -90 + (v / 100) * 180; // -90..+90
  const color = bandColor(v);
  // SVG semi-circle params
  const cx = 120, cy = 120, r = 90;
  const arc = (start: number, end: number, color: string) => {
    const a1 = (start * Math.PI) / 180;
    const a2 = (end * Math.PI) / 180;
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    const large = end - start > 180 ? 1 : 0;
    return <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`} fill="none" stroke={color} strokeWidth={18} strokeLinecap="round" />;
  };
  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Tasa de detección temprana</h3>
        <p className="text-sm text-muted-foreground">Porcentaje acumulado del periodo actual</p>
      </div>
      <div className="flex items-center justify-center h-[260px]">
        <svg viewBox="0 0 240 160" className="w-full max-w-[320px]">
          {/* Bands */}
          {arc(180, 270, 'hsl(var(--destructive) / 0.35)')}
          {arc(225, 315, 'hsl(var(--warning) / 0.35)')}
          {arc(270, 360, 'hsl(var(--success) / 0.35)')}
          {/* Track */}
          {arc(180, 360, 'hsl(var(--muted))')}
          {/* Value arc */}
          {arc(180, 180 + (v / 100) * 180, color)}
          {/* Needle */}
          <g transform={`translate(${cx},${cy}) rotate(${angle})`}>
            <line x1={0} y1={0} x2={0} y2={-r + 6} stroke="hsl(var(--foreground))" strokeWidth={3} strokeLinecap="round" />
            <circle r={6} fill="hsl(var(--foreground))" />
          </g>
          <text x={cx} y={cy - 10} textAnchor="middle" className="fill-foreground" style={{ fontSize: 26, fontWeight: 700 }}>{v}%</text>
          <text x={cx} y={cy + 14} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 11 }}>Objetivo: {TARGET}%</text>
        </svg>
      </div>
      <div className="flex justify-around text-xs mt-1">
        <span className="text-destructive">● Riesgo &lt; 50%</span>
        <span className="text-warning">● Alerta 50–74%</span>
        <span className="text-success">● Óptimo ≥ 75%</span>
      </div>
    </div>
  );
}
