import { useMemo, useState, useEffect } from 'react';
import { FileSearch, Loader2, ArrowRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchBar } from '@/components/shared/SearchBar';
import { FiltersButton } from '@/components/shared/FiltersButton';
import { TablePagination } from '@/components/shared/TablePagination';
import { BackupActions } from '@/components/backup/BackupActions';
import { cn } from '@/lib/utils';
import { useAuditorias } from '@/services/useAuditorias';

export type AccionRealizada = 'Crear' | 'Editar' | 'Eliminar' | 'Sesión';

const accionColors: Record<string, string> = {
  Crear: 'bg-success/20 text-success',
  Editar: 'bg-warning/20 text-warning',
  Eliminar: 'bg-destructive/20 text-destructive',
  Sesión: 'bg-info/20 text-info',
};

const FIELD_LABELS: Record<string, string> = {
  id: 'ID',
  email: 'Correo',
  cedula: 'Cédula',
  nombre: 'Nombre',
  apellido: 'Apellido',
  telefono: 'Teléfono',
  password: 'Contraseña',
  rol: 'Rol',
  status: 'Estado',
  createdAt: 'Fecha creación',
  updatedAt: 'Fecha actualización',
  recoveryCode: 'Código recuperación',
  recoveryExpires: 'Expiración código',
  recoveryAttempts: 'Intentos recuperación',
  ci: 'CI',
  nombres: 'Nombres',
  apellidos: 'Apellidos',
  fechaNacimiento: 'Fecha nacimiento',
  sexo: 'Sexo',
  direccion: 'Dirección',
  nacionalidad: 'Nacionalidad',
  estadoPaciente: 'Estado paciente',
  estadoCivil: 'Estado civil',
  fechaCita: 'Fecha cita',
  horaCita: 'Hora cita',
  duracionCita: 'Duración',
  estadoCita: 'Estado cita',
  descripcion: 'Descripción',
  fechaDiagnostico: 'Fecha diagnóstico',
  nombreComunidad: 'Comunidad',
  enfermedadCronica: 'Enfermedad crónica',
  gravedad: 'Gravedad',
  turno: 'Turno',
  diasSemana: 'Días semana',
  horaInicio: 'Hora inicio',
  horaFin: 'Hora fin',
  cargaPaciente: 'Carga pacientes',
  titulo: 'Título',
  mensaje: 'Mensaje',
  leida: 'Leída',
  nivelUrgencia: 'Urgencia',
  fechaMotivo: 'Fecha motivo',
  observacionMotivo: 'Observación',
  fechaInicio: 'Fecha inicio',
  fechaFin: 'Fecha fin',
  motivo: 'Motivo',
  dispositivo: 'Dispositivo',
  usuarioId: 'Usuario ID',
  entidad: 'Entidad',
  entidadId: 'Entidad ID',
  accion: 'Acción',
  valorAnterior: 'Valor anterior',
  valorNuevo: 'Valor nuevo',
  fechaCreacion: 'Fecha creación',
  nombreEspecialidad: 'Especialidad',
  descripcionMotivo: 'Motivo consulta',
  nombreEnfermedad: 'Enfermedad',
  nombreSintoma: 'Síntoma',
};

const HIDDEN_FIELDS = new Set([
  'id', 'password', 'recoveryCode', 'recoveryExpires', 'recoveryAttempts',
  'valorAnterior', 'valorNuevo', 'usuarioId', 'dispositivo',
  'entidad', 'entidadId', 'accion', 'fechaCreacion',
]);

function friendlyFieldName(key: string): string {
  return FIELD_LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
}

function formatValue(val: any): string {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'boolean') return val ? 'Sí' : 'No';
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
    try {
      return new Date(val).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' });
    } catch { return val; }
  }
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

function computeDiff(before: Record<string, any> | null, after: Record<string, any> | null): DiffField[] {
  if (!before && !after) return [];
  if (before && !after) {
    return Object.entries(before)
      .filter(([k]) => !HIDDEN_FIELDS.has(k) && !k.startsWith('_'))
      .map(([k, v]) => ({ field: friendlyFieldName(k), oldVal: formatValue(v), newVal: null as string | null }));
  }
  if (!before && after) {
    return Object.entries(after)
      .filter(([k]) => !HIDDEN_FIELDS.has(k) && !k.startsWith('_'))
      .map(([k, v]) => ({ field: friendlyFieldName(k), oldVal: null as string | null, newVal: formatValue(v) }));
  }
  const diffs: DiffField[] = [];
  const allKeys = new Set([...Object.keys(before!), ...Object.keys(after!)]);
  for (const k of allKeys) {
    if (HIDDEN_FIELDS.has(k) || k.startsWith('_')) continue;
    const oldV = before![k];
    const newV = after![k];
    if (JSON.stringify(oldV) === JSON.stringify(newV)) continue;
    diffs.push({ field: friendlyFieldName(k), oldVal: formatValue(oldV), newVal: formatValue(newV) });
  }
  return diffs;
}

