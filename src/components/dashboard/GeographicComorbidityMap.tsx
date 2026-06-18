import { useState } from 'react';

/**
 * Índice de comorbilidad geográfica — choropleth simplificado.
 * Representación esquemática de regiones (estilo grid) para evitar dependencia
 * de topojson externo; los colores siguen una escala secuencial y muestran
 * tooltip con valor del índice y variación vs periodo anterior.
 */

interface Region {
  id: string;
  name: string;
  index: number;          // 0..100
  delta: number;          // % variation vs prev period
  // grid position
  col: number;
  row: number;
}

const REGIONS: Region[] = [
  { id: 'zul', name: 'Zulia',     index: 78, delta: +3.2,  col: 0, row: 1 },
  { id: 'fal', name: 'Falcón',    index: 42, delta: -1.5,  col: 1, row: 0 },
  { id: 'lar', name: 'Lara',      index: 58, delta: +2.1,  col: 1, row: 1 },
  { id: 'car', name: 'Carabobo',  index: 71, delta: +4.0,  col: 2, row: 1 },
  { id: 'ara', name: 'Aragua',    index: 66, delta: +1.8,  col: 3, row: 1 },
  { id: 'mir', name: 'Miranda',   index: 84, delta: +5.6,  col: 4, row: 1 },
  { id: 'dc',  name: 'Distrito Capital', index: 91, delta: +6.4, col: 4, row: 0 },
  { id: 'anz', name: 'Anzoátegui', index: 55, delta: -0.7, col: 5, row: 1 },
  { id: 'sucre', name: 'Sucre',   index: 47, delta: +0.5,  col: 6, row: 1 },
  { id: 'bol', name: 'Bolívar',   index: 38, delta: -2.3,  col: 4, row: 2 },
  { id: 'ama', name: 'Amazonas',  index: 22, delta: -1.0,  col: 3, row: 2 },
  { id: 'tac', name: 'Táchira',   index: 49, delta: +1.2,  col: 0, row: 2 },
  { id: 'mer', name: 'Mérida',    index: 53, delta: +1.6,  col: 1, row: 2 },
  { id: 'bar', name: 'Barinas',   index: 44, delta: -0.8,  col: 2, row: 2 },
];

function colorFor(v: number): string {
  // Sequential blue scale via primary token
  const op = 0.18 + (v / 100) * 0.72;
  return `hsl(var(--primary) / ${op.toFixed(2)})`;
}

export function GeographicComorbidityMap() {
  const [hover, setHover] = useState<Region | null>(null);
  const cellW = 64, cellH = 50, gap = 6;
  const maxCol = Math.max(...REGIONS.map(r => r.col)) + 1;
  const maxRow = Math.max(...REGIONS.map(r => r.row)) + 1;

  return (
    <div>
      <div className="mb-3 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Índice de comorbilidad geográfica</h3>
        <p className="text-sm text-muted-foreground">Intensidad de comorbilidad por región</p>
      </div>
      <div className="flex gap-4 items-start">
        <div className="relative">
          <svg width={maxCol * (cellW + gap)} height={maxRow * (cellH + gap)}>
            {REGIONS.map(r => (
              <g key={r.id}
                onMouseEnter={() => setHover(r)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: 'pointer' }}>
                <rect
                  x={r.col * (cellW + gap)} y={r.row * (cellH + gap)}
                  width={cellW} height={cellH}
                  rx={6}
                  fill={colorFor(r.index)}
                  stroke="hsl(var(--border))" strokeWidth={1}
                />
                <text x={r.col * (cellW + gap) + cellW / 2} y={r.row * (cellH + gap) + cellH / 2 - 2}
                  textAnchor="middle" className="fill-foreground" style={{ fontSize: 10, fontWeight: 600 }}>
                  {r.name.length > 9 ? r.name.slice(0, 9) + '…' : r.name}
                </text>
                <text x={r.col * (cellW + gap) + cellW / 2} y={r.row * (cellH + gap) + cellH / 2 + 12}
                  textAnchor="middle" className="fill-foreground" style={{ fontSize: 11, fontWeight: 700 }}>
                  {r.index}
                </text>
              </g>
            ))}
          </svg>
          {hover && (
            <div className="absolute top-full left-0 mt-2 bg-popover border border-border rounded-md p-2 shadow-lg text-xs z-10">
              <div className="font-semibold text-foreground">{hover.name}</div>
              <div className="text-muted-foreground">Índice: <span className="text-foreground">{hover.index}</span></div>
              <div className={hover.delta >= 0 ? 'text-warning' : 'text-success'}>
                {hover.delta >= 0 ? '↑' : '↓'} {Math.abs(hover.delta).toFixed(1)}% vs periodo anterior
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 text-[10px] pt-1">
          <span className="text-muted-foreground font-medium">Escala</span>
          {[20, 40, 60, 80, 95].map(v => (
            <div key={v} className="flex items-center gap-2">
              <span className="inline-block w-4 h-3 rounded-sm" style={{ background: colorFor(v) }} />
              <span className="text-muted-foreground">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
