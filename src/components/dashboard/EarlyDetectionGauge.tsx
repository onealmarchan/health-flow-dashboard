/**
 * Tasa de detección temprana — gauge 0–100%.
 * Semáforo: Verde >10% · Ámbar 5–9.9% · Rojo <5% (polaridad ascendente).
 */
import { useMemo } from 'react';
import { getSemaforo } from '@/lib/kpi-semaforos';
import { useTasaDeteccionTemprana } from '@/services/useIndicadores';
import { useDiagnosticos } from '@/services/useDiagnosticos';
import { useCitas } from '@/services/useCitas';

function bandColor(v: number) {
  const sem = getSemaforo('porcentajeAlto', v);
  return sem === 'verde' ? 'hsl(var(--success))'
       : sem === 'ambar' ? 'hsl(var(--warning))'
       : 'hsl(var(--destructive))';
}

export function EarlyDetectionGauge() {
  const { data, isLoading } = useTasaDeteccionTemprana();
  const { data: diagnosticos = [] } = useDiagnosticos();
  const { data: citas = [] } = useCitas();

  const v = useMemo(() => {
    if (data) {
      const raw = data?.porcentaje || data?.valorIndicador || data?.tasa || data?.value || 0;
      const val = typeof raw === 'object' ? 0 : Number(raw) || 0;
      if (val > 0) return Math.max(0, Math.min(100, val));
    }
    if (diagnosticos.length === 0 || citas.length === 0) return 0;
    const earlyTerms = ['temprano', 'inicial', 'leve', 'estadio i', 'estadio 1', 'fase inicial', 'etapa temprana'];
    const earlyDiags = diagnosticos.filter((d: any) => {
      const desc = (d.descripcion || d.observacion || d.fase || d.etapa || d.estado || '').toLowerCase();
      return earlyTerms.some(t => desc.includes(t));
    });
    const earlyCount = earlyDiags.length;
    const total = diagnosticos.length;
    if (total === 0) return 0;
    return Math.round((earlyCount / total) * 1000) / 10;
  }, [data, diagnosticos, citas]);

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
  const pct = (p: number) => 180 + (Math.min(p, 100) / 100) * 180;

  if (isLoading) {
    return (
      <div>
        <div className="mb-4 pr-8">
          <h3 className="text-lg font-semibold text-foreground">Tasa de detección temprana</h3>
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
        <div className="flex items-center justify-center h-[260px]">
          <span className="text-muted-foreground animate-pulse">Cargando indicador...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Tasa de detección temprana</h3>
        <p className="text-sm text-muted-foreground">Casos detectados en etapa inicial / Total del período</p>
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
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-foreground" style={{ fontSize: 26, fontWeight: 700 }}>{v.toFixed(1)}%</text>
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