function buildSummary(accion: string, diffs: DiffField[], valorNuevo: any, valorAnterior: any): string {
  if (accion === 'Sesión') return 'Evento de autenticación';
  if (accion === 'Crear') {
    if (valorNuevo && typeof valorNuevo === 'object') {
      const name = valorNuevo.nombre || valorNuevo.nombres || valorNuevo.titulo || valorNuevo.descripcion || '';
      return name ? `Registro creado: ${name}` : 'Nuevo registro creado';
    }
    return 'Nuevo registro creado';
  }
  if (accion === 'Eliminar') {
    if (valorAnterior && typeof valorAnterior === 'object') {
      const name = valorAnterior.nombre || valorAnterior.nombres || valorAnterior.titulo || valorAnterior.descripcion || '';
      return name ? `Registro eliminado: ${name}` : 'Registro eliminado';
    }
    return 'Registro eliminado';
  }
  if (diffs.length === 0) return 'Sin cambios detectados';
  if (diffs.length === 1) {
    const d = diffs[0];
    return d.oldVal && d.newVal
      ? `${d.field}: ${d.oldVal} → ${d.newVal}`
      : d.oldVal
        ? `${d.field}: ${d.newVal}`
        : `${d.field}: ${d.newVal}`;
  }
  return `${diffs.length} campo${diffs.length > 1 ? 's' : ''} modificado${diffs.length > 1 ? 's' : ''}: ${diffs.slice(0, 2).map(d => d.field).join(', ')}${diffs.length > 2 ? '...' : ''}`;
}

interface DiffField {
  field: string;
  oldVal: string | null;
  newVal: string | null;
}

interface AuditRow {
  id: number | string;
  seccion: string;
  registroAfectado: string;
  accion: AccionRealizada;
  responsable: string;
  fechaHora: string;
  summary: string;
  diffs: DiffField[];
  raw: any;
}

