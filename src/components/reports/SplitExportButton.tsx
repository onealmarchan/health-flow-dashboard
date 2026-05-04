import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Download } from 'lucide-react';

interface Props {
  hasSelection: boolean;
  onExportTable: () => void;
  onSelectionReport: () => void;
  onExportAllCSV: () => void;
  onAdvancedAll: () => void;
}

export function SplitExportButton({ hasSelection, onExportTable, onSelectionReport, onExportAllCSV, onAdvancedAll }: Props) {
  return (
    <div className="inline-flex">
      <Button
        size="sm"
        variant="outline"
        onClick={onExportTable}
        className="rounded-r-none border-r-0"
      >
        <Download className="w-3.5 h-3.5 mr-1.5" />
        Exportar tabla
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="rounded-l-none px-2">
            <ChevronDown className="w-3.5 h-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-popover border border-border z-50">
          <DropdownMenuItem
            disabled={!hasSelection}
            onClick={onSelectionReport}
          >
            Reporte de selección
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onExportAllCSV}>
            Exportar todo (CSV)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onAdvancedAll}>
            Reporte avanzado…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
