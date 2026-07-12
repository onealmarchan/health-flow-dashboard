import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { ReportableModule, ExportFormat, SortMode } from './types';
import { exportReport, generarReporteGeneral } from './exporters';
import { AdvancedSheetShell, ReportTypeRadio, AdvancedReportType } from './AdvancedSheetShell';

type CitasReportType = 'general' | 'total' | 'menor' | 'mayor' | 'promedio';

const types: AdvancedReportType<CitasReportType>[] = [
  { id: 'general', label: 'Reporte General', description: 'PDF completo con portada, resumen ejecutivo, métricas y tabla de datos detallada.' },
  { id: 'total', label: 'Total de citas registradas', description: 'Total dentro del rango — desglose por estado.' },
  { id: 'menor', label: 'Volumen menor de citas', description: 'Especialidad con la menor cantidad de citas.' },
  { id: 'mayor', label: 'Volumen mayor de citas', description: 'Especialidad con la mayor cantidad de citas.' },
  { id: 'promedio', label: 'Promedio de citas registradas', description: 'Promedio por especialidad.' },
];

const chartOptions = [
  { id: 'barras', label: 'Barras por especialidad' },
  { id: 'estado', label: 'Distribución por estado de cita' },
  { id: 'evolucion', label: 'Línea de evolución temporal' },
];

interface Props<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: ReportableModule<T>;
  selectedIds: Set<string | number>;
  scope: 'selection' | 'all';
}

export function AdvancedReportSheetCitas<T>({ open, onOpenChange, module, selectedIds, scope }: Props<T>) {
  const [fieldKeys, setFieldKeys] = useState<Set<string>>(new Set(module.fields.map(f => f.key)));
  const [type, setType] = useState<CitasReportType | ''>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [enableSort, setEnableSort] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('date-desc');
  const [format, setFormat] = useState<ExportFormat>('xlsx');
  const [includeMetrics, setIncludeMetrics] = useState(false);
  const [chart, setChart] = useState<string>('barras');

  useEffect(() => {
    if (open) {
      setFieldKeys(new Set(module.fields.map(f => f.key)));
      setType('');
      setFrom(''); setTo('');
      setEnableSort(false); setSortMode('date-desc');
      setFormat('xlsx'); setIncludeMetrics(false); setChart('barras');
    }
  }, [open, module]);

  const baseRows = useMemo(() => {
    if (scope === 'selection') return module.rows.filter(r => selectedIds.has(module.getId(r)));
    return module.rows;
  }, [scope, module, selectedIds]);

  const filteredRows = useMemo(() => {
    let rows = baseRows;
    if (module.dateField && from && to) {
      rows = rows.filter(r => {
        const d = module.dateField!.accessor(r);
        return d >= from && d <= to;
      });
    }
    if (enableSort) {
      const nameField = module.fields.find(f => /paciente|nombre/i.test(f.label));
      if (sortMode === 'alpha-asc' && nameField)
        rows = [...rows].sort((a, b) => String(nameField.accessor(a)).localeCompare(String(nameField.accessor(b))));
      else if (sortMode === 'alpha-desc' && nameField)
        rows = [...rows].sort((a, b) => String(nameField.accessor(b)).localeCompare(String(nameField.accessor(a))));
      else if (sortMode === 'date-asc' && module.dateField)
        rows = [...rows].sort((a, b) => module.dateField!.accessor(a).localeCompare(module.dateField!.accessor(b)));
      else if (sortMode === 'date-desc' && module.dateField)
        rows = [...rows].sort((a, b) => module.dateField!.accessor(b).localeCompare(module.dateField!.accessor(a)));
    }
    return rows;
  }, [baseRows, module, from, to, enableSort, sortMode]);

  const activeFields = useMemo(
    () => module.fields.filter(f => fieldKeys.has(f.key)),
    [module.fields, fieldKeys]
  );

  const scopeText = scope === 'selection'
    ? `${selectedIds.size} ${selectedIds.size === 1 ? module.itemSingular : module.itemPlural} seleccionad${selectedIds.size === 1 ? 'a' : 'as'}`
    : `Tabla completa (${module.rows.length} registros)`;

  const dateRangeInvalid = from && to && from > to;
  const dateRangeMissing = !from || !to;
  const isGeneral = type === 'general';

  let validationMessage: string | null = null;
  if (!type) validationMessage = 'Debes seleccionar un tipo de reporte antes de continuar.';
  else if (!isGeneral && dateRangeMissing) validationMessage = 'El rango de fechas es obligatorio para este tipo de reporte.';
  else if (!isGeneral && dateRangeInvalid) validationMessage = 'La fecha final debe ser posterior a la inicial.';
  else if (activeFields.length === 0) validationMessage = 'Selecciona al menos un campo para exportar.';
  else if (filteredRows.length === 0) validationMessage = 'Los filtros aplicados no arrojan registros. Ajusta las opciones e intenta nuevamente.';

  const canGenerate = !validationMessage;

  const previewLines = [
    { label: 'Alcance', value: scopeText },
    { label: 'Campos', value: `${activeFields.length} of ${module.fields.length}` },
    { label: 'Registros', value: String(filteredRows.length) },
    { label: 'Tipo', value: type ? types.find(t => t.id === type)!.label : '— no seleccionado —' },
    { label: 'Formato', value: isGeneral ? 'PDF (completo con portada)' : format.toUpperCase() },
    ...(!isGeneral && includeMetrics ? [{ label: 'Métricas', value: chartOptions.find(c => c.id === chart)!.label }] : []),
  ];

  const handleGenerate = async () => {
    if (!canGenerate) return;
    if (isGeneral) {
      const metrics = module.metrics ? module.metrics(filteredRows) : {
        'Total registros': filteredRows.length,
      };
      generarReporteGeneral(
        `Reporte General — ${module.name}`,
        scopeText,
        filteredRows,
        activeFields,
        metrics,
        `Reporte_General_${module.name.replace(/\s+/g, '_')}`
      );
    } else {
      await exportReport(format, module, filteredRows, activeFields, {
        scope: scopeText,
        includeMetrics,
      });
    }
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
    <AdvancedSheetShell
      open={open}
      onOpenChange={onOpenChange}
      title="Reporte avanzado — Citas médicas"
      scopeText={scopeText}
      scope={scope}
      fieldOptions={module.fields.map(f => ({ key: f.key, label: f.label }))}
      selectedFields={fieldKeys}
      onToggleField={toggleField}
      from={from} to={to}
      onFromChange={setFrom} onToChange={setTo}
      enableSort={enableSort} onEnableSortChange={setEnableSort}
      sortMode={sortMode} onSortModeChange={setSortMode}
      format={format} onFormatChange={setFormat}
      includeMetrics={includeMetrics} onIncludeMetricsChange={setIncludeMetrics}
      hideFormatAndMetrics={isGeneral}
      metricsExtra={
        !isGeneral ? (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Tipo de gráfico</Label>
            <Select value={chart} onValueChange={setChart}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border border-border z-50">
                {chartOptions.map(o => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        ) : undefined
      }
      previewLines={previewLines}
      validationMessage={validationMessage}
      canGenerate={canGenerate}
      onGenerate={handleGenerate}
    >
      <ReportTypeRadio<CitasReportType> value={type} onChange={(v) => setType(v)} options={types} />
    </AdvancedSheetShell>
  );
}
