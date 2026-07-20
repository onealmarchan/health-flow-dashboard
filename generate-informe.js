import { Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType, BorderStyle } from 'docx';
import { writeFileSync } from 'fs';

const fecha = new Date().toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' });

function h1(t) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 140 }, children: [new TextRun({ text: t, bold: true })] });
}
function h2(t) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 260, after: 100 }, children: [new TextRun({ text: t, bold: true })] });
}
function p(t) {
  return new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: t, size: 22, font: 'Arial' })] });
}
function item(name, desc) {
  return new Paragraph({
    spacing: { after: 60 },
    indent: { left: 360 },
    children: [
      new TextRun({ text: name, bold: true, size: 22, font: 'Arial' }),
      new TextRun({ text: desc, size: 22, font: 'Arial' }),
    ],
  });
}
function capture(t) {
  return new Paragraph({
    spacing: { before: 160, after: 160 },
    alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.DASHED, size: 2, color: 'AAAAAA', space: 10 }, bottom: { style: BorderStyle.DASHED, size: 2, color: 'AAAAAA', space: 10 }, left: { style: BorderStyle.DASHED, size: 2, color: 'AAAAAA', space: 10 }, right: { style: BorderStyle.DASHED, size: 2, color: 'AAAAAA', space: 10 } },
    children: [new TextRun({ text: t, size: 20, font: 'Arial', color: '888888', italics: true })],
  });
}

