/**
 * KPI semáforo helper — single source of truth for color thresholds.
 * Returns tailwind text/bg tokens for the given metric value.
 */

export type SemaforoColor = 'verde' | 'ambar' | 'rojo';

export type KpiKind =
  | 'citasHoy'          // V ≥80 · Á 50–79 · R <50
  | 'totalConsultas'    // V >10 · Á 5–9.9 · R <5  (growth %)
  | 'totalPacientes'    // V >10 · Á 5–9.9 · R <5  (growth %)
  | 'cargaEspecialista' // V ≤20% desv · Á 21–40 · R >40  (absolute deviation)
  | 'urgencias'         // V 0–20 · Á 21–35 · R >35
  | 'ocupacionAgenda'   // V >80 · Á 50–79 · R <50
  | 'bloqueosAgenda'    // V 0–5 · Á 6–15 · R >15
  | 'porcentajeBajo'    // V 0–5 · Á 6–15 · R >15    (generic descendente)
  | 'porcentajeAlto'    // V >10 · Á 5–9.9 · R <5     (generic ascendente)
  | 'retencion'         // V ≥80 · Á 50–79 · R <50
  | 'deviacionCentral'; // V |v|≤10 · Á 10–20 · R >20

export function getSemaforo(kind: KpiKind, value: number): SemaforoColor {
  const v = Number.isFinite(value) ? value : 0;
  const abs = Math.abs(v);
  switch (kind) {
    case 'citasHoy':
    case 'ocupacionAgenda':
    case 'retencion':
      if (v >= 80) return 'verde';
      if (v >= 50) return 'ambar';
      return 'rojo';
    case 'totalConsultas':
    case 'totalPacientes':
    case 'porcentajeAlto':
      if (v > 10) return 'verde';
      if (v >= 5) return 'ambar';
      return 'rojo';
    case 'cargaEspecialista':
      if (abs <= 20) return 'verde';
      if (abs <= 40) return 'ambar';
      return 'rojo';
    case 'urgencias':
      if (v <= 20) return 'verde';
      if (v <= 35) return 'ambar';
      return 'rojo';
    case 'bloqueosAgenda':
    case 'porcentajeBajo':
      if (v <= 5) return 'verde';
      if (v <= 15) return 'ambar';
      return 'rojo';
    case 'deviacionCentral':
      if (abs <= 10) return 'verde';
      if (abs <= 20) return 'ambar';
      return 'rojo';
  }
}

export const semaforoClasses: Record<SemaforoColor, { text: string; bg: string; border: string; ring: string }> = {
  verde: { text: 'text-success', bg: 'bg-success/10', border: 'border-success/30', ring: 'ring-success/40' },
  ambar: { text: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', ring: 'ring-warning/40' },
  rojo:  { text: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', ring: 'ring-destructive/40' },
};
