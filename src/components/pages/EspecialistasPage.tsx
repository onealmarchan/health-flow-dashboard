import { UserCog, Plus, Star, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const specialists = [
  { id: 1, name: 'Dr. Juan López', specialty: 'Cardiología', rating: 4.8, patients: 245, phone: '555-0101', email: 'jlopez@medicitas.com', available: true },
  { id: 2, name: 'Dra. Ana Martínez', specialty: 'Pediatría', rating: 4.9, patients: 312, phone: '555-0102', email: 'amartinez@medicitas.com', available: true },
  { id: 3, name: 'Dr. Carlos Sánchez', specialty: 'Dermatología', rating: 4.7, patients: 189, phone: '555-0103', email: 'csanchez@medicitas.com', available: false },
  { id: 4, name: 'Dra. María Díaz', specialty: 'Neurología', rating: 4.6, patients: 156, phone: '555-0104', email: 'mdiaz@medicitas.com', available: true },
  { id: 5, name: 'Dr. Pedro Torres', specialty: 'Traumatología', rating: 4.8, patients: 278, phone: '555-0105', email: 'ptorres@medicitas.com', available: true },
  { id: 6, name: 'Dra. Laura Fernández', specialty: 'Ginecología', rating: 4.9, patients: 298, phone: '555-0106', email: 'lfernandez@medicitas.com', available: true },
];

export function EspecialistasPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Especialistas Médicos</h1>
          <p className="text-muted-foreground">Directorio de profesionales de la salud</p>
        </div>
        <Button className="gradient-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Especialista
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {specialists.map((specialist) => (
          <div key={specialist.id} className="metric-card">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                <UserCog className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                specialist.available 
                  ? 'bg-success/20 text-success' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {specialist.available ? 'Disponible' : 'No disponible'}
              </span>
            </div>
            
            <h3 className="font-semibold text-foreground">{specialist.name}</h3>
            <p className="text-sm text-primary mb-3">{specialist.specialty}</p>
            
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-warning fill-warning" />
                <span className="text-sm font-medium text-foreground">{specialist.rating}</span>
              </div>
              <span className="text-sm text-muted-foreground">• {specialist.patients} pacientes</span>
            </div>
            
            <div className="space-y-2 pt-3 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{specialist.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="truncate">{specialist.email}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
