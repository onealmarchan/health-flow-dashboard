import { useState } from 'react';
import { UserCog } from 'lucide-react';
import type { Especialista } from '@/data/especialistasStore';
import { colorFor } from './utils';

interface Props {
  specialists: Especialista[];
}

export function SpecialistList({ specialists }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const max = Math.max(1, ...specialists.map(s => s.pacientes));

  return (
    <div className="flex flex-col h-full min-h-[480px] bg-card">
      <div className="sticky top-0 z-10 bg-secondary/60 backdrop-blur px-3 py-2 flex items-center gap-3 border-b border-border text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span className="w-7 text-right">Nº</span>
        <span className="flex-1">Médico · MPPS</span>
        <span className="w-20 text-right">Pacientes</span>
      </div>
      <div className="overflow-y-auto flex-1">
        {specialists.map((s, i) => {
          const critical = s.pacientes >= 350;
          const color = colorFor(s.especialidad, i);
          const pct = Math.min(100, (s.pacientes / max) * 100);
          const isSel = selected === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSelected(s.id)}
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 border-b border-border/60 transition-colors cursor-pointer ${
                isSel ? 'bg-primary/10 border-l-[3px] border-l-primary' : 'hover:bg-secondary/50 border-l-[3px] border-l-transparent'
              }`}
            >
              <span className="w-7 text-right text-xs text-muted-foreground tabular-nums">{i + 1}</span>
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: color }}
              >
                <UserCog className="w-4 h-4 text-white" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-foreground truncate">
                  Dr(a). {s.nombre} {s.apellido}
                </span>
                <span className="block text-xs truncate">
                  <span style={{ color }}>{s.especialidad}</span>
                  <span className="text-muted-foreground"> · {s.mpps}</span>
                </span>
              </span>
              <span className="w-20 flex flex-col items-end gap-1">
                <span className="text-xs font-semibold tabular-nums" style={{ color: critical ? '#e05252' : 'hsl(var(--foreground))' }}>
                  {s.pacientes}
                </span>
                <span className="w-[60px] h-1 rounded-full bg-muted overflow-hidden">
                  <span
                    className="block h-full"
                    style={{ width: `${pct}%`, backgroundColor: critical ? '#e05252' : color }}
                  />
                </span>
              </span>
            </button>
          );
        })}
        {specialists.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">No hay especialistas registrados</div>
        )}
      </div>
    </div>
  );
}
