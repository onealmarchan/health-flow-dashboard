import { useState, useMemo } from 'react';
import { Clock, Calendar, Plus, ChevronLeft, ChevronRight, Edit, Ban, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const schedules = [
  { id: 1, doctor: 'Dr. López', specialty: 'Cardiología', turno: 'Mañana', cargaHoraria: '08:00-14:00' },
  { id: 2, doctor: 'Dra. Martínez', specialty: 'Pediatría', turno: 'Mañana', cargaHoraria: '09:00-15:00' },
  { id: 3, doctor: 'Dr. Sánchez', specialty: 'Dermatología', turno: 'Tarde', cargaHoraria: '14:00-20:00' },
  { id: 4, doctor: 'Dra. Díaz', specialty: 'Neurología', turno: 'Completa', cargaHoraria: '08:00-16:00' },
];

const doctors = [
  { mpps: 'MPPS-001', nombre: 'Juan', apellido: 'López', especialidad: 'Cardiología' },
  { mpps: 'MPPS-002', nombre: 'Ana', apellido: 'Martínez', especialidad: 'Pediatría' },
  { mpps: 'MPPS-003', nombre: 'Carlos', apellido: 'Sánchez', especialidad: 'Dermatología' },
  { mpps: 'MPPS-004', nombre: 'María', apellido: 'Díaz', especialidad: 'Neurología' },
];

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const DAYS_HEAD = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DAYS_FULL = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const RAZONES = ['Vacaciones', 'Permiso', 'Reposo', 'Cirugía', 'Capacitación', 'Congreso', 'Mantenimiento', 'Rotación', 'Otro'];

interface Bloqueo {
  id: string;
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string;
  razon: string;
  observaciones: string;
}

interface DaySchedule {
  turno: string;
  horaInicio: string;
  horaFin: string;
}

const pad = (n: number) => n.toString().padStart(2, '0');
const toISO = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

function buildMonthGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
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

// Get Monday-based week for a given month + offset
function getWeekRange(year: number, month: number, offset: number) {
  // First Monday on/after day 1, or last Monday before
  const first = new Date(year, month, 1);
  const dow = first.getDay(); // 0 Sun ... 1 Mon
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const firstMonday = new Date(year, month, 1 + mondayOffset + offset * 7);
  const days: { date: Date; iso: string; label: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(firstMonday);
    d.setDate(firstMonday.getDate() + i);
    days.push({
      date: d,
      iso: toISO(d.getFullYear(), d.getMonth(), d.getDate()),
      label: `${DAYS_FULL[i]} ${d.getDate()}`,
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
  if (sm === em && sy === ey) return `Semana del ${sd} al ${ed} de ${sm} ${sy}`;
  return `Semana del ${sd} ${sm} al ${ed} ${em} ${ey}`;
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
  const [weekSchedule, setWeekSchedule] = useState<Record<string, DaySchedule>>({});
  const [bloqueos, setBloqueos] = useState<Bloqueo[]>([]);

  // Block modal state
  const [blockModal, setBlockModal] = useState<{
    open: boolean;
    editingId: string | null;
    fechaInicio: string;
    fechaFin: string;
    razon: string;
    observaciones: string;
    lockStart: boolean;
  }>({ open: false, editingId: null, fechaInicio: '', fechaFin: '', razon: '', observaciones: '', lockStart: true });

  // Confirm dialogs
  const [confirmSaveAll, setConfirmSaveAll] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmSaveBlock, setConfirmSaveBlock] = useState(false);
  const [confirmCancelBlock, setConfirmCancelBlock] = useState(false);
  const [confirmDeleteBlock, setConfirmDeleteBlock] = useState<string | null>(null);

  const doctor = doctors.find(d => d.mpps === selectedMpps);
  const monthGrid = useMemo(() => buildMonthGrid(calYear, calMonth), [calYear, calMonth]);
  const weekRange = useMemo(() => getWeekRange(calYear, calMonth, weekOffset), [calYear, calMonth, weekOffset]);

  const openBlockModal = (fechaInicio: string, existing?: Bloqueo) => {
    if (existing) {
      setBlockModal({
        open: true,
        editingId: existing.id,
        fechaInicio: existing.fechaInicio,
        fechaFin: existing.fechaFin,
        razon: existing.razon,
        observaciones: existing.observaciones,
        lockStart: false,
      });
    } else {
      setBlockModal({
        open: true,
        editingId: null,
        fechaInicio,
        fechaFin: fechaInicio,
        razon: '',
        observaciones: '',
        lockStart: true,
      });
    }
  };

  const handleCalendarClick = (day: number | null) => {
    if (!day) return;
    const iso = toISO(calYear, calMonth, day);
    const blocked = isDateBlocked(iso, bloqueos);
    if (blocked) {
      openBlockModal(iso, blocked);
    }
  };

  const updateRow = (iso: string, patch: Partial<DaySchedule>) => {
    setWeekSchedule(prev => ({
      ...prev,
      [iso]: { turno: '', horaInicio: '', horaFin: '', ...prev[iso], ...patch },
    }));
  };

  const handleSaveRow = (iso: string) => {
    toast.success('Jornada del día actualizada');
  };

  const isBlockValid = blockModal.fechaInicio && blockModal.fechaFin && blockModal.razon && blockModal.fechaFin >= blockModal.fechaInicio;

  const doSaveBlock = () => {
    if (!isBlockValid) return;
    if (blockModal.editingId) {
      setBloqueos(prev => prev.map(b => b.id === blockModal.editingId ? {
        ...b,
        fechaInicio: blockModal.fechaInicio,
        fechaFin: blockModal.fechaFin,
        razon: blockModal.razon,
        observaciones: blockModal.observaciones,
      } : b));
      toast.success('Bloqueo actualizado');
    } else {
      const nuevo: Bloqueo = {
        id: `BLQ-${Date.now()}`,
        fechaInicio: blockModal.fechaInicio,
        fechaFin: blockModal.fechaFin,
        razon: blockModal.razon,
        observaciones: blockModal.observaciones,
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

  const resetAll = () => {
    setSelectedMpps('');
    setWeekOffset(0);
    setWeekSchedule({});
    setBloqueos([]);
    setCalMonth(today.getMonth());
    setCalYear(today.getFullYear());
  };

  const handleSaveAll = () => {
    toast.success('Jornadas y bloqueos guardados');
    setShowModal(false);
    resetAll();
    setConfirmSaveAll(false);
  };

  const handleCancelAll = () => {
    setShowModal(false);
    resetAll();
    setConfirmCancel(false);
  };

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/20"><Clock className="w-6 h-6 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">168</p>
              <p className="text-sm text-muted-foreground">Horas/Semana</p>
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/20"><Calendar className="w-6 h-6 text-success" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">24</p>
              <p className="text-sm text-muted-foreground">Especialistas</p>
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-accent/20"><Clock className="w-6 h-6 text-accent" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">95%</p>
              <p className="text-sm text-muted-foreground">Ocupación</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-foreground mb-4">Jornadas Registradas</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Doctor', 'Especialidad', 'Turno', 'Carga Horaria', 'Acciones'].map(h => (
                  <th key={h} className="text-left p-3 text-sm font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedules.map(s => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                  <td className="p-3 text-sm font-medium text-foreground">{s.doctor}</td>
                  <td className="p-3 text-sm text-muted-foreground">{s.specialty}</td>
                  <td className="p-3 text-sm text-foreground">{s.turno}</td>
                  <td className="p-3 text-sm text-success">{s.cargaHoraria}</td>
                  <td className="p-3">
                    <Button variant="ghost" size="sm">Editar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Jornada Modal — 4 cuadrantes */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-card border border-border max-w-[95vw] w-[95vw] h-[92vh] flex flex-col p-0 gap-0">
          {/* Header */}
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

          {/* Body — 4 quadrants */}
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
                    return (
                      <button
                        key={idx}
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

              {/* Q2: Weekly editor */}
              <div className="bg-card border border-border rounded-lg p-4 overflow-auto">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-foreground">Edición semanal</h4>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setWeekOffset(o => o - 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground min-w-[200px] text-center">
                      {formatRange(weekRange.start, weekRange.end)}
                    </span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setWeekOffset(o => o + 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {['Día', 'Turno', 'Hora Inicio', 'Hora Fin', 'Acciones'].map(h => (
                          <th key={h} className="text-left p-2 text-xs font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {weekRange.days.map(d => {
                        const row = weekSchedule[d.iso] || { turno: '', horaInicio: '', horaFin: '' };
                        const blocked = isDateBlocked(d.iso, bloqueos);
                        return (
                          <tr key={d.iso} className={cn('border-b border-border/50', blocked && 'opacity-60')}>
                            <td className="p-2 text-foreground font-medium whitespace-nowrap">{d.label}</td>
                            <td className="p-2">
                              <Select value={row.turno} onValueChange={v => updateRow(d.iso, { turno: v })}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                                <SelectContent className="bg-popover border border-border z-50">
                                  <SelectItem value="mañana">Mañana</SelectItem>
                                  <SelectItem value="tarde">Tarde</SelectItem>
                                  <SelectItem value="noche">Noche</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-2">
                              <Input
                                type="time"
                                className="h-8 text-xs"
                                value={row.horaInicio}
                                onChange={e => updateRow(d.iso, { horaInicio: e.target.value })}
                                disabled={!row.turno}
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="time"
                                className="h-8 text-xs"
                                value={row.horaFin}
                                onChange={e => updateRow(d.iso, { horaFin: e.target.value })}
                                disabled={!row.horaInicio}
                              />
                            </td>
                            <td className="p-2">
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleSaveRow(d.iso)} title="Editar">
                                  <Edit className="w-3.5 h-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openBlockModal(d.iso)} title="Bloquear">
                                  <Ban className="w-3.5 h-3.5 text-destructive" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
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
                    { label: 'Horas regulares', value: '—' },
                    { label: 'Horas semanales', value: '—' },
                    { label: 'Días bloqueados', value: bloqueos.length ? String(bloqueos.length) : '—' },
                    { label: 'Días hábiles', value: '—' },
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
                <h4 className="text-sm font-semibold text-foreground mb-3">Bloqueos programados</h4>
                {bloqueos.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Sin bloqueos registrados</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          {['Fecha Inicio', 'Fecha Fin', 'Razón', 'Observaciones', 'Acciones'].map(h => (
                            <th key={h} className="text-left p-2 text-xs font-medium text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {bloqueos.map(b => (
                          <tr key={b.id} className="border-b border-border/50">
                            <td className="p-2 text-foreground whitespace-nowrap">{b.fechaInicio}</td>
                            <td className="p-2 text-foreground whitespace-nowrap">{b.fechaFin}</td>
                            <td className="p-2 text-foreground">{b.razon}</td>
                            <td className="p-2 text-muted-foreground truncate max-w-[180px]">{b.observaciones || '—'}</td>
                            <td className="p-2">
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openBlockModal(b.fechaInicio, b)} title="Editar">
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

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border flex justify-end gap-2 shrink-0">
            <Button variant="outline" onClick={() => setConfirmCancel(true)}>Cancelar</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setConfirmSaveAll(true)}>Guardar todo</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Secondary: Bloquear Día */}
      <Dialog open={blockModal.open} onOpenChange={open => setBlockModal(s => ({ ...s, open }))}>
        <DialogContent className="bg-card border border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">{blockModal.editingId ? 'Editar Bloqueo' : 'Bloquear Día'}</DialogTitle>
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

      {/* Confirms */}
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
    </div>
  );
}
