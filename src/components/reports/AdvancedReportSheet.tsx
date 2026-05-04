import { useEffect, useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import type { ReportableModule, ExportFormat, SortMode } from './types';
import { exportReport } from './exporters';

interface Props<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: ReportableModule<T>;
  selectedIds: Set<string | number>;
  scope: 'selection' | 'all';
}

export function AdvancedReportSheet<T>({ open, onOpenChange, module, selectedIds, scope }: Props<T>) {
  const [fieldKeys, setFieldKeys] = useState<Set<string>>(new Set(module.fields.map(f => f.key)));
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [format, setFormat] = useState<ExportFormat>('xlsx');
  const [includeMetrics, setIncludeMetrics] = useState(false);

  // Reset on open
  useEffect(() => {
    if (open) {
      setFieldKeys(new Set(module.fields.map(f => f.key)));
      setFrom('');
      setTo('');
      setSortMode('recent');
      setFormat('xlsx');
      setIncludeMetrics(false);
    }
  }, [open, module]);

  const baseRows = useMemo(() => {
    if (scope === 'selection') {
      return module.rows.filter(r => selectedIds.has(module.getId(r)));
    }
    return module.rows;
  }, [scope, module, selectedIds]);

  const filteredRows = useMemo(() => {
    let rows = baseRows;
    if (module.dateField && (from || to)) {
      rows = rows.filter(r => {
        const d = module.dateField!.accessor(r);
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      });
    }
    if (sortMode === 'recent' && module.dateField) {
      rows = [...rows].sort((a, b) => module.dateField!.accessor(b).localeCompare(module.dateField!.accessor(a)));
    } else if (sortMode === 'oldest' && module.dateField) {
      rows = [...rows].sort((a, b) => module.dateField!.accessor(a).localeCompare(module.dateField!.accessor(b)));
    } else if (sortMode === 'name-asc') {
      const nameField = module.fields.find(f => /nombre/i.test(f.label) || /paciente/i.test(f.label));
      if (nameField) {
        rows = [...rows].sort((a, b) => String(nameField.accessor(a)).localeCompare(String(nameField.accessor(b))));
      }
    }
    return rows;
  }, [baseRows, module, from, to, sortMode]);

  const activeFields = useMemo(
    () => module.fields.filter(f => fieldKeys.has(f.key)),
    [module.fields, fieldKeys]
  );

  const scopeText = scope === 'selection'
    ? `${selectedIds.size} ${selectedIds.size === 1 ? module.itemSingular : module.itemPlural} seleccionad${selectedIds.size === 1 ? 'o' : 'os'}`
    : `Tabla completa (${module.rows.length} registros)`;

  const isEmpty = filteredRows.length === 0 || activeFields.length === 0;

  const handleGenerate = () => {
    if (isEmpty) {
      toast.warning('Los filtros aplicados no arrojan registros. Ajusta el rango de fechas u otras opciones.');
      return;
    }
    exportReport(format, module, filteredRows, activeFields, {
      scope: scopeText,
      includeMetrics,
    });
    toast.success('Reporte generado correctamente');
    onOpenChange(false);
  };

  const toggleField = (key: string) => {
    setFieldKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto bg-card border-l border-border">
        <SheetHeader>
          <SheetTitle className="text-foreground">Reporte avanzado — {module.name}</SheetTitle>
          <SheetDescription className="text-muted-foreground">{scopeText}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div className={`px-3 py-1.5 rounded-md text-xs font-medium inline-block ${
            scope === 'selection' ? 'bg-primary/15 text-primary' : 'bg-success/15 text-success'
          }`}>
            {scopeText}
          </div>

          <section className="space-y-2">
            <Label className="text-foreground font-semibold">Campos a exportar</Label>
            <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto pr-1">
              {module.fields.map(f => (
                <label key={f.key} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <Checkbox checked={fieldKeys.has(f.key)} onCheckedChange={() => toggleField(f.key)} />
                  <span>{f.label}</span>
                </label>
              ))}
            </div>
          </section>

          {module.dateField && (
            <section className="space-y-2">
              <Label className="text-foreground font-semibold">Rango de fechas ({module.dateField.label})</Label>
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
            </section>
          )}

          <section className="space-y-2">
            <Label className="text-foreground font-semibold">Ordenar por</Label>
            <Select value={sortMode} onValueChange={v => setSortMode(v as SortMode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border border-border z-50">
                <SelectItem value="recent">Fecha más reciente primero</SelectItem>
                <SelectItem value="oldest">Fecha más antigua primero</SelectItem>
                <SelectItem value="name-asc">Nombre ascendente</SelectItem>
              </SelectContent>
            </Select>
          </section>

          <section className="space-y-2">
            <Label className="text-foreground font-semibold">Formato de salida</Label>
            <RadioGroup value={format} onValueChange={v => setFormat(v as ExportFormat)} className="flex gap-2">
              {(['xlsx', 'csv', 'pdf'] as ExportFormat[]).map(f => (
                <label
                  key={f}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm cursor-pointer transition-colors ${
                    format === f ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border text-foreground hover:bg-muted'
                  }`}
                >
                  <RadioGroupItem value={f} className="sr-only" />
                  {f === 'xlsx' ? 'Excel (.xlsx)' : f.toUpperCase()}
                </label>
              ))}
            </RadioGroup>
          </section>

          <section className="space-y-2">
            <Label className="text-foreground font-semibold">Opciones adicionales</Label>
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <Checkbox checked={includeMetrics} onCheckedChange={v => setIncludeMetrics(v === true)} disabled={!module.metrics} />
              <span>Incluir hoja de métricas {!module.metrics && <em className="text-xs text-muted-foreground">(no disponible)</em>}</span>
            </label>
          </section>

          <section className="rounded-md bg-muted p-3 text-xs space-y-1">
            <div className="font-semibold text-foreground mb-1">Vista previa estimada</div>
            <div className="flex justify-between"><span className="text-muted-foreground">Alcance:</span><span className="text-foreground">{scopeText}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Campos:</span><span className="text-foreground">{activeFields.length} de {module.fields.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Registros:</span><span className="text-foreground">{filteredRows.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Formato:</span><span className="text-foreground uppercase">{format}</span></div>
            {includeMetrics && module.metrics && (
              <div className="flex justify-between"><span className="text-muted-foreground">Métricas:</span><span className="text-foreground">Incluidas</span></div>
            )}
          </section>

          {isEmpty && (
            <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Los filtros aplicados no arrojan registros. Ajusta el rango de fechas u otras opciones.</span>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <Button onClick={handleGenerate} className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isEmpty}>
              Generar reporte
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
              Cancelar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