export function AuditoriasPage() {
  const { data: rawAuditorias, isLoading } = useAuditorias();

  const apiAuditorias: any[] = Array.isArray(rawAuditorias)
    ? rawAuditorias
    : Array.isArray((rawAuditorias as any)?.data)
      ? (rawAuditorias as any).data
      : [];

  const historial = useMemo(() => apiAuditorias.map((a: any, idx: number): AuditRow => {
    const diffs = computeDiff(a.valorAnterior, a.valorNuevo);
    const accion: AccionRealizada =
      a.accion === 'INSERT' ? 'Crear'
      : a.accion === 'UPDATE' ? 'Editar'
      : a.accion === 'DELETE' ? 'Eliminar'
      : (a.accion === 'LOGIN' || a.accion === 'LOGOUT') ? 'Sesión'
      : 'Editar';

    return {
      id: a.id || idx,
      seccion: a.entidad || 'Sistema',
      registroAfectado: a.entidadId ? `${a.entidad || ''} #${a.entidadId}` : '—',
      accion,
      responsable: a.usuarioId ? `Usuario #${a.usuarioId}` : a.dispositivo || 'Sistema',
      fechaHora: a.fechaCreacion
        ? new Date(a.fechaCreacion).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' })
        : '—',
      summary: buildSummary(accion, diffs, a.valorNuevo, a.valorAnterior),
      diffs,
      raw: a,
    };
  }), [apiAuditorias]);

  const [search, setSearch] = useState('');
  const [filterSeccion, setFilterSeccion] = useState<string>('todas');
  const [filterAccion, setFilterAccion] = useState<string>('todas');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [detailRow, setDetailRow] = useState<AuditRow | null>(null);

  const secciones = useMemo(
    () => Array.from(new Set(historial.map(h => h.seccion))).sort(),
    [historial]
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return historial.filter(r => {
      if (filterSeccion !== 'todas' && r.seccion !== filterSeccion) return false;
      if (filterAccion !== 'todas' && r.accion !== filterAccion) return false;
      if (!q) return true;
      return (
        r.registroAfectado.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.responsable.toLowerCase().includes(q)
      );
    });
  }, [historial, search, filterSeccion, filterAccion]);

  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return rows.slice(start, start + itemsPerPage);
  }, [rows, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [search, filterSeccion, filterAccion]);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileSearch className="w-6 h-6 text-primary" />
            Historial de Cambios
          </h1>
          <p className="text-muted-foreground">Registro de actividades del sistema</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar por registro, cambio o responsable..." />
          <FiltersButton onClear={() => { setFilterSeccion('todas'); setFilterAccion('todas'); }}>
            <div className="space-y-2">
              <Label className="text-foreground text-xs">Sección</Label>
              <Select value={filterSeccion} onValueChange={setFilterSeccion}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border border-border z-[60]">
                  <SelectItem value="todas">Todas</SelectItem>
                  {secciones.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground text-xs">Acción</Label>
              <Select value={filterAccion} onValueChange={setFilterAccion}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border border-border z-[60]">
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="Crear">Crear</SelectItem>
                  <SelectItem value="Editar">Editar</SelectItem>
                  <SelectItem value="Eliminar">Eliminar</SelectItem>
                  <SelectItem value="Sesión">Sesión</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FiltersButton>
        </div>
        <BackupActions />
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Cargando historial...</span>
            </div>
          ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-muted/50">
              <tr>
                {['Sección', 'Registro', 'Acción', 'Cambio', 'Responsable', 'Fecha', ''].map(h => (
                  <th key={h || 'det'} className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">
                  {rows.length === 0 ? 'No se encontraron registros' : 'Sin registros'}
                </td></tr>
              )}
              {paginatedRows.map(r => (
                <tr key={r.id} className="border-t border-border/50 transition-colors hover:bg-secondary/30">
                  <td className="px-3 py-2.5 text-foreground text-xs">{r.seccion}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{r.registroAfectado}</td>
                  <td className="px-3 py-2.5">
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', accionColors[r.accion])}>
                      {r.accion}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-foreground text-xs max-w-[280px]">
                    <span className="line-clamp-2">{r.summary}</span>
                  </td>
                  <td className="px-3 py-2.5 text-foreground text-xs">{r.responsable}</td>
                  <td className="px-3 py-2.5 text-muted-foreground font-mono text-xs whitespace-nowrap">{r.fechaHora}</td>
                  <td className="px-3 py-2.5">
                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Ver detalle" onClick={() => setDetailRow(r)}>
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={rows.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailRow !== null} onOpenChange={(o) => !o && setDetailRow(null)}>
        <DialogContent className="bg-card border border-border max-w-lg max-h-[85vh] overflow-y-auto p-5">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-foreground text-base">Detalle del Cambio</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              {detailRow?.seccion} — {detailRow?.registroAfectado} — {detailRow?.fechaHora}
            </DialogDescription>
          </DialogHeader>

          {detailRow && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', accionColors[detailRow.accion])}>
                  {detailRow.accion}
                </span>
                <span className="text-xs text-muted-foreground">por {detailRow.responsable}</span>
              </div>

              {detailRow.accion === 'Sesión' ? (
                <div className="rounded-lg border border-border bg-secondary/40 p-3">
                  <p className="text-sm text-foreground">
                    {detailRow.raw.accion === 'LOGIN' ? 'Inicio de sesión' : 'Cierre de sesión'}
                    {detailRow.raw.dispositivo ? ` — ${detailRow.raw.dispositivo}` : ''}
                  </p>
                </div>
              ) : detailRow.diffs.length === 0 ? (
                <div className="rounded-lg border border-border bg-secondary/40 p-3">
                  <p className="text-sm text-muted-foreground">{detailRow.summary}</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Campos modificados</p>
                  <div className="rounded-lg border border-border overflow-hidden divide-y divide-border/50">
                    {detailRow.diffs.map((d, i) => (
                      <div key={i} className="flex items-start gap-3 px-3 py-2 bg-secondary/30">
                        <span className="text-xs font-medium text-foreground shrink-0 w-28 pt-0.5">{d.field}</span>
                        <div className="flex-1 flex items-center gap-2 text-xs min-w-0">
                          {d.oldVal !== null && (
                            <span className="line-through text-muted-foreground truncate max-w-[180px]" title={d.oldVal}>
                              {d.oldVal}
                            </span>
                          )}
                          {d.oldVal !== null && d.newVal !== null && (
                            <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                          )}
                          {d.newVal !== null && (
                            <span className="font-medium text-foreground truncate max-w-[180px]" title={d.newVal}>
                              {d.newVal}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-3">
            <Button variant="outline" size="sm" onClick={() => setDetailRow(null)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
