import { useState, useMemo } from 'react';
import { Plus, Search, Filter, CalendarDays, ArrowLeft, FileDown, X } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { RowActions } from '@/components/shared/RowActions';
import { cn } from '@/lib/utils';
import { usePatients, addPatient, type Patient } from '@/data/patientsStore';
import { useAppointments, addAppointment, removeAppointment } from '@/data/appointmentsStore';
import { useReportableTable } from '@/components/reports/useReportableTable';
import type { ReportableModule } from '@/components/reports/types';

// Doctors grouped by specialty
const doctorsBySpecialty = [
  {
    specialty: 'Cardiología',
    doctors: [
      { id: 'd1', name: 'Dr. López', mpps: 'MPPS-1023', carga: '12/16' },
      { id: 'd2', name: 'Dra. Reyes', mpps: 'MPPS-2087', carga: '8/16' },
    ],
  },
  {
    specialty: 'Pediatría',
    doctors: [
      { id: 'd3', name: 'Dra. Martínez', mpps: 'MPPS-3401', carga: '14/16' },
    ],
  },
  {
    specialty: 'Dermatología',
    doctors: [
      { id: 'd4', name: 'Dr. Sánchez', mpps: 'MPPS-4502', carga: '6/16' },
    ],
  },
  {
    specialty: 'Neurología',
    doctors: [
      { id: 'd5', name: 'Dra. Díaz', mpps: 'MPPS-5610', carga: '10/16' },
    ],
  },
];

const baseTimeSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00'];

const statusColors: Record<string, string> = {
  confirmada: 'bg-success/20 text-success',
  pendiente: 'bg-warning/20 text-warning',
  cancelada: 'bg-destructive/20 text-destructive',
};

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

type ModalStep = 'closed' | 'search' | 'register' | 'schedule' | 'motivo' | 'fullCita';

type Doctor = { id: string; name: string; mpps: string; carga: string };
type SelectedDoctor = Doctor & { specialty: string };

function buildMonthGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Convert: Sunday=0 → 6, Monday=1 → 0 (week starts on Monday)
  const offset = (firstDay.getDay() + 6) % 7;
  const cells: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function calcAge(fechaNac: string): number {
  if (!fechaNac) return 0;
  const birth = new Date(fechaNac);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function CitasPage() {
  const [modalStep, setModalStep] = useState<ModalStep>('closed');
  const [patientSearch, setPatientSearch] = useState('');
  const allPatients = usePatients();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isMinor, setIsMinor] = useState(false);

  // Appointments come from shared store
  const appointments = useAppointments();

  // Day availability mock
  const [dayAvailability, setDayAvailability] = useState<Record<string, 'available' | 'reserved'>>({
    '2024-01-28': 'reserved',
  });

  // New patient form state
  const [newPatient, setNewPatient] = useState({
    ci: '', nombres: '', apellidos: '', fechaNac: '', sexo: '',
    direccion: '', telefono: '', nacionalidad: '', estado: 'Activo', estadoCivil: '',
    ciRepresentante: '',
    comunidad: '', estadoUbic: '', municipio: '', parroquia: '',
  });

  const [confirmAction, setConfirmAction] = useState<'save' | 'saveContinue' | 'cancel' | null>(null);

  // Doctor selected for the new appointment
  const [selectedDoctor, setSelectedDoctor] = useState<SelectedDoctor | null>(null);

  // Motivo de Consulta state
  const [motivoData, setMotivoData] = useState({
    numPaciente: '',
    descripcion: '',
    urgencia: '',
    fecha: '',
    observacion: '',
  });

  // Cita Médica fullscreen state
  const [citaNumber, setCitaNumber] = useState('');
  const now = new Date();
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [tipoCita, setTipoCita] = useState('');
  const [motivoTexto, setMotivoTexto] = useState('');
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [turno, setTurno] = useState<'Mañana' | 'Tarde' | 'Noche' | ''>('');
  const [remitido, setRemitido] = useState<'si' | 'no'>('no');

  const emptyPatient = {
    ci: '', nombres: '', apellidos: '', fechaNac: '', sexo: '',
    direccion: '', telefono: '', nacionalidad: '', estado: 'Activo', estadoCivil: '',
    ciRepresentante: '',
    comunidad: '', estadoUbic: '', municipio: '', parroquia: '',
  };

  const filteredPatients = allPatients.filter(p =>
    p.nombres.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.apellidos.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.ci.includes(patientSearch)
  );

  const persistNewPatient = () => {
    if (!newPatient.nombres.trim() || !newPatient.apellidos.trim()) return;
    const ciFinal = isMinor && newPatient.ciRepresentante
      ? `${newPatient.ciRepresentante}-R01`
      : newPatient.ci;
    addPatient({
      ci: ciFinal,
      nombres: newPatient.nombres,
      apellidos: newPatient.apellidos,
      fechaNac: newPatient.fechaNac,
      sexo: (newPatient.sexo === 'M' ? 'M' : 'F'),
      direccion: newPatient.direccion,
      telefono: newPatient.telefono,
      nacionalidad: newPatient.nacionalidad || 'Venezolano',
      estadoCivil: newPatient.estadoCivil,
      estado: newPatient.estado === 'Activo' ? 'Activo' : 'Encamado',
      comunidad: newPatient.comunidad,
      estadoGeo: newPatient.estadoUbic,
      municipio: newPatient.municipio,
      parroquia: newPatient.parroquia,
    });
    toast.success('Paciente registrado');
  };

  const handleSavePatient = () => {
    persistNewPatient();
    setModalStep('search');
    setNewPatient(emptyPatient);
    setIsMinor(false);
  };

  const handleSaveAndContinue = () => {
    persistNewPatient();
    setNewPatient(emptyPatient);
    setIsMinor(false);
  };

  const handleCancelRegister = () => {
    setNewPatient(emptyPatient);
    setIsMinor(false);
    setModalStep('search');
  };

  const handleMinorChange = (checked: boolean) => {
    setIsMinor(checked);

    if (checked) {
      setNewPatient(prev => ({
        ...prev,
        ci: '',
      }));
    }
  };

  const handleConfirmAction = () => {
    if (confirmAction === 'save') handleSavePatient();
    else if (confirmAction === 'saveContinue') handleSaveAndContinue();
    else if (confirmAction === 'cancel') handleCancelRegister();
    setConfirmAction(null);
  };

  // Open Motivo modal from a doctor card
  const handleAsignarCita = (doctor: SelectedDoctor) => {
    setSelectedDoctor(doctor);
    setMotivoData({
      numPaciente: selectedPatient ? String(selectedPatient.num) : '',
      descripcion: '',
      urgencia: '',
      fecha: '',
      observacion: '',
    });
    setModalStep('motivo');
  };

  const isMotivoValid = useMemo(() => {
    return (
      motivoData.numPaciente.trim() !== '' &&
      motivoData.descripcion.trim() !== '' &&
      motivoData.urgencia.trim() !== '' &&
      motivoData.fecha.trim() !== '' &&
      motivoData.observacion.trim() !== ''
    );
  }, [motivoData]);

  const handleSiguienteMotivo = () => {
    const nuevoNumero = `CITA-${Date.now().toString().slice(-6)}`;
    setCitaNumber(nuevoNumero);
    setMotivoTexto(motivoData.descripcion);
    // Set calendar to motivo's date if provided
    const d = new Date(motivoData.fecha);
    if (!isNaN(d.getTime())) {
      setCalMonth(d.getMonth());
      setCalYear(d.getFullYear());
      setSelectedDate(motivoData.fecha);
    } else {
      setSelectedDate(null);
    }
    setTipoCita('');
    setHoraSeleccionada('');
    setTurno('');
    setRemitido('no');
    setModalStep('fullCita');
  };

  const cells = useMemo(() => buildMonthGrid(calYear, calMonth), [calYear, calMonth]);

  const yearsRange = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => current + i);
  }, []);

  const usedHoursForDate = useMemo(() => {
    if (!selectedDate) return new Set<string>();
    return new Set(appointments.filter(a => a.date === selectedDate).map(a => a.time));
  }, [selectedDate, appointments]);

  const availableHours = useMemo(() => {
    const filtered = baseTimeSlots.filter(h => !usedHoursForDate.has(h));
    if (!turno) return filtered;
    return filtered.filter(h => {
      const hour = parseInt(h.split(':')[0], 10);
      if (turno === 'Mañana') return hour >= 6 && hour < 12;
      if (turno === 'Tarde') return hour >= 12 && hour < 18;
      return hour >= 18 && hour < 24;
    });
  }, [usedHoursForDate, turno]);

  const isResumenReady = tipoCita && motivoTexto && horaSeleccionada;

  const selectedDayNumber = useMemo(() => {
    if (!selectedDate) return null;
    return parseInt(selectedDate.split('-')[2], 10);
  }, [selectedDate]);

  const handleAgendarCitaFinal = () => {
    if (!selectedPatient || !selectedDoctor || !selectedDate) return;
    addAppointment({
      patient: `${selectedPatient.nombres} ${selectedPatient.apellidos}`,
      doctor: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      date: selectedDate,
      time: horaSeleccionada,
      status: 'confirmada',
    });
    setDayAvailability(prev => ({ ...prev, [selectedDate]: 'reserved' }));
    toast.success('Cita agendada exitosamente');
    // Reset everything
    setModalStep('closed');
    setSelectedPatient(null);
    setSelectedDoctor(null);
    setSelectedDate(null);
    setTipoCita('');
    setMotivoTexto('');
    setHoraSeleccionada('');
    setTurno('');
    setCitaNumber('');
  };

  const handleDayClick = (day: number) => {
    const key = formatDateKey(calYear, calMonth, day);
    if (dayAvailability[key] === 'reserved') return;
    setSelectedDate(key);
    setHoraSeleccionada('');
  };

  // Reports module for appointments table
  const appointmentsModule: ReportableModule<typeof appointments[number]> = useMemo(() => ({
    name: 'Citas',
    itemSingular: 'cita',
    itemPlural: 'citas',
    rows: appointments,
    getId: r => r.id,
    fields: [
      { key: 'patient', label: 'Paciente', accessor: r => r.patient },
      { key: 'doctor', label: 'Doctor', accessor: r => r.doctor },
      { key: 'specialty', label: 'Especialidad', accessor: r => r.specialty },
      { key: 'date', label: 'Fecha', accessor: r => r.date },
      { key: 'time', label: 'Hora', accessor: r => r.time },
      { key: 'status', label: 'Estado', accessor: r => r.status },
    ],
    dateField: { accessor: r => r.date, label: 'Fecha' },
    advancedVariant: 'citas',
    metrics: rows => ({
      'Total exportadas': rows.length,
      'Confirmadas': rows.filter(r => r.status === 'confirmada').length,
      'Pendientes': rows.filter(r => r.status === 'pendiente').length,
      'Canceladas': rows.filter(r => r.status === 'cancelada').length,
    }),
  }), [appointments]);

  const appointmentsReports = useReportableTable({ module: appointmentsModule, visibleRows: appointments });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Citas Médicas</h1>
          <p className="text-muted-foreground">Gestión de citas y programación</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setModalStep('search')}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cita
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar citas..." className="pl-9" />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Appointments Table */}
      <div className="chart-container">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground">Próximas Citas Médicas</h3>
          {appointmentsReports.SplitButton}
        </div>
        {appointmentsReports.ContextBar}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="w-10 p-3">{appointmentsReports.HeaderCheckbox}</th>
                {['Paciente', 'Doctor', 'Especialidad', 'Fecha', 'Hora', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="text-left p-3 text-sm font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.map(apt => {
                const selected = appointmentsReports.isRowSelected(apt.id);
                return (
                  <tr key={apt.id}
                    className={cn('border-b border-border/50 transition-colors hover:bg-secondary/50',
                      selected && 'bg-primary/10')}>
                    <td className="p-3"><appointmentsReports.RowCheckbox id={apt.id} /></td>
                    <td className="p-3 text-sm font-medium text-foreground">{apt.patient}</td>
                    <td className="p-3 text-sm text-foreground">{apt.doctor}</td>
                    <td className="p-3 text-sm text-muted-foreground">{apt.specialty}</td>
                    <td className="p-3 text-sm text-foreground">{apt.date}</td>
                    <td className="p-3 text-sm text-foreground">{apt.time}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[apt.status]}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <RowActions actions={[
                        {
                          icon: X,
                          label: 'Cancelar cita',
                          variant: 'destructive',
                          animateOnClick: true,
                          onClick: () => {
                            if (confirm(`¿Cancelar la cita de ${apt.patient} el ${apt.date} ${apt.time}?`)) {
                              removeAppointment(apt.id);
                              toast.success('Cita cancelada');
                            }
                          },
                        },
                      ]} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {appointmentsReports.ReportSheet}

      {/* Step 1: Search Patient */}
      <Dialog open={modalStep === 'search'} onOpenChange={(o) => !o && setModalStep('closed')}>
        <DialogContent className="bg-card border border-border max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Buscar Paciente</DialogTitle>
            <DialogDescription className="text-muted-foreground">Busque un paciente registrado o registre uno nuevo</DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por nombre, CI..." value={patientSearch} onChange={e => setPatientSearch(e.target.value)} className="pl-9" />
            </div>
            <Button variant="outline" onClick={() => setModalStep('register')}>
              <Plus className="w-4 h-4 mr-2" />
              Registrar Nuevo
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Nº', 'CI', 'Nombres', 'Apellidos', 'F. Nacimiento', 'Sexo', 'Dirección', 'Teléfono', 'Nacionalidad', 'Estado', 'E. Civil', 'Acciones'].map(h => (
                    <th key={h} className="text-left p-2 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(p => (
                  <tr key={p.num} className="border-b border-border/50 hover:bg-secondary/50">
                    <td className="p-2 text-foreground">{p.num}</td>
                    <td className="p-2 text-foreground font-mono">{p.ci}</td>
                    <td className="p-2 text-foreground">{p.nombres}</td>
                    <td className="p-2 text-foreground">{p.apellidos}</td>
                    <td className="p-2 text-muted-foreground">{p.fechaNac}</td>
                    <td className="p-2 text-foreground">{p.sexo}</td>
                    <td className="p-2 text-muted-foreground truncate max-w-[120px]">{p.direccion}</td>
                    <td className="p-2 text-muted-foreground">{p.telefono}</td>
                    <td className="p-2 text-muted-foreground">{p.nacionalidad}</td>
                    <td className="p-2 text-foreground">{p.estado}</td>
                    <td className="p-2 text-muted-foreground">{p.estadoCivil}</td>
                    <td className="p-2">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedPatient(p); setModalStep('schedule'); }}>
                        <CalendarDays className="w-3 h-3 mr-1" />
                        Agendar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Step 2: Register New Patient */}
      <Dialog open={modalStep === 'register'} onOpenChange={(o) => !o && setModalStep('search')}>
        <DialogContent className="bg-card border border-border max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Registrar Nuevo Paciente</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Nº Paciente: AUTO-{String(allPatients.length + 1).padStart(4, '0')}
            </DialogDescription>
          </DialogHeader>

          {/* Minor without CI - relocated to top */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isMinor"
                checked={isMinor}
                onChange={e => handleMinorChange(e.target.checked)}
                className="rounded border-border"
              />
              <Label htmlFor="isMinor" className="text-foreground text-sm">
                Paciente menor de edad sin C.I.
              </Label>
            </div>
            {isMinor && (
              <div className="space-y-2 p-3 rounded-lg bg-secondary/50 border border-border">
                <Label className="text-foreground">Cédula del Representante</Label>
                <Input
                  value={newPatient.ciRepresentante}
                  onChange={e => setNewPatient({ ...newPatient, ciRepresentante: e.target.value })}
                  placeholder="Ej: 4568987 → generará 4568987-R01"
                />
                <p className="text-xs text-muted-foreground">
                  Se asignará un subíndice correlativo (ej: 4568987-R01)
                </p>
              </div>
            )}
          </div>

          {/* Section 1: Datos Personales */}
          <div className="space-y-4 mt-2">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
              Datos Personales
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Cédula de Identidad</Label>
                <Input
                  value={isMinor ? '' : newPatient.ci}
                  disabled={isMinor}
                  onChange={e => {
                    if (!isMinor) setNewPatient({ ...newPatient, ci: e.target.value });
                  }}
                  placeholder={isMinor ? 'Se usará la cédula del representante' : 'Ej: 12345678'}
                />
                {isMinor && (
                  <p className="text-xs text-muted-foreground">
                    Campo anulado: se usará la Cédula del Representante como documento de identificación.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Nombres</Label>
                <Input value={newPatient.nombres} onChange={e => setNewPatient({ ...newPatient, nombres: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Apellidos</Label>
                <Input value={newPatient.apellidos} onChange={e => setNewPatient({ ...newPatient, apellidos: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Fecha de Nacimiento</Label>
                <Input type="date" value={newPatient.fechaNac} onChange={e => setNewPatient({ ...newPatient, fechaNac: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Sexo</Label>
                <Select value={newPatient.sexo} onValueChange={v => setNewPatient({ ...newPatient, sexo: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Femenino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Dirección</Label>
                <Input value={newPatient.direccion} onChange={e => setNewPatient({ ...newPatient, direccion: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Teléfono</Label>
                <Input value={newPatient.telefono} onChange={e => setNewPatient({ ...newPatient, telefono: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Nacionalidad</Label>
                <Select value={newPatient.nacionalidad} onValueChange={v => setNewPatient({ ...newPatient, nacionalidad: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
                    <SelectItem value="Venezolano">Venezolano</SelectItem>
                    <SelectItem value="Extranjero">Extranjero</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Estado del Paciente</Label>
                <Select value={newPatient.estado} onValueChange={v => setNewPatient({ ...newPatient, estado: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Estado Civil</Label>
                <Select value={newPatient.estadoCivil} onValueChange={v => setNewPatient({ ...newPatient, estadoCivil: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
                    <SelectItem value="Soltero/a">Soltero/a</SelectItem>
                    <SelectItem value="Casado/a">Casado/a</SelectItem>
                    <SelectItem value="Divorciado/a">Divorciado/a</SelectItem>
                    <SelectItem value="Viudo/a">Viudo/a</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section 2: Ubicación */}
          <div className="space-y-4 mt-4">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
              Ubicación
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Comunidad</Label>
                <Input value={newPatient.comunidad} onChange={e => setNewPatient({ ...newPatient, comunidad: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Estado</Label>
                <Input value={newPatient.estadoUbic} onChange={e => setNewPatient({ ...newPatient, estadoUbic: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Municipio</Label>
                <Input value={newPatient.municipio} onChange={e => setNewPatient({ ...newPatient, municipio: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Parroquia</Label>
                <Input value={newPatient.parroquia} onChange={e => setNewPatient({ ...newPatient, parroquia: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4 mt-4 border-t border-border">
            <Button
              type="button"
              onClick={() => setConfirmAction('save')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Guardar
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setConfirmAction('saveContinue')}
            >
              Guardar y Continuar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmAction('cancel')}
            >
              Cancelar
            </Button>
          </div>

          <ConfirmDialog
            open={confirmAction !== null}
            onOpenChange={(open) => !open && setConfirmAction(null)}
            onConfirm={handleConfirmAction}
            title="¿Estás seguro?"
            description={
              confirmAction === 'cancel'
                ? 'Se perderán los cambios no guardados.'
                : confirmAction === 'saveContinue'
                ? 'Se guardarán los datos y podrá registrar otro paciente.'
                : 'Se guardarán los datos ingresados.'
            }
          />
        </DialogContent>
      </Dialog>

      {/* Step 3: Schedule - Doctors grouped by specialty */}
      <Dialog open={modalStep === 'schedule'} onOpenChange={(o) => !o && setModalStep('closed')}>
        <DialogContent className="bg-card border border-border max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Agendar Cita - {selectedPatient?.nombres} {selectedPatient?.apellidos}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Seleccione un especialista para asignar la cita
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {doctorsBySpecialty.map(group => (
              <div key={group.specialty} className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
                  {group.specialty}
                </h3>
                <div className="space-y-2">
                  {group.doctors.map(doc => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{doc.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {doc.mpps} · Carga actual: {doc.carga}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => handleAsignarCita({ ...doc, specialty: group.specialty })}
                      >
                        Asignar Cita
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Step 4: Motivo de Consulta */}
      <Dialog open={modalStep === 'motivo'} onOpenChange={(o) => !o && setModalStep('schedule')}>
        <DialogContent className="bg-card border border-border w-[92vw] max-w-2xl max-h-[82vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="shrink-0 px-6 pt-6 pb-4 border-b border-border">
            <DialogTitle className="text-foreground">Motivo de Consulta</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedDoctor?.name} · {selectedDoctor?.specialty}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 pr-8 space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Nº Paciente</Label>
              <Input value={motivoData.numPaciente} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Descripción</Label>
              <Textarea
                value={motivoData.descripcion}
                onChange={e => setMotivoData({ ...motivoData, descripcion: e.target.value })}
                placeholder="Describa el motivo de la consulta"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Nivel de Urgencia</Label>
              <Select value={motivoData.urgencia} onValueChange={v => setMotivoData({ ...motivoData, urgencia: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  <SelectItem value="Bajo">Bajo</SelectItem>
                  <SelectItem value="Medio">Medio</SelectItem>
                  <SelectItem value="Alto">Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Fecha</Label>
              <Input
                type="date"
                value={motivoData.fecha}
                onChange={e => setMotivoData({ ...motivoData, fecha: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Observación</Label>
              <Textarea
                value={motivoData.observacion}
                onChange={e => setMotivoData({ ...motivoData, observacion: e.target.value })}
                placeholder="Observaciones adicionales"
                rows={2}
              />
            </div>
          </div>

          <div className="shrink-0 flex justify-end px-6 py-4 border-t border-border bg-card">
            <Button
              disabled={!isMotivoValid}
              onClick={handleSiguienteMotivo}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Siguiente
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Step 5: Cita Médica - Fullscreen */}
      <Dialog open={modalStep === 'fullCita'} onOpenChange={(o) => !o && setModalStep('motivo')}>
        <DialogContent className="bg-card border border-border max-w-[95vw] w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col">
          {/* Hidden header for accessibility */}
          <DialogHeader className="sr-only">
            <DialogTitle>Cita Médica</DialogTitle>
            <DialogDescription>Seleccione fecha, hora y tipo de cita</DialogDescription>
          </DialogHeader>

          {/* Sticky top bar with Volver button */}
          <div className="flex items-center px-6 py-3 border-b border-border bg-card shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setModalStep('motivo')}
              className="text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>

          {/* Body: 70/30 grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-10 overflow-hidden">
            {/* Left column 70% */}
            <div className="lg:col-span-7 p-6 overflow-y-auto border-r border-border">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-foreground">Cita Médica</h2>
                <p className="text-sm text-muted-foreground">
                  Nº de Cita Médica: <span className="font-mono font-medium text-foreground">{citaNumber}</span>
                </p>
              </div>

              {/* Month/Year selectors */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1 space-y-2">
                  <Label className="text-foreground">Mes</Label>
                  <Select value={String(calMonth)} onValueChange={v => setCalMonth(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover border border-border z-50 max-h-72">
                      {monthNames.map((m, i) => (
                        <SelectItem key={m} value={String(i)}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="text-foreground">Año</Label>
                  <Select value={String(calYear)} onValueChange={v => setCalYear(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover border border-border z-50">
                      {yearsRange.map(y => (
                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Calendar */}
              <div className="rounded-lg border border-border p-4 bg-background/50">
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                    <div key={i} className="text-center text-xs font-semibold text-muted-foreground py-1">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {cells.map((day, idx) => {
                    if (day === null) return <div key={idx} />;
                    const key = formatDateKey(calYear, calMonth, day);
                    const isReserved = dayAvailability[key] === 'reserved';
                    const isSelected = selectedDate === key;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleDayClick(day)}
                        disabled={isReserved}
                        className={cn(
                          'mx-auto w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border transition-all',
                          isReserved && 'bg-destructive text-destructive-foreground border-destructive cursor-not-allowed',
                          isSelected && 'bg-primary text-primary-foreground border-primary',
                          !isReserved && !isSelected && 'bg-background text-foreground border-border hover:border-primary'
                        )}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                {/* Selected day number bottom-right */}
                <div className="flex justify-end mt-3">
                  {selectedDayNumber !== null && (
                    <span className="text-sm text-muted-foreground">
                      Día seleccionado:{' '}
                      <span className="font-semibold text-foreground">{selectedDayNumber}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-background border border-border" />
                  <span className="text-foreground">Cupos Disponibles</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-destructive border border-destructive" />
                  <span className="text-foreground">Cupos Reservados</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-primary border border-primary" />
                  <span className="text-foreground">Cupo Seleccionado</span>
                </div>
              </div>
            </div>

            {/* Right column 30% */}
            <div className="lg:col-span-3 p-6 overflow-y-auto bg-background/30">
              {!selectedDate ? (
                <div className="h-full flex items-center justify-center text-center">
                  <p className="text-muted-foreground text-sm">
                    Seleccione una fecha disponible
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Top: 3 controls */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-foreground">Tipo de Cita</Label>
                      <Select value={tipoCita} onValueChange={setTipoCita}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent className="bg-popover border border-border z-50">
                          <SelectItem value="Primera vez">Primera vez</SelectItem>
                          <SelectItem value="Control">Control</SelectItem>
                          <SelectItem value="Urgencia">Urgencia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Motivo</Label>
                      <Input value={motivoTexto} onChange={e => setMotivoTexto(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Turno</Label>
                      <Select value={turno} onValueChange={(v) => { setTurno(v as 'Mañana' | 'Tarde' | 'Noche'); setHoraSeleccionada(''); }}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar turno" /></SelectTrigger>
                        <SelectContent className="bg-popover border border-border z-50">
                          <SelectItem value="Mañana">Mañana</SelectItem>
                          <SelectItem value="Tarde">Tarde</SelectItem>
                          <SelectItem value="Noche">Noche</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Hora Disponible</Label>
                      <Select value={horaSeleccionada} onValueChange={setHoraSeleccionada} disabled={!turno}>
                        <SelectTrigger>
                          <SelectValue placeholder={turno ? 'Seleccionar' : 'Seleccione un turno primero'} />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border border-border z-50">
                          {availableHours.length === 0 ? (
                            <SelectItem value="none" disabled>Sin horarios</SelectItem>
                          ) : (
                            availableHours.map(h => (
                              <SelectItem key={h} value={h}>{h}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Resumen card */}
                  {isResumenReady && selectedPatient && selectedDoctor && (() => {
                    const generarComprobantePDF = () => {
                      const doc = new jsPDF({ unit: 'pt', format: 'letter' });
                      const W = doc.internal.pageSize.getWidth();
                      let y = 40;
                      const line = () => { doc.setLineWidth(0.5); doc.line(40, y, W - 40, y); y += 12; };
                      const row = (left: string, right?: string) => {
                        doc.setFontSize(10);
                        doc.text(left, 44, y);
                        if (right) doc.text(right, W / 2 + 10, y);
                        y += 14;
                      };
                      const section = (title: string) => {
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(10);
                        doc.text(title, 44, y);
                        doc.setFont('helvetica', 'normal');
                        y += 14;
                      };

                      doc.setFont('helvetica', 'bold');
                      doc.setFontSize(12);
                      doc.text('Centro Ambulatorio Dr Salvador Allende', 44, y);
                      doc.text(`N° cita: ${citaNumber}`, W - 200, y);
                      y += 16;
                      doc.setFontSize(11);
                      doc.text('Comprobante de Cita Médica', 44, y);
                      y += 8;
                      line();
                      doc.setFont('helvetica', 'normal');

                      row(`Fecha de Cita: ${selectedDate || ''}`, `Hora Asignada: ${horaSeleccionada || ''}`);
                      row(`Turno: ${turno || ''}    Tipo de Cita: ${tipoCita || ''}    Caso: ${remitido === 'si' ? 'Remitido' : 'Directo'}`);
                      line();

                      section('DATOS DEL PACIENTE');
                      row(`Cédula: ${selectedPatient.ci}`, `Nombres: ${selectedPatient.nombres}`);
                      row(`Apellidos: ${selectedPatient.apellidos}`, `Fecha Nac.: ${selectedPatient.fechaNac}`);
                      row(`Sexo: ${selectedPatient.sexo}`, `Teléfono: ${selectedPatient.telefono}`);
                      row(`Comunidad: —`, `Estado: ${selectedPatient.estado}`);
                      row(`Parroquia: —`);
                      line();

                      section('MÉDICO TRATANTE');
                      row(`N° Ministerio de Salud: ${selectedDoctor.mpps}`, `Especialidad: ${selectedDoctor.specialty}`);
                      row(`Nombres y Apellidos: ${selectedDoctor.name}`, `Horario de Sesión: —`);
                      line();

                      section('MOTIVO DE CONSULTA');
                      doc.setFontSize(10);
                      const split = doc.splitTextToSize(motivoTexto || '—', W - 88);
                      doc.text(split, 44, y);
                      y += split.length * 12 + 4;
                      row(`Nivel de Urgencia: ${motivoData.urgencia || '—'}`, `Remisión: ${remitido === 'si' ? 'Sí' : 'No'}`);
                      line();

                      doc.save(`Comprobante_${citaNumber}.pdf`);
                    };

                    return (
                      <div className="rounded-lg border border-border p-4 bg-card space-y-3">
                        <div className="flex items-start justify-between border-b border-border pb-2">
                          <div>
                            <h3 className="text-xs font-semibold text-foreground">Centro Ambulatorio Dr Salvador Allende</h3>
                            <p className="text-sm font-bold text-foreground">Comprobante de Cita Médica</p>
                          </div>
                          <div className="text-right text-xs">
                            <div className="text-muted-foreground">N° cita</div>
                            <div className="font-mono font-semibold text-foreground">{citaNumber}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs pb-2 border-b border-border/60">
                          <div><span className="text-muted-foreground">Fecha de Cita:</span> <span className="text-foreground">{selectedDate}</span></div>
                          <div><span className="text-muted-foreground">Hora Asignada:</span> <span className="text-foreground">{horaSeleccionada}</span></div>
                          <div><span className="text-muted-foreground">Turno:</span> <span className="text-foreground">{turno || '—'}</span></div>
                          <div><span className="text-muted-foreground">Tipo de Cita:</span> <span className="text-foreground">{tipoCita}</span></div>
                          <div className="col-span-2 flex items-center gap-2">
                            <span className="text-muted-foreground">Caso:</span>
                            <RadioGroup value={remitido} onValueChange={(v) => setRemitido(v as 'si' | 'no')} className="flex gap-3">
                              <div className="flex items-center gap-1">
                                <RadioGroupItem value="si" id="rem-si" />
                                <Label htmlFor="rem-si" className="text-foreground text-xs">Remitido</Label>
                              </div>
                              <div className="flex items-center gap-1">
                                <RadioGroupItem value="no" id="rem-no" />
                                <Label htmlFor="rem-no" className="text-foreground text-xs">Directo</Label>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>

                        <div className="space-y-1.5 pb-2 border-b border-border/60">
                          <h4 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Datos del Paciente</h4>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            <div><span className="text-muted-foreground">Cédula:</span> <span className="text-foreground">{selectedPatient.ci}</span></div>
                            <div><span className="text-muted-foreground">Nombres:</span> <span className="text-foreground">{selectedPatient.nombres}</span></div>
                            <div><span className="text-muted-foreground">Apellidos:</span> <span className="text-foreground">{selectedPatient.apellidos}</span></div>
                            <div><span className="text-muted-foreground">F. Nac.:</span> <span className="text-foreground">{selectedPatient.fechaNac}</span></div>
                            <div><span className="text-muted-foreground">Sexo:</span> <span className="text-foreground">{selectedPatient.sexo}</span></div>
                            <div><span className="text-muted-foreground">Teléfono:</span> <span className="text-foreground">{selectedPatient.telefono}</span></div>
                            <div><span className="text-muted-foreground">Comunidad:</span> <span className="text-foreground">—</span></div>
                            <div><span className="text-muted-foreground">Estado:</span> <span className="text-foreground">{selectedPatient.estado}</span></div>
                            <div className="col-span-2"><span className="text-muted-foreground">Parroquia:</span> <span className="text-foreground">—</span></div>
                          </div>
                        </div>

                        <div className="space-y-1.5 pb-2 border-b border-border/60">
                          <h4 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Médico Tratante</h4>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            <div><span className="text-muted-foreground">N° MPPS:</span> <span className="text-foreground font-mono">{selectedDoctor.mpps}</span></div>
                            <div><span className="text-muted-foreground">Especialidad:</span> <span className="text-foreground">{selectedDoctor.specialty}</span></div>
                            <div><span className="text-muted-foreground">Nombres y Apellidos:</span> <span className="text-foreground">{selectedDoctor.name}</span></div>
                            <div><span className="text-muted-foreground">Horario de Sesión:</span> <span className="text-foreground">—</span></div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <h4 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Motivo de Consulta</h4>
                          <p className="text-xs text-muted-foreground">Descripción del motivo</p>
                          <p className="text-xs text-foreground whitespace-pre-wrap">{motivoTexto || '—'}</p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs pt-1">
                            <div><span className="text-muted-foreground">Nivel de Urgencia:</span> <span className="text-foreground">{motivoData.urgencia || '—'}</span></div>
                            <div><span className="text-muted-foreground">Remisión:</span> <span className="text-foreground">{remitido === 'si' ? 'Sí' : 'No'}</span></div>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          className="w-full mt-2"
                          onClick={generarComprobantePDF}
                        >
                          <FileDown className="w-4 h-4 mr-2" />
                          Generar Comprobante de Cita
                        </Button>
                      </div>
                    );
                  })()}

                  {/* Bottom buttons */}
                  <div className="flex flex-col gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setModalStep('motivo')}
                    >
                      Regresar
                    </Button>
                    <Button
                      disabled={!isResumenReady}
                      onClick={handleAgendarCitaFinal}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Agendar Cita
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
