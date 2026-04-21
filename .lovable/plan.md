

## Rediseño del Flujo "Agendar Cita" — 3 nuevos modales encadenados

Voy a reemplazar el actual modal "Agendar Cita" (paso 3) por un flujo de tres pantallas conectadas dentro de `src/components/pages/CitasPage.tsx`, manteniendo los pasos 1 (Buscar) y 2 (Registrar) intactos.

### Cambios principales

**1. Modal "Agendar Cita" (rediseñado) — agrupación por especialidad**

Sustituyo la lista plana de `scheduleBlocks` por una vista agrupada:
- Acordeones/secciones por especialidad (Cardiología, Pediatría, Dermatología, Neurología…).
- Cada doctor se muestra como una tarjeta con: nombre, MPPS, carga actual y un botón **"Asignar Cita"** a la derecha.
- Al pulsar "Asignar Cita" → se abre el modal **Motivo de Consulta** y se guarda el doctor seleccionado en estado.

**2. Nuevo modal "Motivo de Consulta"**

Modal mediano (`max-w-lg`) con 5 campos en orden:
1. **Nº Paciente** (precargado y readonly desde el paciente seleccionado).
2. **Descripción** (`Textarea`).
3. **Nivel de Urgencia** (`Select`: Bajo / Medio / Alto).
4. **Fecha** (input `type="date"`).
5. **Observación** (`Textarea`).

Botón **"Siguiente"** abajo a la derecha; queda `disabled` hasta que TODOS los campos requeridos tengan valor (validación derivada). Al hacer click → cierra este modal, abre el modal a pantalla completa y genera un **Nº de Cita** (ej: `CITA-{timestamp}` ).

**3. Nuevo modal a pantalla completa "Cita Médica"**

`DialogContent` con `max-w-[95vw] w-[95vw] h-[90vh]`. Layout:

- **Header (sticky)**: botón **"← Volver"** en la esquina superior izquierda → cierra este modal y reabre "Motivo de Consulta" preservando los datos.
- **Grid 70/30** debajo del header.

**Columna izquierda (70%)**:
- Título "Cita Médica" + subtítulo `Nº de Cita Médica: CITA-XXXX`.
- Dos `Select`: **Mes** (Enero–Diciembre) y **Año** (actual a +5 años).
- **Calendario personalizado** (no `react-day-picker` — necesitamos celdas circulares con colores por estado). Se construirá con un grid `grid-cols-7`:
  - Encabezado L M M J V S D.
  - Cada celda: botón circular (`rounded-full w-10 h-10`) con el número del día.
  - Color de fondo: blanco (disponible), rojo (reservado), azul (seleccionado).
  - Estado de cupos vendrá de un mock `dayAvailability: Record<string, 'available' | 'reserved'>`.
- **Nº del día seleccionado** mostrado abajo a la derecha del calendario.
- **Leyenda** debajo: 3 chips con colores y texto (Blanco/Rojo/Azul).

**Columna derecha (30%)** — dos estados:
- **Sin fecha seleccionada**: mensaje "Seleccione una fecha disponible".
- **Con fecha seleccionada**:
  - Bloque superior con 3 controles:
    - **Tipo de Cita** (`Select`: Primera vez / Control / Urgencia).
    - **Motivo** (`Input`, precargado desde la Descripción del modal anterior).
    - **Hora Disponible** (`Select` con horarios mock filtrados por la fecha).
  - Cuando los 3 campos estén llenos → aparece el bloque **"Resumen de Cita Asignada"**:

```text
┌─ Resumen de Cita Asignada ─────────────────────────┐
│ Nº de Cita: CITA-001        Médico: Dr. López      │
│ Paciente:   María García    Especialidad: Cardio.  │
│ Edad:       34 años         Remitido: ○ Sí  ○ No   │
│ Motivo:     Dolor torácico  Tipo: Control          │
│ Día:        2025-04-22      Hora: 09:30            │
└────────────────────────────────────────────────────┘
```
   Implementado con `grid grid-cols-2 gap-x-6 gap-y-2`. Cada par usa `<span class="font-medium">label:</span> <span>valor</span>`. **Remitido** usa `RadioGroup` (Sí/No).
  - Debajo, dos botones a ancho completo: **"Regresar"** (vuelve a Motivo) y **"Agendar Cita"** (primario).

### Comportamiento al confirmar

Al pulsar **"Agendar Cita"**:
1. Se construye el objeto cita con todos los datos (paciente, doctor, especialidad, fecha, hora, motivo, urgencia, tipo, remitido, observación).
2. Se agrega a un `useState<Appointment[]>` que reemplazará el `appointments` constante actual (estado interno del componente, mock).
3. Se marca el cupo (`dayAvailability[fecha]`) como `'reserved'` para que el calendario lo muestre en rojo.
4. Se cierran los 3 modales (`modalStep = 'closed'`).
5. Se muestra `toast.success('Cita agendada exitosamente')` (sonner).
6. La nueva cita aparece en la tabla principal de Citas.

### Diagrama de navegación

```text
[Tabla Citas] → [Buscar Paciente] → (paciente seleccionado)
                                          ↓
                                   [Agendar Cita]
                                   (doctores por
                                    especialidad)
                                          ↓ "Asignar Cita"
                                   [Motivo de Consulta]
                                          ↓ "Siguiente" (cuando válido)
                                   [Cita Médica - fullscreen]
                                          ↓ "Agendar Cita"
                                   toast + cierra todo
                                   + actualiza tabla
```

### Detalles Técnicos

- **Archivo único modificado**: `src/components/pages/CitasPage.tsx`.
- Ampliar `ModalStep` a: `'closed' | 'search' | 'register' | 'schedule' | 'motivo' | 'fullCita'`.
- Nuevos estados:
  - `selectedDoctor: { name, specialty, mpps } | null`
  - `motivoData: { numPaciente, descripcion, urgencia, fecha, observacion }`
  - `citaNumber: string` (generado al pulsar "Siguiente")
  - `calMonth, calYear, selectedDate, tipoCita, motivoTexto, horaSeleccionada, remitido`
  - `appointments` migra de constante a `useState`.
  - `dayAvailability: Record<string,'available'|'reserved'>` mock con algunas fechas pre-reservadas.
- **Calendario custom** (no react-day-picker): función `buildMonthGrid(year, month)` que devuelve matriz de días con padding inicial; render con `grid-cols-7`. Esto permite controlar los círculos de color exigidos.
- **Validación de "Siguiente"**: `isMotivoValid = Object.values(motivoData).every(v => v.trim() !== '')`.
- **Mock de doctores agrupados** (nuevo array `doctorsBySpecialty`): array con `{ specialty, doctors: [{ id, name, mpps, carga }] }`.
- **Mock de horarios por fecha**: array fijo `['08:00','08:30','09:00','09:30','10:00','10:30','11:00']` filtrando los ya tomados.
- **UI components reutilizados**: `Dialog`, `Select`, `Input`, `Textarea`, `RadioGroup`, `Button`, `Label` (todos existentes en `@/components/ui/`).
- **Toast**: `import { toast } from 'sonner'` (ya disponible globalmente).
- **Cálculo de edad**: helper `calcAge(fechaNac)` a partir de `selectedPatient.fechaNac`.
- **Botón "Volver"** en pantalla completa: simplemente hace `setModalStep('motivo')` sin limpiar `motivoData`.
- **Sin cambios** en: pasos 1 (Buscar Paciente), 2 (Registrar Nuevo Paciente), tabla principal de citas, ni en otros módulos.

