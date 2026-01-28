import { Users, Plus, Search, Filter, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const employees = [
  { id: 1, name: 'Roberto García', role: 'Recepcionista', department: 'Recepción', status: 'activo', startDate: '2022-03-15', email: 'rgarcia@medicitas.com' },
  { id: 2, name: 'Carmen Ruiz', role: 'Enfermera', department: 'Enfermería', status: 'activo', startDate: '2021-08-20', email: 'cruiz@medicitas.com' },
  { id: 3, name: 'Miguel Torres', role: 'Administrativo', department: 'Administración', status: 'activo', startDate: '2020-01-10', email: 'mtorres@medicitas.com' },
  { id: 4, name: 'Patricia López', role: 'Enfermera', department: 'Enfermería', status: 'licencia', startDate: '2019-05-22', email: 'plopez@medicitas.com' },
  { id: 5, name: 'Fernando Díaz', role: 'Técnico', department: 'Laboratorio', status: 'activo', startDate: '2023-02-01', email: 'fdiaz@medicitas.com' },
  { id: 6, name: 'Sandra Moreno', role: 'Recepcionista', department: 'Recepción', status: 'activo', startDate: '2022-11-30', email: 'smoreno@medicitas.com' },
];

const statusColors = {
  activo: 'bg-success/20 text-success',
  licencia: 'bg-warning/20 text-warning',
  inactivo: 'bg-destructive/20 text-destructive',
};

export function EmpleadosPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Empleados</h1>
          <p className="text-muted-foreground">Gestión de personal del centro médico</p>
        </div>
        <Button className="gradient-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Empleado
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="metric-card">
          <p className="text-sm text-muted-foreground">Total Empleados</p>
          <p className="text-2xl font-bold text-foreground">48</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-muted-foreground">Activos</p>
          <p className="text-2xl font-bold text-success">42</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-muted-foreground">En Licencia</p>
          <p className="text-2xl font-bold text-warning">4</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-muted-foreground">Nuevos (30d)</p>
          <p className="text-2xl font-bold text-primary">3</p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar empleados..." className="pl-9" />
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
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Nombre</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Rol</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Departamento</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Inicio</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Estado</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-foreground">{emp.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-foreground">{emp.role}</td>
                  <td className="p-3 text-sm text-muted-foreground">{emp.department}</td>
                  <td className="p-3 text-sm text-muted-foreground">{emp.email}</td>
                  <td className="p-3 text-sm text-muted-foreground">{emp.startDate}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[emp.status as keyof typeof statusColors]}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
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
