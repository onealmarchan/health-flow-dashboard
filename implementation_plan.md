# Conectar Frontend con APIs del Backend — Eliminar Datos Estáticos

## Contexto

El frontend tiene un `ApiClient` completo en `src/api/client.ts` (auto-generado desde OpenAPI) con todos los endpoints del backend, pero **ningún componente lo usa**. En su lugar, hay 5 archivos de datos estáticos en `src/data/` que alimentan todas las páginas con datos hardcodeados. Además, el Login y las notificaciones del Header usan lógica simulada.

## Alcance del Cambio

### Módulos que se conectarán a la API:

| Módulo | Archivo estático actual | Endpoint API |
|---|---|---|
| **Login** | Credenciales hardcoded en `Login.tsx` | `AuthController_login`, `AuthController_requestCode`, `AuthController_resetPassword` |
| **Dashboard** (métricas) | `patients`, `appointments`, `especialistas` | `DashboardController_*` (total-pacientes, total-consultas, citas-hoy, ocupacion-agenda, bloqueos-agenda) |
| **Pacientes** (tabla) | `patientsStore.ts` | `PacienteController_getAllPacientes`, `PacienteController_createPaciente` |
| **Citas** | `appointmentsStore.ts` + `patientsStore.ts` | `CitaMedicaController_*`, `PacienteController_*`, `MedicoController_*`, `SesionMedicaController_*`, `MotivoConsultaController_*` |
| **Especialistas** | `especialistasStore.ts` | `MedicoController_*`, `EspecialidadController_*` |
| **Usuarios** | `usuariosStore.ts` | `UsuarioController_*` |
| **Auditorías** | `historialStore.ts` | `AuditoriaController_findAll` |
| **Diagnósticos** | Mock inline en `DiagnosticosPage.tsx` | `DiagnosticoEnfermedadController_*`, `EnfermedadController_*`, `SintomaController_*` |
| **Jornadas** | Mock inline en `JornadasPage.tsx` | `SesionMedicaController_*`, `BloqueoAgendaController_*`, `MedicoController_*` |
| **Notificaciones** (Header) | Mock inline en `Header.tsx` | `NotificacionController_*` |

---

## Propuesta de Arquitectura

### 1. Capa de servicios + React Query Hooks

Crear una carpeta `src/services/` con hooks de React Query que encapsulen cada dominio:

```
src/services/
  apiClient.ts         ← Instancia singleton con token dinámico
  useAuth.ts           ← Login, logout, requestCode, resetPassword
  usePacientes.ts      ← CRUD pacientes
  useCitas.ts          ← CRUD citas + motivos
  useMedicos.ts        ← CRUD médicos/especialistas + especialidades
  useUsuarios.ts       ← CRUD usuarios
  useAuditorias.ts     ← Listado auditoría
  useDiagnosticos.ts   ← CRUD diagnósticos + enfermedades + síntomas
  useJornadas.ts       ← Sesiones médicas + bloqueos
  useDashboard.ts      ← Indicadores del dashboard
  useNotificaciones.ts ← Notificaciones
```

Cada hook usará `@tanstack/react-query` (ya instalado) para:
- `useQuery` para lecturas (con loading/error states)
- `useMutation` para escrituras (con invalidación automática del caché)

### 2. Instancia API con token dinámico

El `ApiClient` del `client.ts` ya lee `localStorage.getItem('token')`. Crearemos una instancia singleton que se configure correctamente.

### 3. Estados de carga y error

Cada página mostrará:
- **Skeleton/loading** mientras carga
- **Estado vacío** cuando no hay datos
- **Toast de error** cuando falla la API (con opción de reintentar)

---

## Proposed Changes

### Capa de servicios (todos archivos NUEVOS)

#### [NEW] [apiClient.ts](file:///home/yiye/Música/frontend/health-flow-dashboard/src/services/apiClient.ts)
Singleton del `ApiClient` con `baseURL` configurable via `.env` y manejo de token.

#### [NEW] [useAuth.ts](file:///home/yiye/Música/frontend/health-flow-dashboard/src/services/useAuth.ts)
Hook con mutations para login, requestCode, resetPassword. El login guardará el token en localStorage y redirigirá.

