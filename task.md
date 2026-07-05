# Task: Conectar Frontend con APIs del Backend

## Fase 1: Capa de servicios (hooks)
- [ ] `src/services/apiClient.ts` — Singleton API con token dinámico
- [ ] `src/services/useAuth.ts` — Login, logout, recovery
- [ ] `src/services/usePacientes.ts` — CRUD pacientes
- [ ] `src/services/useCitas.ts` — CRUD citas + motivos
- [ ] `src/services/useMedicos.ts` — CRUD médicos + especialidades
- [ ] `src/services/useUsuarios.ts` — CRUD usuarios
- [ ] `src/services/useAuditorias.ts` — Listado auditoría
- [ ] `src/services/useDiagnosticos.ts` — CRUD diagnósticos
- [ ] `src/services/useJornadas.ts` — Sesiones + bloqueos
- [ ] `src/services/useDashboard.ts` — Indicadores dashboard
- [ ] `src/services/useNotificaciones.ts` — Notificaciones
- [ ] `.env` — Variable de entorno API_BASE_URL

## Fase 2: Migrar componentes
- [ ] `Login.tsx` — Auth real
- [ ] `DashboardContent.tsx` — Métricas reales
- [ ] `PatientTable.tsx` — Pacientes reales
- [ ] `EarlyDetectionGauge.tsx` — Eliminar datos estáticos
- [ ] `DecisionMatrix.tsx` — Eliminar datos estáticos
- [ ] `CitasPage.tsx` — Citas reales
- [ ] `EspecialistasPage.tsx` — Médicos reales
- [ ] `UsuariosPage.tsx` — Usuarios reales
- [ ] `AuditoriasPage.tsx` — Auditoría real
- [ ] `DiagnosticosPage.tsx` — Diagnósticos reales
- [ ] `JornadasPage.tsx` — Jornadas reales
- [ ] `Header.tsx` — Notificaciones reales

## Fase 3: Limpieza
- [ ] Eliminar `src/data/appointmentsStore.ts`
- [ ] Eliminar `src/data/patientsStore.ts`
- [ ] Eliminar `src/data/especialistasStore.ts`
- [ ] Eliminar `src/data/usuariosStore.ts`
- [ ] Eliminar `src/data/historialStore.ts`

## Fase 4: Verificación
- [ ] Build exitoso
- [ ] Verificación visual en browser
