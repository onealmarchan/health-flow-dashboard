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
}

export type ExportFormat = 'xlsx' | 'csv' | 'pdf';
export type SortMode = 'recent' | 'oldest' | 'name-asc';
