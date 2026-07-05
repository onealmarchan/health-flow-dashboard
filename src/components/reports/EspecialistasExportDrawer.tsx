import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export type Especialista = {
  id: number;
  mpps: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  pacientes: number;
  telefono: string;
  disponible: boolean;
  fechaIngreso: string;
  createdAt: number;
};
import { downloadCSV, downloadXLSX, downloadPDF } from './exporters';

type ReportType = 'total' | 'menor' | 'mayor' | 'promedio';
type Disponibilidad = 'todos' | 'disp' | 'nodisp';
type FormatId = 'xlsx' | 'csv' | 'pdf';
type SortId = 'carga-desc' | 'carga-asc' | 'az' | 'za' | 'mpps-asc' | 'mpps-desc';
type FieldId = 'num' | 'mpps' | 'nombre' | 'apellido' | 'especialidad' | 'pacientes' | 'telefono' | 'disponible';

interface FieldDef {
  id: FieldId;
  label: string;
  defaultOn: boolean;
}

const FIELD_DEFS: FieldDef[] = [
  { id: 'num',          label: 'Número (correlativo)', defaultOn: true },
  { id: 'mpps',         label: 'MPPS',                 defaultOn: true },
  { id: 'nombre',       label: 'Nombre',               defaultOn: true },
  { id: 'apellido',     label: 'Apellido',             defaultOn: true },
  { id: 'especialidad', label: 'Especialidad',         defaultOn: true },
  { id: 'pacientes',    label: 'Carga de pacientes',   defaultOn: true },
  { id: 'telefono',     label: 'Teléfono',             defaultOn: false },
  { id: 'disponible',   label: 'Estado de disponibilidad', defaultOn: false },
];

const REPORT_TYPES: { id: ReportType; label: string; description: string }[] = [
  { id: 'total',    label: 'Total de médicos',         description: 'Médicos con citas asignadas en el rango.' },
  { id: 'menor',    label: 'Menor densidad de atención', description: 'Médicos con menos citas atendidas.' },
  { id: 'mayor',    label: 'Mayor densidad de atención', description: 'Médicos con más citas atendidas.' },
  { id: 'promedio', label: 'Promedio de rendimiento médico', description: 'Promedio de pacientes atendidos.' },
];

const SORT_OPTIONS: { id: SortId; label: string }[] = [
  { id: 'carga-desc', label: 'Mayor carga de pacientes' },
  { id: 'carga-asc',  label: 'Menor carga de pacientes' },
  { id: 'az',         label: 'A–Z' },
  { id: 'za',         label: 'A–Z (invertido)' },
  { id: 'mpps-asc',   label: 'Nº MPPS' },
  { id: 'mpps-desc',  label: 'Nº MPPS (invertido)' },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  especialistas: Especialista[];
  especialidades: string[];
}

