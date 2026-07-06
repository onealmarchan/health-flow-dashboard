# Plan de corrección — Persistencia real, tiempo real, gráficas y Soporte Técnico

## 0. Diagnóstico previo (auditoría rápida, sin código)

Antes de tocar nada, se revisa y reporta:

1. **Persistencia**: `useDemoStore` sí declara `persist` con `sessionStorage` y clave `medicitas-demo`. El problema real es que muchos formularios/acciones **no llaman** los actions del store (`addPatient`, `addAppointment`, etc.) — siguen usando `useState` local o el objeto `historialMock` como array estático. Se listan los puntos exactos que faltan por conectar.
2. **Cards/gráficas**: se verifica cuáles leen del store con selector (`useDemoStore(s => ...)`) y cuáles siguen con datos hardcodeados (`retentionData`, arrays literales dentro del componente). Se reporta el listado antes de reescribir.
3. `**removeExpired**`: la implementación actual filtra por `seedIds`, así que los seed sobreviven; pero cualquier registro creado en sesión desaparece a los 40 min, según lo acordado. Se confirma que sigue correcto.

## 1. Cierre real del bloque E (persistencia)

Conectar al store todos los flujos que aún usan estado local:

- `CitasPage.tsx`: cancelar/reprogramar cita → `removeAppointment` / `updateAppointment`.
- `PatientTable.tsx` (dashboard) + `PacientesPage`: editar paciente → `updatePatient`.
- `EspecialistasPage`: alta/edición → `addEspecialista` / `updateEspecialista`.
- `DiagnosticosPage`: extender el store con slice `diagnosticos` (mismo patrón: `add/update/remove` + `createdAt`) y conectarlo.
- `JornadasPage` (bloqueos): usar `addBloqueo` / `removeBloqueo` del store en lugar del estado local del modal.
- `UsuariosPage`: alta, edición, reset y toggle → actions del store.

Verificación: crear registro → cambiar de sección → F5 → sigue presente y reflejado en cards/gráficas durante 35–40 min.

## 2. Columna Acciones (cierre del bloque B)

- **PatientTable (dashboard)**: agregar columna Acciones con `RowActions` → `[✏️ Editar]` abre `PatientFormModal` en modo edición y guarda con `updatePatient`.
- **Tabla de Próximas Citas Médicas** (`CitasPage`): agregar columna Acciones tras "Estado":
  - `[❌ Cancelar Cita]` → `ConfirmDialog` "¿Estás seguro?" → `removeAppointment(id)` + toast + entrada en Historial.
  - `[📝 Reprogramar]` → abre el modal de Cita Médica precargado con los datos del registro; al guardar hace `updateAppointment(id, patch)` + entrada en Historial.

## 3. Historial de Cambios en vivo

Causa raíz de la tabla vacía: nadie invoca `addHistorial`, y `AuditoriasPage` sigue leyendo el proxy `historialMock` en vez de suscribirse al store.

- `AuditoriasPage`: reemplazar `historialMock` por `useHistorial()` (selector), ordenar por `createdAt desc`.
- Crear un helper `src/lib/audit.ts` con `logAudit({ seccion, registroAfectado, accion, cambio })` que arma `responsable` (usuario simulado de sesión) + `fechaHora` (`new Date().toLocaleString('es-VE')`) y llama `useDemoStore.getState().addHistorial(...)`.
- Invocar `logAudit` en cada `add/update/remove/toggle` de Pacientes, Citas, Especialistas, Diagnósticos, Jornadas (bloqueos), Usuarios — incluidas las nuevas acciones del punto 2. Para "Editar", construir el texto del delta comparando `prev` vs `patch` (solo los campos que cambiaron).

## 4. Diverging Bar — Ratio vs Meta (visual + semáforo de 3 zonas)

Archivo: `src/components/pages/especialistas/DivergingBar.tsx` (usado desde el dashboard).

