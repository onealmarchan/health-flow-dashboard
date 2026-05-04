## Plan: Dashboard Pacientes, Buscar Paciente y Componente de Reportes

### 1) Dashboard — Tabla de Pacientes rediseñada

Archivo: `src/components/dashboard/PatientTable.tsx` (reescrito).

**Fuente de datos compartida**: extraer `allPatients` de `CitasPage.tsx` a un nuevo módulo `src/data/patientsStore.ts`:

```ts
export type Patient = {
  num: number; ci: string; nombres: string; apellidos: string;
  fechaNac: string; sexo: 'M'|'F'; direccion: string; telefono: string;
  nacionalidad: 'Venezolano'|'Extranjero'; estadoCivil: string;
  estado: 'Activo'|'Encamado';
  comunidad: string; estadoGeo: string; municipio: string; parroquia: string;
};
let _patients: Patient[] = [...]; // datos seed (los 4 actuales + comunidad/municipio/parroquia)
export const getPatients = () => _patients;
export const addPatient = (p: Patient) => { _patients = [..._patients, p]; emit(); };
// pequeño pub/sub con useSyncExternalStore para que las tablas re-rendericen
export const usePatients = () => useSyncExternalStore(subscribe, getPatients, getPatients);
```

**Columnas de la tabla del Dashboard**:

```text
[ ☐ ] | Nº | C.I. | Nombres | Apellidos | Detalles Complementarios 👁 | Detalles Comunitarios 👁 | Estado
```

- Botón ojo (`Eye` de `lucide-react`, `variant="ghost"`) en cada fila para cada bloque de detalles.
- **Modal "Detalles Complementarios"**: Fecha de Nacimiento, Edad (calculada), Sexo (Masculino/Femenino), Dirección, Teléfono, Nacionalidad, Estado Civil.
- **Modal "Detalles Comunitarios"**: Nº, Comunidad, Estado, Municipio, Parroquia.
- Columna **Estado**: badge `Activo` (verde) / `Encamado` (warning).
- Mantener filtros existentes adaptados (búsqueda por nombre/CI; filtro por Estado Activo/Encamado; filtro por Comunidad).

### 2) Modal "Registrar Nuevo Paciente" — Nacionalidad como Selector

Archivo: `src/components/pages/CitasPage.tsx`.

- Línea ~510: reemplazar `Input` por `Select` con opciones `Venezolano` / `Extranjero`.
- Agregar campos de ubicación al estado `newPatient`: `comunidad`, `estadoGeo`, `municipio`, `parroquia` (los inputs ya existen en sección "Ubicación", solo conectarlos).
- Al guardar paciente nuevo: llamar `addPatient(...)` del store; el paciente aparecerá en la tabla "Buscar Paciente" y en el Dashboard.
- Tabla de "Buscar Paciente" pasa a leer del store (`usePatients()`).
- En la tabla principal de Citas (`appointments`), al confirmar una cita nueva, hacer `setAppointments([...prev, { id, patient: 'Nombres Apellidos', doctor, specialty, date, time, status: 'pendiente' }])`. Solo esos 6 campos visibles.

### 3) Componente reutilizable de Reportes

Nuevos archivos en `src/components/reports/`:

- `ReportsProvider.tsx` — contexto con `selection` (Set de IDs), helpers `toggle/clear/selectAll/setAll`, y metadata del módulo.
- `useTableReports.ts` — hook que expone `selectedIds`, `isAllSelected`, `isIndeterminate`, `toggleRow`, `toggleAll(visibleIds)`, `clear`.
- `SelectionCheckbox.tsx` — checkbox con estado `indeterminate` (usa `<Checkbox>` de shadcn + ref para `data-state="indeterminate"`).
- `ContextActionBar.tsx` — barra info que aparece con `animate-fade-in slide-in-from-top-2` cuando `selectedIds.size > 0`. Botones: `Limpiar`, `Avanzado`, `Exportar` (toast verde de éxito).
- `SplitExportButton.tsx` — botón dividido (acción principal "Exportar tabla" + `DropdownMenu` con: Reporte de selección / Exportar todo (CSV) / Reporte avanzado…). Item "Reporte de selección" `disabled` si selección vacía.
- `AdvancedReportSheet.tsx` — `Sheet` lateral derecho (shadcn `sheet`) con:
  - Header: "Reporte avanzado — {moduleName}" + subtítulo de alcance + ✕.
  - Indicador de alcance (badge azul/verde).
  - **Campos a exportar**: lista de `Checkbox` por columna (todas marcadas).
  - **Rango de fechas** (desde/hasta) sólo si `module.dateField` definido.
  - **Ordenar por**: `Select` (recientes / antiguos / nombre asc).
