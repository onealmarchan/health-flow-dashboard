## A) Login — Flujo de Recuperación con OTP

Archivo: `src/pages/Login.tsx`

Reemplazar la vista de recuperación actual por un flujo de 3 sub-estados:

```ts
type RecoverStep = 'email' | 'otp' | 'newPassword';
```

### A1. Paso `email` (formulario inicial)
- Cambiar texto del botón: `Enviar enlace de recuperación` → **`Enviar código de recuperación`**.
- Eliminar el toast actual de "Si el correo existe, recibirás un enlace…".
- Al enviar:
  - Validar que el correo contenga `@` y un `.`; si no, shake + toast error `Correo inválido`.
  - Toast success: **`Código de recuperación enviado`**.
  - Generar OTP simulado de 6 dígitos (no se muestra; lo "válido" será cualquier código que coincida con el generado o, para demo, `123456`). Guardar en estado.
  - Guardar `maskedEmail` y avanzar a `otp` con `expiresAt = Date.now() + 15*60*1000`.

### A2. Paso `otp`
- Título: **`Recuperación de Contraseña`**.
- Subtítulo: `Acabamos de enviar su código de recuperación por correo electrónico a {maskedEmail}`.
- Función `maskEmail(email)`:
  - Separar local/dominio por `@`.
  - Resultado: `local[0] + '*'.repeat(max(local.length - 1, 1)) + '@' + domain`.
  - Ej.: `Fulanito@gmail.com` → `F*******@gmail.com`.
- Contador visible MM:SS arrancando en `15:00`, decreciendo cada segundo via `setInterval` + `useEffect` con cleanup. Estilo `tabular-nums text-primary font-semibold`.
- OTP: usar `<InputOTP maxLength={6}>` con 6 `InputOTPSlot` (componente ya existe en `src/components/ui/input-otp.tsx`).
- Botón **`Verificar`** (deshabilitado si longitud < 6 o expirado).
- Lógica:
  - Si `Date.now() >= expiresAt` → bloquear input y mostrar mensaje en pantalla en rojo: **`Validez Expirada`** + botón "Reenviar código" que vuelve a `email`.
  - Si código ingresado coincide → toast success `Código verificado`, avanzar a `newPassword`.
  - Si no coincide → shake + toast error `Código incorrecto`.

### A3. Paso `newPassword`
- Campos:
  - **Nueva Contraseña** (Input password con toggle ojo).
  - **Repetir Contraseña** (Input password con toggle ojo).
- Validación: mínimo 6 caracteres y ambas iguales; si no, toast error.
- Botón **`Confirmar`**.
- Al confirmar válidamente → toast success: **`Contraseña Actualizada Correctamente`**, esperar ~700ms y `navigate('/login')` reseteando todo a modo `login`.

### A4. Animación
- Cada cambio de sub-paso envuelto en `<div key={step} className="animate-fade-in">` (ya en uso para `mode`).

---

## B) JornadasPage — Modal Agregar Jornada (4 cuadrantes)

Archivo: `src/components/pages/JornadasPage.tsx`

### B1. Q1 — Calendario: Tooltip en celdas bloqueadas
- Importar `Tooltip, TooltipTrigger, TooltipContent, TooltipProvider` desde `@/components/ui/tooltip`.
- Envolver cada `<button>` día bloqueado (`blocked` truthy) en un `Tooltip` con `TooltipContent` mostrando `blocked.razon` (texto registrado en el campo Razón del modal Bloquear Turno).
- Tooltip se activa en hover (comportamiento por defecto).

### B2. Q2 — Tabla Sesiones Médicas

Reemplazar el bloque actual de "Edición semanal":

- Encima de la tabla, fila con dos títulos:
  - Izquierda: **`Sesiones Médicas`** (`text-sm font-semibold`).
  - Derecha: **`Rango Semanal`** + selector con flechas que avanzan/retroceden de 7 en 7 días (ya usa `weekOffset` ±1 ⇒ se mantiene; aclarar etiqueta).

#### Estructura de filas — modelo nuevo
```ts
type RowId = string; // `${iso}-${idx}`
interface ScheduleRow {
  id: RowId;
  iso: string;          // día
  turnoTipo: 'Mañana' | 'Tarde' | 'Noche' | '';
  horaInicio: string;
  horaFin: string;
  saved: boolean;
  bloqueoId?: string;   // si esta fila está bloqueada por turno
}
const [rows, setRows] = useState<ScheduleRow[]>([]);
```
Cada día renderiza dinámicamente sus filas (1..3). Si un día no tiene filas, se muestra una fila inicial vacía con botón `+`.

