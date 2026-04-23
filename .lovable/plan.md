

## Cambios: Especialidades dinámicas + Nueva página "Control de Diagnósticos"

### 1. Modal "Nuevo Especialista" — Selector de especialidad dinámico

**Archivo:** `src/components/pages/EspecialistasPage.tsx`

- Convertir el campo **Especialidad** (actualmente `Input`) en un `Select` (combobox) con shadcn `Select`.
- Al lado del select, botón **"+"** (icono `Plus`, variant `outline`, tamaño `icon`) que abre el modal anidado **"Registro de Especialidad Médica"**.
- Catálogo inicial mock (estado `useState<string[]>`): `['Cardiología', 'Pediatría', 'Dermatología', 'Neurología', 'Traumatología', 'Ginecología']`.

**Modal "Registro de Especialidad Médica"** (`Dialog` anidado, `max-w-md`):
- Campos:
  - **Nombre** (`Input`, requerido).
  - **Descripción** (`Textarea`, opcional).
- Footer alineado a la derecha: **Guardar** (primario) + **Cancelar** (outline). El **X** nativo de shadcn cierra como Cancelar.
- Al **Guardar**: valida nombre no vacío, agrega al array `especialidades`, autoselecciona la nueva en el formulario padre, cierra el modal y muestra `toast.success`.

---

### 2. Nueva página "Control de Diagnósticos"

**2.1 Registro en el sistema**

- Crear `src/components/pages/DiagnosticosPage.tsx`.
- Registrar en `src/pages/Index.tsx` con clave `diagnosticos`.
- Añadir entrada en `src/components/layout/Sidebar.tsx`: `{ id: 'diagnosticos', label: 'Control de Diagnósticos', icon: Stethoscope }` (de `lucide-react`).

**2.2 Tabla principal**

Columnas: **Nº | Paciente | Nº Cita Origen | Enfermedad | Crítico | Etapa | Fecha | Estado | Acciones**.
- `Crítico` → badge "Sí" (rojo) / "No" (gris).
- `Estado` → badge según valor (Activo verde / Resuelto azul).
- `Acciones` → botón **"Ver diagnóstico"** (icono `Eye` + texto).

Botón **"Registrar Diagnóstico"** arriba a la derecha del header de la página.

Estado: `useState<Diagnostico[]>` con 2-3 mocks iniciales.

**2.3 Modal "Registrar Diagnóstico"** (`max-w-3xl`, scroll interno)

Layout en grid de 2 columnas para campos básicos:

```text
┌─────────────────────────────────────────────────────┐
│ Nº Cita Paciente [Select▼]   Fecha de Cita [auto]   │
│ C.I.            [Input]      Nombres   [Input]      │
│ Apellidos       [Input]      Urgencia  [Sí/No radio]│
│ Motivo de la Cita     [Textarea col-span-2]         │
│ Tratamiento Previo    [Textarea col-span-2]         │
│ ── Síntomas Detectados ──── [+ Agregar síntoma]     │
│  ┌ Síntoma 1 ──────────────────────── [🗑️]         │
│  │ Nombre [_] Descripción [_] Gravedad [1-5 ▼]      │
│  └─────                                             │
│ ── Diagnóstico Final ──────────────                 │
│  Nombre [_]   Descripción [Textarea]                │
│  Crónico: ○ Sí  ○ No                                │
│                          [Guardar] [Cancelar]       │
└─────────────────────────────────────────────────────┘
```

- Al seleccionar **Nº Cita**: auto-rellena C.I., Nombres, Apellidos y Fecha de Cita desde un mock de citas (`mockCitas`).
- **Síntomas Detectados**: lista repetible (`useState<Sintoma[]>`); cada bloque con botón ✕ para eliminar; botón "+ Agregar síntoma" añade entrada vacía. Gravedad = `Select` 1–5.
- **Diagnóstico Final**: bloque único con Nombre, Descripción y `RadioGroup` Sí/No para Crónico.
- Footer abajo a la derecha: **Guardar** + **Cancelar**, con `ConfirmDialog` ("¿Estás seguro?") según estándar CRUD.
- Al guardar: añade al array `diagnosticos`, cierra modal, `toast.success`, refresca tabla.

**2.4 Modal "Ver diagnóstico"** (`max-w-5xl`, layout 4 cuadrantes)

Header superior (fila): `Nº Cita Paciente: XXX` · `Fecha de Diagnóstico: YYYY-MM-DD`. X nativo arriba derecha.

Body en `grid grid-cols-2 grid-rows-2 gap-4`:

```text
┌── A: Datos del Paciente ──┬── B: Medidor de Salud ──┐
│ Nº Paciente: ...          │      ╔═══╗              │
│ C.I.: ...                 │      ║   ║  😊          │
│ Nombre / Apellido         │      ║▓▓▓║   (nivel)    │
│ Diagnóstico Presuntivo    │      ║▓▓▓║              │
│ Tratamiento               │      ╚═══╝              │
│ Urgencia: Sí/No           │   Gravedad: 4/5         │
├── C: Síntomas detectados ─┼── D: Enfermedad ────────┤
│ Tabla:                    │ Nombre: ...             │
│ Nombre│Descripción│Grav.  │ Descripción: ...        │
│ ...                       │ Crónica: Sí / No        │
└───────────────────────────┴─────────────────────────┘
```

**Cuadrante B — Medidor de Salud (termómetro vertical)**:
- Componente custom `<HealthMeter value={1-5} />`.
- Barra vertical `w-12 h-48 rounded-full border bg-muted overflow-hidden` con relleno interior `absolute bottom-0 w-full transition-all` cuya altura = `value*20%`.
- Mapa color/emoji:
  - 1 → `bg-red-500`     😫
  - 2 → `bg-orange-500`  😟
  - 3 → `bg-yellow-400`  😐
  - 4 → `bg-blue-500`    🙂
  - 5 → `bg-green-500`   😁
- Emoji grande al lado del termómetro + label "Gravedad: X/5".
- Valor: del Diagnóstico Final si existe; si no, promedio de gravedad de síntomas; default `3`.

---

### Detalles técnicos

- **Tipos** (definidos en `DiagnosticosPage.tsx`):
  ```ts
  type Sintoma = { nombre: string; descripcion: string; gravedad: number };
  type Diagnostico = {
    id: number; numCitaOrigen: string; paciente: string; ci: string;
    nombres: string; apellidos: string; fechaCita: string; fechaDiagnostico: string;
    motivo: string; tratamientoPrevio: string; urgencia: boolean;
    sintomas: Sintoma[];
    enfermedad: { nombre: string; descripcion: string; cronico: boolean };
    critico: boolean; etapa: string; estado: string;
  };
  ```
- **Mocks**: `mockCitas` (3-4 citas con datos de paciente) y 2-3 diagnósticos de ejemplo precargados.
- **Componentes UI reutilizados**: `Dialog`, `Select`, `Input`, `Textarea`, `RadioGroup`, `Button`, `Label`, `Table`, `ConfirmDialog`, `toast` (sonner).
- **Iconos** (`lucide-react`): `Plus`, `Eye`, `Trash2`, `Stethoscope`, `X` (nativo del Dialog).
- **Sin cambios** en otras páginas/módulos. La nueva página queda accesible desde el sidebar.

