import { useState, useMemo } from 'react';
import { Edit, Search } from 'lucide-react';
import { Link, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type AvailabilityEvent =
  | {
      kind: 'session';
      turno: 'Mañana' | 'Tarde' | 'Noche';
      horaInicio: string;
      horaFin: string;
      days: string[];
    }
  | {
      kind: 'block';
      razon: string;
      fechaInicio: string;
      fechaFin: string;
      turno: string;
    };

export interface DoctorAvailability {
  mpps: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  events: AvailabilityEvent[];
}

interface Props {
  data: DoctorAvailability[];
  onEdit: (mpps: string) => void;
  filter?: 'all' | 'sessions' | 'blocks';
  onFilterChange?: (f: 'all' | 'sessions' | 'blocks') => void;
}

type FilterMode = 'all' | 'sessions' | 'blocks';

const AVATAR_COLORS = [
  'bg-primary/20 text-primary',
  'bg-success/20 text-success',
  'bg-accent/20 text-accent',
  'bg-warning/20 text-warning',
  'bg-destructive/20 text-destructive',
];

function hashColor(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initials(nombre: string, apellido: string): string {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
}

export function AvailabilityTable({ data, onEdit, filter: propFilter, onFilterChange }: Props) {
  const [filterState, setFilterState] = useState<FilterMode>('all');
  const filter = (propFilter as FilterMode) ?? filterState;
  const setFilter = (f: FilterMode) => {
    if (onFilterChange) onFilterChange(f);
    setFilterState(f);
  };
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return data
      .map(doc => {
        const filteredEvents = doc.events.filter(ev => {
          if (filter === 'sessions') return ev.kind === 'session';
          if (filter === 'blocks') return ev.kind === 'block';
          return true;
        });
        return { ...doc, events: filteredEvents };
      })
      .filter(doc => {
        if (filter !== 'all' && doc.events.length === 0) return false;
        if (!term) return true;
        const fullName = `${doc.nombre} ${doc.apellido}`.toLowerCase();
        return fullName.includes(term) || doc.especialidad.toLowerCase().includes(term);
      });
  }, [data, filter, search]);

  const filterChip = (val: FilterMode, label: string) => (
    <button
      key={val}
      type="button"
      onClick={() => setFilter(val)}
      className={cn(
        'px-3 py-1 text-xs rounded-full border transition-colors',
        filter === val
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background text-muted-foreground border-border hover:border-primary/50',
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold text-foreground mb-3">Disponibilidad Horaria</h3>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-success" />
          <span className="text-muted-foreground">Sesión activa</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-destructive" />
          <span className="text-muted-foreground">Bloqueo programado</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          {filterChip('all', 'Todos')}
          {filterChip('sessions', 'Sesiones')}
          {filterChip('blocks', 'Bloqueos')}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar médico o especialidad..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 text-xs font-medium text-muted-foreground w-[26%]">Médico</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">Disponibilidad Horaria</th>
              <th className="text-right p-3 text-xs font-medium text-muted-foreground w-[100px]">Gestionar</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-sm text-muted-foreground">
                  Sin resultados
                </td>
              </tr>
            ) : (
              rows.map(doc => {
                const isExpanded = !!expanded[doc.mpps];
                const visibleEvents = isExpanded ? doc.events : doc.events.slice(0, 2);
                const hidden = doc.events.length - visibleEvents.length;
                return (
                  <tr key={doc.mpps} className="border-b border-border/50 align-top">
                    <td className="p-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0',
                            hashColor(doc.mpps),
                          )}
                        >
                          {initials(doc.nombre, doc.apellido)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">
                            {doc.nombre} {doc.apellido}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{doc.especialidad}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      {doc.events.length === 0 ? (
                        <div className="text-xs text-muted-foreground italic">Sin disponibilidad registrada</div>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          {visibleEvents.map((ev, i) =>
                            ev.kind === 'session' ? (
                              <div
                                key={i}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-success/15 border border-success/20 text-xs"
                              >
                                <span className="font-semibold text-success">{ev.turno}</span>
                                <span className="text-success/80">
                                  {ev.horaInicio}–{ev.horaFin}
                                </span>
                                <span className="text-success/70 truncate ml-auto">
                                  {ev.days.join(', ')}
                                </span>
                                <button
                                  type="button"
                                  title="Copiar enlace de sesión"
                                  onClick={() => {
                                    try {
                                      const id = typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2,8);
                                      const url = `${window.location.origin}/shared/${id}`;
                                      navigator.clipboard.writeText(url).then(() => {
                                        // remember this shared id for this tab
                                        try { localStorage.setItem('activeSharedId', id); } catch (e) {}
                                        // notify user
                                        alert('Enlace copiado al portapapeles');
                                      });
                                    } catch (e) {
                                      console.error('copy link error', e);
                                    }
                                  }}
                                  className="ml-2 p-1 rounded-md hover:bg-secondary/40"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div
                                key={i}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-destructive/15 border border-destructive/20 text-xs"
                              >
                                <span className="font-semibold text-destructive">{ev.razon}</span>
                                <span className="text-destructive/80">
                                  {ev.fechaInicio} – {ev.fechaFin}
                                </span>
                                <span className="text-destructive/70 truncate ml-auto">{ev.turno}</span>
                              </div>
                            ),
                          )}
                          {doc.events.length > 2 && (
                            <button
                              type="button"
                              onClick={() => setExpanded(s => ({ ...s, [doc.mpps]: !isExpanded }))}
                              className="self-start text-xs text-primary hover:underline mt-0.5"
                            >
                              {isExpanded ? 'Mostrar menos' : `+${hidden} más`}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(doc.mpps)}
                        title="Editar jornada"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
