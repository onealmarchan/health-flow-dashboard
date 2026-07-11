import { useMemo, useState } from 'react';
import { FileSearch } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchBar } from '@/components/shared/SearchBar';
import { FiltersButton } from '@/components/shared/FiltersButton';
import { BackupActions } from '@/components/backup/BackupActions';
import { cn } from '@/lib/utils';
import { useAuditorias } from '@/services/useAuditorias';

export type AccionRealizada = 'Crear' | 'Editar' | 'Eliminar';

const accionColors: Record<AccionRealizada, string> = {
  Crear: 'bg-success/20 text-success',
  Editar: 'bg-warning/20 text-warning',
  Eliminar: 'bg-destructive/20 text-destructive',
};

export function AuditoriasPage() {
  const { data: rawAuditorias, isLoading } = useAuditorias();

  // Backend may return a paginated object { data: [], total: N } or a plain array
  const apiAuditorias: any[] = Array.isArray(rawAuditorias)
    ? rawAuditorias
    : Array.isArray((rawAuditorias as any)?.data)
      ? (rawAuditorias as any).data
      : [];

  const historialMock = useMemo(() => apiAuditorias.map((a: any, idx: number) => {
    // Build a human-readable summary from valorNuevo or valorAnterior
    let cambioTexto = 'Sin detalles';
    if (a.valorNuevo && typeof a.valorNuevo === 'object') {
      const v = a.valorNuevo;
      cambioTexto = v.titulo || v.nombre || v.descripcion || v.mensaje?.slice(0, 60) || JSON.stringify(v).slice(0, 80);
    } else if (a.valorAnterior && typeof a.valorAnterior === 'object') {
      const v = a.valorAnterior;
      cambioTexto = v.titulo || v.nombre || v.descripcion || JSON.stringify(v).slice(0, 80);
    }

    return {
      id: a.id || idx,
      seccion: a.entidad || 'Sistema',
      registroAfectado: a.entidadId ? `${a.entidad || ''} #${a.entidadId}` : 'N/A',
      accion: a.accion === 'INSERT' ? 'Crear'
        : a.accion === 'UPDATE' ? 'Editar'
        : a.accion === 'DELETE' ? 'Eliminar'
        : 'Editar',
      cambio: cambioTexto,
      responsable: a.usuarioId ? `Usuario #${a.usuarioId}` : a.dispositivo || 'Sistema',
      fechaHora: a.fechaCreacion
        ? new Date(a.fechaCreacion).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' })
        : 'N/A',
    };
  }), [apiAuditorias]);

  const [search, setSearch] = useState('');
  const [filterSeccion, setFilterSeccion] = useState<string>('todas');
  const [filterAccion, setFilterAccion] = useState<string>('todas');

  const secciones = useMemo(
    () => Array.from(new Set(historialMock.map((h: any) => h.seccion))).sort() as string[],
    [historialMock]
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return historialMock.filter(r => {
      if (filterSeccion !== 'todas' && r.seccion !== filterSeccion) return false;
      if (filterAccion !== 'todas' && r.accion !== filterAccion) return false;
      if (!q) return true;
      return (
        r.registroAfectado.toLowerCase().includes(q) ||
        r.cambio.toLowerCase().includes(q) ||
        r.responsable.toLowerCase().includes(q)
      );
    });
  }, [search, filterSeccion, filterAccion]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileSearch className="w-6 h-6 text-primary" />
            Historial de Cambios
          </h1>
          <p className="text-muted-foreground">Registro de actividades del sistema</p>
        </div>

      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
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
                </SelectContent>
              </Select>
            </div>
          </FiltersButton>
        </div>
        <BackupActions />
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                {['Sección', 'Registro afectado', 'Acción realizada', 'Cambio realizado', 'Responsable', 'Fecha y hora'].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-3 py-2 text-foreground">{r.seccion}</td>
                  <td className="px-3 py-2 font-mono text-xs text-foreground">{r.registroAfectado}</td>
                  <td className="px-3 py-2">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', accionColors[r.accion])}>
                      {r.accion}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-foreground">{r.cambio}</td>
                  <td className="px-3 py-2 text-foreground">{r.responsable}</td>
                  <td className="px-3 py-2 text-muted-foreground font-mono text-xs">{r.fechaHora}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Sin registros</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
