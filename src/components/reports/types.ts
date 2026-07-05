export interface ReportField<T> {
  key: string;
  label: string;
  accessor: (r: T) => string | number;
}

export interface ReportableModule<T> {
  name: string;
  itemSingular: string;
  itemPlural: string;
  rows: T[];
  getId: (r: T) => string | number;
  fields: ReportField<T>[];
  dateField?: { accessor: (r: T) => string; label: string };
  metrics?: (rows: T[]) => Record<string, string | number>;
  /** Optional flavor for advanced sheet variant: 'citas' | 'diagnosticos' | undefined */
  advancedVariant?: 'citas' | 'diagnosticos';
  /** Optional handler called when the user imports rows (parsed from CSV/XLSX). */
  onImport?: (rows: any[]) => void;
}

export type ExportFormat = 'xlsx' | 'csv' | 'pdf' | 'docx';
export type AdditionalFormat = 'xlsx' | 'pdf' | 'docx';

export type SortMode =
  | 'alpha-asc'
  | 'alpha-desc'
  | 'date-asc'
  | 'date-desc';
