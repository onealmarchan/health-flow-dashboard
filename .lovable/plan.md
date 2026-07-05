# Plan: Ajustes de Dashboard, Tablas, Formularios, KPIs y Persistencia con Zustand

Cinco bloques de trabajo (A–E). Se pueden aplicar en el mismo pase, pero los agrupo por dominio para minimizar conflictos entre archivos.

---

## Bloque A — Dashboard y Planificación de Jornadas (métricas superiores)

### A.1 Dashboard: cards de métricas (`DashboardContent.tsx` + `MetricCard.tsx`)

- Eliminar: `Especialistas` y `Tiempo Espera`.
- Conservar (con recálculo en vivo desde el store): `% Citas de Hoy`, `Total de Consultas`, `Total de Pacientes Registrados`, `Carga promedio por Especialista`, `% de Urgencias`.
- Extender `MetricCard` con:
  - `semaforo: 'verde' | 'ambar' | 'rojo'` → borde/acento del ícono usando tokens (`--success`, `--warning`, `--destructive`).
  - Pie de card: `↑ / ↓ X% vs mes anterior` (ascendente/descendente). Signo y color derivados del delta real.
- Umbrales por card exactamente según la tabla del usuario (helper `getSemaforo(kind, value)` en `src/lib/kpi-semaforos.ts`).

### A.2 Planificación de Jornadas (`JornadasPage.tsx`)

- Eliminar las cards actuales.
- Añadir dos cards calculadas desde `disponibilidad_horaria` (bloqueos en el store):
  - `% Ocupación de Agenda` — polaridad Ascendente, semáforo V>80 / Á 50–79 / R<50.
  - `% Bloqueos de Agenda` — polaridad Descendente, semáforo V 0–5 / Á 6–15 / R>15.
- Fórmulas: ocupación = bloques ocupados / bloques totales; bloqueos = bloqueos manuales / bloques totales.

---

## Bloque B — Columna `Acciones` en tablas + reestructura de Usuarios

Componente compartido: `src/components/shared/RowActions.tsx` (botones icónicos con `Tooltip` + `ConfirmDialog`). Cada acción dispara `toast.success(...)`.

### B.1 Pacientes Registrados (`PatientTable.tsx`)

- Añadir columna `Acciones`: `[✏️ Editar Datos]` → abre `PatientFormModal` (nuevo, reusa el layout de "Registrar Paciente" en modo edición).

### B.2 Próximas Citas Médicas (`CitasPage.tsx` — tabla)

- Añadir columna `Acciones` tras `Estado`:
  - `[❌ Cancelar Cita]` → confirmación → `removeAppointment(id)` + toast.
  - `[📝 Reprogramar]` → abre el modal de Cita Médica precargado con el registro.

### B.3 Especialistas (modal "Buscar Especialista" en flujo de cita)

- Añadir columna `Acciones` tras `Carga de Pacientes`:
  - `[✏️ Editar Datos]` → abre modal con la misma estructura que "Nuevo Especialista" (contacto, especialidad, descripción).

### B.4 Usuarios (`UsuariosPage.tsx`)

- Eliminar columnas `Miembro desde` y `Última actualización` del store/tabla.
- Nuevas columnas: `Nº | Correo electrónico | Nombre completo | Rol | Historial | Acciones`.
- Columna `Historial`: botón `[⏰ Ver Historial]` (movido desde Acciones) → abre modal "Control de Registro".
- Columna `Acciones`:
  - `[✏️ Editar Datos]` → modal completo, permite cambiar rol (Admin/Auxiliar).
  - `[🔑 Restablecer Contraseña]` → toast: "Enlace de recuperación enviado" o clave temporal generada.
  - `[🔒 Inhabilitar] / [🔓 Habilitar]` → toggle de `estado`, botón con `transition-transform` + rebote (Tailwind `animate-[wiggle]` custom keyframe).

### B.5 Historial de Cambios (`AuditoriasPage.tsx`)

- Eliminar botón `Exportar logs` de la barra superior.

---

## Bloque C — Validaciones de formularios (zod + react-hook-form)

Crear `src/lib/validators.ts` con todos los schemas zod. Cada formulario:

- `useForm({ resolver: zodResolver(schema), mode: 'onBlur' })`.
- Todos los campos requeridos; deshabilitar `[GUARDAR]` mientras `!formState.isValid`.
- Mensajes en español bajo cada input.

Schemas a crear:


