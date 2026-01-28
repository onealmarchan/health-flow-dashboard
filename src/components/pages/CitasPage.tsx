import { CalendarDays, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const appointments = [
  { id: 1, patient: 'María García', doctor: 'Dr. López', specialty: 'Cardiología', date: '2024-01-28', time: '09:00', status: 'confirmada' },
  { id: 2, patient: 'Carlos Ruiz', doctor: 'Dra. Martínez', specialty: 'Pediatría', date: '2024-01-28', time: '09:30', status: 'pendiente' },
  { id: 3, patient: 'Ana Torres', doctor: 'Dr. Sánchez', specialty: 'Dermatología', date: '2024-01-28', time: '10:00', status: 'confirmada' },
  { id: 4, patient: 'Pedro Fernández', doctor: 'Dra. Díaz', specialty: 'Neurología', date: '2024-01-28', time: '10:30', status: 'cancelada' },
  { id: 5, patient: 'Laura Jiménez', doctor: 'Dr. López', specialty: 'Cardiología', date: '2024-01-28', time: '11:00', status: 'confirmada' },
];

const statusColors = {
  confirmada: 'bg-success/20 text-success',
  pendiente: 'bg-warning/20 text-warning',
  cancelada: 'bg-destructive/20 text-destructive',
};

export function CitasPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Citas Médicas</h1>
          <p className="text-muted-foreground">Gestión de citas y programación</p>
        </div>
        <Button className="gradient-primary text-primary-foreground">
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

      <div className="chart-container">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Paciente</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Doctor</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Especialidad</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Fecha</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Hora</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Estado</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                  <td className="p-3 text-sm font-medium text-foreground">{apt.patient}</td>
                  <td className="p-3 text-sm text-foreground">{apt.doctor}</td>
                  <td className="p-3 text-sm text-muted-foreground">{apt.specialty}</td>
                  <td className="p-3 text-sm text-foreground">{apt.date}</td>
                  <td className="p-3 text-sm text-foreground">{apt.time}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[apt.status as keyof typeof statusColors]}`}>
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
    </div>
  );
}
