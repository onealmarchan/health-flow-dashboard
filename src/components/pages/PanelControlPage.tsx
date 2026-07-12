import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays, Clock, UserCog, Stethoscope, Users, Loader2,
  ArrowRight, AlertCircle, CheckCircle2, Timer, Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCitas } from '@/services/useCitas';
import { useDiagnosticos } from '@/services/useDiagnosticos';
import { useMedicos } from '@/services/useMedicos';

interface QuickAction {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  page: string;
}

const quickActions: QuickAction[] = [
  { label: 'Agendar Cita', description: 'Registrar nueva cita médica', icon: CalendarDays, color: 'bg-blue-500/10 text-blue-600', page: 'citas' },
  { label: 'Diagnóstico', description: 'Registrar diagnóstico', icon: Stethoscope, color: 'bg-emerald-500/10 text-emerald-600', page: 'diagnosticos' },
  { label: 'Especialistas', description: 'Ver médicos disponibles', icon: UserCog, color: 'bg-violet-500/10 text-violet-600', page: 'especialistas' },
  { label: 'Pacientes', description: 'Gestionar pacientes', icon: Users, color: 'bg-amber-500/10 text-amber-600', page: 'citas' },
];

type PageChange = (page: string) => void;

interface PanelControlPageProps {
  onPageChange?: PageChange;
}

