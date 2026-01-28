import { Clock, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const schedules = [
  { id: 1, doctor: 'Dr. López', specialty: 'Cardiología', monday: '08:00-14:00', tuesday: '08:00-14:00', wednesday: '14:00-20:00', thursday: '08:00-14:00', friday: '08:00-14:00' },
  { id: 2, doctor: 'Dra. Martínez', specialty: 'Pediatría', monday: '09:00-15:00', tuesday: '09:00-15:00', wednesday: '09:00-15:00', thursday: '-', friday: '09:00-15:00' },
  { id: 3, doctor: 'Dr. Sánchez', specialty: 'Dermatología', monday: '10:00-18:00', tuesday: '-', wednesday: '10:00-18:00', thursday: '10:00-18:00', friday: '-' },
  { id: 4, doctor: 'Dra. Díaz', specialty: 'Neurología', monday: '08:00-16:00', tuesday: '08:00-16:00', wednesday: '08:00-16:00', thursday: '08:00-16:00', friday: '08:00-12:00' },
];

export function HorariosPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Horarios y Agendas</h1>
          <p className="text-muted-foreground">Configuración de horarios de atención</p>
        </div>
        <Button className="gradient-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Horario
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/20">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">168</p>
              <p className="text-sm text-muted-foreground">Horas/Semana</p>
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/20">
              <Calendar className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">24</p>
              <p className="text-sm text-muted-foreground">Especialistas</p>
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-accent/20">
              <Clock className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">95%</p>
              <p className="text-sm text-muted-foreground">Ocupación</p>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <h3 className="text-lg font-semibold text-foreground mb-4">Horarios Semanales</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Doctor</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Especialidad</th>
                <th className="text-center p-3 text-sm font-medium text-muted-foreground">Lunes</th>
                <th className="text-center p-3 text-sm font-medium text-muted-foreground">Martes</th>
                <th className="text-center p-3 text-sm font-medium text-muted-foreground">Miércoles</th>
                <th className="text-center p-3 text-sm font-medium text-muted-foreground">Jueves</th>
                <th className="text-center p-3 text-sm font-medium text-muted-foreground">Viernes</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr key={schedule.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                  <td className="p-3 text-sm font-medium text-foreground">{schedule.doctor}</td>
                  <td className="p-3 text-sm text-muted-foreground">{schedule.specialty}</td>
                  <td className="p-3 text-center text-sm">
                    <span className={schedule.monday !== '-' ? 'text-success' : 'text-muted-foreground'}>
                      {schedule.monday}
                    </span>
                  </td>
                  <td className="p-3 text-center text-sm">
                    <span className={schedule.tuesday !== '-' ? 'text-success' : 'text-muted-foreground'}>
                      {schedule.tuesday}
                    </span>
                  </td>
                  <td className="p-3 text-center text-sm">
                    <span className={schedule.wednesday !== '-' ? 'text-success' : 'text-muted-foreground'}>
                      {schedule.wednesday}
                    </span>
                  </td>
                  <td className="p-3 text-center text-sm">
                    <span className={schedule.thursday !== '-' ? 'text-success' : 'text-muted-foreground'}>
                      {schedule.thursday}
                    </span>
                  </td>
                  <td className="p-3 text-center text-sm">
                    <span className={schedule.friday !== '-' ? 'text-success' : 'text-muted-foreground'}>
                      {schedule.friday}
                    </span>
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