- **Espaciado**: subir `y.padding(0.3)` → `0.55`, aumentar `margin.left` a 170 y `margin.bottom` a 70; alto mínimo por barra 34 px (recalcular `size.h` en función de `rows.length`).
- **Semáforo de 3 zonas** (reemplaza las 6 categorías): Verde |desv| ≤ 10 %, Ámbar 10–20 %, Rojo > 20 %. Nueva función `zoneColor(desv)` en `especialistas/utils.ts`; eliminar `divergingColor`, `severityLabel` y la constante `LEGEND` con 6 entradas.
- **Leyenda**: 3 chips (Verde/Ámbar/Rojo) centrados debajo del gráfico.
- **Cálculo mensual**: `desv = ((cargaActual / META) - 1) * 100` con `META = 250`, agrupado por especialidad sobre `especialistas` del store (ya usa el store; se documenta en comentario que es indicador **independiente** de la card "Carga por Especialista").

## 5. Gauge "Tasa de detección temprana" (visual + datos reales)

Archivo: `src/components/dashboard/EarlyDetectionGauge.tsx`.

- **Reencuadre**: `viewBox="0 0 240 170"`, subir `cy` a 130, radio 78, `strokeWidth` 14; la aguja y el número quedan centrados dentro del arco.
- **Leyenda inferior**: envolver los 3 chips en `mt-6 flex flex-wrap justify-around gap-2 px-4` para que no toquen el borde.
- **Datos reales**: reemplazar `computeValue` por `casosTempranos / totalDiagnosticos * 100` leídos del nuevo slice `diagnosticos` del store (campo `etapa: 'inicial' | 'avanzada'`). Mientras el slice se pobla en demo, seed con 3–4 diagnósticos de ejemplo. Semáforo `porcentajeAlto` ya correcto.

## 6. Cards del dashboard — datos reales + delta dinámico

En `DashboardContent.tsx`:

- Confirmar que cada card ya lee del store (sí lo hace) — pero reemplazar la baseline pseudoaleatoria `baseline()` por un **snapshot del mes anterior**: nuevo campo en el store `monthlySnapshot: { yyyymm: string; counts: {...} }` que se recalcula la primera vez que cambia el mes o al inicio de sesión. El delta se calcula contra ese snapshot. Si no existe snapshot, se muestra "—" en el chip en lugar de un número inventado.
- Los umbrales de semáforo ya están correctos en `kpi-semaforos.ts` (`citasHoy`, `totalConsultas`, `totalPacientes`, `cargaEspecialista`, `urgencias`); solo se verifica que las cinco cards usen exactamente esos `kind`.

### 7. Gráficas KPI en % y en vivo — 🔧 corregido, separar componentes/kinds


| Componente                                                                                                                           | Fuente en store                                                             | Fórmula                                 | Kind semáforo                   |
| ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- | --------------------------------------- | ------------------------------- |
| `StackedBarChart` (Distribución de Enfermedades)                                                                                     | `diagnosticos` por enfermedad                                               | simple %                                | `porcentajeBajo` (0-5/6-15/>15) |
| `AgeTreeMap` (Distribución Etaria por Especialidad)                                                                                  | `patients` × `appointments.specialty`                                       | simple %                                | `porcentajeBajo`                |
| 🔧 `AgeConcentrationChart` (Concentración de Condiciones por Edad) — **componente propio, ya no fusionado con Tendencia**            | `diagnosticos` agrupado por rango etario                                    | simple %, sin -1                        | `porcentajeBajo`                |
| 🔧 `AgeGroupTrendChart` (Tendencia de consultas por grupo etario) — **solo esta métrica, sin mezclar con Concentración**             | `appointments` grupo etario actual vs periodo anterior                      | `[(actual/anterior)-1]×100`             | `porcentajeAlto` (>10/5-9.9/<5) |
| `RetentionChart` (Retención por Especialidad)                                                                                        | pacientes que repiten / total por especialidad                              | simple %                                | `retencion` (V≥80/Á50-79/R<50)  |
| `EarlyDetectionGauge`                                                                                                                | ver punto 5                                                                 | simple %                                | `porcentajeAlto`                |
| 🔧 `ReconsultasChart` (Frecuencia de Reconsultas) — **componente propio, no** `DecisionMatrix`                                       | pacientes críticos que reconsultan / total pacientes críticos               | simple %, sin -1                        | `porcentajeBajo`                |
| 🔧 `SpecialtyTrendChart` (Tasa Trimestral por Especialidad — aumento/decremento por especialidad) — **componente propio, explícito** | casos actuales por especialidad / casos periodo anterior misma especialidad | `[(actual/anterior)-1]×100`             | `porcentajeBajo`                |
| `GeographicKPI` — 🔧 **desglosar internamente en 4 sub-cálculos, no una fórmula genérica**:                                          | &nbsp;                                                                      | &nbsp;                                  | &nbsp;                          |
| → Densidad Epidemiológica                                                                                                            | `patients` por comunidad                                                    | simple %, **sin -1**                    | `porcentajeBajo`                |
| → Vulnerabilidad Comunitaria (encamados)                                                                                             | `patients` encamados por comunidad                                          | simple %, **sin -1**                    | `porcentajeBajo`                |
| → Concentración Geográfica                                                                                                           | casos actuales comunidad / casos periodo anterior misma comunidad           | `[(actual/anterior)-1]×100`, **con -1** | `porcentajeBajo`                |
| → Crecimiento Epidemiológico                                                                                                         | casos actuales comunidad / casos anteriores misma comunidad                 | `[(actual/anterior)-1]×100`, **con -1** | `porcentajeBajo`                |


