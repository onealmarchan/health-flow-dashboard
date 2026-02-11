import { useState } from 'react';
import { Clock, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModalFormButtons } from '@/components/shared/ModalFormButtons';

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

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export function JornadasPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [turno, setTurno] = useState('');

  const doctor = doctors.find(d => d.mpps === selectedDoctor);

  const toggleDay = (day: string) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleSave = () => {
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedDoctor(''); setSelectedDays([]); setHoraInicio(''); setHoraFin(''); setTurno('');
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

      {/* Add Jornada Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-card border border-border max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Agregar Jornada</DialogTitle>
            <DialogDescription className="text-muted-foreground">Configure la jornada médica</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Doctor Selector */}
            <div className="space-y-2">
              <Label className="text-foreground">Seleccionar Médico</Label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger><SelectValue placeholder="Buscar médico..." /></SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  {doctors.map(d => (
                    <SelectItem key={d.mpps} value={d.mpps}>
                      {d.nombre} {d.apellido} — {d.especialidad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Auto-filled data */}
            {doctor && (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
                <div><Label className="text-xs text-muted-foreground">Nº MPPS</Label><p className="text-sm text-foreground font-mono">{doctor.mpps}</p></div>
                <div><Label className="text-xs text-muted-foreground">Nombre</Label><p className="text-sm text-foreground">{doctor.nombre} {doctor.apellido}</p></div>
                <div className="col-span-2"><Label className="text-xs text-muted-foreground">Especialidad</Label><p className="text-sm text-foreground">{doctor.especialidad}</p></div>
              </div>
            )}

            {/* Days */}
            <div className="space-y-2">
              <Label className="text-foreground">Días de la Semana</Label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map(day => (
                  <button key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedDays.includes(day) ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}>
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Hours */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Hora Inicio</Label>
                <Input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Hora Fin</Label>
                <Input type="time" value={horaFin} onChange={e => setHoraFin(e.target.value)} />
              </div>
            </div>

            {/* Shift */}
            <div className="space-y-2">
              <Label className="text-foreground">Turno</Label>
              <Select value={turno} onValueChange={setTurno}>
                <SelectTrigger><SelectValue placeholder="Seleccionar turno" /></SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  <SelectItem value="mañana">Mañana</SelectItem>
                  <SelectItem value="tarde">Tarde</SelectItem>
                  <SelectItem value="noche">Noche</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ModalFormButtons
            onSave={handleSave}
            onSaveAndAnother={() => { handleSave(); setShowModal(true); }}
            onCancel={() => setShowModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