export function PanelControlPage({ onPageChange }: PanelControlPageProps) {
  const navigate = useNavigate();
  const { data: rawCitas = [], isLoading: loadingCitas } = useCitas();
  const { data: rawDiagnosticos = [], isLoading: loadingDiag } = useDiagnosticos();
  const { data: especialistas = [], isLoading: loadingEsp } = useMedicos();

  const citas: any[] = useMemo(() => {
    if (Array.isArray(rawCitas)) return rawCitas;
    if (Array.isArray((rawCitas as any)?.data)) return (rawCitas as any).data;
    return [];
  }, [rawCitas]);

  const diagnosticos: any[] = useMemo(() => {
    if (Array.isArray(rawDiagnosticos)) return rawDiagnosticos;
    if (Array.isArray((rawDiagnosticos as any)?.data)) return (rawDiagnosticos as any).data;
    return [];
  }, [rawDiagnosticos]);

  const espList: any[] = useMemo(() => {
    if (Array.isArray(especialistas)) return especialistas;
    if (Array.isArray((especialistas as any)?.data)) return (especialistas as any).data;
    return [];
  }, [especialistas]);

  const today = new Date().toISOString().slice(0, 10);

  const citasHoy = useMemo(() =>
    citas.filter((c: any) => c.fecha_cita === today || c.fechaCita === today),
    [citas, today]
  );

  const citasPendientes = useMemo(() =>
    citas.filter((c: any) => {
      const estado = (c.estado_cita || c.estadoCita || '').toLowerCase();
      return estado === 'programada' || estado === 'en espera' || estado === 'en_espera';
    }).slice(0, 8),
    [citas]
  );

  const diagnosticosRecientes = useMemo(() =>
    diagnosticos.slice(0, 6),
    [diagnosticos]
  );

  const navigateTo = (page: string) => {
    if (onPageChange) onPageChange(page);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-foreground">Panel de Control</h1>
        <p className="text-sm text-muted-foreground">Acciones rápidas y vista general del día</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickActions.map(action => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => navigateTo(action.page)}
              className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-all duration-200 text-left group"
            >
              <div className={cn('p-2.5 rounded-lg shrink-0', action.color)}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{action.label}</p>
                <p className="text-xs text-muted-foreground truncate">{action.description}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Citas de hoy */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Citas de Hoy</h3>
            </div>
            <span className="text-xs text-muted-foreground">{citasHoy.length} cita{citasHoy.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="divide-y divide-border/50">
            {loadingCitas ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : citasHoy.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <CalendarDays className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No hay citas programadas para hoy</p>
              </div>
            ) : (
              citasHoy.map((c: any, i: number) => (
                <div key={c.id || i} className="px-4 py-2.5 flex items-center gap-3 hover:bg-secondary/30 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{(c.hora_cita || c.horaCita || '--').slice(0, 5)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {c.paciente_nombre || c.pacienteNombre || `Paciente #${c.fk_ps_b001_num_paciente || ''}`}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {c.medico_nombre || c.medicoNombre || `Médico #${c.fk_cm_b001_num_medico_ministerio_salud || ''}`}
                    </p>
                  </div>
                  <CitaEstadoBadge estado={c.estado_cita || c.estadoCita || ''} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Citas pendientes / próximas */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-foreground">Próximas Citas</h3>
            </div>
            <span className="text-xs text-muted-foreground">{citasPendientes.length} pendiente{citasPendientes.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="divide-y divide-border/50">
            {loadingCitas ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : citasPendientes.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <CheckCircle2 className="w-8 h-8 mx-auto text-success/30 mb-2" />
                <p className="text-sm text-muted-foreground">No hay citas pendientes</p>
              </div>
            ) : (
              citasPendientes.map((c: any, i: number) => (
                <div key={c.id || i} className="px-4 py-2.5 flex items-center gap-3 hover:bg-secondary/30 transition-colors">
                  <div className="text-xs text-muted-foreground font-mono w-16 shrink-0">
                    {c.fecha_cita || c.fechaCita || '—'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {c.paciente_nombre || c.pacienteNombre || `Paciente #${c.fk_ps_b001_num_paciente || ''}`}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {c.hora_cita || c.horaCita || '--'} — {c.medico_nombre || c.medicoNombre || `Médico #${c.fk_cm_b001_num_medico_ministerio_salud || ''}`}
                    </p>
                  </div>
                  <CitaEstadoBadge estado={c.estado_cita || c.estadoCita || ''} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Diagnósticos recientes */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-semibold text-foreground">Diagnósticos Recientes</h3>
            </div>
            <button onClick={() => navigateTo('diagnosticos')} className="text-xs text-primary hover:underline">Ver todos</button>
          </div>
          <div className="divide-y divide-border/50">
            {loadingDiag ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : diagnosticosRecientes.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">Sin diagnósticos recientes</p>
              </div>
            ) : (
              diagnosticosRecientes.map((d: any, i: number) => (
                <div key={d.id || d.num_diagnostico || i} className="px-4 py-2.5 hover:bg-secondary/30 transition-colors">
                  <p className="text-sm font-medium text-foreground truncate">
                    {d.enfermedad_nombre || d.enfermedadNombre || d.descripcion || 'Sin descripción'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {d.fecha_diagnostico || d.fechaDiagnostico || '—'} — Cita #{d.fk_cm_c001_num_cita_medica || ''}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Especialistas con disponibilidad */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCog className="w-4 h-4 text-violet-500" />
              <h3 className="text-sm font-semibold text-foreground">Especialistas</h3>
            </div>
            <button onClick={() => navigateTo('especialistas')} className="text-xs text-primary hover:underline">Ver todos</button>
          </div>
          <div className="divide-y divide-border/50">
            {loadingEsp ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : espList.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">Sin especialistas registrados</p>
              </div>
            ) : (
              espList.slice(0, 6).map((e: any, i: number) => (
                <div key={e.pk_num_medico_ministerio_salud || i} className="px-4 py-2.5 flex items-center gap-3 hover:bg-secondary/30 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0">
                    <UserCog className="w-3.5 h-3.5 text-violet-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      Dr(a). {e.nombre || ''} {e.apellido || ''}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {e.especialidad_nombre || e.especialidadNombre || e.fk_cm_a001_num_especialidad || 'Sin especialidad'}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{e.carga_paciente || e.cargaPaciente || 0} pacientes</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CitaEstadoBadge({ estado }: { estado: string }) {
  const e = estado.toLowerCase();
  const colors = e === 'atendido' ? 'bg-success/20 text-success'
    : e === 'cancelado' ? 'bg-destructive/20 text-destructive'
    : e === 'programada' ? 'bg-blue-500/20 text-blue-600'
    : e === 'en espera' || e === 'en_espera' ? 'bg-amber-500/20 text-amber-600'
    : 'bg-muted text-muted-foreground';
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap', colors)}>
      {estado || '—'}
    </span>
  );
}
