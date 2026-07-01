
# Plan de cambios

## 1. Especialistas Médicos
- Eliminar el segmented control `[Tarjetas] [Análisis]` y el estado `view` en `EspecialistasPage.tsx`. La página vuelve a mostrar únicamente el grid de tarjetas.
- Borrar los archivos `src/components/pages/especialistas/AnalysisView.tsx`, `SpecialistList.tsx`, `ViolinPlot.tsx`. Se mantiene `DivergingBar.tsx` y `utils.ts` (utilizados en el Dashboard).
- Añadir barra de búsqueda dinámica arriba del grid (input con icono `Search`) que filtra en vivo por nombre, especialidad o MPPS.
- Añadir botón `Filtros` (icono `SlidersHorizontal`) que abre un `Popover` con: especialidad (multi-select), disponibilidad, rango de pacientes (min/max).

## 2. Dashboard
- Eliminar por completo `GeographicComorbidityMap.tsx` (archivo + referencias en `kpiCatalog.ts` y `DashboardContent.tsx`).
- Registrar un nuevo KPI `"diverging-bar"` en `kpiCatalog.ts` que renderiza `<DivergingBar />` (leyendo `especialistasStore`). Ocupa el mismo slot que ocupaba el mapa de comorbilidad, con el mismo tamaño/wrapper (`KPIWrapper`), navegación rotatoria y export intactos.
- Título del KPI: "Ratio de pacientes vs Meta por Especialidad".

## 3. Usuarios
- `UsuariosPage.tsx`: reemplazar columnas por  
  `Nº | Correo electrónico | Nombre completo | Rol | Miembro desde | Última actualización | Estado`.
- Ajustar el mock de usuarios (o `usuariosStore` si existe) con esos campos (`email`, `nombreCompleto`, `rol`, `miembroDesde`, `ultimaActualizacion`, `estado`). Rol limitado a "Administrador" / "Auxiliar Administrativo". Estado como Badge (Activo/Inactivo).
- Añadir barra de búsqueda dinámica + botón `Filtros` (rol, estado, rango de fecha "miembro desde").

## 4. Historial de Cambios
- Renombrar en el sidebar y en el título de la página: `"Historias de Cambios"` → `"Historial de Cambios"` (buscar todas las cadenas en `Sidebar.tsx`, `AuditoriasPage.tsx`, `pageComponents` labels).
- Reemplazar la tabla actual por:  
  `Sección | Registro afectado | Acción realizada | Cambio realizado | Responsable | Fecha y hora`.
- Actualizar mock data acorde (acciones: Crear/Editar/Eliminar; "Cambio realizado" como texto libre tipo `campo: antes → después`).

## 5. Control de Diagnósticos
- Unificar el diseño visual con las tablas del resto del sistema (mismo `Table` de shadcn con header `bg-muted`, filas con `hover:bg-muted/50`, badges y tipografía coincidentes con `PatientTable`).
- Añadir barra de búsqueda dinámica (paciente, diagnóstico, CIE-10) + botón `Filtros` (severidad, estado, especialidad).

## 6. Búsquedas, Filtros y Rango de fechas — componentes reutilizables
- Crear `src/components/shared/SearchBar.tsx` (input con icono, `value/onChange`, placeholder configurable).
- Crear `src/components/shared/FiltersButton.tsx` (Popover con children configurables por página; footer con "Limpiar" / "Aplicar").
- Crear `src/components/shared/DateRangeButton.tsx` (Popover con `Calendar mode="range"` de shadcn) usado en **Citas Médicas**.
- Integrar:
  - Jornadas Médicas → botón `Filtros`.
  - Especialistas → búsqueda + `Filtros`.
  - Control de Diagnósticos → búsqueda + `Filtros`.
  - Usuarios → búsqueda + `Filtros`.
  - Citas Médicas → botón `Rango de fechas`.

