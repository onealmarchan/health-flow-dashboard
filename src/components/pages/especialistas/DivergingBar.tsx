import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { Especialista } from '@/data/especialistasStore';
import { META, zoneColor, zoneLabel } from './utils';

interface Props {
  specialists: Especialista[];
}

interface Row {
  especialidad: string;
  promedio_pacientes: number;
  desviacion: number; // %
  cantidad_medicos: number;
}

interface TipState { x: number; y: number; row: Row; }

const LEGEND = [
  { c: 'hsl(var(--success))',     t: 'Verde · |desv| ≤ 10 %' },
  { c: 'hsl(var(--warning))',     t: 'Ámbar · 10 – 20 %' },
  { c: 'hsl(var(--destructive))', t: 'Rojo · > 20 %' },
];

export function DivergingBar({ specialists }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(600);
  const [tip, setTip] = useState<TipState | null>(null);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      setWidth(Math.max(420, cr.width));
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const rows = useMemo<Row[]>(() => {
    const map = new Map<string, number[]>();
    specialists.forEach(s => {
      const arr = map.get(s.especialidad) ?? [];
      arr.push(s.pacientes);
      map.set(s.especialidad, arr);
    });
    const out: Row[] = [];
    map.forEach((vals, especialidad) => {
      const prom = vals.reduce((a, b) => a + b, 0) / vals.length;
      const desv = ((prom / META) - 1) * 100;
      out.push({
        especialidad,
        promedio_pacientes: Math.round(prom * 10) / 10,
        desviacion: Math.round(desv * 10) / 10,
        cantidad_medicos: vals.length,
      });
    });
    return out.sort((a, b) => a.desviacion - b.desviacion);
  }, [specialists]);

  // Height driven by # rows to guarantee separation.
  const ROW_H = 42;
  const marginTop = 46, marginBottom = 60, marginLeft = 170, marginRight = 90;
  const innerH = Math.max(rows.length * ROW_H, 200);
  const height = innerH + marginTop + marginBottom;

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    if (rows.length === 0) return;

    const innerW = width - marginLeft - marginRight;
    const maxAbs = Math.max(25, d3.max(rows, r => Math.abs(r.desviacion)) ?? 25);
    const x = d3.scaleLinear().domain([-maxAbs * 1.15, maxAbs * 1.15]).range([0, innerW]);
    const y = d3.scaleBand<string>().domain(rows.map(r => r.especialidad)).range([0, innerH]).padding(0.55);

    const g = svg.append('g').attr('transform', `translate(${marginLeft},${marginTop})`);

    // Zone labels
    g.append('text').attr('x', 0).attr('y', -22).attr('font-size', 10).attr('font-weight', 600)
      .attr('fill', 'hsl(var(--success))').text('← Capacidad disponible');
    g.append('text').attr('x', innerW).attr('y', -22).attr('text-anchor', 'end').attr('font-size', 10).attr('font-weight', 600)
      .attr('fill', 'hsl(var(--destructive))').text('Sobrecarga →');

    // Meta label
    g.append('text').attr('x', x(0)).attr('y', -6).attr('text-anchor', 'middle')
      .attr('font-size', 10).attr('fill', 'hsl(var(--muted-foreground))').text('Meta 250 pac./médico');

    // X axis (percent)
    g.append('g').attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x).ticks(7).tickSize(0).tickFormat(d => `${d as number > 0 ? '+' : ''}${d}%`))
      .call(s => { s.select('.domain').remove(); s.selectAll('text').attr('fill', 'hsl(var(--muted-foreground))').attr('font-size', 10); });

    // Y axis (specialty labels, left)
    g.append('g').call(d3.axisLeft(y).tickSize(0).tickPadding(12))
      .call(s => { s.select('.domain').remove(); s.selectAll('text').attr('fill', 'hsl(var(--foreground))').attr('font-size', 12); });

    // Bars
    g.selectAll('rect.bar').data(rows).enter().append('rect')
      .attr('class', 'bar')
      .attr('y', d => y(d.especialidad) ?? 0)
      .attr('height', y.bandwidth())
      .attr('x', d => d.desviacion >= 0 ? x(0) : x(d.desviacion))
      .attr('width', d => Math.abs(x(d.desviacion) - x(0)))
      .attr('fill', d => zoneColor(d.desviacion))
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .on('mousemove', (event: MouseEvent, d: Row) => {
        const rect = (svgRef.current as SVGSVGElement).getBoundingClientRect();
        setTip({ x: event.clientX - rect.left, y: event.clientY - rect.top, row: d });
      })
      .on('mouseleave', () => setTip(null));

    // Value labels
    g.selectAll('text.val').data(rows).enter().append('text')
      .attr('class', 'val')
      .attr('y', d => (y(d.especialidad) ?? 0) + y.bandwidth() / 2 + 4)
      .attr('x', d => d.desviacion >= 0 ? x(d.desviacion) + 8 : x(d.desviacion) - 8)
      .attr('text-anchor', d => d.desviacion >= 0 ? 'start' : 'end')
      .attr('font-size', 12).attr('font-weight', 700)
      .attr('fill', d => zoneColor(d.desviacion))
      .text(d => `${d.desviacion >= 0 ? '+' : ''}${d.desviacion.toFixed(1)}%`);

    // Center line (meta)
    g.append('line').attr('x1', x(0)).attr('x2', x(0)).attr('y1', 0).attr('y2', innerH)
      .attr('stroke', 'hsl(var(--border))').attr('stroke-width', 1.5).attr('stroke-dasharray', '3 3');
  }, [rows, width, innerH]);

  return (
    <div className="flex flex-col h-full">
      <div ref={wrapRef} className="relative flex-1 min-h-[280px]">
        <svg ref={svgRef} width={width} height={height} />
        {tip && (
          <div
            className="pointer-events-none absolute z-20 bg-popover text-popover-foreground border border-border rounded-md shadow-md px-3 py-2 text-xs"
            style={{ left: Math.min(tip.x + 12, width - 220), top: Math.max(8, tip.y - 70) }}
          >
            <div className="font-semibold">{tip.row.especialidad}</div>
            <div>Promedio: <span className="font-semibold">{tip.row.promedio_pacientes}</span> pac.</div>
            <div>Desviación: <span className="font-semibold">{tip.row.desviacion >= 0 ? '+' : ''}{tip.row.desviacion}%</span></div>
            <div>Médicos: {tip.row.cantidad_medicos}</div>
            <div className="text-muted-foreground mt-1">{zoneLabel(tip.row.desviacion)}</div>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4 pt-3 border-t border-border">
        {LEGEND.map(l => (
          <div key={l.t} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.c }} />
            <span>{l.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
