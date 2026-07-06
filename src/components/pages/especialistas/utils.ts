export const META = 250;

export const SPECIALTY_COLORS: Record<string, string> = {
  'Cardiología': '#1a9bd8',
  'Pediatría': '#0f9e7b',
  'Dermatología': '#7c5bc4',
  'Neurología': '#d85a30',
  'Traumatología': '#d4537e',
  'Ginecología': '#ba7517',
};

const FALLBACK_PALETTE = ['#1a9bd8', '#0f9e7b', '#7c5bc4', '#d85a30', '#d4537e', '#ba7517', '#3a7bd5', '#8e5a3a'];

export function colorFor(specialty: string, index = 0): string {
  return SPECIALTY_COLORS[specialty] ?? FALLBACK_PALETTE[index % FALLBACK_PALETTE.length];
}

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function kde(values: number[], bandwidth: number, points: number[]) {
  const k = (u: number) => Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI);
  return points.map(x => {
    const sum = values.reduce((acc, v) => acc + k((x - v) / bandwidth), 0);
    return [x, sum / (values.length * bandwidth)] as [number, number];
  });
}

export function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  return sorted[base];
}

export function stats(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = quantile(sorted, 0.25);
  const median = quantile(sorted, 0.5);
  const q3 = quantile(sorted, 0.75);
  const iqr = q3 - q1;
  const minWhisker = Math.max(sorted[0], q1 - 1.5 * iqr);
  const maxWhisker = Math.min(sorted[sorted.length - 1], q3 + 1.5 * iqr);
  return { q1, median, q3, minWhisker, maxWhisker, min: sorted[0], max: sorted[sorted.length - 1] };
}

/**
 * 3-zone semáforo para Diverging Bar (Ratio vs Meta):
 * Verde |desv| ≤ 10 % · Ámbar 10-20 % · Rojo > 20 %.
 */
export function zoneColor(desvPct: number): string {
  const a = Math.abs(desvPct);
  if (a <= 10) return 'hsl(var(--success))';
  if (a <= 20) return 'hsl(var(--warning))';
  return 'hsl(var(--destructive))';
}

export function zoneLabel(desvPct: number): string {
  const a = Math.abs(desvPct);
  if (a <= 10) return 'En rango (±10 %)';
  if (a <= 20) return desvPct > 0 ? 'Sobrecarga leve (+10–20 %)' : 'Capacidad disponible (−10–20 %)';
  return desvPct > 0 ? 'Sobrecarga crítica (>+20 %)' : 'Subutilizado (<−20 %)';
}