`DecisionMatrix` queda **exclusivamente** como el diagrama "Matriz de Prioridades" (urgencia × impacto), sin absorber ningún KPI de esta tabla.

Cada gráfica se envuelve en `useMemo(..., [patients, appointments, diagnosticos, especialistas])` para recomputar reactivamente; color/badge vía `getSemaforo(kind, valorAgregado)`.

## 8. Renombre "Help Desk" → "Soporte Técnico" + fichas de equipo

- `HelpDeskPage.tsx` → renombrar componente a `SoporteTecnicoPage` en `src/components/pages/SoporteTecnicoPage.tsx`, actualizar `Sidebar.tsx` (label + ruta) e `Index.tsx` (switch de página).
- Contenido: header "Soporte Técnico" + 3 tarjetas centradas en fila (`grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto`), cada una con avatar/ícono médico, nombre completo, y campos:
  - Cédula de Identidad
  - Rol de Equipo
  - Contacto Directo
- Datos:
  1. Guillermo José Rojas Piñerúa
  2. Manuel Delfín Salazar Díaz
  3. O'Neal Josué Marchán Márquez
- **Nota**: los campos Cédula, Rol y Contacto llegaron vacíos en la solicitud; se dejarán como `"— por definir —"` para que el usuario los complete después con un simple edit.

## Fuera de alcance

Backend real, envío real de correos, tablas o KPIs no listados arriba.

## Detalles técnicos

- **Nuevo slice `diagnosticos**` en `useDemoStore`: `{ id, paciente, enfermedad, etapa: 'inicial'|'avanzada', fecha, createdAt }` + `addDiagnostico/updateDiagnostico/removeDiagnostico` + inclusión en `removeExpired`.
- `**monthlySnapshot**` en el store, campo persistido; helper `refreshSnapshotIfNeeded()` llamado desde `App.tsx` junto al `setInterval` existente.
- `**src/lib/audit.ts**` nuevo, envoltura sobre `addHistorial`. Todos los stores/handlers importan `logAudit` en lugar de duplicar strings.
- `**especialistas/utils.ts**`: exportar `zoneColor(desv: number)` y `zoneLabel(desv)` con 3 zonas. Eliminar exports antiguos usados solo por `DivergingBar`.
- **Sin cambios** en el sistema de temas, sidebar, login, reportes ni módulos de reporting.

## Criterio de aceptación global

1. Crear/editar/eliminar en cualquier tabla: persiste tras F5 durante ≥ 35 min, aparece en Historial de Cambios y actualiza cards + gráficas al instante.
2. Diverging Bar y Gauge se ven espaciados, sin solapes, con semáforo de 3 zonas.
3. Todos los KPIs muestran % con color según el valor calculado en vivo — nada estático.
4. "Soporte Técnico" reemplaza "Help Desk" con las 3 fichas centradas.