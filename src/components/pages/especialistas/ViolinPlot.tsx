import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { Especialista } from '@/data/especialistasStore';
import { META, colorFor, kde, mulberry32, stats } from './utils';

interface Props {
  specialists: Especialista[];
}

interface TooltipState {
  x: number;
  y: number;
  d: Especialista;
}

export function ViolinPlot({ specialists }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 600, h: 460 });
  const [tip, setTip] = useState<TooltipState | null>(null);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      setSize({ w: Math.max(400, cr.width), h: Math.max(380, cr.height) });
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, Especialista[]>();
    specialists.forEach(s => {
      const arr = map.get(s.especialidad) ?? [];
      arr.push(s);
      map.set(s.especialidad, arr);
    });
    return Array.from(map.entries()).map(([especialidad, items], idx) => ({
      especialidad,
      items,
      color: colorFor(especialidad, idx),
      idx,
    }));
  }, [specialists]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    if (groups.length === 0) return;

    const { w, h } = size;
    const margin = { top: 24, right: 24, bottom: 48, left: 56 };
    const innerW = w - margin.left - margin.right;
    const innerH = h - margin.top - margin.bottom;

    const all = specialists.map(s => s.pacientes);
    const yMax = Math.max(400, d3.max(all) ?? 400);
    const yMin = Math.max(0, (d3.min(all) ?? 0) - 30);

    const x = d3.scaleBand<string>().domain(groups.map(g => g.especialidad)).range([0, innerW]).padding(0.2);
    const y = d3.scaleLinear().domain([yMin, yMax]).nice().range([innerH, 0]);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // grid
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(y.ticks(8))
      .enter().append('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', d => y(d)).attr('y2', d => y(d))
      .attr('stroke', '#ebebeb').attr('stroke-dasharray', '3,3');

    // axes
    g.append('g').call(d3.axisLeft(y).ticks(8).tickSize(0)).call(s => {
      s.select('.domain').remove();
      s.selectAll('text').attr('fill', 'hsl(var(--muted-foreground))').attr('font-size', 11);
    });
    g.append('text').attr('transform', `rotate(-90)`).attr('x', -innerH / 2).attr('y', -42)
      .attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', 'hsl(var(--muted-foreground))')
      .text('Nº Pacientes');

    g.append('g').attr('transform', `translate(0,${innerH})`).call(d3.axisBottom(x).tickSize(0)).call(s => {
      s.select('.domain').remove();
      s.selectAll('text').attr('fill', 'hsl(var(--foreground))').attr('font-size', 11);
    });

    // meta line
    g.append('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', y(META)).attr('y2', y(META))
      .attr('stroke', '#f09030').attr('stroke-width', 1.5).attr('stroke-dasharray', '7,4');
    g.append('text')
      .attr('x', innerW - 4).attr('y', y(META) - 6)
      .attr('text-anchor', 'end').attr('fill', '#f09030').attr('font-size', 10).attr('font-weight', 600)
      .text('Meta: 250');

    // each group
    groups.forEach(group => {
      const cx = (x(group.especialidad) ?? 0) + x.bandwidth() / 2;
      const values = group.items.map(s => s.pacientes);
      const halfW = Math.min(x.bandwidth() / 2 - 4, 60);

      if (values.length >= 2) {
        const bandwidth = 23;
        const points = d3.range(yMin, yMax, 4);
        const density = kde(values, bandwidth, points);
        const dMax = d3.max(density, d => d[1]) ?? 1;
        const wScale = d3.scaleLinear().domain([0, dMax]).range([0, halfW]);
        const area = d3.area<[number, number]>()
          .x0(d => cx - wScale(d[1]))
          .x1(d => cx + wScale(d[1]))
          .y(d => y(d[0]))
          .curve(d3.curveBasis);
        g.append('path')
          .datum(density)
          .attr('d', area)
          .attr('fill', group.color).attr('fill-opacity', 0.18)
          .attr('stroke', group.color).attr('stroke-opacity', 0.65).attr('stroke-width', 1.5);
      }

      // box plot
      const st = stats(values);
      const boxW = 14;
      // whisker line
      g.append('line').attr('x1', cx).attr('x2', cx).attr('y1', y(st.minWhisker)).attr('y2', y(st.maxWhisker))
        .attr('stroke', group.color).attr('stroke-opacity', 0.85).attr('stroke-width', 1.5);
      // caps
      [st.minWhisker, st.maxWhisker].forEach(v => {
        g.append('line').attr('x1', cx - 6).attr('x2', cx + 6).attr('y1', y(v)).attr('y2', y(v))
          .attr('stroke', group.color).attr('stroke-opacity', 0.85).attr('stroke-width', 1.5);
      });
      // IQR box
      g.append('rect')
        .attr('x', cx - boxW / 2).attr('y', y(st.q3))
        .attr('width', boxW).attr('height', Math.max(2, y(st.q1) - y(st.q3)))
        .attr('rx', 2)
        .attr('fill', 'hsl(var(--card))').attr('stroke', group.color).attr('stroke-width', 1.5);
      // median
      g.append('line')
        .attr('x1', cx - boxW / 2).attr('x2', cx + boxW / 2)
        .attr('y1', y(st.median)).attr('y2', y(st.median))
        .attr('stroke', '#333').attr('stroke-width', 2.5);

      // jitter points
      const prng = mulberry32(group.idx * 1013 + 7);
      group.items.forEach((s) => {
        const critical = s.pacientes >= 350;
        const jx = cx + (prng() - 0.5) * (halfW * 0.9);
        const node = g.append('circle')
          .attr('cx', jx).attr('cy', y(s.pacientes))
          .attr('r', critical ? 5.5 : 4.5)
          .attr('fill', critical ? '#e05252' : group.color)
          .attr('fill-opacity', critical ? 0.95 : 0.72)
          .attr('cursor', 'pointer');
        if (critical) node.attr('stroke', '#a01010').attr('stroke-width', 1.2);
        node.on('mousemove', (event: MouseEvent) => {
          const rect = (svgRef.current as SVGSVGElement).getBoundingClientRect();
          setTip({ x: event.clientX - rect.left, y: event.clientY - rect.top, d: s });
        });
        node.on('mouseleave', () => setTip(null));
      });
    });
  }, [groups, size, specialists]);

  return (
    <div ref={wrapRef} className="relative w-full h-full min-h-[460px]">
      <svg ref={svgRef} width={size.w} height={size.h} />
      {tip && (
        <div
          className="pointer-events-none absolute z-20 bg-popover text-popover-foreground border border-border rounded-md shadow-md px-3 py-2 text-xs"
          style={{
            left: Math.min(tip.x + 12, size.w - 200),
            top: Math.max(8, tip.y - 70),
          }}
        >
          <div className="font-semibold">Dr(a). {tip.d.nombre} {tip.d.apellido}</div>
          <div className="text-muted-foreground">{tip.d.especialidad}</div>
          <div>Pacientes: <span className="font-semibold">{tip.d.pacientes}</span></div>
          <div>Desviación: <span className="font-semibold">{tip.d.pacientes - META >= 0 ? '+' : ''}{tip.d.pacientes - META}</span></div>
          {tip.d.pacientes >= 350 && (
            <div className="mt-1 inline-block bg-[#e05252] text-white px-1.5 py-0.5 rounded text-[10px] font-semibold">⚠ Carga crítica</div>
          )}
        </div>
      )}
    </div>
  );
}