#### [NEW] [usePacientes.ts](file:///home/yiye/Música/frontend/health-flow-dashboard/src/services/usePacientes.ts)
`useQuery` para `getAllPacientes`, `useMutation` para `createPaciente`, `updatePaciente`, `deletePaciente`.

#### [NEW] [useCitas.ts](file:///home/yiye/Música/frontend/health-flow-dashboard/src/services/useCitas.ts)
Hooks para citas médicas y motivos de consulta.

#### [NEW] [useMedicos.ts](file:///home/yiye/Música/frontend/health-flow-dashboard/src/services/useMedicos.ts)
Hooks para médicos, especialidades y sesiones médicas por médico.

#### [NEW] [useUsuarios.ts](file:///home/yiye/Música/frontend/health-flow-dashboard/src/services/useUsuarios.ts)
Hooks CRUD de usuarios con toggle de estado.

#### [NEW] [useAuditorias.ts](file:///home/yiye/Música/frontend/health-flow-dashboard/src/services/useAuditorias.ts)
Hook para listar auditorías con filtros.

#### [NEW] [useDiagnosticos.ts](file:///home/yiye/Música/frontend/health-flow-dashboard/src/services/useDiagnosticos.ts)
Hooks para diagnósticos de enfermedad, enfermedades y síntomas.

#### [NEW] [useJornadas.ts](file:///home/yiye/Música/frontend/health-flow-dashboard/src/services/useJornadas.ts)
Hooks para sesiones médicas y bloqueos de agenda.

#### [NEW] [useDashboard.ts](file:///home/yiye/Música/frontend/health-flow-dashboard/src/services/useDashboard.ts)
Hooks para los 5 indicadores del dashboard (total pacientes, consultas, citas hoy, ocupación, bloqueos).

#### [NEW] [useNotificaciones.ts](file:///home/yiye/Música/frontend/health-flow-dashboard/src/services/useNotificaciones.ts)
Hooks para obtener, marcar como leída y eliminar notificaciones.

---

### Componentes MODIFICADOS

#### [MODIFY] [Login.tsx](file:///home/yiye/Música/frontend/health-flow-dashboard/src/pages/Login.tsx)
- Eliminar credenciales hardcoded (`VALID_EMAIL`, `VALID_PASSWORD`)
- Usar `useAuth().loginMutation` para autenticar contra `/auth/login`
- Usar `useAuth().requestCodeMutation` para `/auth/request-code`
- Usar `useAuth().resetPasswordMutation` para `/auth/reset-password`
- Guardar token JWT en localStorage al login exitoso

#### [MODIFY] [DashboardContent.tsx](file:///home/yiye/Música/frontend/health-flow-dashboard/src/components/dashboard/DashboardContent.tsx)
- Reemplazar imports de `patientsStore`, `appointmentsStore`, `especialistasStore`
- Usar `useDashboard()` hooks para las 5 MetricCards
- Mostrar skeleton mientras carga

#### [MODIFY] [PatientTable.tsx](file:///home/yiye/Música/frontend/health-flow-dashboard/src/components/dashboard/PatientTable.tsx)
- Reemplazar `usePatients()` por `usePacientes().query`
- Mapear campos del backend a los campos del frontend

#### [MODIFY] [CitasPage.tsx](file:///home/yiye/Música/frontend/health-flow-dashboard/src/components/pages/CitasPage.tsx)
- Reemplazar `usePatients()` y `useAppointments()` por hooks de API
- Reemplazar `doctorsBySpecialty` estático por datos de `useMedicos()`
- Conectar creación de citas a `useCitas().createMutation`

#### [MODIFY] [EspecialistasPage.tsx](file:///home/yiye/Música/frontend/health-flow-dashboard/src/components/pages/EspecialistasPage.tsx)
- Reemplazar `useEspecialistas()` por `useMedicos().query`
- Reemplazar especialidades hardcoded por `useEspecialidades().query`
- Conectar creación a `useMedicos().createMutation`

