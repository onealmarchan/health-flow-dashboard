import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useTableSelection } from './useTableSelection';
import { SelectionCheckbox } from './SelectionCheckbox';
import { ContextActionBar } from './ContextActionBar';
import { SplitExportButton } from './SplitExportButton';
import { AdvancedReportSheet } from './AdvancedReportSheet';
import { exportReport, downloadCSV } from './exporters';
import type { ReportableModule } from './types';

interface Args<T> {
  module: ReportableModule<T>;
  visibleRows: T[];
}

/**
 * High-level hook that wires selection + advanced sheet + bar + split button.
 * Returns rendered helpers and the selection state.
 */
export function useReportableTable<T>({ module, visibleRows }: Args<T>) {
  const sel = useTableSelection<string | number>();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [scope, setScope] = useState<'selection' | 'all'>('all');

  const visibleIds = useMemo(() => visibleRows.map(module.getId), [visibleRows, module]);
  const headerState = sel.headerState(visibleIds);

  const HeaderCheckbox = (
    <SelectionCheckbox
      state={headerState}
      onChange={(v) => sel.setAllVisible(visibleIds, v)}
      ariaLabel="Seleccionar todos"
    />
  );

  const RowCheckbox = ({ id }: { id: string | number }) => (
    <SelectionCheckbox
      checked={sel.selectedIds.has(id)}
      onChange={() => sel.toggleRow(id)}
      ariaLabel={`Seleccionar ${id}`}
    />
  );

  const isRowSelected = (id: string | number) => sel.selectedIds.has(id);

  const exportSelected = () => {
    const rows = module.rows.filter(r => sel.selectedIds.has(module.getId(r)));
    if (rows.length === 0) {
      toast.warning('Selecciona al menos un registro para usar esta opción.');
      return;
    }
    exportReport('xlsx', module, rows, module.fields, {
      scope: `${rows.length} ${rows.length === 1 ? module.itemSingular : module.itemPlural} seleccionad${rows.length === 1 ? 'o' : 'os'}`,
      includeMetrics: false,
    });
    toast.success('Reporte generado correctamente');
  };

  const exportAll = () => {
    if (module.rows.length === 0) {
      toast.warning('No hay registros para exportar.');
      return;
    }
    exportReport('xlsx', module, module.rows, module.fields, {
      scope: `Tabla completa (${module.rows.length} registros)`,
      includeMetrics: false,
    });
    toast.success('Reporte generado correctamente');
  };

  const exportAllCSV = () => {
    if (module.rows.length === 0) {
      toast.warning('No hay registros para exportar.');
      return;
    }
    const safe = module.name.replace(/\s+/g, '_');
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCSV(`${safe}_${stamp}`, module.rows, module.fields);
    toast.success('Reporte generado correctamente');
  };

  const openAdvanced = (s: 'selection' | 'all') => {
    if (s === 'selection' && sel.selectedIds.size === 0) {
      toast.warning('Selecciona al menos un registro para usar esta opción.');
      return;
    }
    setScope(s);
    setSheetOpen(true);
  };

  const ContextBar = (
    <ContextActionBar
      count={sel.selectedIds.size}
      itemSingular={module.itemSingular}
      itemPlural={module.itemPlural}
      onClear={sel.clear}
      onAdvanced={() => openAdvanced('selection')}
      onExport={exportSelected}
    />
  );

  const SplitButton = (
    <SplitExportButton
      hasSelection={sel.selectedIds.size > 0}
      onExportTable={exportAll}
      onSelectionReport={() => openAdvanced('selection')}
      onExportAllCSV={exportAllCSV}
      onAdvancedAll={() => openAdvanced('all')}
    />
  );

  const ReportSheet = (
    <AdvancedReportSheet
      open={sheetOpen}
      onOpenChange={setSheetOpen}
      module={module}
      selectedIds={sel.selectedIds}
      scope={scope}
    />
  );

  return {
    HeaderCheckbox,
    RowCheckbox,
    isRowSelected,
    ContextBar,
    SplitButton,
    ReportSheet,
    selectedCount: sel.selectedIds.size,
  };
}
