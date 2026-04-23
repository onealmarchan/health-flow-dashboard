

## Rediseño del Modal "Agregar Jornada" — Layout de 4 cuadrantes con bloqueos

Reemplazaré el modal actual de `JornadasPage.tsx` (formulario simple) por una pantalla amplia organizada en 4 cuadrantes con calendario visual, edición semanal y gestión de bloqueos.

### Estructura general del modal

- `DialogContent` ampliado: `max-w-[95vw] w-[95vw] h-[92vh] flex flex-col` + botón **X** nativo en esquina superior derecha (ya provisto por shadcn `Dialog`).
- **Header (sticky superior)**: dos selectores alineados a la izquierda en una fila, separados con `gap-6`:
  1. **Médico** (`Select` con lista de doctores existentes; muestra MPPS + Nombre + Especialidad).
  2. **Mes / Año** (dos `Select` lado a lado: meses Enero–Diciembre, años actual a +2).
- **Body**: grid `grid-cols-2 grid-rows-2 gap-4 flex-1 overflow-hidden` con los 4 cuadrantes. Cada cuadrante usa `bg-card border border-border rounded-lg p-4 overflow-auto`.
- **Footer (sticky inferior)**: alineado a la derecha → botones **Guardar todo** (primario) y **Cancelar** (outline). Cada uno dispara `ConfirmDialog` ("¿Estás seguro?").

### Cuadrante 1 (superior izq.) — Calendario mensual visual

- Tabla `grid-cols-7` con encabezado **Dom Lun Mar Mié Jue Vie Sáb**.
- Cada celda = botón circular `w-10 h-10 rounded-full border border-border` con el número del día.
- Colores (única leyenda):
  - **Blanco** (`bg-background`) = disponible.
  - **Rojo** (`bg-destructive text-destructive-foreground`) = bloqueado.
- Click en día rojo → abre el modal secundario "Bloquear Día" precargado con esos datos para editar/eliminar.
- Click en día blanco → sin acción.
- Cambio de mes/año en el header → recálculo automático de colores leyendo `bloqueos[]`.
- **Leyenda** debajo del calendario: dos chips (Disponible / Bloqueado).

### Cuadrante 2 (superior der.) — Edición de jornada por semana

- Selector de semana en la parte superior: `◀  "Semana del 6 al 12 de Abril 2026"  ▶` (botones ghost con `ChevronLeft`/`ChevronRight`).
- Tabla con columnas: **Día | Turno | Hora Inicio | Hora Fin | Acciones**.
- 7 filas (Lun → Dom), cada una con:
  - Día abreviado + número (ej. "Lun 6").
  - `Select` Turno (Mañana / Tarde / Noche / vacío).
  - `Input type="time"` Hora Inicio (habilitado solo si hay turno).
  - `Input type="time"` Hora Fin (habilitado solo si hay hora inicio).
  - **Acciones**: ✏️ `Edit` (guarda cambios de la fila al estado `weekSchedule`) y 🚫 `Ban` (abre modal secundario "Bloquear Día").

### Modal secundario "Bloquear Día"

- `Dialog` anidado, `max-w-md`, con su propia X.
- Campos:
  - **Fecha Inicio**: `Input type="date"` precargado con la fecha de la fila, `readOnly`/`disabled`.
  - **Fecha Fin**: `Input type="date"` libre (mínimo = fecha inicio).
  - **Razón**: `Select` (Vacaciones, Permiso, Reposo, Cirugía, Capacitación, Congreso, Mantenimiento, Rotación, Otro).
  - **Observaciones**: `Textarea` opcional.
- Footer: **Guardar** + **Cancelar**.
- Al guardar:
  1. Inserta/actualiza objeto en estado `bloqueos[]`.
  2. Calendario (Cuadrante 1) repinta en rojo todas las fechas en el rango.
  3. Cuadrante 4 (lista) refresca automáticamente.

### Cuadrante 3 (inferior izq.) — Resumen estadístico (placeholder)