#### Botones por fila
- **`+`** (antes del campo Día):
  - Sólo visible si el día tiene < 3 filas guardadas y existen turnos no usados.
  - Al click, agrega fila nueva con `turnoTipo` por defecto = primer turno disponible no marcado en ese día.
- **Guardar** (icono `Save` 💾, reemplaza `Editar`):
  - Valida la fila y la marca `saved: true`.
- **Bloquear** (icono `Ban` 🚫): abre `Bloquear Turno` con `turno = row.turnoTipo` (autocompletado, editable según UX existente).
- **Badge `Link2` 🔗** (encima del botón 🚫, esquina superior derecha, tamaño `w-3.5 h-3.5` dentro de un `span` `absolute -top-1 -right-1`, con `animate-bounce` en hover/active mediante clase `hover:animate-bounce active:scale-110 transition-transform`):
  - Abre `Bloquear Turno` con `turno = 'Todos los Turnos'` no editable.

#### Validaciones al guardar fila
Función `validateRow(row, rows)`:
1. `horaInicio < horaFin` en minutos.
2. No solapamiento con otras filas guardadas del mismo `iso` y mismo médico:
   - Para cada minuto `m` en `[hi, hf)`, si existe otra fila guardada cuyo rango contiene `m` → error: `¡Error! A las ${HH:MM} el médico ya está ocupado.`
3. Combinación turno + horaInicio + horaFin + bloqueo no debe duplicar otra fila guardada del mismo día.
4. Excepción de descanso de 30 min: dos filas son válidas aunque estén separadas por ≤30 min entre fin de una e inicio de otra (no obliga, sólo se acepta).

### B3. Modal Bloquear Turno (renombrar)
- Renombrar `DialogTitle` `Bloquear Día` → **`Bloquear Turno`**.
- Mantener `Fecha Inicio`, `Fecha Fin`, `Razón`, `Observaciones`.
- Agregar campo **`Turno`** (Select con `Mañana | Tarde | Noche | Todos los Turnos`):
  - Origen `botón 🚫` por fila → autocompletar con `row.turnoTipo`, editable.
  - Origen `badge 🔗` → valor fijo `Todos los Turnos`, `disabled`.
- Guardar registra UN solo `Bloqueo` con `turno` incluido (extender interfaz `Bloqueo` con `turno: string`).

### B4. Q4 — Tabla Bloqueos Programados
- Agregar columna **`N°`** (índice +1) antes de `Fecha Inicio`.
- Agregar columna **`Turno`** después de `Fecha Inicio/Fecha Fin`.
- Encima de la tabla, alineado a la derecha, `Select` con opciones: `Todos`, `Todos los Turnos`, `Mañana`, `Tarde`, `Noche`. Filtra por `bloqueo.turno`.

### B5. Guardar Todo
- Al click `Guardar Todo`, recopilar `rows.filter(saved)` + `bloqueos` y propagar al estado global de la página (un nuevo `availabilityByDoctor: Record<mpps, { sessions: ScheduleRow[]; blocks: Bloqueo[] }>`) que alimenta la tabla unificada de la sección C.

---

## C) JornadasPage — Tabla unificada Disponibilidad Horaria

Archivo nuevo: `src/components/pages/jornadas/AvailabilityTable.tsx` y consumir en `JornadasPage.tsx`.

### C1. Eliminar bloque actual `Jornadas Registradas`
Borrar el `<div className="chart-container">` con `<h3>Jornadas Registradas</h3>` y la tabla siguiente (líneas ~276-302).

### C2. Componente `AvailabilityTable`
Props:
```ts
interface DoctorAvailability {
  mpps: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  events: AvailabilityEvent[];
}
type AvailabilityEvent =
  | { kind: 'session'; turno: 'Mañana'|'Tarde'|'Noche'; horaInicio: string; horaFin: string; days: string[] }
  | { kind: 'block'; razon: string; fechaInicio: string; fechaFin: string; turno: string };
```

### C3. Estructura visual
- **Leyenda** (encima de barra de herramientas): punto verde `Sesión activa`, punto rojo `Bloqueo programado`.
- **Toolbar**:
  - Pastillas `Todos | Sesiones | Bloqueos` (estado controlado, una activa).
  - Input búsqueda a la derecha (`Search` icon, filtra por nombre/apellido/especialidad en tiempo real).
