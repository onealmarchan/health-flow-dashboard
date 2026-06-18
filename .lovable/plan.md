## Plan: Sistema de Exportación/Reportes + Rediseño Dashboard

### Parte A — Componente de Exportación y Reportes (4 módulos)

**A1. Refactor del sistema actual de reportes** (`src/components/reports/`)

Reescribir/extender los componentes existentes (`SplitExportButton`, `ContextActionBar`, `AdvancedReportSheet`, `exporters.ts`) para cumplir la nueva especificación, conservando la integración con `useTableSelection` y `useReportableTable` ya funcional.

- `exporters.ts`: agregar soporte para **DOCX** (vía `docx` npm) además de CSV/XLSX/PDF ya soportados. Exponer `exportMulti(formats[], data, fields)` que genera 1 archivo por formato.
- `SplitExportButton.tsx`: rediseñar dropdown con:
  - Bloque "Formato predeterminado": `[✓] CSV` fijo (disabled).
  - Bloque "Formatos adicionales": `[ ] XLSX`, `[ ] PDF`, `[ ] DOCX` (reset al cerrar).
  - Ítem condicional `Reporte avanzado…` (solo Citas/Diagnósticos).
  - Botón izq ejecuta exportación (selección si hay, tabla completa si no) con todos los formatos marcados + CSV.
- `ContextActionBar.tsx`: 
  - Animación slide/fade (Tailwind `data-[state]` + transition).
  - Texto pluralizado por módulo (`pacientes/citas/diagnósticos`).
  - Botón **Limpiar** (ghost) + **Avanzado** (solo Citas/Diagnósticos).
  - Sin botón de exportar propio.

**A2. Modal lateral de Reporte Avanzado — Citas** (`AdvancedReportSheetCitas.tsx`)

Sheet derecha (390–420px) usando `@/components/ui/sheet`. Secciones:
- Indicador de alcance (pill azul/verde).
- Campos a exportar (checkboxes, todos marcados por defecto).
- **Tipo de reporte** (radio pills, obligatorio): Total citas / Volumen menor / Volumen mayor / Promedio — todos por especialidad.
- Rango de fechas Desde/Hasta (obligatorio, validación Hasta ≥ Desde).
- "Ordenar resultados" (checkbox + selector condicional: A→Z, Z→A, cronológico asc/desc).
- Formato de salida (radio pills, XLSX default): XLSX/CSV/PDF/DOCX.
- "Incluir métricas y gráficos" (checkbox + sub-panel con tipo de gráfico coherente: barras por especialidad, distribución por estado, evolución temporal).
- **Vista previa estimada** (bloque neutro, actualización reactiva).
- Pie: Generar reporte (primario) / Cancelar.

**A3. Modal lateral de Reporte Avanzado — Diagnósticos** (`AdvancedReportSheetDiagnosticos.tsx`)

Misma estructura, con diferencias:
- Tipos: Total diagnósticos (requiere selector de enfermedad) / Volumen menor / Volumen mayor / Promedio por especialidad.
- Selector adicional de enfermedad cuando tipo = Total.
- Campos coherentes con tabla Diagnósticos.
- Gráficos: distribución por enfermedad, % críticos, evolución temporal.

**A4. Drawer de Exportación — Médicos** (`EspecialistasExportDrawer.tsx`)

Nuevo drawer (no usa split button ni context bar). Disparador: botón **Exportar** en barra superior de `EspecialistasPage`.
- Campos a incluir (8 checkboxes con defaults indicados; teléfono y disponibilidad OFF; validación "al menos uno").
- Tipo de reporte (4 opciones, obligatorio).
- Filtrar por especialidad (select; "Todas" default).
- Filtrar por disponibilidad (radio: Todos/Disponibles/No disponibles).
- Rango de fechas obligatorio sobre fecha de ingreso.
- Ordenar por (6 opciones, default "Mayor carga"). MPPS ordenado por sufijo numérico.
- Formato: Excel default / CSV / PDF.
- Opciones: "Incluir gráfica de carga" (deshabilitada si CSV) + "Incluir resumen estadístico".
- Vista previa estimada en tiempo real.
- Estados: idle/loading ("Generando…")/success/error.

**A5. Alertas y notificaciones** (Parte 5)

Usar `sonner` para toasts (éxito verde, error rojo, advertencia amarilla) y mensajes inline dentro de paneles para validaciones de campos. Mensajes exactos según spec.

**A6. Integración por módulo**

