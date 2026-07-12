# MANUAL DE USUARIO

## MediCitas — Sistema de Gestión Médica

---

| Campo | Detalle |
|---|---|
| **Nombre del Producto** | MediCitas — Health Flow Dashboard |
| **Versión** | 1.0 |
| **Fecha de Emisión** | Julio 2026 |
| **Clasificación** | Documento de Usuario Interno |
| **Norma de Referencia** | ISO/IEC 18019:2004 / IEEE 1063-2001 |

---

## ÍNDICE

1. [Introducción](#1-introducción)
   - 1.1 Propósito del Manual
   - 1.2 Alcance
   - 1.3 Audiencia Objetivo
   - 1.4 Definiciones y Acrónimos
   - 1.5 Referencias
2. [Descripción General del Sistema](#2-descripción-general-del-sistema)
   - 2.1 ¿Qué es MediCitas?
   - 2.2 Características Principales
   - 2.3 Arquitectura del Sistema
3. [Requisitos del Sistema](#3-requisitos-del-sistema)
   - 3.1 Requisitos de Hardware
   - 3.2 Requisitos de Software
   - 3.3 Conexión de Red
4. [Instalación y Configuración](#4-instalación-y-configuración)
   - 4.1 Instalación del Servidor de Desarrollo
   - 4.2 Variables de Entorno
   - 4.3 Inicio del Sistema
5. [Inicio de Sesión y Autenticación](#5-inicio-de-sesión-y-autenticación)
   - 5.1 Pantalla de Inicio de Sesión
   - 5.2 Proceso de Autenticación
   - 5.3 Recuperación de Contraseña
   - 5.4 Cierre de Sesión
6. [Interfaz Principal — Panel de Control](#6-interfaz-principal--panel-de-control)
   - 6.1 Elementos de la Interfaz
   - 6.2 Barra Lateral de Navegación
   - 6.3 Barra Superior (Header)
   - 6.4 Cambio de Tema
7. [Módulo de Dashboard (Indicadores)](#7-módulo-de-dashboard-indicadores)
   - 7.1 Tarjetas de Métricas KPI
   - 7.2 Sistema de Semáforo (Tráfico)
   - 7.3 Visualizaciones Gráficas
   - 7.4 Configuración de Indicadores
   - 7.5 Tabla de Pacientes
8. [Módulo de Citas Médicas](#8-módulo-de-citas-médicas)
   - 8.1 Lista de Citas
   - 8.2 Crear Nueva Cita
   - 8.3 Editar Cita
   - 8.4 Cancelar Cita
   - 8.5 Vista de Calendario
   - 8.6 Exportación de Citas
9. [Módulo de Planificación de Jornadas](#9-módulo-de-planificación-de-jornadas)
   - 9.1 Tabla de Disponibilidad Semanal
   - 9.2 Gestión de Sesiones Médicas
   - 9.3 Bloqueo de Agenda
   - 9.4 Indicadores de Jornada
10. [Módulo de Especialistas Médicos](#10-módulo-de-especialistas-médicos)
    - 10.1 Lista de Especialistas
    - 10.2 Crear Especialista
    - 10.3 Editar Especialista
    - 10.4 Gestión de Especialidades
    - 10.5 Exportación
11. [Módulo de Diagnósticos](#11-módulo-de-diagnósticos)
    - 11.1 Lista de Diagnósticos
    - 11.2 Crear Diagnóstico
    - 11.3 Gestión de Enfermedades
    - 11.4 Gestión de Síntomas
    - 11.5 Exportación
12. [Módulo de Gestión de Usuarios](#12-módulo-de-gestión-de-usuarios)
    - 12.1 Lista de Usuarios
    - 12.2 Crear Usuario
    - 12.3 Editar Usuario
    - 12.4 Activar/Desactivar Usuarios
    - 12.5 Roles y Permisos
13. [Módulo de Auditoría (Historial de Cambios)](#13-módulo-de-auditoría-historial-de-cambios)
    - 13.1 Consulta del Historial
    - 13.2 Filtros de Búsqueda
14. [Módulo de Ajustes](#14-módulo-de-ajustes)
    - 14.1 Selección de Tema
    - 14.2 Temas Disponibles
15. [Sistema de Reportes y Exportación](#15-sistema-de-reportes-y-exportación)
    - 15.1 Formatos de Exportación
    - 15.2 Exportación CSV
    - 15.3 Exportación XLSX (Excel)
    - 15.4 Exportación PDF
    - 15.5 Exportación DOCX (Word)
    - 15.6 Reportes Avanzados
16. [Sistema de Copias de Seguridad (Backup)](#16-sistema-de-copias-de-seguridad-backup)
    - 16.1 Exportar Respaldo
    - 16.2 Importar Respaldo
17. [Sistema de Notificaciones](#17-sistema-de-notificaciones)
    - 17.1 Centro de Notificaciones
    - 17.2 Gestión de Notificaciones
18. [Solución de Problemas](#18-solución-de-problemas)
19. [Preguntas Frecuentes (FAQ)](#19-preguntas-frecuentes-faq)
20. [Glosario](#20-glosario)
21. [Índice Alfabético](#21-índice-alfabético)

---

## 1. Introducción

### 1.1 Propósito del Manual

El presente manual de usuario tiene como finalidad proporcionar las instrucciones necesarias para el uso adecuado del sistema **MediCitas — Health Flow Dashboard**, una plataforma web de gestión médica diseñada para la administración de citas, pacientes, especialistas, diagnósticos y operaciones clínicas.

Este documento está dirigido a los usuarios finales del sistema y contiene la información requerida para:

- Instalar y configurar el entorno de desarrollo.
- Iniciar sesión y navegar por la interfaz.
- Utilizar cada uno de los módulos funcionales.
- Generar reportes y exportar información.
- Realizar copias de seguridad.
- Resolver problemas comunes.

### 1.2 Alcance

Este manual cubre la versión **1.0** del sistema MediCitas, incluyendo todos los módulos funcionales disponibles en la interfaz de usuario. No cubre el desarrollo del backend, la base de datos subyacente ni la configuración del servidor de producción.

### 1.3 Audiencia Objetivo

| Rol | Nivel de Experiencia | Uso Previsto |
|---|---|---|
| Administrador del Sistema | Técnico / Semi-técnico | Instalación, configuración, gestión de usuarios |
| Personal Administrativo | No técnico | Uso diario de citas, pacientes, reportes |
| Auditor / Supervisión | No técnico | Consulta de historial de cambios |

### 1.4 Definiciones y Acrónimos

| Término | Definición |
|---|---|
| **KPI** | Key Performance Indicator — Indicador Clave de Desempeño |
| **JWT** | JSON Web Token — Token de autenticación |
| **CRUD** | Create, Read, Update, Delete — Operaciones de base de datos |
| **SPA** | Single Page Application — Aplicación de Página Única |
| **CI** | Cédula de Identidad — Documento de identificación venezolano |
| **MPPS** | Ministerio del Poder Popular para la Salud |
| **OTP** | One-Time Password — Contraseña de un solo uso |
| **CSV** | Comma-Separated Values — Valores separados por coma |
| **XLSX** | Formato de archivo de Microsoft Excel |
| **PDF** | Portable Document Format — Formato de documento portátil |
| **DOCX** | Formato de documento de Microsoft Word |
| **API** | Application Programming Interface — Interfaz de Programación de Aplicaciones |
| **Semáforo** | Sistema de indicadores visuales con colores verde, amarillo y rojo |

### 1.5 Referencias

| Referencia | Descripción |
|---|---|
| ISO/IEC 18019:2004 | Guía para la preparación de manuales de usuario de software |
| IEEE 1063-2001 | Estándar para documentación de usuario de software |
| Documento `navigation_map.md` | Mapa de navegación interno del proyecto |
| OpenAPI Specification | Especificación de la API backend utilizada |

---

## 2. Descripción General del Sistema

### 2.1 ¿Qué es MediCitas?

**MediCitas** es una aplicación web de gestión médica que permite administrar de manera integral las operaciones de una consulta o centro médico. El sistema está diseñado para el contexto venezolano e integra herramientas de planificación, seguimiento y reporte en una única plataforma accesible desde el navegador web.

### 2.2 Características Principales

- **Gestión de Citas Médicas**: Crear, editar, cancelar y visualizar citas en calendario.
- **Planificación de Jornadas**: Administrar horarios, sesiones médicas y bloqueos de agenda.
- **Control de Especialistas**: Gestionar médicos, especialidades y disponibilidad.
- **Diagnósticos Clínicos**: Registrar enfermedades, síntomas y niveles de severidad.
- **Dashboard Analítico**: Indicadores KPI con sistema de semáforo y gráficos interactivos.
- **Gestión de Usuarios**: Administración de cuentas con roles y permisos.
- **Auditoría**: Registro histórico de todos los cambios realizados en el sistema.
- **Reportes Multiformato**: Exportación a CSV, Excel, PDF y Word.
- **Copias de Seguridad**: Respaldo e importación de datos en JSON y CSV.
- **Notificaciones**: Centro de notificaciones en tiempo real.
- **8 Temas Visuales**: Personalización de la apariencia con animaciones.
- **Diseño Responsivo**: Adaptado a dispositivos de escritorio y móviles.

### 2.3 Arquitectura del Sistema

MediCitas sigue una arquitectura **SPA (Single Page Application)** con las siguientes capas:

```
┌─────────────────────────────────────────────────┐
│               NAVEGADOR WEB                      │
│  ┌───────────────────────────────────────────┐   │
│  │         Frontend (React + TypeScript)     │   │
│  │  ┌─────────┐ ┌──────────┐ ┌───────────┐  │   │
│  │  │ Vistas  │ │ Servicios│ │ Componentes│  │   │
│  │  └────┬────┘ └────┬─────┘ └─────┬─────┘  │   │
│  │       └───────────┼─────────────┘         │   │
│  │                   ▼                        │   │
│  │         Cliente API (Axios + JWT)          │   │
│  └───────────────────┼───────────────────────┘   │
│                      │ HTTP/REST                  │
└──────────────────────┼───────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────┐
│            Backend API (localhost:3000)            │
│         (OpenAPI / Base de Datos)                 │
└──────────────────────────────────────────────────┘
```

---

## 3. Requisitos del Sistema

### 3.1 Requisitos de Hardware

| Componente | Mínimo | Recomendado |
|---|---|---|
| Procesador | 1 GHz | 2 GHz o superior |
| Memoria RAM | 2 GB | 4 GB o superior |
| Espacio en Disco | 500 MB | 1 GB o superior |
| Resolución de Pantalla | 1024 x 768 | 1920 x 1080 o superior |
| Conexión a Internet | 1 Mbps | 5 Mbps o superior |

### 3.2 Requisitos de Software

| Software | Versión Mínima | Versión Recomendada |
|---|---|---|
| Sistema Operativo | Windows 10 / macOS 10.15 / Ubuntu 20.04 | Windows 11 / macOS 14 / Ubuntu 22.04 |
| Navegador Web | Google Chrome 90 / Firefox 88 / Edge 90 | Google Chrome 120+ / Firefox 120+ / Edge 120+ |
| Node.js (para desarrollo) | 18.x | 20.x LTS |
| npm o Bun | npm 9+ / Bun 1.0+ | npm 10+ / Bun 1.1+ |

> **Nota:** El sistema es accesible desde cualquier navegador moderno que soporte ECMAScript 2020+. No se requiere instalación adicional en los equipos de los usuarios finales.

### 3.3 Conexión de Red

- El frontend se ejecuta en el puerto **8080** por defecto.
- El backend debe estar accesible en **http://localhost:3000** (configurable).
- Se requiere conectividad HTTP entre el navegador y el servidor backend.

---

## 4. Instalación y Configuración

### 4.1 Instalación del Servidor de Desarrollo

#### Paso 1: Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd health-flow-dashboard
```

#### Paso 2: Instalar Dependencias

Con **npm**:
```bash
npm install
```

O con **Bun**:
```bash
bun install
```

#### Paso 3: Configurar Variables de Entorno

El archivo `.env` en la raíz del proyecto contiene la configuración necesaria:

```
VITE_API_BASE_URL=http://localhost:3000
```

Modifique esta variable si el backend se ejecuta en una dirección diferente.

#### Paso 4: Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

El sistema estará disponible en: **http://localhost:8080**

### 4.2 Variables de Entorno

| Variable | Valor por Defecto | Descripción |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:3000` | URL base del servidor backend API |

### 4.3 Inicio del Sistema

1. Asegúrese de que el **backend** esté ejecutándose en el puerto 3000.
2. Ejecute `npm run dev` en la terminal.
3. Abra el navegador web e ingrese a `http://localhost:8080`.
4. Será redirigido automáticamente a la pantalla de inicio de sesión.

### 4.4 Comandos Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo (puerto 8080) |
| `npm run build` | Genera la versión de producción |
| `npm run build:dev` | Genera la versión de desarrollo |
| `npm run preview` | Previsualiza la versión de producción |
| `npm run test` | Ejecuta las pruebas unitarias |
| `npm run test:watch` | Ejecuta las pruebas en modo observación |
| `npm run lint` | Verifica el código con ESLint |

---

## 5. Inicio de Sesión y Autenticación

### 5.1 Pantalla de Inicio de Sesión

Al acceder al sistema, se presenta la pantalla de autenticación con un diseño animado de tema médico (latido cardíaco ECG). La página contiene:

- Campo de **Correo Electrónico**
- Campo de **Contraseña**
- Botón **Iniciar Sesión**
- Enlace **¿Olvidó su contraseña?**

### 5.2 Proceso de Autenticación

1. Ingrese su correo electrónico registrado en el campo correspondiente.
2. Ingrese su contraseña en el segundo campo.
3. Haga clic en el botón **Iniciar Sesión**.
4. Si las credenciales son correctas, será redirigido al **Panel de Control (Dashboard)**.
5. Si las credenciales son incorrectas, se mostrará un mensaje de error con animación de sacudida.

> **Nota:** El sistema utiliza tokens JWT para mantener la sesión. El token se almacena localmente en el navegador y se envía automáticamente en cada petición al servidor.

### 5.3 Recuperación de Contraseña

Si ha olvidado su contraseña, siga estos pasos:

#### Paso 1: Solicitar Código
1. Haga clic en **¿Olvidó su contraseña?** en la pantalla de login.
2. Ingrese su correo electrónico registrado.
3. Haga clic en **Enviar Código**.
4. Se le enviará un código OTP de 6 dígitos a su correo electrónico.

#### Paso 2: Verificar Código
1. Ingrese el código de 6 dígitos recibido.
2. El código tiene un tiempo de expiración de **15 minutos**. Se mostrará un temporizador regressivo.
3. Haga clic en **Verificar**.

#### Paso 3: Establecer Nueva Contraseña
1. Ingrese su nueva contraseña.
2. Confirme la nueva contraseña escribiéndola nuevamente.
3. Haga clic en **Restablecer Contraseña**.
4. Será redirigido a la pantalla de inicio de sesión.

### 5.4 Cierre de Sesión

1. Haga clic en el ícono de usuario en la **barra superior** (esquina superior derecha).
2. Seleccione **Cerrar Sesión** en el menú desplegable.
3. Será redirigido a la pantalla de inicio de sesión.

> **Importante:** Al cerrar sesión, el token JWT se elimina del almacenamiento local del navegador. Todas las pestañas abiertas del sistema perderán acceso.

---

## 6. Interfaz Principal — Panel de Control

### 6.1 Elementos de la Interfaz

Una vez autenticado, la interfaz principal se compone de tres áreas principales:

```
┌──────────────────────────────────────────────────────┐
│  BARRA SUPERIOR (Header)                             │
│  [☰] [🔍 Buscar]          [🔔] [🌙] [👤 Usuario]   │
├────────────┬─────────────────────────────────────────┤
│            │                                         │
│  BARRA     │    ÁREA DE CONTENIDO                    │
│  LATERAL   │    (Página activa)                      │
│  (Sidebar) │                                         │
│            │                                         │
│  📊 Dash   │                                         │
│  📅 Citas  │                                         │
│  📋 Jorn.  │                                         │
│  👨‍⚕️ Esp.  │                                         │
│  🔬 Diag.  │                                         │
│  👥 Usu.   │                                         │
│  📝 Aud.   │                                         │
│  ⚙️ Aju.   │                                         │
│            │                                         │
├────────────┴─────────────────────────────────────────┤
│  PIE DE PÁGINA                                       │
└──────────────────────────────────────────────────────┘
```

### 6.2 Barra Lateral de Navegación

La barra lateral se encuentra en el lado izquierdo de la pantalla y contiene los accesos a todos los módulos del sistema. Puede ser **colapsada** para ganar espacio en el área de contenido.

| Ícono | Módulo | Descripción |
|---|---|---|
| 📊 | Dashboard | Panel de indicadores y métricas |
| 📅 | Citas | Gestión de citas médicas |
| 📋 | Jornadas | Planificación de horarios y sesiones |
| 👨‍⚕️ | Especialistas | Gestión de médicos y especialidades |
| 🔬 | Diagnósticos | Control de enfermedades y síntomas |
| 👥 | Usuarios | Administración de cuentas de usuario |
| 📝 | Auditoría | Historial de cambios del sistema |
| ⚙️ | Ajustes | Configuración de temas y apariencia |
| ❓ | FAQ | Preguntas frecuentes |
| 🎧 | Help Desk | Mesa de ayuda |

**Acciones disponibles:**
- **Colapsar/Expandir**: Haga clic en el ícono de menú (☰) en la barra superior.
- **Navegar**: Haga clic en cualquier módulo para cambiar el contenido mostrado.

### 6.3 Barra Superior (Header)

La barra superior contiene los siguientes elementos de derecha a izquierda:

| Elemento | Función |
|---|---|
| **Menú hamburguesa** (☰) | Colapsar/expandir la barra lateral |
| **Barra de búsqueda** | Búsqueda global en el sistema |
| **Centro de notificaciones** (🔔) | Acceso a notificaciones con contador de pendientes |
| **Toggle de tema** (🌙/☀️) | Alternar entre modo claro y oscuro con animación ECG |
| **Menú de usuario** (👤) | Acceso a perfil, ajustes y cierre de sesión |

### 6.4 Cambio de Tema

El sistema ofrece **8 temas visuales** organizados en modos claro y oscuro:

#### Temas Claros
| Tema | Descripción |
|---|---|
| **Azul Celeste** | Tema por defecto en modo claro. Dominio de tonos azul celeste. |
| **Verde Esmeralda** | Dominio de tonos verdes esmeralda. |
| **Violeta Claro** | Dominio de tonos violeta suaves. |
| **Marrón Claro** | Dominio de tonos marrones cálidos. |

#### Temas Oscuros
| Tema | Descripción |
|---|---|
| **Morado/Rosa** | Tema por defecto en modo oscuro. Dominio de tonos morados y rosados. |
| **Escarlata** | Dominio de tonos rojo escarlata sobre fondo oscuro. |
| **Negro/Verde** | Dominio de tonos verdes sobre fondo negro. |
| **Blanco/Gris** | Dominio de tonos grises y blancos sobre fondo oscuro. |

**Para cambiar el tema:**
1. Haga clic en el ícono de sol/luna en la barra superior para alternar entre modo claro y oscuro.
2. Navegue al módulo **Ajustes** (⚙️) desde la barra lateral.
3. Seleccione el tema visual de su preferencia.
4. Se reproducirá una animación de electrocardiograma (ECG) durante el cambio.

---

## 7. Módulo de Dashboard (Indicadores)

### 7.1 Tarjetas de Métricas KPI

El Dashboard presenta **5 tarjetas de métricas principales** en la parte superior:

| KPI | Descripción | Fórmula/Origen |
|---|---|---|
| **% Citas de Hoy** | Porcentaje de citas del día actual sobre el total programado | Citas de hoy / Total de citas |
| **Total de Consultas** | Número total de consultas registradas en el período | Conteo desde API |
| **Total de Pacientes** | Número total de pacientes activos en el sistema | Conteo desde API |
| **Carga por Especialista** | Distribución de carga de trabajo entre médicos | Desviación del promedio |
| **% de Urgencias** | Porcentaje de citas clasificadas como emergencia | Urgencias / Total citas |

Cada tarjeta muestra:
- El **nombre del indicador**.
- El **valor numérico** actual.
- Un **ícono** representativo.
- Un **color de semáforo** que indica el estado.

### 7.2 Sistema de Semáforo (Tráfico)

Cada KPI se evalúa mediante un sistema de semáforo de tres niveles:

| Nivel | Color | Significado |
|---|---|---|
| **Óptimo** | 🟢 Verde | El indicador se encuentra dentro de rangos satisfactorios |
| **Precaución** | 🟡 Amarillo | El indicador requiere atención |
| **Crítico** | 🔴 Rojo | El indicador está fuera de rangos aceptables |

**Umbrales por indicador:**

| Indicador | 🟢 Verde | 🟡 Amarillo | 🔴 Rojo |
|---|---|---|---|
| Citas de Hoy | ≥ 80% | 50% – 79% | < 50% |
| Total de Consultas | > 10% | 5% – 9.9% | < 5% |
| Total de Pacientes | > 10% | 5% – 9.9% | < 5% |
| Carga por Especialista | Desviación ≤ 20% | 21% – 40% | > 40% |
| % de Urgencias | 0% – 20% | 21% – 35% | > 35% |
| Retención | ≥ 80% | 50% – 79% | < 50% |
| Bloqueos de Agenda | 0% – 5% | 6% – 15% | > 15% |

### 7.3 Visualizaciones Gráficas

Debajo de las tarjetas KPI, el Dashboard ofrece **5 ranuras de visualización** configurables:

| Visualización | Tipo de Gráfico | Descripción |
|---|---|---|
| **Distribución por Edad** | Treemap (D3.js) | Muestra la distribución de pacientes por grupos de edad |
| **Tasa de Retención** | Gráfico de línea (Recharts) | Evolución temporal de la retención de pacientes |
| **Distribución de Enfermedades** | Gráfico de barras apiladas | Enfermedades más frecuentes segmentadas por categoría |
| **Matriz de Decisión** | Matriz de priorización | Priorización de acciones según impacto y urgencia |
| **KPI Geográfico** | Indicador geográfico | Densidad epidemiológica por comunidad |

### 7.4 Configuración de Indicadores

Para personalizar qué indicadores se muestran en las ranuras de visualización:

1. Haga clic en el botón de **configuración** (ícono de engranaje) en el área de visualizaciones.
2. Se abrirá un **modal de configuración** con las opciones disponibles.
3. Seleccione los indicadores que desea visualizar usando los checkboxes.
4. Haga clic en **Guardar** para aplicar los cambios.
5. Las visualizaciones se actualizarán inmediatamente.

### 7.5 Tabla de Pacientes

En la parte inferior del Dashboard se encuentra una tabla de pacientes con las siguientes funcionalidades:

- **Búsqueda**: Ingrese un nombre o cédula en el campo de búsqueda para filtrar.
- **Filtro por Comunidad**: Use el filtro para ver pacientes de una comunidad específica.
- **Paginación**: Navegue entre páginas usando los controles inferiores.
- **Exportación**: Exporte la lista de pacientes en diversos formatos.

---

## 8. Módulo de Citas Médicas

### 8.1 Lista de Citas

El módulo de Citas muestra un listado completo de todas las citas médicas registradas en el sistema. La vista incluye:

- **Tabla principal** con columnas: ID, Paciente, Médico, Fecha, Hora, Tipo, Estado, Motivo.
- **Barra de búsqueda** para filtrar citas por paciente, médico o motivo.
- **Filtros avanzados** por rango de fechas, tipo de cita y estado.
- **Botón "Nueva Cita"** para crear una cita.
- **Acciones por fila**: Editar, cancelar, ver detalles.

### 8.2 Crear Nueva Cita

1. Haga clic en el botón **Nueva Cita** (generalmente ubicado en la esquina superior derecha de la tabla).
2. Complete el formulario con los siguientes campos:

| Campo | Requerido | Descripción | Validación |
|---|---|---|---|
| **Paciente** | Sí | Seleccione o registre un paciente | Búsqueda por nombre o CI |
| **Médico** | Sí | Seleccione el médico especialista | Lista filtrada por disponibilidad |
| **Sesión Médica** | Sí | Seleccione la sesión/horario disponible | Filtrada por médico y fecha |
| **Motivo de Consulta** | Sí | Describa el motivo de la consulta | Mínimo 10, máximo 200 caracteres |
| **Tipo de Cita** | Sí | Seleccione el tipo | Control / Primera vez / Emergencia |
| **Nivel de Urgencia** | Sí | Estime la urgencia | Bajo / Medio / Alto |
| **Fecha** | Sí | Fecha de la cita | Formato DD/MM/AAAA |

3. Haga clic en **Guardar** para registrar la cita.
4. La cita aparecerá en la lista con estado **"Agendada"**.

### 8.3 Editar Cita

1. Localice la cita que desea modificar en la tabla.
2. Haga clic en el ícono de **editar** (lápiz) en la columna de acciones.
3. Modifique los campos necesarios en el formulario.
4. Haga clic en **Guardar Cambios**.

### 8.4 Cancelar Cita

1. Localice la cita que desea cancelar.
2. Haga clic en el ícono de **eliminar** (papelera) en la columna de acciones.
3. Confirme la cancelación en el diálogo de confirmación.
4. El estado de la cita cambiará a **"Cancelada"**.

> **Nota:** Las citas canceladas permanecen en el historial pero no se cuentan en los indicadores de productividad.

### 8.5 Vista de Calendario

El módulo de citas incluye una vista de calendario mensual:

1. Use las **flechas de navegación** (← →) para moverse entre meses.
2. Los días con citas se muestran resaltados.
3. Haga clic en un día para ver las citas programadas.
4. Use el selector de fechas para ir a una fecha específica.

### 8.6 Exportación de Citas

1. Seleccione las citas que desea exportar usando los **checkboxes** de las filas.
2. Haga clic en el botón de **exportar**.
3. Seleccione el formato deseado: **CSV**, **XLSX**, **PDF** o **DOCX**.
4. El archivo se descargará automáticamente.

> Para exportar todas las citas sin seleccionar, use el botón de **exportación completa**.

---

## 9. Módulo de Planificación de Jornadas

### 9.1 Tabla de Disponibilidad Semanal

El módulo presenta una tabla que muestra la disponibilidad de cada médico por día de la semana:

| Columna | Contenido |
|---|---|
| **Médico** | Nombre del especialista |
| **Lunes** | Horarios disponibles / ocupados |
| **Martes** | Horarios disponibles / ocupados |
| **Miércoles** | Horarios disponibles / ocupados |
| **Jueves** | Horarios disponibles / ocupados |
| **Viernes** | Horarios disponibles / ocupados |
| **Sábado** | Horarios disponibles / ocupados |
| **Domingo** | Horarios disponibles / ocupados |

- Los horarios **disponibles** se muestran en color verde.
- Los horarios **ocupados** se muestran en color rojo.
- Los horarios **bloqueados** se muestran en color amarillo.

### 9.2 Gestión de Sesiones Médicas

Una sesión médica representa un bloque de atención de un médico en un día y turno específico.

#### Crear Sesión Médica
1. Haga clic en **Nueva Sesión**.
2. Complete los campos:

| Campo | Descripción |
|---|---|
| **Médico** | Seleccione el médico |
| **Turno** | Mañana / Tarde / Noche |
| **Día de la Semana** | Lunes a Domingo |
| **Hora de Inicio** | Hora de inicio del turno |
| **Hora de Fin** | Hora de fin del turno |

3. Haga clic en **Guardar**.

#### Editar Sesión Médica
1. Localice la sesión en la tabla.
2. Haga clic en **editar**.
3. Modifique los campos requeridos.
4. Guarde los cambios.

#### Eliminar Sesión Médica
1. Localice la sesión.
2. Haga clic en **eliminar**.
3. Confirme la acción.

### 9.3 Bloqueo de Agenda

Los bloqueos de agenda permiten registrar períodos en los que un médico no estará disponible.

#### Crear Bloqueo
1. Haga clic en **Nuevo Bloqueo**.
2. Complete los campos:

| Campo | Descripción |
|---|---|
| **Médico** | Seleccione el médico a bloquear |
| **Fecha de Inicio** | Primer día del bloqueo |
| **Fecha de Fin** | Último día del bloqueo |
| **Motivo del Bloqueo** | Seleccione el motivo |

**Motivos de bloqueo disponibles:**

| Motivo | Descripción |
|---|---|
| Vacaciones | Período de descanso programado |
| Permiso | Permiso administrativo |
| Reposo | Reposo médico |
| Cirugía | Período de recuperación postquirúrgica |
| Capacitación | Actividad de formación o entrenamiento |
| Congreso | Asistencia a congreso médico |
| Otro | Otro motivo no especificado |

3. Haga clic en **Guardar**.

### 9.4 Indicadores de Jornada

El módulo incluye tarjetas de indicadores específicos:

| Indicador | Descripción |
|---|---|
| **% Ocupación de Agenda** | Porcentaje de horarios ocupados vs. disponibles |
| **% Bloqueos de Agenda** | Porcentaje de horarios bloqueados vs. total |

Ambos indicadores utilizan el sistema de semáforo de colores descrito en la sección 7.2.

---

## 10. Módulo de Especialistas Médicos

### 10.1 Lista de Especialistas

El módulo muestra un listado visual de todos los médicos registrados en tarjetas (cards). Cada tarjeta muestra:

- **Nombre completo** del médico
- **Nro. MPPS** (registro del Ministerio de Salud)
- **Especialidad** médica
- **Teléfono** de contacto
- **Estado de disponibilidad**

### 10.2 Crear Especialista

1. Haga clic en **Nuevo Especialista**.
2. Complete el formulario:

| Campo | Requerido | Descripción | Validación |
|---|---|---|---|
| **Nro. MPPS** | Sí | Número de registro del MPPS | 4 a 6 dígitos, único en el sistema |
| **Nombre Completo** | Sí | Nombre y apellidos del médico | Solo letras, mínimo 2 caracteres |
| **Especialidad** | Sí | Seleccione la especialidad | Lista desplegable |
| **Teléfono** | Sí | Número de teléfono | 11 dígitos |

3. Haga clic en **Guardar**.

### 10.3 Editar Especialista

1. Localice el especialista en la lista.
2. Haga clic en el ícono de **editar** en su tarjeta.
3. Modifique los campos necesarios.
4. Guarde los cambios.

### 10.4 Gestión de Especialidades

Desde el módulo de Especialistas también puede gestionar las especialidades médicas:

#### Crear Nueva Especialidad
1. Haga clic en **Nueva Especialidad**.
2. Complete los campos:

| Campo | Descripción | Validación |
|---|---|---|
| **Nombre** | Nombre de la especialidad | Solo letras, 3-100 caracteres |
| **Descripción** | Descripción de la especialidad | Texto libre, obligatorio |

3. Haga clic en **Guardar**.

### 10.5 Exportación

1. Haga clic en el botón de **exportar**.
2. Seleccione el formato deseado.
3. Los datos de los especialistas se descargarán en el archivo.

---

## 11. Módulo de Diagnósticos

### 11.1 Lista de Diagnósticos

El módulo muestra un listado de todos los diagnósticos clínicos registrados, incluyendo:

- **Paciente** diagnosticado
- **Enfermedad** identificada
- **Síntomas** reportados
- **Nivel de severidad**
- **Etapa** del diagnóstico
- **Cita médica** asociada
- **¿Es crónico?** (Sí/No)

### 11.2 Crear Diagnóstico

1. Haga clic en **Nuevo Diagnóstico**.
2. Complete el formulario:

| Campo | Requerido | Descripción | Validación |
|---|---|---|---|
| **Paciente** | Sí | Seleccione el paciente | Lista desplegable |
| **Enfermedad** | Sí | Seleccione la enfermedad | Lista del catálogo |
| **¿Es Crónico?** | Sí | Indique si es enfermedad crónica | Sí / No |
| **Cita Asociada** | Sí | Vincule a una cita médica | Lista desplegable |
| **Síntomas** | Sí | Agregue al menos 1 síntoma | Mínimo 1 síntoma |

#### Para cada síntoma:

| Campo | Descripción | Validación |
|---|---|---|
| **Nombre** | Nombre del síntoma | Texto obligatorio |
| **Descripción** | Descripción del síntoma | Texto obligatorio |
| **Severidad** | Nivel de severidad | Del 1 (leve) al 5 (grave) |

3. Haga clic en **Guardar**.

### 11.3 Gestión de Enfermedades

Desde el módulo puede administrar el catálogo de enfermedades:

1. Acceda a la sección de **Enfermedades**.
2. **Crear**: Haga clic en "Nueva Enfermedad", ingrese nombre y descripción, guarde.
3. **Editar**: Seleccione la enfermedad, modifique los campos, guarde.
4. **Eliminar**: Seleccione la enfermedad y confirme la eliminación.

### 11.4 Gestión de Síntomas

El sistema permite registrar y administrar síntomas con las siguientes propiedades:

| Propiedad | Descripción |
|---|---|
| **Nombre** | Identificación del síntoma |
| **Descripción** | Detalle del síntoma |
| **Severidad** | Nivel del 1 al 5 (1 = leve, 5 = grave) |

### 11.5 Exportación

1. Seleccione los diagnósticos a exportar.
2. Elija el formato: **CSV**, **XLSX**, **PDF** o **DOCX**.
3. El archivo se descargará automáticamente.

---

## 12. Módulo de Gestión de Usuarios

> **Nota:** Este módulo está disponible únicamente para usuarios con rol de **Administrador**.

### 12.1 Lista de Usuarios

El módulo muestra un listado de todos los usuarios del sistema con:

- **Nombre** completo
- **Correo electrónico**
- **Rol** asignado
- **Estado** (Activo/Inactivo)

### 12.2 Crear Usuario

1. Haga clic en **Nuevo Usuario**.
2. Complete el formulario:

| Campo | Requerido | Descripción | Validación |
|---|---|---|---|
| **Nombre Completo** | Sí | Nombre del usuario | Mínimo 5 caracteres |
| **Correo Electrónico** | Sí | Email de acceso | Formato válido, único en el sistema |
| **Contraseña** | Sí | Contraseña de acceso | Seguridad mínima requerida |
| **Rol** | Sí | Nivel de acceso | Administrador / Auxiliar Administrativo |

3. Haga clic en **Guardar**.

### 12.3 Editar Usuario

1. Localice el usuario en la lista.
2. Haga clic en **editar**.
3. Modifique los campos necesarios (nombre, email, rol).
4. Guarde los cambios.

### 12.4 Activar/Desactivar Usuarios

1. Localice el usuario en la lista.
2. Haga clic en el **interruptor (toggle)** de estado.
3. El usuario cambiará de estado:
   - **Activo** → Puede iniciar sesión y usar el sistema.
   - **Inactivo** → No podrá iniciar sesión.

### 12.5 Roles y Permisos

| Rol | Permisos |
|---|---|
| **Administrador** | Acceso total: CRUD de todos los módulos, gestión de usuarios, auditoría, ajustes |
| **Auxiliar Administrativo** | Acceso a: Citas, Jornadas, Especialistas, Diagnósticos, Dashboard (sin gestión de usuarios ni auditoría) |

---

## 13. Módulo de Auditoría (Historial de Cambios)

### 13.1 Consulta del Historial

El módulo de Auditoría muestra un registro cronológico de todas las acciones realizadas en el sistema. Cada registro incluye:

| Campo | Descripción |
|---|---|
| **Fecha y Hora** | Momento en que se realizó la acción |
| **Usuario** | Quién realizó la acción |
| **Entidad** | Sobre qué objeto se actuó (Paciente, Cita, Médico, etc.) |
| **Tipo de Acción** | Qué se hizo |
| **Detalles** | Información adicional del cambio |

### 13.2 Filtros de Búsqueda

Puede filtrar el historial por:

| Filtro | Opciones |
|---|---|
| **Tipo de Acción** | INSERT / UPDATE / DELETE / LOGIN / LOGOUT |
| **Entidad** | Paciente, Cita, Médico, Diagnóstico, Usuario, etc. |
| **Usuario** | Filtrar por quién realizó la acción |
| **Rango de Fechas** | Período específico de consulta |

---

## 14. Módulo de Ajustes

### 14.1 Selección de Tema

1. Navegue al módulo **Ajustes** (⚙️) desde la barra lateral.
2. Se mostrarán las opciones de tema disponibles.
3. Haga clic en el tema deseado.
4. Se reproducirá una **animación de ECG** (electrocardiograma) durante el cambio.
5. El tema se aplicará inmediatamente a toda la interfaz.
6. Su preferencia se guardará automáticamente para futuras sesiones.

### 14.2 Temas Disponibles

**Modo Claro:**
- Azul Celeste (predeterminado)
- Verde Esmeralda
- Violeta Claro
- Marrón Claro

**Modo Oscuro:**
- Morado/Rosa (predeterminado)
- Escarlata
- Negro/Verde
- Blanco/Gris

---

## 15. Sistema de Reportes y Exportación

### 15.1 Formatos de Exportación

MediCitas soporta cuatro formatos de exportación:

| Formato | Extensión | Uso Recomendado |
|---|---|---|
| **CSV** | `.csv` | Datos tabulares simples, compatibilidad con cualquier hoja de cálculo |
| **XLSX** | `.xlsx` | Microsoft Excel, tablas dinámicas, gráficos |
| **PDF** | `.pdf` | Documentos formales, impresión, archivado |
| **DOCX** | `.docx` | Documentos editables en Microsoft Word |

### 15.2 Exportación CSV

1. Seleccione los registros a exportar (o deje vacío para exportar todos).
2. Haga clic en **Exportar** → **CSV**.
3. El archivo `.csv` se descargará con los datos en texto plano separado por comas.

### 15.3 Exportación XLSX (Excel)

1. Seleccione los registros.
2. Haga clic en **Exportar** → **XLSX**.
3. Se generará un archivo Excel con formato de tabla, encabezados y estilos.

### 15.4 Exportación PDF

1. Seleccione los registros.
2. Haga clic en **Exportar** → **PDF**.
3. Se generará un documento PDF con tabla formateada, encabezados y pie de página.

> **Nota:** Los reportes PDF incluyen automáticamente el logo del sistema, fecha de generación y numeración de páginas.

### 15.5 Exportación DOCX (Word)

1. Seleccione los registros.
2. Haga clic en **Exportar** → **DOCX**.
3. Se generará un documento Word con tabla editable.

### 15.6 Reportes Avanzados

El sistema ofrece reportes avanzados con opciones de personalización:

#### Reportes de Citas
- Filtros por rango de fechas
- Filtro por tipo de cita
- Filtro por médico
- Filtro por paciente

#### Reportes de Diagnósticos
- Filtros por enfermedad
- Filtros por severidad
- Filtros por período
- Incluye desglose de síntomas

**Procedimiento general:**
1. Acceda al reporte avanzado desde el módulo correspondiente.
2. Configure los filtros de interés.
3. Use los **checkboxes** para seleccionar filas específicas o seleccione todas.
4. Elija el formato de exportación.
5. El archivo se descargará.

---

## 16. Sistema de Copias de Seguridad (Backup)

### 16.1 Exportar Respaldo

1. Navegue al módulo de **Auditoría** o acceda a la herramienta de backup.
2. Haga clic en **Exportar Respaldo**.
3. Seleccione el formato:

| Formato | Descripción |
|---|---|
| **JSON** | Formato estructurado, ideal para restauración automática |
| **CSV** | Formato tabular, compatible con hojas de cálculo |

4. Se descargará el archivo con todos los datos del sistema.
5. Guarde el archivo en un lugar seguro.

> **Importante:** Las copias de seguridad contienen información sensible (datos de pacientes, credenciales). Manipule estos archivos conforme a las políticas de protección de datos.

### 16.2 Importar Respaldo

1. Haga clic en **Importar Respaldo**.
2. Seleccione el archivo de respaldo (JSON o CSV).
3. Confirme la importación.
4. Los datos se cargarán en el sistema.

> **Advertencia:** La importación de un respaldo puede sobrescribir datos existentes. Se recomienda crear un respaldo actual antes de importar.

---

## 17. Sistema de Notificaciones

### 17.1 Centro de Notificaciones

El centro de notificaciones se accede haciendo clic en el ícono de **campana** (🔔) en la barra superior.

Características:
- **Contador de no leídas**: Muestra el número de notificaciones sin leer sobre el ícono.
- **Lista desplegable**: Al hacer clic, se despliega la lista de notificaciones.
- **Tipos de notificación**: Mensajes, eventos, actualizaciones, seguridad.

### 17.2 Gestión de Notificaciones

| Acción | Descripción |
|---|---|
| **Marcar como leída** | Haga clic en una notificación para marcarla como leída |
| **Marcar todas como leídas** | Use el botón en el encabezado del centro |
| **Eliminar** | Elimine notificaciones individuales |
| **Eliminar todas** | Limpie todo el centro de notificaciones |

---

## 18. Solución de Problemas

### Problema: No puedo iniciar sesión

| Causa Possible | Solución |
|---|---|
| Credenciales incorrectas | Verifique su correo y contraseña. Revise mayúsculas/minúsculas. |
| Cuenta desactivada | Contacte al administrador para reactivar su cuenta. |
| Backend no disponible | Verifique que el servidor backend esté ejecutándose en `localhost:3000`. |
| Token expirado | Cierre sesión e inicie sesión nuevamente. |

### Problema: La página no carga o muestra errores

| Causa Possible | Solución |
|---|---|
| Servidor de desarrollo apagado | Ejecute `npm run dev` en la terminal. |
| Puerto 8080 en uso | Verifique que no haya otra aplicación usando el puerto. |
| Dependencias faltantes | Ejecute `npm install` para reinstalar dependencias. |
| Error de red | Verifique la conexión a internet y la accesibilidad del backend. |

### Problema: Los datos no se muestran

| Causa Possible | Solución |
|---|---|
| Backend sin datos | Verifique que la base de datos del backend contenga registros. |
| Token inválido | Cierre sesión y vuelva a autenticarse. |
| Error de API | Abra las herramientas de desarrollo del navegador (F12) y revise la pestaña Console/Network. |

### Problema: No puedo exportar archivos

| Causa Possible | Solución |
|---|---|
| Sin permisos | Verifique que su rol tenga permisos de exportación. |
| Navegador bloquea descargas | Verifique la configuración de descargas del navegador. |
| Sin datos seleccionados | Seleccione al menos un registro antes de exportar. |

### Problema: El tema no cambia

| Causa Possible | Solución |
|---|---|
| Caché del navegador | Limpie la caché del navegador y recargue (Ctrl+Shift+R). |
| Error de JavaScript | Revise la consola del navegador para errores. |

---

## 19. Preguntas Frecuentes (FAQ)

**¿Puedo usar el sistema desde múltiples dispositivos?**
Sí. MediCitas es una aplicación web accesible desde cualquier dispositivo con navegador moderno y conexión a internet. Sin embargo, la sesión se maneja por navegador, por lo que deberá iniciar sesión en cada dispositivo.

**¿Qué sucede si pierdo la conexión a internet?**
El sistema requiere conexión al backend para la mayoría de operaciones. Si pierde la conexión, las operaciones de lectura y escritura fallarán. Se recomienda verificar la conexión antes de realizar operaciones importantes.

**¿Puedo recuperar datos eliminados?**
No directamente. Los registros eliminados se quitan permanentemente del sistema. Se recomienda realizar copias de seguridad periódicas usando la herramienta de Backup.

**¿Cuántos usuarios pueden usar el sistema simultáneamente?**
La aplicación frontend no tiene un límite de usuarios simultáneos definido. La capacidad depende del servidor backend y la base de datos.

**¿El sistema funciona sin conexión al backend?**
No. MediCitas es un frontend que consume una API REST. Sin el backend, no podrá realizar operaciones de datos.

**¿Cómo cambio mi contraseña?**
Contacte al administrador del sistema para solicitar un cambio de contraseña o utilice la función de recuperación de contraseña.

**¿Puedo exportar solo parte de los datos?**
Sí. Puede usar los checkboxes para seleccionar registros específicos antes de exportar, o usar los filtros para acotar el conjunto de datos.

**¿Los reportes PDF incluyen gráficos?**
Los reportes PDF generados desde la herramienta de exportación incluyen tablas de datos. Los gráficos del dashboard pueden exportarse como imagen usando las herramientas integradas de visualización.

---

## 20. Glosario

| Término | Definición |
|---|---|
| **Agenda** | Horario disponible de un médico para atender pacientes |
| **API** | Interfaz de Programación de Aplicaciones; conjunto de endpoints que permiten la comunicación entre el frontend y el backend |
| **Auditoría** | Registro histórico de todas las acciones realizadas en el sistema |
| **Backup** | Copia de seguridad de los datos del sistema |
| **Bloqueo de Agenda** | Período en el que un médico no está disponible para atender citas |
| **CI** | Cédula de Identidad; documento de identificación venezolano |
| **CRUD** | Operaciones básicas de base de datos: Crear, Leer, Actualizar, Eliminar |
| **CSV** | Formato de archivo de texto plano con valores separados por comas |
| **Dashboard** | Panel de control con indicadores y métricas visuales |
| **Diagnóstico** | Evaluación clínica que vincula un paciente con una enfermedad y sus síntomas |
| **DOCX** | Formato de documento de Microsoft Word |
| **ECG** | Electrocardiograma; animación visual utilizada en el cambio de temas |
| **JWT** | JSON Web Token; mecanismo de autenticación basado en tokens |
| **KPI** | Indicador Clave de Desempeño |
| **MPPS** | Ministerio del Poder Popular para la Salud |
| **OTP** | Contraseña de un solo uso; código temporal para recuperación |
| **Paciente** | Persona registrada en el sistema que recibe atención médica |
| **PDF** | Formato de documento portátil multiplataforma |
| **Semaforo** | Sistema de indicadores visuales con colores verde, amarillo y rojo |
| **Sesión Médica** | Bloque de tiempo definido por médico, turno y día de la semana |
| **SPA** | Aplicación de Página Única; arquitectura web que carga una sola vez |
| **Turno** | Período de atención: Mañana, Tarde o Noche |
| **XLSX** | Formato de archivo de Microsoft Excel |
| **Zod** | Librería de validación de esquemas de datos |

---

## 21. Índice Alfabético

| Término | Sección |
|---|---|
| Acceso denegado | 12.5 |
| Administrador | 12.5 |
| Auditoría | 13 |
| Ajustes | 14 |
| Autenticación | 5 |
| Backup | 16 |
| Barra lateral | 6.2 |
| Barra superior | 6.3 |
| Bloqueo de agenda | 9.3 |
| Calendario | 8.5 |
| Cambio de tema | 6.4, 14 |
| Citas médicas | 8 |
| Cierre de sesión | 5.4 |
| Configuración de indicadores | 7.4 |
| Contraseña | 5.3 |
| Copia de seguridad | 16 |
| CSV | 15.2 |
| Dashboard | 7 |
| Diagnósticos | 11 |
| DOCX | 15.5 |
| ECG (animación) | 6.4 |
| Enfermedades | 11.3 |
| Especialidades | 10.4 |
| Especialistas | 10 |
| Exportación | 15 |
| FAQ | 19 |
| Glosario | 20 |
| Historial de cambios | 13 |
| Importar respaldo | 16.2 |
| Inicio de sesión | 5.1, 5.2 |
| Instalación | 4 |
| Jornadas | 9 |
| KPI | 7.1 |
| Login | 5 |
| Notificaciones | 17 |
| Ocupación de agenda | 9.4 |
| Pacientes | 7.5 |
| Permisos | 12.5 |
| Planificación de jornadas | 9 |
| Problemás (solución) | 18 |
| Recuperación de contraseña | 5.3 |
| Reportes | 15 |
| Requisitos del sistema | 3 |
| Roles | 12.5 |
| Semáforo | 7.2 |
| Sesión médica | 9.2 |
| Síntomas | 11.4 |
| Temas | 6.4, 14.2 |
| Usuarios | 12 |
| Variables de entorno | 4.2 |
| Visualizaciones gráficas | 7.3 |
| XLSX | 15.3 |

---

## Documento Generado

| Campo | Valor |
|---|---|
| **Sistema** | MediCitas — Health Flow Dashboard |
| **Versión del Documento** | 1.0 |
| **Fecha de Generación** | 11 de Julio de 2026 |
| **Norma de Referencia** | ISO/IEC 18019:2004 / IEEE 1063-2001 |
| **Estado** | Documento Interno |

---

*Este documento fue generado como parte del proceso de documentación del sistema MediCitas. Para actualizaciones o consultas, contacte al equipo de desarrollo.*
