import { useState, useMemo } from 'react';
import { Plus, Search, Filter, CalendarDays, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { cn } from '@/lib/utils';

// Mock data
const initialAppointments = [
  { id: 1, patient: 'María García', doctor: 'Dr. López', specialty: 'Cardiología', date: '2024-01-28', time: '09:00', status: 'confirmada' },
  { id: 2, patient: 'Carlos Ruiz', doctor: 'Dra. Martínez', specialty: 'Pediatría', date: '2024-01-28', time: '09:30', status: 'pendiente' },
  { id: 3, patient: 'Ana Torres', doctor: 'Dr. Sánchez', specialty: 'Dermatología', date: '2024-01-28', time: '10:00', status: 'confirmada' },
  { id: 4, patient: 'Pedro Fernández', doctor: 'Dra. Díaz', specialty: 'Neurología', date: '2024-01-28', time: '10:30', status: 'cancelada' },
  { id: 5, patient: 'Laura Jiménez', doctor: 'Dr. López', specialty: 'Cardiología', date: '2024-01-28', time: '11:00', status: 'confirmada' },
];

const allPatients = [
  { num: 1, ci: '12345678', nombres: 'María', apellidos: 'García López', fechaNac: '1990-05-15', sexo: 'F', direccion: 'Calle 1', telefono: '555-0101', nacionalidad: 'Venezolana', estado: 'Activo', estadoCivil: 'Soltera' },
  { num: 2, ci: '23456789', nombres: 'Carlos', apellidos: 'Ruiz Pérez', fechaNac: '1985-08-22', sexo: 'M', direccion: 'Calle 2', telefono: '555-0102', nacionalidad: 'Venezolano', estado: 'Activo', estadoCivil: 'Casado' },
  { num: 3, ci: '34567890', nombres: 'Ana', apellidos: 'Torres Díaz', fechaNac: '1978-12-03', sexo: 'F', direccion: 'Calle 3', telefono: '555-0103', nacionalidad: 'Venezolana', estado: 'Activo', estadoCivil: 'Casada' },
  { num: 4, ci: '45678901', nombres: 'Pedro', apellidos: 'Fernández Gil', fechaNac: '1995-03-10', sexo: 'M', direccion: 'Calle 4', telefono: '555-0104', nacionalidad: 'Venezolano', estado: 'Activo', estadoCivil: 'Soltero' },
];

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
  const [selectedPatient, setSelectedPatient] = useState<typeof allPatients[0] | null>(null);
  const [isMinor, setIsMinor] = useState(false);

  // Appointments (mutable mock)
  const [appointments, setAppointments] = useState(initialAppointments);

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

  const handleSavePatient = () => {
    setModalStep('search');
    setNewPatient(emptyPatient);
  };

  const handleSaveAndContinue = () => {
    setNewPatient(emptyPatient);
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
    return baseTimeSlots.filter(h => !usedHoursForDate.has(h));
  }, [usedHoursForDate]);

  const isResumenReady = tipoCita && motivoTexto && horaSeleccionada;

  const selectedDayNumber = useMemo(() => {
    if (!selectedDate) return null;
    return parseInt(selectedDate.split('-')[2], 10);
  }, [selectedDate]);

  const handleAgendarCitaFinal = () => {
    if (!selectedPatient || !selectedDoctor || !selectedDate) return;
    const newApt = {
      id: appointments.length + 1,
      patient: `${selectedPatient.nombres} ${selectedPatient.apellidos}`,
      doctor: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      date: selectedDate,
      time: horaSeleccionada,
      status: 'confirmada',
    };
    setAppointments(prev => [...prev, newApt]);
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
    setCitaNumber('');
  };

  const handleDayClick = (day: number) => {
    const key = formatDateKey(calYear, calMonth, day);
    if (dayAvailability[key] === 'reserved') return;
    setSelectedDate(key);
    setHoraSeleccionada('');
  };

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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Paciente', 'Doctor', 'Especialidad', 'Fecha', 'Hora', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="text-left p-3 text-sm font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.map(apt => (
                <tr key={apt.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
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
                    <Button variant="ghost" size="sm">Editar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
                <Input value={newPatient.nacionalidad} onChange={e => setNewPatient({ ...newPatient, nacionalidad: e.target.value })} />
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
        <DialogContent className="bg-card border border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Motivo de Consulta</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedDoctor?.name} · {selectedDoctor?.specialty}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
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

          <div className="flex justify-end pt-4 border-t border-border">
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
                      <Label className="text-foreground">Hora Disponible</Label>
                      <Select value={horaSeleccionada} onValueChange={setHoraSeleccionada}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
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
                  {isResumenReady && selectedPatient && selectedDoctor && (
                    <div className="rounded-lg border border-border p-4 bg-card space-y-3">
                      <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
                        Resumen de Cita Asignada
                      </h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                        <div>
                          <span className="font-medium text-muted-foreground">Nº de Cita:</span>{' '}
                          <span className="text-foreground font-mono">{citaNumber}</span>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Médico:</span>{' '}
                          <span className="text-foreground">{selectedDoctor.name}</span>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Paciente:</span>{' '}
                          <span className="text-foreground">{selectedPatient.nombres} {selectedPatient.apellidos}</span>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Especialidad:</span>{' '}
                          <span className="text-foreground">{selectedDoctor.specialty}</span>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Edad:</span>{' '}
                          <span className="text-foreground">{calcAge(selectedPatient.fechaNac)} años</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-muted-foreground">Remitido:</span>
                          <RadioGroup
                            value={remitido}
                            onValueChange={(v) => setRemitido(v as 'si' | 'no')}
                            className="flex gap-3"
                          >
                            <div className="flex items-center gap-1">
                              <RadioGroupItem value="si" id="rem-si" />
                              <Label htmlFor="rem-si" className="text-foreground text-xs">Sí</Label>
                            </div>
                            <div className="flex items-center gap-1">
                              <RadioGroupItem value="no" id="rem-no" />
                              <Label htmlFor="rem-no" className="text-foreground text-xs">No</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium text-muted-foreground">Motivo:</span>{' '}
                          <span className="text-foreground">{motivoTexto}</span>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Tipo de Cita:</span>{' '}
                          <span className="text-foreground">{tipoCita}</span>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Día:</span>{' '}
                          <span className="text-foreground">{selectedDate}</span>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Hora:</span>{' '}
                          <span className="text-foreground">{horaSeleccionada}</span>
                        </div>
                      </div>
                    </div>
                  )}

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