const doc = new Document({
  styles: { default: { document: { run: { font: 'Arial', size: 22 } }, heading1: { run: { font: 'Arial', size: 30, bold: true, color: '1B3A5C' } }, heading2: { run: { font: 'Arial', size: 26, bold: true, color: '2B579A' } } } },
  sections: [
    // Portada
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
      children: [
        new Paragraph({ spacing: { before: 3600 }, children: [] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: 'Descripcion del Frontend', size: 40, bold: true, font: 'Arial', color: '1B3A5C' })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: 'MediCitas - Health Flow Dashboard', size: 26, font: 'Arial', color: '2B579A' })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 500 }, children: [new TextRun({ text: 'Centro Ambulatorio Dr. Salvador Allende', size: 22, font: 'Arial', color: '666666' })] }),
        new Paragraph({ spacing: { before: 200, after: 200 }, border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC', space: 4 } }, children: [] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Fecha: ${fecha}`, size: 20, font: 'Arial', color: '888888' })] }),
      ],
    },
    // Contenido
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
      children: [
        // Descripcion general
        h1('Descripcion del Frontend'),
        p('El frontend esta construido con Vite v5, React 18 y TypeScript, utilizando SWC como compilador para un rendimiento optimizado en desarrollo. Tailwind CSS sirve como base de estilos, complementado con el sistema de componentes shadcn/ui que proporciona 47 primitivas de interfaz construidas sobre Radix UI.'),
        p('Para la gestion de estado del servidor se utiliza TanStack React Query v5, que maneja automaticamente el cache, la invalidacion por mutaciones y la sincronizacion de datos. El enrutamiento se implementa con React Router v6, incluyendo carga diferida de paginas (lazy loading) y control de acceso basado en roles (ADMIN y ADMIN_AUXILIAR).'),
        p('Los formularios se validan con React Hook Form junto con Zod, incluyendo reglas de validacion especificas para formato venezolano (cedula, telefono de 11 digitos). La visualizacion de datos se apoya en Recharts para graficos declarativos y D3.js para componentes avanzados como treemaps.'),
        p('El sistema de reportes permite exportar datos en cuatro formatos: CSV, XLSX, PDF (con portada institucional usando jsPDF) y DOCX (con estructura profesional usando la libreria docx). Tambien incluye un sistema de 8 temas visuales con modo claro y oscuro, persistentes en el navegador.'),
        p('El servidor de desarrollo corre en el puerto 8080 con HMR habilitado, y el build de produccion genera chunks optimizados separando vendor de codigo de la aplicacion. La comunicacion con el backend se realiza a traves de un cliente HTTP auto-generado desde la especificacion OpenAPI, con interceptor JWT para autenticacion automatica.'),
        p('Toda la informacion del backend es consumida por esta aplicacion, que constituye el panel de gestion medica integral del Centro Ambulatorio Dr. Salvador Allende, administrando pacientes, medicos, especialidades, citas, diagnosticos, indicadores epidemiologicos y reportes.'),

        capture('Captura: Estructura general del proyecto (arbol de carpetas)'),

        // Carpetas principales
        h1('Descripcion de las carpetas principales'),
        item('src/api/ ', '- Cliente HTTP auto-generado desde la especificacion OpenAPI del backend. Contiene la clase ApiClient con interceptor JWT que adjunta el token de autenticacion automaticamente y redirige al login ante un error 401. Incluye todas las interfaces TypeScript para los DTOs y respuestas del backend.'),
        item('src/services/ ', '- Capa de acceso a datos basada en TanStack Query. Cada archivo envuelve los metodos del ApiClient en hooks personalizados (useQuery/useMutation) con cache automatico, invalidacion por mutaciones y normalizacion de respuestas. Incluye hooks para autenticacion, pacientes, citas, medicos, especialidades, diagnosticos, jornadas, comunidades, usuarios, auditorias, notificaciones e indicadores.'),
        item('src/components/ui/ ', '- 47 componentes primitivos del sistema de diseno shadcn/ui, construidos sobre Radix UI y estilizados con Tailwind CSS. Incluye botones, dialogos, selects, tablas, toasts, acordeones, calendarios, carruseles, paletas de comandos, drawers, menus, popover, progress bars, sliders, toggles y tooltips.'),
        item('src/components/layout/ ', '- Shell de la aplicacion. El Sidebar maneja la navegacion lateral con visibilidad condicional por rol y soporte para colapso. El Header contiene el centro de notificaciones, menu de usuario con avatar y boton de cambio de tema.'),
        item('src/components/dashboard/ ', '- Modulo completo del panel principal. Incluye tarjetas de metricas (KPIs) con indicadores de tendencia, catalogo de 16 indicadores con frecuencia de reporte, y graficos especializados: treemaps de distribucion etaria con D3, graficos de retencion por especialidad, barras apiladas de distribucion de enfermedades, gauge de deteccion temprana, indicadores geograficos y matrices de decision.'),
        item('src/components/pages/ ', '- Componentes de pagina completos para cada modulo funcional: Citas (gestion de turnos), Jornadas (sesiones medicas y bloqueo de agenda), Especialistas (medicos y carga de trabajo), Diagnosticos (enfermedades, sintomas y asociaciones), Usuarios (CRUD y roles), Auditorias (registro de actividad), Ajustes (preferencias), FAQ y HelpDesk.'),
        item('src/components/auth/ ', '- Guardias de autenticacion a nivel de ruta. RequireAuth valida el JWT almacenado en localStorage y redirige al login si es invalido. SharedOpen gestiona enlaces profundos para sesiones compartidas mediante BroadcastChannel.'),
        item('src/components/shared/ ', '- Componentes reutilizables transversales: barra de busqueda, filtros por columna, selectores de rango de fechas, tablas responsivas con scroll horizontal, paginacion, menus de acciones por fila, dialogos de confirmacion y botones estandarizados para formularios modales.'),
        item('src/components/reports/ ', '- Motor de exportacion multi-formato. Genera archivos en CSV, XLSX, PDF (con portada institucional, resumen ejecutivo y tablas formateadas via jsPDF) y DOCX (con estructura profesional via libreria docx). Incluye hojas de reporte avanzadas especializadas por modulo.'),
        item('src/components/backup/ ', '- Interfaz para la exportacion e importacion de respaldos de la base de datos en formatos JSON y CSV.'),
        item('src/components/theme/ ', '- Componente de efecto visual de transicion animada estilo electrocardiograma (ECG) al alternar entre temas.'),
        item('src/contexts/ ', '- Contexto de temas con 8 variaciones (4 claros y 4 oscuros), incluyendo persistencia en el navegador, toggle entre modo claro y oscuro, y triggers de animacion para transiciones visuales.'),
        item('src/lib/ ', '- Funciones utilitarias: cn() para fusion de clases Tailwind, esquemas de validacion Zod con formato especifico venezolano (cedula, telefono), y sistema de semaforos (verde/ambar/rojo) para el trafico visual de KPIs segun umbrales configurados.'),
        item('src/hooks/ ', '- Hooks personalizados: deteccion de viewport movil (useIsMobile) y gestion del estado de notificaciones toast con patron reducer y listeners externos.'),
        item('src/pages/ ', '- Componentes a nivel de ruta: Index es el shell autenticado principal con Sidebar y Header, Login incluye formulario de inicio de sesion y recuperacion de contrasena en 3 pasos con OTP, y tambien incluye las paginas de 404 y Acceso Denegado.'),
        item('src/test/ ', '- Infraestructura de testing con Vitest y Testing Library. Configuracion de entorno jsdom, matchers de jest-dom y mocks de APIs del navegador.'),
        item('src/data/ ', '- Directorio reservado para datos estaticos o mock, actualmente vacio.'),

        capture('Captura: Contenido de la carpeta src/'),

        // Logica principal
        h1('Logica principal del frontend'),

        h2('Paginas (pages/)'),
        item('Index.tsx (src/pages/Index.tsx) ', '- Shell autenticado principal. Usa Sidebar y Header como layout. Asigna paginas lazy-loaded segun el rol del usuario. Los administradores ven dashboard, usuarios y auditorias por defecto; los no administradores inician en panel de control.'),
        item('Login.tsx (src/pages/Login.tsx) ', '- Pagina de inicio de sesion con formulario de email y contrasena. Incluye flujo de recuperacion de contrasena en 3 pasos: envio de email, verificacion de codigo OTP con cuenta regresiva, y establecimiento de nueva contrasena. Contiene animaciones decorativas de iconos medicos y efecto shake en error.'),
        item('NotFound.tsx (src/pages/NotFound.tsx) ', '- Pagina de error 404 para rutas no encontradas.'),
        item('AccesoDenegado.tsx (src/pages/AccesoDenegado.tsx) ', '- Pagina de acceso denegado para usuarios sin el rol requerido.'),

        h2('Componentes de Layout'),
        item('Sidebar.tsx (src/components/layout/Sidebar.tsx) ', '- Barra de navegacion lateral con links a cada pagina del sistema. Implementa visibilidad condicional por rol (paginas exclusivas para ADMIN), soporte para colapso y menu hamburguesa en dispositivos moviles.'),
        item('Header.tsx (src/components/layout/Header.tsx) ', '- Barra superior con campana de notificaciones, avatar y menu del usuario, toggle de tema claro/oscuro, y boton de menu para movil.'),

        h2('Componentes de Autenticacion'),
        item('RequireAuth.tsx (src/components/auth/RequireAuth.tsx) ', '- Guardia de ruta que verifica la existencia y validez del JWT en localStorage. Redirige al login si el token es inexistente o expirado.'),
        item('SharedOpen.tsx (src/components/auth/SharedOpen.tsx) ', '- Maneja enlaces profundos /shared/:id. Transmite un evento de sesion compartida via BroadcastChannel (o localStorage como fallback), limpia el token y redirige al login.'),

        h2('Componentes del Dashboard'),
        item('DashboardContent.tsx (src/components/dashboard/DashboardContent.tsx) ', '- Orquestador principal del dashboard. Compone todas las tarjetas KPI y graficos en el layout del panel.'),
        item('kpiCatalog.ts (src/components/dashboard/kpiCatalog.ts) ', '- Define 16 KPIs con sus IDs, etiquetas, frecuencia de reporte (mensual/trimestral/bimensual/semestral) y agrupacion por slot para rotacion.'),
        item('KPIWrapper.tsx (src/components/dashboard/KPIWrapper.tsx) ', '- Wrapper generico que renderiza una tarjeta KPI con titulo, valor, color trafico y navegacion previo/siguiente dentro de un slot.'),
        item('KPIConfigModal.tsx (src/components/dashboard/KPIConfigModal.tsx) ', '- Modal para configurar opciones de visualizacion de un KPI (rango de fechas, filtro de cadencia).'),
        item('KPIExportPopover.tsx (src/components/dashboard/KPIExportPopover.tsx) ', '- Popover para exportar un KPI especifico en formato CSV, XLSX, PDF o DOCX.'),
        item('MetricCard.tsx (src/components/dashboard/MetricCard.tsx) ', '- Tarjetas de la fila superior del dashboard (total pacientes, citas del dia, consultas mensuales, etc.) con indicadores de tendencia.'),
        item('AgeTreeMap.tsx (src/components/dashboard/AgeTreeMap.tsx) ', '- Treemap impulsado por D3 para distribucion etaria de pacientes (bimensual).'),
        item('AgeGroupTrendChart.tsx (src/components/dashboard/AgeGroupTrendChart.tsx) ', '- Grafico de linea/barras que muestra tendencias de consultas por grupo de edad en trimestres.'),
        item('RetentionChart.tsx (src/components/dashboard/RetentionChart.tsx) ', '- Grafico de tasa de retencion por especialidad medica.'),
        item('StackedBarChart.tsx (src/components/dashboard/StackedBarChart.tsx) ', '- Barras apiladas para distribucion de enfermedades o tasas de demanda.'),
        item('EarlyDetectionGauge.tsx (src/components/dashboard/EarlyDetectionGauge.tsx) ', '- Visualizacion tipo gauge para la tasa de deteccion temprana de enfermedades.'),
        item('GeographicKPI.tsx (src/components/dashboard/GeographicKPI.tsx) ', '- Indicadores geograficos: densidad, concentracion, crecimiento y vulnerabilidad por comunidad.'),
        item('DecisionMatrix.tsx (src/components/dashboard/DecisionMatrix.tsx) ', '- Matriz de prioridad (urgencia x impacto) para priorizacion de triaje.'),
        item('PatientTable.tsx (src/components/dashboard/PatientTable.tsx) ', '- Vista de tabla con pacientes recientes y datos clave.'),

        h2('Paginas de Modulos'),
        item('CitasPage.tsx (src/components/pages/CitasPage.tsx) ', '- Pagina de gestion de citas medicas con CRUD, filtros y exportacion.'),
        item('JornadasPage.tsx (src/components/pages/JornadasPage.tsx) ', '- Pagina de sesiones medicas y turnos con programacion y bloqueo de agenda.'),
        item('EspecialistasPage.tsx (src/components/pages/EspecialistasPage.tsx) ', '- Pagina de gestion de medicos/especialistas con CRUD y balance de carga.'),
        item('DiagnosticosPage.tsx (src/components/pages/DiagnosticosPage.tsx) ', '- Pagina de diagnosticos con CRUD, vinculacion a enfermedades y sintomas.'),
        item('UsuariosPage.tsx (src/components/pages/UsuariosPage.tsx) ', '- Pagina de gestion de usuarios del sistema con CRUD, habilitacion y roles.'),
        item('AuditoriasPage.tsx (src/components/pages/AuditoriasPage.tsx) ', '- Visor de registros de auditoria con filtros por entidad, accion, usuario y fechas.'),
        item('PanelControlPage.tsx (src/components/pages/PanelControlPage.tsx) ', '- Panel de control para usuarios no administradores.'),
        item('AjustesPage.tsx (src/components/pages/AjustesPage.tsx) ', '- Pagina de configuracion de preferencias y tema.'),
        item('FAQPage.tsx (src/components/pages/FAQPage.tsx) ', '- Pagina de preguntas frecuentes.'),
        item('HelpDeskPage.tsx (src/components/pages/HelpDeskPage.tsx) ', '- Pagina de soporte y ayuda tecnica.'),

        h2('Componentes de Reportes'),
        item('exporters.ts (src/components/reports/exporters.ts) ', '- Motor de exportacion completo: funciones downloadCSV, downloadXLSX, downloadPDF (con jsPDF y autoTable) y downloadDOCX (con libreria docx). Incluye generarReporteGeneral() que construye un PDF con portada institucional, resumen ejecutivo, metricas y tabla de datos detallada.'),
        item('types.ts (src/components/reports/types.ts) ', '- Tipos centrales del sistema de reportes: ReportField, ReportableModule, ExportFormat (xlsx/csv/pdf/docx) y SortMode.'),
        item('useReportableTable.tsx (src/components/reports/useReportableTable.tsx) ', '- Hook que provee datos de tabla ordenados y filtrados para cualquier modulo reportable.'),
        item('useTableSelection.ts (src/components/reports/useTableSelection.ts) ', '- Hook para gestionar el estado de seleccion de filas en tablas de exportacion.'),
        item('ContextActionBar.tsx (src/components/reports/ContextActionBar.tsx) ', '- Barra de acciones flotante que aparece cuando se seleccionan filas (exportar, eliminar, etc.).'),
        item('AdvancedReportSheetCitas.tsx (src/components/reports/AdvancedReportSheetCitas.tsx) ', '- Hoja de reporte avanzada especializada para datos de citas medicas.'),
        item('AdvancedReportSheetDiagnosticos.tsx (src/components/reports/AdvancedReportSheetDiagnosticos.tsx) ', '- Hoja de reporte avanzada especializada para datos de diagnosticos.'),
        item('EspecialistasExportDrawer.tsx (src/components/reports/EspecialistasExportDrawer.tsx) ', '- Drawer de exportacion para datos de especialistas.'),
        item('SplitExportButton.tsx (src/components/reports/SplitExportButton.tsx) ', '- Boton dividido con dropdown para elegir formato de exportacion (CSV, XLSX, PDF, DOCX).'),
        item('SelectionCheckbox.tsx (src/components/reports/SelectionCheckbox.tsx) ', '- Componente de checkbox para seleccion de filas en tablas.'),

        h2('Servicios (services/)'),
        item('apiClient.ts (src/services/apiClient.ts) ', '- Singleton ApiClient basado en Axios con URL base dinamica (lee VITE_API_BASE_URL o usa hostname:3000). Funciones para gestion de token JWT: setAuthToken, clearAuthToken, extractAuthToken.'),
        item('useAuth.ts (src/services/useAuth.ts) ', '- Mutaciones de autenticacion: login (almacena token), logout (limpia token y cache de queries), solicitud de codigo OTP y restablecimiento de contrasena.'),
        item('useCurrentUser.ts (src/services/useCurrentUser.ts) ', '- Decodifica el JWT del localStorage y retorna id, email y rol del usuario. Verifica expiracion.'),
        item('usePacientes.ts (src/services/usePacientes.ts) ', '- CRUD completo para pacientes con hooks de TanStack Query.'),
        item('useCitas.ts (src/services/useCitas.ts) ', '- CRUD de citas medicas y motivos de consulta. Incluye normalizacion de respuestas y construccion de payloads.'),
        item('useMedicos.ts (src/services/useMedicos.ts) ', '- CRUD de medicos y especialidades con tiempo de stale de 5 minutos.'),
        item('useDiagnosticos.ts (src/services/useDiagnosticos.ts) ', '- CRUD de diagnosticos, enfermedades, sintomas y asociaciones diagnostico-sintoma.'),
        item('useJornadas.ts (src/services/useJornadas.ts) ', '- CRUD de sesiones medicas (jornadas) y bloqueos de agenda. Incluye helpers de normalizacion para dia de la semana y turno.'),
        item('useComunidades.ts (src/services/useComunidades.ts) ', '- Lectura de comunidades y creacion con tiempo de stale de 10 minutos.'),
        item('useUsuarios.ts (src/services/useUsuarios.ts) ', '- CRUD de usuarios del sistema con toggle de habilitacion/deshabilitacion.'),
        item('useAuditorias.ts (src/services/useAuditorias.ts) ', '- Consulta de registros de auditoria con filtros por entidad, accion, usuario, rango de fechas y paginacion.'),
        item('useNotificaciones.ts (src/services/useNotificaciones.ts) ', '- Sistema de notificaciones con polling cada 30 segundos y actualizaciones optimistas para marcar como leidas y eliminar.'),
        item('useDashboard.ts (src/services/useDashboard.ts) ', '- Agrega 7 consultas del dashboard (total pacientes, consultas, citas del dia, ocupacion de agenda, bloqueos, carga promedio, emergencias) en un solo objeto.'),
        item('useIndicadores.ts (src/services/useIndicadores.ts) ', '- 14 hooks de indicadores, cada uno envuelve un endpoint del backend. Calcula automaticamente el mes/trimestre/bimestre/semestre actual.'),
        item('backup.ts (src/services/backup.ts) ', '- Llamadas axios puras para exportacion e importacion de respaldos (JSON o CSV), con descarga de blobs.'),

        h2('Utilidades y Validaciones'),
        item('utils.ts (src/lib/utils.ts) ', '- Funcion cn() para fusion atonica de clases de Tailwind usando clsx y tailwind-merge.'),
        item('validators.ts (src/lib/validators.ts) ', '- Esquemas Zod para todos los formularios: paciente, motivo de consulta, registro rapido, comunidad, especialista, especialidad, sintoma, diagnostico y usuario. Incluye formato venezolano (cedula, telefono).'),
        item('kpi-semaforos.ts (src/lib/kpi-semaforos.ts) ', '- Sistema de semaforos para KPIs: getSemaforo() retorna verde, ambar o rojo segun umbrales para 11 tipos de indicador. Exporta clases de Tailwind para cada color.'),

        h2('Hooks Personalizados'),
        item('use-mobile.tsx (src/hooks/use-mobile.tsx) ', '- Hook useIsMedia() que retorna true si el viewport es menor a 768px.'),
        item('use-toast.ts (src/hooks/use-toast.ts) ', '- Gestion de estado de notificaciones toast con patron reducer y listeners externos.'),

        h2('Temas'),
        item('ThemeContext.tsx (src/contexts/ThemeContext.tsx) ', '- Maneja 8 temas: light-blue (por defecto claro), light-green, light-violet, light-brown, dark-purple (por defecto oscuro), dark-scarlet, dark-black-green, dark-white-gray. Provee theme, setTheme, mode, toggleMode y transitionTick.'),

        h2('Archivos de Configuracion'),
        item('vite.config.ts ', '- Compilador SWC, chunk splitting manual (vendor-react, vendor-ui, vendor-charts, vendor-query), servidor de desarrollo en puerto 8080.'),
        item('tailwind.config.ts ', '- Modo oscuro por clase, sistema completo de tokens de colores (shadcn/ui), 17 animaciones customizadas, fuente Figtree y Noto Sans.'),
        item('tsconfig.json ', '- Target ES2020, alias de ruta @/ -> src/, modo relajado (noImplicitAny: false).'),
        item('vitest.config.ts ', '- Entorno js globals habilitados, archivo de setup.'),
        item('components.json ', '- Configuracion de shadcn/ui: estilo default, color base slate, variables CSS.'),
        item('eslint.config.js ', '- ESLint 9 con flat config para react-hooks, react-refresh y typescript-eslint.'),
        item('postcss.config.js ', '- Tailwind CSS y Autoprefixer.'),
        item('index.html ', '- lang=\"es\", titulo \"MediCitas\", Google Fonts (Figtree, Noto Sans).'),
        item('.env ', '- VITE_API_BASE_URL=http://localhost:3000.'),

        capture('Captura: Archivos de configuracion en la raiz del proyecto'),

        h1('Conclusion'),
        p('El frontend de MediCitas esta organizado en una arquitectura de capas claramente definida: datos (api/services), presentacion (components/pages), logica (lib/hooks) e infraestructura (config/test). Esta separacion facilita el mantenimiento, la escalabilidad y la incorporacion de nuevos modulos clinicos. Las dependencias externas cubren todas las necesidades funcionales del sistema, desde la validacion de formularios hasta la generacion de reportes institucionales en multiples formatos.'),
      ],
    },
  ],
});

const blob = await Packer.toBlob(doc);
const buffer = Buffer.from(await blob.arrayBuffer());
writeFileSync('informe-estructura-frontend.docx', buffer);
console.log('Generado: informe-estructura-frontend.docx');