- 4 filas con etiquetas y valor vacío (`—`):
  - Horas regulares
  - Horas semanales
  - Días bloqueados
  - Días hábiles
- Estilo: lista con `flex justify-between` por fila, separadores sutiles. Reservado para lógica futura.

### Cuadrante 4 (inferior der.) — Lista de bloqueos programados

- Vacío inicialmente (mensaje "Sin bloqueos registrados") hasta que se cree uno.
- Tabla con columnas: **Fecha Inicio | Fecha Fin | Razón | Observaciones | Acciones**.
- Acciones por fila:
  - ✏️ `Edit` → reabre el modal "Bloquear Día" con datos cargados.
  - 🗑️ `Trash2` → elimina del array `bloqueos[]` (con `ConfirmDialog`); calendario refresca (días vuelven a blanco si no hay otro bloqueo cubriéndolos).

### Diagrama del layout

```text
┌─ Modal Agregar Jornada ─────────────────────────────── X ─┐
│ [Médico ▼]   [Mes ▼] [Año ▼]                              │
├──────────────────────────┬────────────────────────────────┤
│ 1. Calendario mensual    │ 2. ◀ Semana 6-12 Abr 2026 ▶   │
│   D L M M J V S          │ ┌──────────────────────────┐  │
│   ○ ● ○ ○ ○ ○ ○          │ │Día│Turno│Ini│Fin│Acción │  │
│   ○ ○ ○ ● ○ ○ ○          │ │Lun│ ▼   │   │   │✏️ 🚫  │  │
│   ...                    │ │...│     │   │   │       │  │
│   ⚪ Disp · 🔴 Bloq       │ └──────────────────────────┘  │
├──────────────────────────┼────────────────────────────────┤
│ 3. Resumen               │ 4. Bloqueos programados        │
│   Horas regulares: —     │  Fec.Ini│Fec.Fin│Razón│Obs│Act │
│   Horas semanales: —     │  ...                           │
│   Días bloqueados: —     │                                │
│   Días hábiles:    —     │                                │
├──────────────────────────┴────────────────────────────────┤
│                          [Guardar todo]  [Cancelar]       │
└───────────────────────────────────────────────────────────┘
```

### Detalles técnicos

- **Archivo único modificado**: `src/components/pages/JornadasPage.tsx`. La tabla principal "Jornadas Registradas" y el botón "Agregar Jornada" se mantienen.
- Nuevos estados (todos `useState` locales, mock):
  - `selectedMpps: string`
  - `calMonth: number`, `calYear: number`
  - `weekOffset: number` (índice de semana dentro del mes)
  - `weekSchedule: Record<string, { turno, horaInicio, horaFin }>` (clave = `YYYY-MM-DD`)
  - `bloqueos: Bloqueo[]` con `{ id, fechaInicio, fechaFin, razon, observaciones }`
  - `blockModal: { open, editingId, fechaInicio (locked), fechaFin, razon, observaciones }`
- **Helpers**:
  - `buildMonthGrid(year, month)` → matriz 6×7 con padding de días vacíos al inicio.
  - `isDateBlocked(dateStr, bloqueos)` → recorre rangos.
  - `getWeekRange(year, month, offset)` → devuelve `{ start, end, days[] }` para el cuadrante 2.
  - `formatRange()` para el subtítulo "Semana del X al Y de Mes Año".
- **UI components reutilizados**: `Dialog`, `Select`, `Input`, `Textarea`, `Button`, `Label`, `ConfirmDialog`. Iconos: `ChevronLeft`, `ChevronRight`, `Edit`, `Ban`, `Trash2`, `X` (de `lucide-react`).
- **Integración con calendario**: cada cambio en `bloqueos` recalcula colores del cuadrante 1 vía función pura (sin `useEffect` adicional).
- **Confirmaciones**: "Guardar todo", "Cancelar", eliminación de bloqueo y guardado de bloqueo individual usan `ConfirmDialog` ("¿Estás seguro?") según estándar CRUD del proyecto.
- **Sin cambios** en otras páginas, en la tabla principal, ni en el sidebar.

