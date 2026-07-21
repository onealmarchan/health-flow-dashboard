import { useEffect, useMemo, useRef, useState } from 'react';
import { select, scaleLinear, scaleBand, axisBottom, axisLeft, max } from 'd3';
import { META, divergingColor, severityLabel } from './utils';

export type Especialista = {
  id: number;
  mpps: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  pacientes: number;
  telefono: string;
  disponible: boolean;
  fechaIngreso: string;
  createdAt: number;
};

interface Props {
  specialists: Especialista[];
}

interface Row {
  especialidad: string;
  promedio_pacientes: number;
  desviacion: number;
  cantidad_medicos: number;
}

interface TipState { x: number; y: number; row: Row; }

const LEGEND = [
  { c: '#c0392b', t: '> +60 Crítico' },
  { c: '#e05252', t: '+30 a +60 Moderado' },
  { c: '#f09090', t: '0 a +30 Leve' },
  { c: '#7dcfb6', t: '−30 a 0 Leve' },
  { c: '#0f9e7b', t: '−60 a −30 Holgado' },
  { c: '#0a5c48', t: '< −60 Subutilizado' },
];

export function DivergingBar({ specialists }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 600, h: 320 });
  const [tip, setTip] = useState<TipState | null>(null);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      setSize({ w: Math.max(400, cr.width), h: Math.max(440, cr.height) });
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
      out.push({
        especialidad,
        promedio_pacientes: Math.round(prom * 10) / 10,
        desviacion: Math.round((prom - META) * 10) / 10,
        cantidad_medicos: vals.length,
      });
    });
    return out.sort((a, b) => a.desviacion - b.desviacion);
  }, [specialists]);

  useEffect(() => {
    const svg = select(svgRef.current);
    svg.selectAll('*').remove();
    if (rows.length === 0) return;

    const { w, h } = size;
    const margin = { top: 42, right: 80, bottom: 44, left: 160 };
    const innerW = w - margin.left - margin.right;
    const innerH = h - margin.top - margin.bottom;

    const maxAbs = Math.max(80, max(rows, r => Math.abs(r.desviacion)) ?? 80);
    const x = scaleLinear().domain([-maxAbs * 1.15, maxAbs * 1.15]).range([0, innerW]);
    const y = scaleBand<string>().domain(rows.map(r => r.especialidad)).range([0, innerH]).padding(0.3);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // x axis
    g.append('g').attr('transform', `translate(0,${innerH})`)
      .call(axisBottom(x).ticks(8).tickSize(0).tickFormat(d => (d as number > 0 ? `+${d}` : `${d}`)))
      .call(s => {
        s.select('.domain').remove();
        s.selectAll('text').attr('fill', 'hsl(var(--muted-foreground))').attr('font-size', 9);
      });

    // y axis (specialty labels) with smart truncation
    const maxLabelLen = Math.floor((margin.left - 20) / 6);
    g.append('g').call(axisLeft(y).tickSize(0))
      .call(s => {
        s.select('.domain').remove();
        s.selectAll('text')
          .attr('fill', 'hsl(var(--foreground))')
          .attr('font-size', 11)
          .attr('font-weight', 500)
          .each(function() {
            const text = select(this);
            const fullName = text.text();
            const truncated = fullName.length > maxLabelLen ? fullName.slice(0, maxLabelLen) + '…' : fullName;
            text.text(truncated);
            if (fullName !== truncated) text.append('title').text(fullName);
          });
      });

    // horizontal guide lines per bar
    rows.forEach(d => {
      const barY = y(d.especialidad) ?? 0;
      g.append('line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', barY + y.bandwidth() / 2)
        .attr('y2', barY + y.bandwidth() / 2)
        .attr('stroke', 'hsl(var(--border))')
        .attr('stroke-width', 0.5)
        .attr('stroke-dasharray', '2,4');
    });

    // center meta line (BEHIND bars)
    g.append('line')
      .attr('x1', x(0)).attr('x2', x(0))
      .attr('y1', 0).attr('y2', innerH)
      .attr('stroke', '#aaa').attr('stroke-width', 1.5).attr('stroke-dasharray', '6,3');

    // bars
    g.selectAll('rect.bar').data(rows).enter().append('rect')
      .attr('class', 'bar')
      .attr('y', d => y(d.especialidad) ?? 0)
      .attr('height', y.bandwidth())
      .attr('x', d => d.desviacion >= 0 ? x(0) : x(d.desviacion))
      .attr('width', d => Math.max(2, Math.abs(x(d.desviacion) - x(0))))
      .attr('fill', d => divergingColor(d.desviacion))
      .attr('rx', 3)
      .style('cursor', 'pointer')
      .on('mousemove', (event: MouseEvent, d: Row) => {
        const rect = (svgRef.current as SVGSVGElement).getBoundingClientRect();
        setTip({ x: event.clientX - rect.left, y: event.clientY - rect.top, row: d });
      })
      .on('mouseleave', () => setTip(null));

    // --- TEXT LABELS GROUP (always on top of everything) ---
    const labels = g.append('g').attr('class', 'labels');

    // zone labels
    labels.append('text')
      .attr('x', x(0) / 2)
      .attr('y', -22)
      .attr('text-anchor', 'middle')
      .attr('font-size', 9)
      .attr('font-weight', 600)
      .attr('fill', '#0f9e7b')
      .text('← Capacidad disponible');

    labels.append('text')
      .attr('x', x(0) + (innerW - x(0)) / 2)
      .attr('y', -22)
      .attr('text-anchor', 'middle')
      .attr('font-size', 9)
      .attr('font-weight', 600)
      .attr('fill', '#e05252')
      .text('Sobrecarga →');

    // meta label
    labels.append('text')
      .attr('x', x(0))
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('font-size', 9)
      .attr('fill', '#999')
      .text('Meta 250');

    // value labels — INSIDE bar when wide, OUTSIDE otherwise, with halo
    const LABEL_PAD = 8;
    const labelData = labels.selectAll('text.val').data(rows).enter();

    // halo (white/colored stroke behind text for readability)
    labelData.append('text')
      .attr('class', 'val-halo')
      .attr('y', d => (y(d.especialidad) ?? 0) + y.bandwidth() / 2 + 1)
      .attr('x', d => {
        const barW = Math.abs(x(d.desviacion) - x(0));
        const outside = barW < 60;
        if (d.desviacion >= 0) return outside ? x(d.desviacion) + LABEL_PAD : x(d.desviacion) - LABEL_PAD;
        return outside ? x(d.desviacion) - LABEL_PAD : x(d.desviacion) + LABEL_PAD;
      })
      .attr('text-anchor', d => {
        const barW = Math.abs(x(d.desviacion) - x(0));
        const outside = barW < 60;
        if (d.desviacion >= 0) return outside ? 'start' : 'end';
        return outside ? 'end' : 'start';
      })
      .attr('font-size', 10)
      .attr('font-weight', 700)
      .attr('fill', 'none')
      .attr('stroke', d => {
        const barW = Math.abs(x(d.desviacion) - x(0));
        return barW >= 60 ? divergingColor(d.desviacion) : 'hsl(var(--background))';
      })
      .attr('stroke-width', 3)
      .attr('stroke-linejoin', 'round')
      .text(d => `${d.desviacion >= 0 ? '+' : ''}${d.desviacion.toFixed(1)}`);

    // foreground value text
    labelData.append('text')
      .attr('class', 'val')
      .attr('y', d => (y(d.especialidad) ?? 0) + y.bandwidth() / 2 + 1)
      .attr('x', d => {
        const barW = Math.abs(x(d.desviacion) - x(0));
        const outside = barW < 60;
        if (d.desviacion >= 0) return outside ? x(d.desviacion) + LABEL_PAD : x(d.desviacion) - LABEL_PAD;
        return outside ? x(d.desviacion) - LABEL_PAD : x(d.desviacion) + LABEL_PAD;
      })
      .attr('text-anchor', d => {
        const barW = Math.abs(x(d.desviacion) - x(0));
        const outside = barW < 60;
        if (d.desviacion >= 0) return outside ? 'start' : 'end';
        return outside ? 'end' : 'start';
      })
      .attr('font-size', 10)
      .attr('font-weight', 700)
      .attr('fill', d => {
        const barW = Math.abs(x(d.desviacion) - x(0));
        if (barW >= 60) return '#fff';
        return divergingColor(d.desviacion);
      })
      .text(d => `${d.desviacion >= 0 ? '+' : ''}${d.desviacion.toFixed(1)}`);

    // secondary label halo
    labelData.append('text')
      .attr('class', 'avg-halo')
      .attr('y', d => (y(d.especialidad) ?? 0) + y.bandwidth() / 2 + 13)
      .attr('x', d => {
        const barW = Math.abs(x(d.desviacion) - x(0));
        const outside = barW < 60;
        if (d.desviacion >= 0) return outside ? x(d.desviacion) + LABEL_PAD : x(d.desviacion) - LABEL_PAD;
        return outside ? x(d.desviacion) - LABEL_PAD : x(d.desviacion) + LABEL_PAD;
      })
      .attr('text-anchor', d => {
        const barW = Math.abs(x(d.desviacion) - x(0));
        const outside = barW < 60;
        if (d.desviacion >= 0) return outside ? 'start' : 'end';
        return outside ? 'end' : 'start';
      })
      .attr('font-size', 8)
      .attr('fill', 'none')
      .attr('stroke', d => {
        const barW = Math.abs(x(d.desviacion) - x(0));
        return barW >= 60 ? divergingColor(d.desviacion) : 'hsl(var(--background))';
      })
      .attr('stroke-width', 2.5)
      .attr('stroke-linejoin', 'round')
      .text(d => `${d.promedio_pacientes} pac. · ${d.cantidad_medicos} méd.`);

    // secondary label foreground
    labelData.append('text')
      .attr('class', 'avg')
      .attr('y', d => (y(d.especialidad) ?? 0) + y.bandwidth() / 2 + 13)
      .attr('x', d => {
        const barW = Math.abs(x(d.desviacion) - x(0));
        const outside = barW < 60;
        if (d.desviacion >= 0) return outside ? x(d.desviacion) + LABEL_PAD : x(d.desviacion) - LABEL_PAD;
        return outside ? x(d.desviacion) - LABEL_PAD : x(d.desviacion) + LABEL_PAD;
      })
      .attr('text-anchor', d => {
        const barW = Math.abs(x(d.desviacion) - x(0));
        const outside = barW < 60;
        if (d.desviacion >= 0) return outside ? 'start' : 'end';
        return outside ? 'end' : 'start';
      })
      .attr('font-size', 8)
      .attr('fill', d => {
        const barW = Math.abs(x(d.desviacion) - x(0));
        if (barW >= 60) return 'rgba(255,255,255,0.85)';
        return 'hsl(var(--muted-foreground))';
      })
      .text(d => `${d.promedio_pacientes} pac. · ${d.cantidad_medicos} méd.`);
  }, [rows, size]);

  return (
    <div className="flex flex-col h-full">
      <div ref={wrapRef} className="relative flex-1 min-h-[440px]">
        <svg ref={svgRef} width={size.w} height={size.h} />
        {tip && (
          <div
            className="pointer-events-none absolute z-20 bg-popover text-popover-foreground border border-border rounded-md shadow-md px-3 py-2 text-xs"
            style={{ left: Math.min(tip.x + 12, size.w - 220), top: Math.max(8, tip.y - 70) }}
          >
            <div className="font-semibold">{tip.row.especialidad}</div>
            <div>Promedio: <span className="font-semibold">{tip.row.promedio_pacientes}</span> pac.</div>
            <div>Desviación: <span className="font-semibold">{tip.row.desviacion >= 0 ? '+' : ''}{tip.row.desviacion}</span></div>
            <div>Médicos: {tip.row.cantidad_medicos}</div>
            <div className="text-muted-foreground mt-1">{severityLabel(tip.row.desviacion)}</div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-x-4 gap-y-1 mt-3 px-2">
        {LEGEND.map(l => (
          <div key={l.t} className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.c }} />
            <span>{l.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
