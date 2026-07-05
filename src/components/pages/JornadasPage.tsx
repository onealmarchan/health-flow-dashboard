import { useState, useMemo } from 'react';
import { Calendar, Plus, ChevronLeft, ChevronRight, Save, Ban, Trash2, Edit, Link2, TrendingUp, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { getSemaforo } from '@/lib/kpi-semaforos';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AvailabilityTable, DoctorAvailability, AvailabilityEvent } from './jornadas/AvailabilityTable';


const doctors = [
  { mpps: 'MPPS-001', nombre: 'Juan', apellido: 'López', especialidad: 'Cardiología' },
  { mpps: 'MPPS-002', nombre: 'Ana', apellido: 'Martínez', especialidad: 'Pediatría' },
  { mpps: 'MPPS-003', nombre: 'Carlos', apellido: 'Sánchez', especialidad: 'Dermatología' },
  { mpps: 'MPPS-004', nombre: 'María', apellido: 'Díaz', especialidad: 'Neurología' },
];

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAYS_HEAD = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DAYS_FULL = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const RAZONES = ['Vacaciones', 'Permiso', 'Reposo', 'Cirugía', 'Capacitación', 'Congreso', 'Mantenimiento', 'Rotación', 'Otro'];
const TURNOS = ['Mañana', 'Tarde', 'Noche'] as const;
type TurnoTipo = typeof TURNOS[number];
type TurnoOrAll = TurnoTipo | 'Todos los Turnos';

interface Bloqueo {
  id: string;
  fechaInicio: string;
  fechaFin: string;
  razon: string;
  observaciones: string;
  turno: TurnoOrAll;
}

interface ScheduleRow {
  id: string;
  iso: string;
  turnoTipo: TurnoTipo | '';
  horaInicio: string;
  horaFin: string;
  saved: boolean;
}

interface DoctorStore {
  rows: ScheduleRow[];
  bloqueos: Bloqueo[];
}

const pad = (n: number) => n.toString().padStart(2, '0');
const toISO = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

function buildMonthGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function isDateBlocked(dateStr: string, bloqueos: Bloqueo[]): Bloqueo | null {
  for (const b of bloqueos) {
    if (dateStr >= b.fechaInicio && dateStr <= b.fechaFin) return b;
  }
  return null;
}

function getWeekRange(year: number, month: number, offset: number) {
  const first = new Date(year, month, 1);
  const dow = first.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const firstMonday = new Date(year, month, 1 + mondayOffset + offset * 7);
  const days: { date: Date; iso: string; label: string; dayName: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(firstMonday);
    d.setDate(firstMonday.getDate() + i);
    days.push({
      date: d,
      iso: toISO(d.getFullYear(), d.getMonth(), d.getDate()),
      label: `${DAYS_FULL[i]} ${d.getDate()}`,
      dayName: DAYS_FULL[i],
    });
  }
  return { start: days[0].date, end: days[6].date, days };
}

function formatRange(start: Date, end: Date): string {
  const sd = start.getDate();
  const ed = end.getDate();
  const sm = MONTHS[start.getMonth()];
  const em = MONTHS[end.getMonth()];
  const sy = start.getFullYear();
  const ey = end.getFullYear();
  if (sm === em && sy === ey) return `${sd} – ${ed} ${sm} ${sy}`;
  return `${sd} ${sm} – ${ed} ${em} ${ey}`;
}