#### [MODIFY] [UsuariosPage.tsx](file:///home/yiye/Música/frontend/health-flow-dashboard/src/components/pages/UsuariosPage.tsx)
- Reemplazar `initialUsuarios` por `useUsuarios().query`
- Conectar CRUD real

#### [MODIFY] [AuditoriasPage.tsx](file:///home/yiye/Música/frontend/health-flow-dashboard/src/components/pages/AuditoriasPage.tsx)
- Reemplazar `historialMock` por `useAuditorias().query`
- Mapear campos de auditoría del backend

#### [MODIFY] [DiagnosticosPage.tsx](file:///home/yiye/Música/frontend/health-flow-dashboard/src/components/pages/DiagnosticosPage.tsx)
- Reemplazar `mockCitas` e `initialDiagnosticos` por hooks de API
- Conectar creación de diagnósticos

#### [MODIFY] [JornadasPage.tsx](file:///home/yiye/Música/frontend/health-flow-dashboard/src/components/pages/JornadasPage.tsx)
- Reemplazar `doctors` estático por `useMedicos().query`
- Conectar sesiones y bloqueos a API

#### [MODIFY] [Header.tsx](file:///home/yiye/Música/frontend/health-flow-dashboard/src/components/layout/Header.tsx)
- Reemplazar `initialNotifications` por `useNotificaciones().query`
- Conectar marcar leída y eliminar

#### [MODIFY] [EarlyDetectionGauge.tsx](file:///home/yiye/Música/frontend/health-flow-dashboard/src/components/dashboard/EarlyDetectionGauge.tsx)
- Eliminar referencia a `appointments` estáticas

#### [MODIFY] [DecisionMatrix.tsx](file:///home/yiye/Música/frontend/health-flow-dashboard/src/components/dashboard/DecisionMatrix.tsx)
- Eliminar `useEspecialistas()` estático

---

### Archivos a ELIMINAR (datos estáticos)

#### [DELETE] [appointmentsStore.ts](file:///home/yiye/Música/frontend/health-flow-dashboard/src/data/appointmentsStore.ts)
#### [DELETE] [patientsStore.ts](file:///home/yiye/Música/frontend/health-flow-dashboard/src/data/patientsStore.ts)
#### [DELETE] [especialistasStore.ts](file:///home/yiye/Música/frontend/health-flow-dashboard/src/data/especialistasStore.ts)
#### [DELETE] [usuariosStore.ts](file:///home/yiye/Música/frontend/health-flow-dashboard/src/data/usuariosStore.ts)
#### [DELETE] [historialStore.ts](file:///home/yiye/Música/frontend/health-flow-dashboard/src/data/historialStore.ts)

---

### Archivo de entorno

#### [NEW] [.env](file:///home/yiye/Música/frontend/health-flow-dashboard/.env)
```
VITE_API_BASE_URL=http://localhost:3000
```

---

## Open Questions

> [!IMPORTANT]
> **¿En qué puerto corre el backend?** El `ApiClient` actual tiene `baseURL: 'http://localhost:3000'`. ¿Es correcto o el backend corre en otro puerto?

> [!IMPORTANT]
> **¿Se debe implementar protección de rutas (auth guard)?** Actualmente el usuario puede entrar directamente a `/` sin estar logueado. ¿Quieres que redirija a `/login` si no hay token JWT válido?

> [!IMPORTANT]
> **Campos del backend vs campos del frontend.** Los tipos del backend usan nombres como `pk_num_medico_ministerio_salud`, `fk_ps_a001_num_comunidad`, etc. Las respuestas del backend ¿retornan estos mismos campos o retornan campos más legibles? Necesito saber la forma de las respuestas para mapear correctamente.

---

## Verification Plan

### Build Check
```bash
cd /home/yiye/Música/frontend/health-flow-dashboard && npm run build
```

### Verificación visual
- Abrir el frontend en el navegador y verificar que las páginas cargan
- Verificar que los estados de loading/error aparecen correctamente cuando el backend no está disponible

### Tests funcionales
- Login con credenciales reales contra el backend
- Verificar que las tablas se pueblan con datos del backend
- Verificar que las operaciones CRUD funcionan (crear, editar, eliminar)