- **Formato**: `RadioGroup` pills `PDF | Excel (.xlsx) | CSV` .
  - **Opciones**: checkbox "Incluir hoja de métricas".
  - **Vista previa estimada** (bloque `bg-muted` que se actualiza en tiempo real con: alcance, # campos, # registros estimados, formato, métricas sí/no).
  - Footer: `Generar reporte` (primary) + `Cancelar`.
  - Si registros estimados = 0 → alerta inline amarilla y no genera.
  - Estado se resetea a defaults en cada apertura.

**Configuración por módulo** (`ReportableModule`):

```ts
interface ReportableModule<T> {
  name: string;            // "Pacientes"
  itemSingular: string;    // "paciente"
  itemPlural: string;      // "pacientes"
  rows: T[];
  getId: (r: T) => string|number;
  fields: { key: keyof T|string; label: string; accessor: (r: T) => string|number }[];
  dateField?: { accessor: (r: T) => string; label: string };
  metrics?: (rows: T[]) => Record<string, string|number>;
}
```

**Generadores**:

- CSV: construir manual `;`-separado, descargar via `Blob`.
- Excel (.xlsx): usar `xlsx` (SheetJS). Agregar dependencia `xlsx`. Si `incluirMetricas`, agregar segunda hoja "Métricas".
- PDF: usar `jspdf` (ya instalado) + `jspdf-autotable` (agregar dependencia) para tabla. Hoja de métricas como página adicional.

**Integraciones**:

1. **Dashboard PatientTable** — agregar columna inicial de checkboxes, `SplitExportButton` en header, `ContextActionBar` debajo; sin filtro de fechas.
2. **CitasPage** — tabla "Próximas Citas Médicas" con columnas `Paciente|Doctor|Especialidad|Fecha|Hora|Estado`. Date field = `date`.
3. **DiagnosticosPage** — tabla principal. Date field = `fechaDiagnostico`. `metrics` cuenta `critico=true` y % sobre exportados.

### 4) Detalles técnicos

- **Checkbox indeterminado**: `<Checkbox>` shadcn ya soporta `checked="indeterminate"`. Usar `useEffect` + ref si es necesario.
- **Selección por página**: como las tablas no paginan actualmente, la selección aplica a las filas filtradas visibles.
- **z-index**: `Sheet` de shadcn ya gestiona overlay correctamente; no abrir sobre otros modales (chequear `document.querySelector('[role="dialog"][data-state="open"]')` antes de abrir; si existe → toast warning y no abrir).
- **Alertas**: usar `sonner` (`toast.success`, `toast.warning`) coherente con resto del sistema.
- **Estilo**: reutilizar `chart-container`, `bg-info/10`, `text-primary`, `border-primary/30` del tema; checkboxes y botones shadcn existentes; sin estilos nuevos.
- **Datos de prueba**: añadir 2-3 registros más en Dashboard/Citas/Diagnósticos para que los reportes generados tengan contenido demostrable.

### 5) Archivos a crear/modificar

- **Crear**: `src/data/patientsStore.ts`, `src/components/reports/{ReportsProvider,SelectionCheckbox,ContextActionBar,SplitExportButton,AdvancedReportSheet,useTableReports,exporters}.tsx/.ts`.
- **Modificar**: `src/components/dashboard/PatientTable.tsx` (reescribir), `src/components/pages/CitasPage.tsx` (Nacionalidad → Select, store wiring, integrar reportes en tabla de citas), `src/components/pages/DiagnosticosPage.tsx` (integrar reportes).
- **Dependencias nuevas**: `xlsx`, `jspdf-autotable`.

### Resultado esperado

- Dashboard muestra tabla con columnas pedidas y dos modales 👁 funcionales.
- Registrar paciente persiste en memoria y aparece en Buscar Paciente, tabla de Citas y Dashboard.
- Toda tabla integrada exhibe checkbox-column, barra contextual animada, split button y panel lateral de reporte avanzado con vista previa en tiempo real, exportando en CSV/XLSX/PDF (con hoja de métricas opcional).