- **Tabla** 3 columnas: `Médico | Disponibilidad Horaria | Gestionar`.
  - Col 1: avatar circular con iniciales (color hash basado en mpps), nombre, especialidad debajo en `text-xs text-muted-foreground`.
  - Col 2: barras apiladas vertical con `gap-1.5`.
    - Sesión: `bg-success/15 text-success` con etiqueta turno + horario + días.
    - Bloqueo: `bg-destructive/15 text-destructive` con razón + rango de fechas + alcance (turno).
    - Por defecto sólo 2 visibles. Si `events.length > 2`, badge `+{N} más` clickable; al expandir muestra todos y badge cambia a `Mostrar menos`. Estado por fila: `Set<mpps>` o `Record<mpps, boolean>` en el componente.
  - Col 3: botón `Edit` (icon-only, `variant="ghost"`) que llama `onEdit(mpps)` → abre el modal `Agregar Jornada` precargado con los datos guardados de ese médico.
- **Estado vacío**: si no hay coincidencias, fila única `colSpan=3` con texto centrado `Sin resultados`.

### C4. Integración
- En `JornadasPage`, mantener `availabilityByDoctor` y construir array `DoctorAvailability[]` derivado.
- Al hacer `Guardar Todo` en el modal, hacer upsert por `mpps`.
- Botón Editar de la tabla → `setShowModal(true)` + `setSelectedMpps(mpps)` + rellenar `rows` y `bloqueos` desde el almacén.

---

## D) CitasPage — Modal de cita y Comprobante

Archivo: `src/components/pages/CitasPage.tsx`

### D1. Campo Turno encima de Hora Disponible
En la pantalla `fullCita`, justo antes del bloque "Hora Disponible":
- Agregar `Select` **Turno** con opciones `Mañana`, `Tarde`, `Noche`.
- Estado: `const [turno, setTurno] = useState<'Mañana'|'Tarde'|'Noche'|''>('')`.
- Filtrar `availableHours` según turno:
  - Mañana: `06:00–11:59`
  - Tarde: `12:00–17:59`
  - Noche: `18:00–23:59`
- Si turno vacío, deshabilitar selector de hora con texto `Seleccione un turno primero`.

### D2. Renombrar y rediseñar "Resumen de Cita Asignada" → **`Comprobante de Cita`**

Reemplazar el contenido de la sección con la siguiente ficha (estilo `chart-container`, fuente del sistema, líneas separadoras `border-t border-border`):

```text
─────────────────────────────────────────────
Centro Ambulatorio Dr Salvador Allende     N° cita
Comprobante de Cita Médica                  [#citaNumber]
─────────────────────────────────────────────
Fecha de Cita:           Hora Asignada:
Turno:    Tipo de Cita:    Caso: (Remitido si/no)
─────────────────────────────────────────────
DATOS DEL PACIENTE:
Cédula: ... Nombres: ... Apellidos: ...
Fecha de Nacimiento: ... Sexo: ... Teléfono: ...
Comunidad: ... Estado: ... Parroquia: ...
─────────────────────────────────────────────
MÉDICO TRATANTE:
N° Ministerio de Salud: ... Especialidad: ...
Nombres y Apellidos: ... Horario de Sesión: ...
─────────────────────────────────────────────
MOTIVO DE CONSULTA:
Descripción del motivo
[motivoTexto]
Nivel de Urgencia: [urgencia]   Remisión: [Sí/No]
─────────────────────────────────────────────
```

Layout con `grid grid-cols-2 gap-x-6 gap-y-2 text-sm`. Los títulos de sección en `font-semibold uppercase tracking-wide text-xs text-muted-foreground`.

### D3. Botón Generar Comprobante de Cita (PDF)
Debajo de la ficha:
- Botón `Generar Comprobante de Cita` (icon `FileDown`).
- Implementación: agregar dependencia `jspdf` (ya disponible o instalar) y función `generarComprobantePDF()` que arma el documento con `jsPDF` replicando la ficha (texto plano, líneas con `doc.line`, salto de bloque). Descargar como `Comprobante_${citaNumber}.pdf`.
- Alternativa si no se quiere `jspdf`: usar `window.print()` con vista imprimible filtrada por `@media print`. Recomendado: **jspdf** (más controlable).

---

## Notas técnicas / fuera de alcance

- No se toca backend. Todo el estado vive en memoria del componente.
- El OTP "real" se simula: válido cuando coincide con el generado en cliente (también se aceptará `123456` para pruebas si se desea). No se envía correo.
- La tabla unificada de C reemplaza visualmente a "Jornadas Registradas"; ningún otro consumidor depende de esa tabla.
- Se mantienen los estándares: confirmación `¿Estás seguro?` antes de Guardar/Editar/Eliminar (ya implementado vía `ConfirmDialog`); botones `GUARDAR / GUARDAR Y OTRA / CANCELAR` donde apliquen; modales con `X` de cierre nativa de `Dialog`.