function timeToMin(t: string): number {
  if (!t) return -1;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minToTime(m: number): string {
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
}

const today = new Date();
const currentYear = today.getFullYear();
const YEARS = Array.from({ length: 3 }, (_, i) => currentYear + i);

export function JornadasPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedMpps, setSelectedMpps] = useState('');
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [weekOffset, setWeekOffset] = useState(0);
  const [rows, setRows] = useState<ScheduleRow[]>([]);
  const [bloqueos, setBloqueos] = useState<Bloqueo[]>([]);

  // Persisted store per doctor (used by AvailabilityTable)
  const [store, setStore] = useState<Record<string, DoctorStore>>({});

  // Filter for blocks table (Q4)
  const [blockTurnoFilter, setBlockTurnoFilter] = useState<'Todos' | TurnoOrAll>('Todos');

  // Block modal state
  const [blockModal, setBlockModal] = useState<{
    open: boolean;
    editingId: string | null;
    fechaInicio: string;
    fechaFin: string;
    razon: string;
    observaciones: string;
    turno: TurnoOrAll;
    turnoLocked: boolean;
    lockStart: boolean;
    sourceRowId?: string | null;
  }>({
    open: false,
    editingId: null,
    fechaInicio: '',
    fechaFin: '',
    razon: '',
    observaciones: '',
    turno: 'Mañana',
    turnoLocked: false,
    lockStart: true,
    sourceRowId: null,
  });

  const [confirmSaveAll, setConfirmSaveAll] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmSaveBlock, setConfirmSaveBlock] = useState(false);
  const [confirmCancelBlock, setConfirmCancelBlock] = useState(false);
  const [confirmDeleteBlock, setConfirmDeleteBlock] = useState<string | null>(null);
  const [confirmSaveRow, setConfirmSaveRow] = useState<string | null>(null);

  const doctor = doctors.find(d => d.mpps === selectedMpps);
  const monthGrid = useMemo(() => buildMonthGrid(calYear, calMonth), [calYear, calMonth]);
  const weekRange = useMemo(() => getWeekRange(calYear, calMonth, weekOffset), [calYear, calMonth, weekOffset]);

  const rowsByDay = useMemo(() => {
    const map: Record<string, ScheduleRow[]> = {};
    for (const r of rows) {
      if (!map[r.iso]) map[r.iso] = [];
      map[r.iso].push(r);
    }
    return map;
  }, [rows]);

  // ---- Block modal helpers ----
  const openBlockFromCalendar = (iso: string, existing: Bloqueo) => {
    setBlockModal({
      open: true,
      editingId: existing.id,
      fechaInicio: existing.fechaInicio,
      fechaFin: existing.fechaFin,
      razon: existing.razon,
      observaciones: existing.observaciones,
      turno: existing.turno,
      turnoLocked: existing.turno === 'Todos los Turnos',
      lockStart: false,
    });
  };

  const openBlockForRow = (row: ScheduleRow) => {
    setBlockModal({
      open: true,
      editingId: null,
      fechaInicio: row.iso,
      fechaFin: row.iso,
      razon: '',
      observaciones: '',
      turno: row.turnoTipo || 'Mañana',
      turnoLocked: false,
      lockStart: true,
      sourceRowId: row.id,
    });
  };

  const openBlockAllDay = (iso: string) => {
    setBlockModal({
      open: true,
      editingId: null,
      fechaInicio: iso,
      fechaFin: iso,
      razon: '',
      observaciones: '',
      turno: 'Todos los Turnos',
      turnoLocked: true,
      lockStart: true,
    });
  };

  const handleCalendarClick = (day: number | null) => {
    if (!day) return;
    const iso = toISO(calYear, calMonth, day);
    const blocked = isDateBlocked(iso, bloqueos);
    if (blocked) openBlockFromCalendar(iso, blocked);
  };

  // ---- Row operations ----
  const addRow = (iso: string) => {
    const dayRows = rowsByDay[iso] || [];
    if (dayRows.length >= 3) return;
    const used = new Set(dayRows.map(r => r.turnoTipo));
    const nextTurno = TURNOS.find(t => !used.has(t)) || '';
    const newRow: ScheduleRow = {
      id: `${iso}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      iso,
      turnoTipo: nextTurno,
      horaInicio: '',
      horaFin: '',
      saved: false,
    };
    setRows(prev => [...prev, newRow]);
  };

  const updateRow = (id: string, patch: Partial<ScheduleRow>) => {
    setRows(prev => prev.map(r => (r.id === id ? { ...r, ...patch, saved: false } : r)));
  };

  const validateRow = (row: ScheduleRow): string | null => {
    if (!row.turnoTipo) return 'Selecciona el turno';
    if (!row.horaInicio || !row.horaFin) return 'Completa hora de inicio y fin';
    const hi = timeToMin(row.horaInicio);
    const hf = timeToMin(row.horaFin);
    if (hi >= hf) return 'La hora de inicio debe ser menor a la hora de fin';
    const others = rows.filter(r => r.iso === row.iso && r.id !== row.id && r.saved);
    // Duplicate combination
    for (const o of others) {
      if (
        o.turnoTipo === row.turnoTipo &&
        o.horaInicio === row.horaInicio &&
        o.horaFin === row.horaFin
      ) {
        return 'Esta combinación de turno y horario ya fue guardada';
      }
    }
    // Overlap check (any minute in [hi, hf) overlaps any other saved range)
    for (const o of others) {
      const oi = timeToMin(o.horaInicio);
      const of_ = timeToMin(o.horaFin);
      const overlapStart = Math.max(hi, oi);
      const overlapEnd = Math.min(hf, of_);
      if (overlapStart < overlapEnd) {
        return `¡Error! A las ${minToTime(overlapStart)} el médico ya está ocupado.`;
      }
    }
    return null;
  };

  const saveRow = (id: string) => {
    const row = rows.find(r => r.id === id);
    if (!row) return;
    const err = validateRow(row);
    if (err) {
      toast.error(err);
      return;
    }
    setRows(prev => prev.map(r => (r.id === id ? { ...r, saved: true } : r)));
    toast.success('Sesión guardada');
  };

  const removeRow = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  // ---- Block save ----
  const isBlockValid =
    blockModal.fechaInicio &&
    blockModal.fechaFin &&
    blockModal.razon &&
    blockModal.fechaFin >= blockModal.fechaInicio &&
    !!blockModal.turno;

  const doSaveBlock = () => {
    if (!isBlockValid) return;
    if (blockModal.editingId) {
      setBloqueos(prev =>
        prev.map(b =>
          b.id === blockModal.editingId
            ? {
                ...b,
                fechaInicio: blockModal.fechaInicio,
                fechaFin: blockModal.fechaFin,
                razon: blockModal.razon,
                observaciones: blockModal.observaciones,
                turno: blockModal.turno,
              }
            : b,
        ),
      );
      toast.success('Bloqueo actualizado');
    } else {
      const nuevo: Bloqueo = {
        id: `BLQ-${Date.now()}`,
        fechaInicio: blockModal.fechaInicio,
        fechaFin: blockModal.fechaFin,
        razon: blockModal.razon,
        observaciones: blockModal.observaciones,
        turno: blockModal.turno,
      };
      setBloqueos(prev => [...prev, nuevo]);
      toast.success('Bloqueo registrado');
    }
    setBlockModal(s => ({ ...s, open: false }));
  };

  const doDeleteBlock = (id: string) => {
    setBloqueos(prev => prev.filter(b => b.id !== id));
    toast.success('Bloqueo eliminado');
    setConfirmDeleteBlock(null);
  };

  const filteredBloqueos = useMemo(() => {
    if (blockTurnoFilter === 'Todos') return bloqueos;
    return bloqueos.filter(b => b.turno === blockTurnoFilter);
  }, [bloqueos, blockTurnoFilter]);

  // ---- Save All / load store ----
  const resetWorkingState = () => {
    setSelectedMpps('');
    setWeekOffset(0);
    setRows([]);
    setBloqueos([]);
    setCalMonth(today.getMonth());
    setCalYear(today.getFullYear());
  };

  const handleSaveAll = () => {
    if (!selectedMpps) {
      toast.error('Selecciona un médico antes de guardar');
      setConfirmSaveAll(false);
      return;
    }
    setStore(prev => ({
      ...prev,
      [selectedMpps]: {
        rows: rows.filter(r => r.saved),
        bloqueos: [...bloqueos],
      },
    }));
    toast.success('Jornadas y bloqueos guardados');
    setShowModal(false);
    resetWorkingState();
    setConfirmSaveAll(false);
  };

  const handleCancelAll = () => {
    setShowModal(false);
    resetWorkingState();
    setConfirmCancel(false);
  };

  const openModalForEdit = (mpps: string) => {
    const data = store[mpps];
    setSelectedMpps(mpps);
    setRows(data?.rows ?? []);
    setBloqueos(data?.bloqueos ?? []);
    setCalMonth(today.getMonth());
    setCalYear(today.getFullYear());
    setWeekOffset(0);
    setShowModal(true);
  };

  // ---- Build availability data for unified table ----
  const availabilityData: DoctorAvailability[] = useMemo(() => {
    return doctors.map(d => {
      const data = store[d.mpps];
      const events: AvailabilityEvent[] = [];
      if (data) {
        // Group sessions by turno + horario
        const sessionMap = new Map<string, AvailabilityEvent & { kind: 'session' }>();
        for (const r of data.rows) {
          if (!r.turnoTipo || !r.horaInicio || !r.horaFin) continue;
          const key = `${r.turnoTipo}-${r.horaInicio}-${r.horaFin}`;
          const dayName = DAYS_FULL[(new Date(r.iso).getDay() + 6) % 7];
          const existing = sessionMap.get(key);
          if (existing) {
            if (!existing.days.includes(dayName)) existing.days.push(dayName);
          } else {
            sessionMap.set(key, {
              kind: 'session',
              turno: r.turnoTipo,
              horaInicio: r.horaInicio,
              horaFin: r.horaFin,
              days: [dayName],
            });
          }
        }
        events.push(...sessionMap.values());
        for (const b of data.bloqueos) {
          events.push({
            kind: 'block',
            razon: b.razon,
            fechaInicio: b.fechaInicio,
            fechaFin: b.fechaFin,
            turno: b.turno,
          });
        }
      }
      return {
        mpps: d.mpps,
        nombre: d.nombre,
        apellido: d.apellido,
        especialidad: d.especialidad,
        events,
      };
    });
  }, [store]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Planificación de Jornadas Médicas</h1>
          <p className="text-muted-foreground">Configuración de jornadas de atención</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Agregar Jornada
        </Button>
      </div>

      {(() => {
        // Bloques totales estimados = 7 días × 3 turnos × doctores
        const totalDoctors = doctors.length;
        const totalBlocks = 7 * 3 * totalDoctors;
        const bloqueados = Object.values(store).reduce((n, d) => n + d.bloqueos.length, 0);
        const ocupados = Object.values(store).reduce((n, d) => n + d.rows.filter(r => r.saved).length, 0);
        const ocupacionPct = totalBlocks > 0 ? (ocupados / totalBlocks) * 100 : 0;
        const bloqueosPct = totalBlocks > 0 ? (bloqueados / totalBlocks) * 100 : 0;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetricCard
              title="% Ocupación de Agenda"
              value={`${ocupacionPct.toFixed(0)}%`}
              subtitle="Bloques ocupados / totales"
              icon={Calendar}
              semaforo={getSemaforo('ocupacionAgenda', ocupacionPct)}
              trend={{ value: 0, isPositive: true }}
            />
            <MetricCard
              title="% Bloqueos de Agenda"
              value={`${bloqueosPct.toFixed(0)}%`}
              subtitle="Bloqueos manuales / totales"
              icon={ShieldOff}
              semaforo={getSemaforo('bloqueosAgenda', bloqueosPct)}
              trend={{ value: 0, isPositive: false }}
            />
          </div>
        );
      })()}


      {/* Unified Availability Table (replaces old "Jornadas Registradas") */}
      <AvailabilityTable data={availabilityData} onEdit={openModalForEdit} />

      {/* Add Jornada Modal — 4 cuadrantes */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-card border border-border max-w-[95vw] w-[95vw] h-[92vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
            <DialogTitle className="text-foreground">Agregar Jornada</DialogTitle>
            <DialogDescription className="text-muted-foreground sr-only">Configure jornadas y bloqueos del médico</DialogDescription>
            <div className="flex flex-wrap items-end gap-6 pt-3">
              <div className="space-y-1.5 min-w-[260px]">
                <Label className="text-foreground text-xs">Médico</Label>
                <Select value={selectedMpps} onValueChange={setSelectedMpps}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar médico..." /></SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
                    {doctors.map(d => (
                      <SelectItem key={d.mpps} value={d.mpps}>
                        {d.mpps} — {d.nombre} {d.apellido} ({d.especialidad})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 min-w-[160px]">
                <Label className="text-foreground text-xs">Mes</Label>
                <Select value={String(calMonth)} onValueChange={v => { setCalMonth(Number(v)); setWeekOffset(0); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50 max-h-72">
                    {MONTHS.map((m, i) => <SelectItem key={m} value={String(i)}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 min-w-[120px]">
                <Label className="text-foreground text-xs">Año</Label>
                <Select value={String(calYear)} onValueChange={v => { setCalYear(Number(v)); setWeekOffset(0); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
                    {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogHeader>

          <TooltipProvider delayDuration={150}>
            <div className="flex-1 overflow-auto px-6 py-4">
              <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full min-h-[600px]">
                {/* Q1: Calendar */}
                <div className="bg-card border border-border rounded-lg p-4 overflow-auto">
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    Calendario · {MONTHS[calMonth]} {calYear}
                  </h4>
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {DAYS_HEAD.map(d => (
                      <div key={d} className="text-xs font-medium text-muted-foreground py-1">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1 place-items-center">
                    {monthGrid.map((day, idx) => {
                      if (day === null) return <div key={idx} className="w-10 h-10" />;
                      const iso = toISO(calYear, calMonth, day);
                      const blocked = isDateBlocked(iso, bloqueos);
                      const btn = (
                        <button
                          onClick={() => handleCalendarClick(day)}
                          className={cn(
                            'w-10 h-10 rounded-full border border-border text-sm font-medium transition-colors flex items-center justify-center',
                            blocked
                              ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer'
                              : 'bg-background text-foreground hover:bg-secondary cursor-default',
                          )}
                        >
                          {day}
                        </button>
                      );
                      return blocked ? (
                        <Tooltip key={idx}>
                          <TooltipTrigger asChild>{btn}</TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs">
                              <div className="font-semibold">{blocked.razon}</div>
                              <div className="text-muted-foreground">{blocked.turno}</div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <div key={idx}>{btn}</div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-background border border-border" />
                      <span className="text-muted-foreground">Disponible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-destructive border border-border" />
                      <span className="text-muted-foreground">Bloqueado</span>
                    </div>
                  </div>
                </div>

                {/* Q2: Sesiones Médicas */}
                <div className="bg-card border border-border rounded-lg p-4 overflow-auto">
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <h4 className="text-sm font-semibold text-foreground">Sesiones Médicas</h4>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-semibold text-muted-foreground">Rango Semanal</span>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWeekOffset(o => o - 1)}>
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-xs text-foreground min-w-[160px] text-center">
                          {formatRange(weekRange.start, weekRange.end)}
                        </span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWeekOffset(o => o + 1)}>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-2 text-xs font-medium text-muted-foreground w-8"></th>
                          {['Día', 'Turno', 'Hora Inicio', 'Hora Fin', 'Acciones'].map(h => (
                            <th key={h} className="text-left p-2 text-xs font-medium text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {weekRange.days.flatMap(d => {
                          const dayRows = rowsByDay[d.iso] || [];
                          // Always render at least one row per day so user can configure
                          const renderRows = dayRows.length > 0 ? dayRows : [{
                            id: `placeholder-${d.iso}`,
                            iso: d.iso,
                            turnoTipo: '' as TurnoTipo | '',
                            horaInicio: '',
                            horaFin: '',
                            saved: false,
                            isPlaceholder: true as const,
                          }];
                          return renderRows.map((row, idx) => {
                            const isPlaceholder = (row as { isPlaceholder?: boolean }).isPlaceholder;
                            const blocked = isDateBlocked(d.iso, bloqueos);
                            const used = new Set(dayRows.map(r => r.turnoTipo).filter(Boolean));
                            const availableTurnos = TURNOS.filter(t => !used.has(t) || t === row.turnoTipo);
                            const canAdd = dayRows.length < 3 && TURNOS.some(t => !used.has(t));

                            const handleAdd = () => {
                              if (isPlaceholder) {
                                addRow(d.iso);
                              } else {
                                addRow(d.iso);
                              }
                            };

                            return (
                              <tr key={row.id} className={cn('border-b border-border/50', blocked && 'opacity-60', row.saved && 'bg-success/5')}>
                                <td className="p-2">
                                  {idx === 0 && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={handleAdd}
                                      disabled={!canAdd && !isPlaceholder}
                                      title="Agregar turno"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </Button>
                                  )}
                                </td>
                                <td className="p-2 text-foreground font-medium whitespace-nowrap">{d.label}</td>
                                <td className="p-2">
                                  <Select
                                    value={row.turnoTipo || ''}
                                    onValueChange={v => !isPlaceholder && updateRow(row.id, { turnoTipo: v as TurnoTipo })}
                                    disabled={isPlaceholder}
                                  >
                                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                                    <SelectContent className="bg-popover border border-border z-50">
                                      {availableTurnos.map(t => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </td>
                                <td className="p-2">
                                  <Input
                                    type="time"
                                    className="h-8 text-xs"
                                    value={row.horaInicio}
                                    onChange={e => !isPlaceholder && updateRow(row.id, { horaInicio: e.target.value })}
                                    disabled={isPlaceholder || !row.turnoTipo}
                                  />
                                </td>
                                <td className="p-2">
                                  <Input
                                    type="time"
                                    className="h-8 text-xs"
                                    value={row.horaFin}
                                    onChange={e => !isPlaceholder && updateRow(row.id, { horaFin: e.target.value })}
                                    disabled={isPlaceholder || !row.horaInicio}
                                  />
                                </td>
                                <td className="p-2">
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      disabled={isPlaceholder}
                                      onClick={() => !isPlaceholder && setConfirmSaveRow(row.id)}
                                      title="Guardar"
                                    >
                                      <Save className="w-3.5 h-3.5 text-primary" />
                                    </Button>
                                    <div className="relative">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        disabled={isPlaceholder}
                                        onClick={() => !isPlaceholder && openBlockForRow(row as ScheduleRow)}
                                        title="Bloquear turno"
                                      >
                                        <Ban className="w-3.5 h-3.5 text-destructive" />
                                      </Button>
                                      <button
                                        type="button"
                                        disabled={isPlaceholder}
                                        onClick={() => !isPlaceholder && openBlockAllDay(d.iso)}
                                        title="Bloquear día completo"
                                        className={cn(
                                          'absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive/90 text-destructive-foreground flex items-center justify-center shadow-sm',
                                          'transition-transform duration-200 hover:scale-125 hover:rotate-12 active:animate-bounce',
                                          isPlaceholder && 'opacity-50 cursor-not-allowed',
                                        )}
                                      >
                                        <Link2 className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                    {!isPlaceholder && dayRows.length > 1 && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => removeRow(row.id)}
                                        title="Eliminar fila"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          });
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Q3: Stats */}
                <div className="bg-card border border-border rounded-lg p-4 overflow-auto">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Resumen estadístico</h4>
                  <ul className="space-y-2">
                    {[
                      { label: 'Sesiones guardadas', value: rows.filter(r => r.saved).length || '—' },
                      { label: 'Sesiones pendientes', value: rows.filter(r => !r.saved).length || '—' },
                      { label: 'Bloqueos registrados', value: bloqueos.length || '—' },
                      { label: 'Médico seleccionado', value: doctor ? `${doctor.nombre} ${doctor.apellido}` : '—' },
                    ].map(s => (
                      <li key={s.label} className="flex justify-between items-center py-2 border-b border-border/50 text-sm">
                        <span className="text-muted-foreground">{s.label}</span>
                        <span className="text-foreground font-medium">{s.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Q4: Blocked list */}
                <div className="bg-card border border-border rounded-lg p-4 overflow-auto">
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <h4 className="text-sm font-semibold text-foreground">Bloqueos programados</h4>
                    <Select value={blockTurnoFilter} onValueChange={v => setBlockTurnoFilter(v as 'Todos' | TurnoOrAll)}>
                      <SelectTrigger className="h-8 w-[180px] text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-popover border border-border z-50">
                        <SelectItem value="Todos">Todos</SelectItem>
                        <SelectItem value="Todos los Turnos">Todos los Turnos</SelectItem>
                        <SelectItem value="Mañana">Mañana</SelectItem>
                        <SelectItem value="Tarde">Tarde</SelectItem>
                        <SelectItem value="Noche">Noche</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {filteredBloqueos.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Sin bloqueos registrados</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            {['N°', 'Fecha Inicio', 'Fecha Fin', 'Turno', 'Razón', 'Observaciones', 'Acciones'].map(h => (
                              <th key={h} className="text-left p-2 text-xs font-medium text-muted-foreground">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBloqueos.map((b, i) => (
                            <tr key={b.id} className="border-b border-border/50">
                              <td className="p-2 text-muted-foreground">{i + 1}</td>
                              <td className="p-2 text-foreground whitespace-nowrap">{b.fechaInicio}</td>
                              <td className="p-2 text-foreground whitespace-nowrap">{b.fechaFin}</td>
                              <td className="p-2 text-foreground whitespace-nowrap">{b.turno}</td>
                              <td className="p-2 text-foreground">{b.razon}</td>
                              <td className="p-2 text-muted-foreground truncate max-w-[180px]">{b.observaciones || '—'}</td>
                              <td className="p-2">
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openBlockFromCalendar(b.fechaInicio, b)} title="Editar">
                                    <Edit className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setConfirmDeleteBlock(b.id)} title="Eliminar">
                                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TooltipProvider>

          <div className="px-6 py-4 border-t border-border flex justify-end gap-2 shrink-0">
            <Button variant="outline" onClick={() => setConfirmCancel(true)}>Cancelar</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setConfirmSaveAll(true)}>Guardar todo</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bloquear Turno modal */}
      <Dialog open={blockModal.open} onOpenChange={open => setBlockModal(s => ({ ...s, open }))}>
        <DialogContent className="bg-card border border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">{blockModal.editingId ? 'Editar Bloqueo' : 'Bloquear Turno'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">Configure el periodo y motivo del bloqueo</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-foreground">Fecha Inicio</Label>
                <Input
                  type="date"
                  value={blockModal.fechaInicio}
                  disabled={blockModal.lockStart}
                  onChange={e => setBlockModal(s => ({ ...s, fechaInicio: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Fecha Fin</Label>
                <Input
                  type="date"
                  value={blockModal.fechaFin}
                  min={blockModal.fechaInicio}
                  onChange={e => setBlockModal(s => ({ ...s, fechaFin: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Turno</Label>
              <Select
                value={blockModal.turno}
                onValueChange={v => setBlockModal(s => ({ ...s, turno: v as TurnoOrAll }))}
                disabled={blockModal.turnoLocked}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  <SelectItem value="Mañana">Mañana</SelectItem>
                  <SelectItem value="Tarde">Tarde</SelectItem>
                  <SelectItem value="Noche">Noche</SelectItem>
                  <SelectItem value="Todos los Turnos">Todos los Turnos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Razón</Label>
              <Select value={blockModal.razon} onValueChange={v => setBlockModal(s => ({ ...s, razon: v }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar razón" /></SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  {RAZONES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Observaciones</Label>
              <Textarea
                value={blockModal.observaciones}
                onChange={e => setBlockModal(s => ({ ...s, observaciones: e.target.value }))}
                placeholder="Opcional"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setConfirmCancelBlock(true)}>Cancelar</Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!isBlockValid}
              onClick={() => setConfirmSaveBlock(true)}
            >
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmSaveAll}
        onOpenChange={setConfirmSaveAll}
        onConfirm={handleSaveAll}
        title="¿Estás seguro?"
        description="Se guardarán las jornadas y bloqueos configurados."
      />
      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        onConfirm={handleCancelAll}
        title="¿Estás seguro?"
        description="Se descartarán los cambios no guardados."
      />
      <ConfirmDialog
        open={confirmSaveBlock}
        onOpenChange={setConfirmSaveBlock}
        onConfirm={() => { doSaveBlock(); setConfirmSaveBlock(false); }}
        title="¿Estás seguro?"
        description="Se registrará el bloqueo y los días aparecerán en rojo en el calendario."
      />
      <ConfirmDialog
        open={confirmCancelBlock}
        onOpenChange={setConfirmCancelBlock}
        onConfirm={() => { setBlockModal(s => ({ ...s, open: false })); setConfirmCancelBlock(false); }}
        title="¿Estás seguro?"
        description="Se descartarán los cambios del bloqueo."
      />
      <ConfirmDialog
        open={!!confirmDeleteBlock}
        onOpenChange={(o) => !o && setConfirmDeleteBlock(null)}
        onConfirm={() => confirmDeleteBlock && doDeleteBlock(confirmDeleteBlock)}
        title="¿Eliminar bloqueo?"
        description="Esta acción no se puede deshacer."
      />
      <ConfirmDialog
        open={!!confirmSaveRow}
        onOpenChange={(o) => !o && setConfirmSaveRow(null)}
        onConfirm={() => { if (confirmSaveRow) saveRow(confirmSaveRow); setConfirmSaveRow(null); }}
        title="¿Estás seguro?"
        description="Se guardará la sesión médica de esta fila."
      />
    </div>
  );
}