| Formulario             | Reglas clave                                                                                                                                                                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pacienteSchema`       | CI numérico 6–8 dígitos + selector V/E; nombres/apellidos regex letras+espacios ≥2; fechaNac ≤ hoy; sexo/nacionalidad/estadoCivil enum; teléfono 11 dígitos; dirección ≥10; ubicación (comunidad/estado/municipio/parroquia) solo letras |
| `motivoConsultaSchema` | descripción 10–200; urgencia enum Bajo/Medio/Alto; fecha por defecto `new Date()`; observación opcional ≤200                                                                                                                             |
| `especialistaSchema`   | MPPS 4–6 dígitos único; nombre/apellido regex letras; teléfono 11 dígitos; especialidadId ∈ catálogo activo                                                                                                                              |
| `especialidadSchema`   | nombre 3–100 letras+espacios; descripción ≤100                                                                                                                                                                                           |
| `diagnosticoSchema`    | síntomas: nombre ≥3, descripción ≤100, gravedad 1–5; diagnóstico: enfermedad requerida, crónico bool, descripción ≥15                                                                                                                    |
| `usuarioSchema`        | nombreCompleto ≥5 solo letras; email regex + único; rol enum Administrador/Auxiliar                                                                                                                                                      |


Unicidad (MPPS, email) verificada contra el store zustand con `.refine()`.

---

## Bloque D — Espaciado del Dashboard + Corrección de fórmulas y semáforos de KPIs

### D.1 Espaciado

- `DashboardContent.tsx`: grids con `gap-4`/`gap-6` (nunca `gap-1/2`); contenedor sin `overflow-hidden` que recorte.
- `DecisionMatrix.tsx` (Matriz de Prioridades): mover la etiqueta del eje "Urgencia" a su propia columna angosta (grid `[auto_1fr]`), añadir `pl-4` al grid de tarjetas para que "Card 45", "Neur 34"… no se solapen con la etiqueta vertical.
- Todas las cards: margen respecto al contenedor padre; en breakpoints angostos colapso a `grid-cols-1`.

### D.2 Corrección de KPIs

Fuente única de verdad: `src/lib/kpi-semaforos.ts` (helper `semaforoFor(kpiId, value)`) + `src/lib/kpi-formulas.ts` (funciones de cálculo puras que reciben datos del store).

Recorrer cada componente y alinear fórmula + polaridad + frecuencia + umbrales exactamente a la especificación del usuario:

**Eficacia**: `StackedBarChartComponent` (distribución enfermedades), `AgeTreeMap` (distribución etaria por especialidad y concentración por edad), `RetentionChartKPI` (controles por especialidad), `GeographicKPI` (densidad comunidad, vulnerabilidad encamados), `EarlyDetectionGauge` (detección temprana).

**Efectividad**: reconsultas críticos, concentración comunitaria.

**Eficiencia**: aumento/decremento por especialidad, tendencia etaria (`AgeGroupTrendChart`), interconsulta, crecimiento epidemiológico, desviación de carga (mantener `DivergingBar` — sólo verificar que sus 5 zonas se deriven de los umbrales ±10/±20).

Correcciones críticas explícitas:

- `EarlyDetectionGauge`: eliminar meta 85% y semáforo "Riesgo/Alerta/Óptimo"; usar V>10 / Á 5–9.9 / R<5, polaridad Ascendente.
- Reconsultas críticos: eliminar el `-1` de la fórmula (es porcentaje simple, no tasa de variación).
- Sólo los KPIs marcados como "Tasa de variación" (fórmula con `−1`) mantienen la resta.

Cada KPI muestra un chip con su valor, color de semáforo y flecha de polaridad.

---

## Bloque E — Zustand como capa de persistencia

### E.1 Inspección previa (obligatoria antes de tocar código)

`src/pages/Index.tsx` actualmente usa **renderizado condicional que desmonta** los componentes:

```tsx
const PageComponent = pageComponents[currentPage] || DashboardContent;
// ...
<PageComponent />
```

Al cambiar de sección se desmonta la anterior → **cualquier `useState` local en una page se pierde al navegar**. Esto confirma la necesidad de mover el estado de negocio a un store global.

### E.2 Instalación

`npm install zustand`.

### E.3 Store `src/store/useDemoStore.ts`

- Middleware `persist` con `createJSONStorage(() => sessionStorage)`.
- Estado centralizado (unificando los stores actuales `patientsStore`, `appointmentsStore`, `especialistasStore`, `usuariosStore`, `historialStore` + nuevos: consultas, diagnósticos, bloqueos de agenda).
- Cada entidad con campo `createdAt: number` (`Date.now()`).
- Acciones: `addX / updateX / removeX` para cada colección.
- Selector helpers: `useDemoStore(s => s.pacientes)`, etc.
- `removeExpired()` que filtra registros con `Date.now() - createdAt > 40*60*1000`.

### E.4 Migración

- Reemplazar los stores tipo `useSyncExternalStore` (`patientsStore.ts`, `appointmentsStore.ts`, `especialistasStore.ts`) por selectores del nuevo store zustand, manteniendo la misma API pública (`usePatients()`, `useAppointments()`, `useEspecialistas()`) como envoltorios para no romper llamadas.
- `usuariosStore.ts` y `historialStore.ts` se migran a slices del store.
- Dashboard cards y gráficas (recharts) leen del store vía selectores — al crear un registro en Pacientes, las métricas del dashboard se actualizan automáticamente.
- No tocar `App.tsx` provider tree (Zustand no lo requiere).

### E.5 Expiración automática

En `App.tsx`, dentro de un `useEffect`:

```ts
useEffect(() => {
  const id = setInterval(() => useDemoStore.getState().removeExpired(), 30_000);
  return () => clearInterval(id);
}, []);
```

### Criterio de aceptación E

Crear paciente en Pacientes → ir a Diagnósticos → F5 → el paciente persiste y las cards/gráficas del Dashboard lo reflejan.

---

## Orden de ejecución sugerido

1. **E** primero (store centralizado) — necesario para que A/B/D lean datos en vivo.
2. **C** (validators zod) — independiente, se aplica junto con formularios de B.
3. **B** (columnas Acciones + reestructura Usuarios) — usa store y validators.
4. **A** (cards del dashboard + jornadas) — lee del store.
5. **D** (espaciado + semáforos/fórmulas de KPIs) — cierre y consistencia visual.

## Fuera de alcance

- Backend real / integración Supabase.
- Envío real de correos de recuperación (solo toast simulado).
- Migración de las tablas restantes (Diagnósticos, Jornadas) más allá de lo listado.