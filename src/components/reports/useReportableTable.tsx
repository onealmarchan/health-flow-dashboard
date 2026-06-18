import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useTableSelection } from './useTableSelection';
import { SelectionCheckbox } from './SelectionCheckbox';
import { ContextActionBar } from './ContextActionBar';
import { SplitExportButton } from './SplitExportButton';
import { AdvancedReportSheetCitas } from './AdvancedReportSheetCitas';
import { AdvancedReportSheetDiagnosticos } from './AdvancedReportSheetDiagnosticos';
import { exportMulti } from './exporters';
import type { ReportableModule, AdditionalFormat } from './types';

interface Args<T> {
  module: ReportableModule<T>;
  visibleRows: T[];
}

export function useReportableTable<T>({ module, visibleRows }: Args<T>) {
  const sel = useTableSelection<string | number>();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [scope, setScope] = useState<'selection' | 'all'>('all');

  const supportsAdvanced = module.advancedVariant === 'citas' || module.advancedVariant === 'diagnosticos';

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

  const exportRows = async (additional: AdditionalFormat[]) => {
    const useSelection = sel.selectedIds.size > 0;
    const rows = useSelection
      ? module.rows.filter(r => sel.selectedIds.has(module.getId(r)))
      : module.rows;
    if (rows.length === 0) {
      toast.warning('No hay registros para exportar.');
      return;
    }
    const scopeText = useSelection
      ? `${rows.length} ${rows.length === 1 ? module.itemSingular : module.itemPlural} seleccionad${rows.length === 1 ? 'o' : 'os'}`
      : `Tabla completa (${rows.length} registros)`;
    await exportMulti(additional, module, rows, module.fields, { scope: scopeText, includeMetrics: false });
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
      showAdvanced={supportsAdvanced}
    />
  );

  const SplitButton = (
    <SplitExportButton
      showAdvanced={supportsAdvanced}
      onExport={exportRows}
      onAdvancedAll={() => openAdvanced('all')}
    />
  );

  const ReportSheet = supportsAdvanced ? (
    module.advancedVariant === 'citas' ? (
      <AdvancedReportSheetCitas
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        module={module}
        selectedIds={sel.selectedIds}
        scope={scope}
      />
    ) : (
      <AdvancedReportSheetDiagnosticos
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        module={module}
        selectedIds={sel.selectedIds}
        scope={scope}
      />
    )
  ) : null;

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