## 7. Ajustes y Temas
- Nueva página `src/components/pages/AjustesPage.tsx` con sección **Apariencia**:
  - Mueve la selección completa de los 8 temas (4 claros / 4 oscuros) desde `Header.tsx`.
  - Añade dos selectores: "Tema claro preferido" (entre los 4 claros) y "Tema oscuro preferido" (entre los 4 oscuros). Se guardan en `localStorage` (`preferredLightTheme`, `preferredDarkTheme`).
- Sidebar: nuevo item "Ajustes" (icono `Settings`).
- `ThemeContext`:
  - Añadir `mode: 'light' | 'dark'`, `preferredLight`, `preferredDark`, `toggleMode()`.
  - `toggleMode()` cambia entre el tema claro y el oscuro preferidos y dispara la animación.
- Header: eliminar el dropdown de paleta; sustituir por botón animado tipo toggle (icono `Sun`/`Moon` con transición) que llama a `toggleMode()`.
- **Animación ECG**: componente `src/components/theme/ECGTransition.tsx` que renderiza un overlay `fixed inset-0 pointer-events-none z-[100]` con un SVG de una línea de electrocardiograma que se dibuja de izquierda a derecha (~800 ms, `stroke-dasharray`/`stroke-dashoffset`). Se monta al cambiar de modo y se desmonta al terminar. Color del trazo: `hsl(var(--primary))`.

## 8. Nuevas páginas
- `src/components/pages/FAQPage.tsx` — placeholder con título "Preguntas Frecuentes" y texto "Próximamente".
- `src/components/pages/HelpDeskPage.tsx` — placeholder con título "Help Desk" y texto "Próximamente".
- Registrar ambas en `Sidebar.tsx` y en `pageComponents` de `Index.tsx`.

## 9. Acceso Denegado
- Nueva ruta fija `/acceso-denegado` en `App.tsx` → `src/pages/AccesoDenegado.tsx`.
- Layout centrado (viewport completo, fondo del tema).
- Ilustración animada: SVG de una cruz médica + latido (pulse) o estetoscopio con animación CSS suave. Debajo, texto grande: **"ACCESO DENEGADO"** en `text-5xl md:text-7xl font-bold text-destructive`, con subtítulo "No tienes permisos para ver esta página".
- Sin enlace desde el sidebar; accesible solo por URL directa.

---

## Detalles técnicos

- **Sin backend**. Todo con stores en memoria (`patientsStore`, `especialistasStore`, `appointmentsStore` + nuevos `usuariosStore`, `historialStore`).
- **Búsquedas/filtros**: memoización con `useMemo` sobre los stores; sin debounce (dataset pequeño).
- **Consistencia visual**: reutilizar `Table`, `Badge`, `Button`, `Popover`, `Calendar`, `Input` de shadcn ya presentes; respetar tokens semánticos del `ThemeContext`.
- **ThemeContext**: mantener compatibilidad con las 8 clases existentes (`theme-*`). Sólo se añade encima el concepto `mode` + preferidos.
- **ECG overlay**: implementado con Tailwind + un keyframe `@keyframes ecg-sweep` inyectado en `index.css` (o clase utilitaria); duración 800ms, `ease-out`, se autodestruye con `onAnimationEnd`.
- **Ruta Acceso Denegado**: se agrega antes del `path="*"` en `App.tsx`.
- **Renombrado "Historias" → "Historial"**: aplicar en `Sidebar.tsx`, en el título dentro de `AuditoriasPage.tsx` y en cualquier `label`/`breadcrumb` visible. La key interna de `pageComponents` (`auditorias`) se mantiene para no romper referencias.
- **Eliminaciones**: `GeographicComorbidityMap.tsx`, `AnalysisView.tsx`, `SpecialistList.tsx`, `ViolinPlot.tsx` se borran con `rm`.

## Fuera de alcance
- Autenticación real / lógica de permisos que redirija a `/acceso-denegado`.
- Contenido real de FAQ y Help Desk.
- Persistencia en base de datos.