- `PatientTable.tsx` (Dashboard / Pacientes): split button (CSV/XLSX/PDF/DOCX) + barra contextual **sin** botón Avanzado.
- `CitasPage.tsx`: split button con "Reporte avanzado…" + barra con Avanzado + modal Citas.
- `DiagnosticosPage.tsx`: split button con "Reporte avanzado…" + barra con Avanzado + modal Diagnósticos.
- `EspecialistasPage.tsx`: botón "Exportar" en header → drawer dedicado. Sin checkboxes/selección.

---

### Parte B — Modificaciones del Dashboard

**B1. Modal "Configurar KPIs"** (`KPIConfigModal.tsx`)

Reemplaza el selector inline actual. Contiene:
- Checkboxes de tipo: Aleatorio (default ON) / Mensual / Trimestral / Bimensual / Semestral o Anual.
- Clasificación interna de KPIs por tipo (según spec).
- Selector numérico cuyo máximo se recalcula según los tipos marcados.
- Aplicar → actualiza el grid del Dashboard con redistribución proporcional.

**B2. Nuevos KPIs** (en `src/components/dashboard/`)

- `EarlyDetectionGauge.tsx` — donut/gauge 0–100% con bandas rojo/amarillo/verde y aguja.
- `GeographicComorbidityMap.tsx` — choropleth con `react-simple-maps` (nueva dep), tooltip con región/valor/variación.
- `AgeGroupTrendChart.tsx` — barras agrupadas o líneas múltiples (recharts ya disponible), series 0-12/13-18/19-59/60+, tooltip con valores y %.

Reemplazos: 1ª "Vista Reservada" → `EarlyDetectionGauge`; 2ª "Vista Reservada" → `GeographicComorbidityMap`; nuevo slot → `AgeGroupTrendChart`.

**B3. Sistema de slots con navegación secuencial** (`KPIWrapper.tsx`)

Cada slot del grid recibe un array de KPIs asignados.
- Estado interno `currentIndex` por slot.
- Botones header: primer KPI `[→]`; intermedios `[← →]`; último `[← 🔄]`.
- `[🔄]` reinicia a índice 0.

**B4. Botón de exportación por tarjeta** (`KPIExportPopover.tsx`)

En header de `KPIWrapper`, junto a navegación:
```
[ ← ] [ → ] | [ ⬇ ]
```
Divisor 1px `border-tertiary`. Ícono ⬇ con estilo neutral.

Popover (borde `border-info`):
- Header: "Exportar · {nombre KPI activo}".
- Chips toggle: PNG / PDF / DOCX (al menos 1 para habilitar).
- Separador.
- Checkbox "Incluir resumen de datos" (genera narrativa según tipo de KPI).
- Botón primario "Generar informe" (`bg-info`/`border-info`); 1 archivo por formato marcado.

Implementación: PNG vía `html-to-image`, PDF vía `jspdf` (ya instalado) + canvas, DOCX vía `docx`.

---

### Detalles técnicos

**Dependencias nuevas:** `docx`, `react-simple-maps`, `html-to-image`. (Ya disponibles: `xlsx`, `jspdf`, `jspdf-autotable`, `recharts`.)

**Archivos nuevos:**
- `src/components/reports/AdvancedReportSheetCitas.tsx`
- `src/components/reports/AdvancedReportSheetDiagnosticos.tsx`
- `src/components/reports/EspecialistasExportDrawer.tsx`
- `src/components/reports/reportTypes.ts` (catálogos, mensajes de alerta)
- `src/components/dashboard/KPIConfigModal.tsx`
- `src/components/dashboard/EarlyDetectionGauge.tsx`
- `src/components/dashboard/GeographicComorbidityMap.tsx`
- `src/components/dashboard/AgeGroupTrendChart.tsx`
- `src/components/dashboard/KPIExportPopover.tsx`
- `src/components/dashboard/kpiCatalog.ts` (clasificación por tipo)
- `src/data/especialistasStore.ts` (si necesario para mocks compartidos)

**Archivos modificados:**
- `src/components/reports/{SplitExportButton,ContextActionBar,AdvancedReportSheet,exporters}.tsx/ts`
- `src/components/dashboard/{DashboardContent,KPIWrapper,PatientTable}.tsx`
- `src/components/pages/{CitasPage,DiagnosticosPage,EspecialistasPage}.tsx`

**Mocks:** datos médicos coherentes en español (especialidades, enfermedades, regiones de Venezuela para choropleth).

**Reglas de comportamiento global:** stacking de modales (no abrir si otro modal activo), selección reseteada al paginar, no alterar filtros/búsqueda existentes, estética consistente con tokens del sistema (sin colores hardcoded).
