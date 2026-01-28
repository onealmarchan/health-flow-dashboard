import { FileSearch, Download, Calendar, Filter, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const auditLogs = [
  { id: 1, action: 'Creación de cita', user: 'Roberto García', module: 'Citas', date: '2024-01-28 14:32:15', ip: '192.168.1.45', status: 'success' },
  { id: 2, action: 'Modificación de paciente', user: 'Carmen Ruiz', module: 'Pacientes', date: '2024-01-28 14:28:10', ip: '192.168.1.52', status: 'success' },
  { id: 3, action: 'Cancelación de cita', user: 'Miguel Torres', module: 'Citas', date: '2024-01-28 14:15:33', ip: '192.168.1.48', status: 'warning' },
  { id: 4, action: 'Acceso denegado', user: 'Usuario desconocido', module: 'Sistema', date: '2024-01-28 13:45:22', ip: '203.45.67.89', status: 'error' },
  { id: 5, action: 'Exportación de datos', user: 'Patricia López', module: 'Reportes', date: '2024-01-28 13:30:00', ip: '192.168.1.50', status: 'success' },
  { id: 6, action: 'Actualización de horario', user: 'Fernando Díaz', module: 'Horarios', date: '2024-01-28 12:55:18', ip: '192.168.1.55', status: 'success' },
  { id: 7, action: 'Eliminación de registro', user: 'Sandra Moreno', module: 'Pacientes', date: '2024-01-28 12:40:05', ip: '192.168.1.47', status: 'warning' },
  { id: 8, action: 'Login exitoso', user: 'Dr. López', module: 'Autenticación', date: '2024-01-28 08:00:12', ip: '192.168.1.60', status: 'success' },
];

const statusColors = {
  success: 'bg-success/20 text-success',
  warning: 'bg-warning/20 text-warning',
  error: 'bg-destructive/20 text-destructive',
};

const statusLabels = {
  success: 'Exitoso',
  warning: 'Advertencia',
  error: 'Error',
};

export function AuditoriasPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Auditorías</h1>
          <p className="text-muted-foreground">Registro de actividades del sistema</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar Logs
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/20">
              <FileSearch className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">1,245</p>
              <p className="text-sm text-muted-foreground">Total Eventos</p>
            </div>
          </div>
        </div>
        <div className="metric-card">
          <p className="text-sm text-muted-foreground">Hoy</p>
          <p className="text-2xl font-bold text-foreground">48</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-muted-foreground">Advertencias</p>
          <p className="text-2xl font-bold text-warning">12</p>
        </div>
        <div className="metric-card">
          <p className="text-sm text-muted-foreground">Errores</p>
          <p className="text-2xl font-bold text-destructive">3</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <FileSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar en logs..." className="pl-9" />
        </div>
        <Button variant="outline">
          <Calendar className="w-4 h-4 mr-2" />
          Rango de Fechas
        </Button>
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
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Fecha/Hora</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Acción</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Usuario</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Módulo</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">IP</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Estado</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Detalles</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                  <td className="p-3 text-sm text-muted-foreground font-mono">{log.date}</td>
                  <td className="p-3 text-sm font-medium text-foreground">{log.action}</td>
                  <td className="p-3 text-sm text-foreground">{log.user}</td>
                  <td className="p-3 text-sm text-muted-foreground">{log.module}</td>
                  <td className="p-3 text-sm text-muted-foreground font-mono">{log.ip}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[log.status as keyof typeof statusColors]}`}>
                      {statusLabels[log.status as keyof typeof statusLabels]}
                    </span>
                  </td>
                  <td className="p-3">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
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
