import { useState } from 'react';
import { Plus, Search, Filter, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModalFormButtons } from '@/components/shared/ModalFormButtons';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { cn } from '@/lib/utils';

// Mock data
const appointments = [
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

// Mock schedule blocks
const scheduleBlocks = [
  { time: '08:00', doctor: 'Dr. López', specialty: 'Cardiología', occupied: 3, capacity: 16 },
  { time: '08:00', doctor: 'Dra. Martínez', specialty: 'Pediatría', occupied: 8, capacity: 16 },
  { time: '14:00', doctor: 'Dr. Sánchez', specialty: 'Dermatología', occupied: 12, capacity: 16 },
  { time: '14:00', doctor: 'Dra. Díaz', specialty: 'Neurología', occupied: 16, capacity: 16 },
];

const statusColors: Record<string, string> = {
  confirmada: 'bg-success/20 text-success',
  pendiente: 'bg-warning/20 text-warning',
  cancelada: 'bg-destructive/20 text-destructive',
};

type ModalStep = 'closed' | 'search' | 'register' | 'schedule';

export function CitasPage() {
  const [modalStep, setModalStep] = useState<ModalStep>('closed');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<typeof allPatients[0] | null>(null);
  const [isMinor, setIsMinor] = useState(false);

  // New patient form state
  const [newPatient, setNewPatient] = useState({
    ci: '', nombres: '', apellidos: '', fechaNac: '', sexo: '',
    direccion: '', telefono: '', nacionalidad: '', estado: 'Activo', estadoCivil: '',
    ciRepresentante: '',
    comunidad: '', estadoUbic: '', municipio: '', parroquia: '',
  });

  const [confirmAction, setConfirmAction] = useState<'save' | 'saveContinue' | 'cancel' | null>(null);

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
    // Mock save - return to search
    setModalStep('search');
    setNewPatient({ ci: '', nombres: '', apellidos: '', fechaNac: '', sexo: '', direccion: '', telefono: '', nacionalidad: '', estado: 'Activo', estadoCivil: '', ciRepresentante: '' });
  };

  const handleSchedule = () => {
    setModalStep('closed');
    setSelectedPatient(null);
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Cédula de Identidad</Label>
              <Input value={newPatient.ci} onChange={e => setNewPatient({ ...newPatient, ci: e.target.value })} placeholder="Ej: 12345678" />
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

          {/* Minor without CI */}
          <div className="flex items-center gap-2 mt-4">
            <input type="checkbox" id="isMinor" checked={isMinor} onChange={e => setIsMinor(e.target.checked)} className="rounded border-border" />
            <Label htmlFor="isMinor" className="text-foreground text-sm">Paciente menor de edad sin CI</Label>
          </div>
          {isMinor && (
            <div className="space-y-2 mt-2 p-3 rounded-lg bg-secondary/50 border border-border">
              <Label className="text-foreground">Cédula del Representante</Label>
              <Input
                value={newPatient.ciRepresentante}
                onChange={e => setNewPatient({ ...newPatient, ciRepresentante: e.target.value })}
                placeholder="Ej: 4568987 → generará 4568987-R01"
              />
              <p className="text-xs text-muted-foreground">Se asignará un subíndice correlativo (ej: 4568987-R01)</p>
            </div>
          )}

          <ModalFormButtons
            onSave={handleSavePatient}
            onSaveAndAnother={() => {
              handleSavePatient();
              setNewPatient({ ci: '', nombres: '', apellidos: '', fechaNac: '', sexo: '', direccion: '', telefono: '', nacionalidad: '', estado: 'Activo', estadoCivil: '', ciRepresentante: '' });
            }}
            onCancel={() => setModalStep('search')}
          />
        </DialogContent>
      </Dialog>

      {/* Step 3: Schedule - Block Calendar */}
      <Dialog open={modalStep === 'schedule'} onOpenChange={(o) => !o && setModalStep('closed')}>
        <DialogContent className="bg-card border border-border max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Agendar Cita - {selectedPatient?.nombres} {selectedPatient?.apellidos}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Seleccione un bloque disponible para asignar la cita
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {scheduleBlocks.map((block, idx) => {
              const available = block.capacity - block.occupied;
              const isFull = available === 0;
              const pct = (block.occupied / block.capacity) * 100;
              return (
                <div key={idx} className={cn(
                  "p-4 rounded-lg border transition-all",
                  isFull ? "border-destructive/30 bg-destructive/5 opacity-60" : "border-border hover:border-primary/50 cursor-pointer hover:bg-primary/5"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-foreground">{block.doctor}</span>
                      <span className="text-muted-foreground text-sm ml-2">— {block.specialty}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-foreground font-medium">{block.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all",
                          pct >= 100 ? "bg-destructive" : pct >= 75 ? "bg-warning" : "bg-success"
                        )}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <span className={cn("text-xs font-medium",
                      isFull ? "text-destructive" : available <= 4 ? "text-warning" : "text-success"
                    )}>
                      {available}/{block.capacity} cupos
                    </span>
                  </div>
                  {!isFull && (
                    <Button size="sm" className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={handleSchedule}>
                      Asignar Cita
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