function mppsNumber(m: string): number {
  const match = m.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export function EspecialistasExportDrawer({ open, onOpenChange, especialistas, especialidades }: Props) {
  const [fields, setFields] = useState<Set<FieldId>>(() => new Set(FIELD_DEFS.filter(f => f.defaultOn).map(f => f.id)));
  const [type, setType] = useState<ReportType | ''>('');
  const [especialidadFiltro, setEspecialidadFiltro] = useState<string>('all');
  const [disponibilidad, setDisponibilidad] = useState<Disponibilidad>('todos');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sort, setSort] = useState<SortId>('carga-desc');
  const [format, setFormat] = useState<FormatId>('xlsx');
  const [incluirGrafica, setIncluirGrafica] = useState(false);
  const [incluirResumen, setIncluirResumen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setFields(new Set(FIELD_DEFS.filter(f => f.defaultOn).map(f => f.id)));
      setType('');
      setEspecialidadFiltro('all');
      setDisponibilidad('todos');
      setFrom(''); setTo('');
      setSort('carga-desc');
      setFormat('xlsx');
      setIncluirGrafica(false);
      setIncluirResumen(false);
      setLoading(false);
    }
  }, [open]);

  // If format becomes csv, force-disable gráfica
  useEffect(() => {
    if (format === 'csv') setIncluirGrafica(false);
  }, [format]);

  const filtered = useMemo(() => {
    let rows = [...especialistas];
    if (especialidadFiltro !== 'all') rows = rows.filter(r => r.especialidad === especialidadFiltro);
    if (disponibilidad === 'disp') rows = rows.filter(r => r.disponible);
    else if (disponibilidad === 'nodisp') rows = rows.filter(r => !r.disponible);
    if (from && to) rows = rows.filter(r => r.fechaIngreso >= from && r.fechaIngreso <= to);

    switch (sort) {
      case 'carga-desc': rows.sort((a, b) => b.pacientes - a.pacientes); break;
      case 'carga-asc':  rows.sort((a, b) => a.pacientes - b.pacientes); break;
      case 'az':         rows.sort((a, b) => (a.apellido + a.nombre).localeCompare(b.apellido + b.nombre)); break;
      case 'za':         rows.sort((a, b) => (b.apellido + b.nombre).localeCompare(a.apellido + a.nombre)); break;
      case 'mpps-asc':   rows.sort((a, b) => mppsNumber(a.mpps) - mppsNumber(b.mpps)); break;
      case 'mpps-desc':  rows.sort((a, b) => mppsNumber(b.mpps) - mppsNumber(a.mpps)); break;
    }
    return rows;
  }, [especialistas, especialidadFiltro, disponibilidad, from, to, sort]);

  const activeFieldList = FIELD_DEFS.filter(f => fields.has(f.id));
  const dateInvalid = from && to && from > to;
  const dateMissing = !from || !to;

  let validationMessage: string | null = null;
  if (!fields.size) validationMessage = 'Selecciona al menos un campo para exportar.';
  else if (!type) validationMessage = 'Debes seleccionar un tipo de reporte antes de continuar.';
  else if (dateMissing) validationMessage = 'El rango de fechas es obligatorio para este tipo de reporte.';
  else if (dateInvalid) validationMessage = 'La fecha final debe ser posterior a la inicial.';
  else if (filtered.length === 0) validationMessage = 'Los filtros aplicados no arrojan registros. Ajusta las opciones e intenta nuevamente.';

  const canGenerate = !validationMessage && !loading;

  const toggleField = (id: FieldId) => {
    setFields(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size === 1) {
          toast.warning('Selecciona al menos un campo para exportar.');
          return prev;
        }
        next.delete(id);
      } else next.add(id);
      return next;
    });
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    try {
      const fieldDefs = activeFieldList.map((f, idx) => {
        if (f.id === 'num') return { key: 'num', label: 'Nº', accessor: (_r: Especialista) => idx };
        if (f.id === 'disponible') return { key: 'disponible', label: 'Disponibilidad', accessor: (r: Especialista) => r.disponible ? 'Disponible' : 'No disponible' };
        if (f.id === 'mpps')        return { key: 'mpps', label: 'MPPS', accessor: (r: Especialista) => r.mpps };
        if (f.id === 'nombre')      return { key: 'nombre', label: 'Nombre', accessor: (r: Especialista) => r.nombre };
        if (f.id === 'apellido')    return { key: 'apellido', label: 'Apellido', accessor: (r: Especialista) => r.apellido };
        if (f.id === 'especialidad') return { key: 'especialidad', label: 'Especialidad', accessor: (r: Especialista) => r.especialidad };
        if (f.id === 'pacientes')   return { key: 'pacientes', label: 'Carga de pacientes', accessor: (r: Especialista) => r.pacientes };
        return { key: 'telefono', label: 'Teléfono', accessor: (r: Especialista) => r.telefono };
      });

      // Add correlative number if 'num' included
      const numbered = filtered.map((r, i) => ({ ...r, num: i + 1 } as Especialista & { num: number }));

      const metrics = incluirResumen ? (() => {
        const total = filtered.length;
        const promedio = total > 0 ? (filtered.reduce((a, b) => a + b.pacientes, 0) / total).toFixed(1) : '0';
        const sorted = [...filtered].sort((a, b) => b.pacientes - a.pacientes);
        const mayor = sorted[0];
        const menor = sorted[sorted.length - 1];
        const especialidadesUnicas = Array.from(new Set(filtered.map(f => f.especialidad)));
        return {
          'Total de especialistas': total,
          'Promedio de pacientes': promedio,
          'Especialista con mayor carga': mayor ? `${mayor.nombre} ${mayor.apellido} (${mayor.pacientes})` : '—',
          'Especialista con menor carga': menor ? `${menor.nombre} ${menor.apellido} (${menor.pacientes})` : '—',
          'Especialidades representadas': especialidadesUnicas.join(', '),
        };
      })() : undefined;

      const stamp = new Date().toISOString().slice(0, 10);
      const fileName = `Especialistas_${stamp}`;
      const scopeText = `Reporte: ${REPORT_TYPES.find(t => t.id === type)?.label}`;
      const title = 'Reporte — Especialistas Médicos';

      if (format === 'csv') downloadCSV(fileName, numbered, fieldDefs);
      else if (format === 'xlsx') downloadXLSX(fileName, numbered, fieldDefs, metrics);
      else downloadPDF(fileName, title, scopeText, numbered, fieldDefs, metrics);

      toast.success('Reporte generado correctamente');
      onOpenChange(false);
    } catch (e) {
      toast.error('Error al generar el reporte. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !loading && onOpenChange(o)}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto bg-card border-l border-border">
        <SheetHeader>
          <SheetTitle className="text-foreground">Generar reporte</SheetTitle>
          <SheetDescription className="text-muted-foreground">Exportación de especialistas médicos</SheetDescription>
        </SheetHeader>

        <div className="space-y-5 mt-5">
          <section className="space-y-2">
            <Label className="text-foreground font-semibold">Campos a incluir</Label>
            <div className="border border-border rounded-md p-2 space-y-1">
              {FIELD_DEFS.map(f => (
                <label key={f.id} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <Checkbox checked={fields.has(f.id)} onCheckedChange={() => toggleField(f.id)} />
                  <span>{f.label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <Label className="text-foreground font-semibold">Tipo de reporte <span className="text-destructive">*</span></Label>
            <div className="space-y-1.5">
              {REPORT_TYPES.map(o => (
                <button key={o.id} type="button" onClick={() => setType(o.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-md border text-sm transition-colors',
                    type === o.id
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border text-foreground hover:bg-muted'
                  )}>
                  <div className="font-medium">{o.label}</div>
                  <div className="text-xs text-muted-foreground">{o.description}</div>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <Label className="text-foreground font-semibold">Filtrar por especialidad</Label>
            <Select value={especialidadFiltro} onValueChange={setEspecialidadFiltro}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border border-border z-50">
                <SelectItem value="all">Todas las especialidades</SelectItem>
                {[...especialidades].sort().map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </section>

          <section className="space-y-2">
            <Label className="text-foreground font-semibold">Filtrar por disponibilidad</Label>
            <RadioGroup value={disponibilidad} onValueChange={(v) => setDisponibilidad(v as Disponibilidad)} className="flex flex-col gap-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <RadioGroupItem value="todos" /> Todos
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <RadioGroupItem value="disp" /> Solo disponibles
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <RadioGroupItem value="nodisp" /> Solo no disponibles
              </label>
            </RadioGroup>
          </section>

          <section className="space-y-2">
            <Label className="text-foreground font-semibold">Rango de fechas <span className="text-destructive">*</span></Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Desde</Label>
                <Input type="date" value={from} onChange={e => setFrom(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Hasta</Label>
                <Input type="date" value={to} onChange={e => setTo(e.target.value)} />
              </div>
            </div>
            {dateInvalid && (
              <p className="text-xs text-destructive">La fecha final debe ser posterior a la inicial.</p>
            )}
            <p className="text-[10px] text-muted-foreground">Aplica sobre la fecha de ingreso al sistema.</p>
          </section>

          <section className="space-y-2">
            <Label className="text-foreground font-semibold">Ordenar por</Label>
            <Select value={sort} onValueChange={(v) => setSort(v as SortId)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border border-border z-50">
                {SORT_OPTIONS.map(o => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </section>

          <section className="space-y-2">
            <Label className="text-foreground font-semibold">Formato de salida</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['xlsx', 'csv', 'pdf'] as FormatId[]).map(f => (
                <button key={f} type="button" onClick={() => setFormat(f)}
                  className={cn(
                    'px-3 py-2 rounded-md border text-sm transition-colors',
                    format === f ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border text-foreground hover:bg-muted'
                  )}>
                  {f === 'xlsx' ? 'Excel' : f.toUpperCase()}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <Label className="text-foreground font-semibold">Opciones adicionales</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <label className={cn(
                    'flex items-center gap-2 text-sm cursor-pointer',
                    format === 'csv' && 'opacity-50 cursor-not-allowed'
                  )}>
                    <Checkbox
                      checked={incluirGrafica}
                      disabled={format === 'csv'}
                      onCheckedChange={v => setIncluirGrafica(v === true)}
                    />
                    <span>Incluir gráfica de carga de pacientes</span>
                  </label>
                </TooltipTrigger>
                {format === 'csv' && (
                  <TooltipContent>Las gráficas no están disponibles en formato CSV.</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={incluirResumen} onCheckedChange={v => setIncluirResumen(v === true)} />
              <span>Incluir resumen estadístico</span>
            </label>
          </section>

          <section className="rounded-md bg-muted p-3 text-xs space-y-1">
            <div className="font-semibold text-foreground mb-1">Vista previa estimada</div>
            <div className="flex justify-between"><span className="text-muted-foreground">Alcance:</span><span className="text-foreground">{filtered.length} especialistas</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Campos:</span><span className="text-foreground">{fields.size} de {FIELD_DEFS.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Registros:</span><span className="text-foreground">{filtered.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Formato:</span><span className="text-foreground">{format === 'xlsx' ? 'Excel' : format.toUpperCase()}</span></div>
          </section>

          {validationMessage && (
            <div className="rounded-md border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
              {validationMessage}
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <Button onClick={handleGenerate} disabled={!canGenerate}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generando…</>) : 'Generar reporte'}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="w-full">
              Cancelar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
