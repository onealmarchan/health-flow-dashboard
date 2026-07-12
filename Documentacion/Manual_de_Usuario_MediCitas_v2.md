# MANUAL DE USUARIO

## Sistema de Gestión de Citas Médicas — Hospital Dr. Salvador Allende

---

| Campo | Detalle |
|---|---|
| **Nombre del Sistema** | Sistema de Gestión de Citas Médicas |
| **Institución** | Hospital Dr. Salvador Allende |
| **Versión** | 1.0 |
| **Fecha de Emisión** | Julio 2026 |
| **Clasificación** | Documento de Usuario Interno |

---

## ÍNDICE

1. [Introducción](#1-introducción)
   - 1.1 ¿Qué es este Sistema?
   - 1.2 Para Qué Sirve
   - 1.3 Requisitos para Usar el Sistema
2. [Cómo Iniciar Sesión](#2-cómo-iniciar-sesión)
   - 2.1 Acceder al Sistema
   - 2.2 Recuperar Contraseña
   - 2.3 Cerrar Sesión
3. [Conocer la Interfaz](#3-conocer-la-interfaz)
   - 3.1 Pantalla Principal
   - 3.2 Barra Lateral de Navegación
   - 3.3 Barra Superior
   - 3.4 Cambiar el Tema Visual
4. [Módulo de Dashboard (Panel de Control)](#4-módulo-de-dashboard-panel-de-control)
   - 4.1 Tarjetas de Métricas
   - 4.2 Significado de los Colores
   - 4.3 Gráficos e Indicadores
   - 4.4 Tabla de Pacientes
5. [Módulo de Citas Médicas](#5-módulo-de-citas-médicas)
   - 5.1 Ver Lista de Citas
   - 5.2 Crear una Cita
   - 5.3 Editar una Cita
   - 5.4 Cancelar una Cita
   - 5.5 Ver Calendario
   - 5.6 Exportar Citas
6. [Módulo de Planificación de Jornadas](#6-módulo-de-planificación-de-jornadas)
   - 6.1 Ver Disponibilidad Semanal
   - 6.2 Crear Sesión Médica
   - 6.3 Bloquear Agenda
   - 6.4 Indicadores de Jornada
7. [Módulo de Especialistas Médicos](#7-módulo-de-especialistas-médicos)
   - 7.1 Ver Lista de Especialistas
   - 7.2 Crear Especialista
   - 7.3 Editar Especialista
   - 7.4 Gestionar Especialidades
8. [Módulo de Diagnósticos](#8-módulo-de-diagnósticos)
   - 8.1 Ver Lista de Diagnósticos
   - 8.2 Crear Diagnóstico
   - 8.3 Gestionar Enfermedades
   - 8.4 Gestionar Síntomas
9. [Módulo de Gestión de Usuarios](#9-módulo-de-gestión-de-usuarios) *(Solo Administradores)*
   - 9.1 Ver Lista de Usuarios
   - 9.2 Crear Usuario
   - 9.3 Activar / Desactivar Usuarios
10. [Módulo de Auditoría](#10-módulo-de-auditoría)
    - 10.1 Ver Historial de Cambios
    - 10.2 Filtrar Registros
11. [Módulo de Ajustes](#11-módulo-de-ajustes)
    - 11.1 Cambiar Tema Visual
12. [Exportar Datos](#12-exportar-datos)
    - 12.1 Formatos Disponibles
    - 12.2 Cómo Exportar
13. [Copias de Seguridad](#13-copias-de-seguridad)
    - 13.1 Exportar Respaldo
    - 13.2 Importar Respaldo
14. [Notificaciones](#14-notificaciones)
15. [Solución de Problemas](#15-solución-de-problemas)
16. [Preguntas Frecuentes](#16-preguntas-frecuentes)
17. [Glosario](#17-glosario)

---

## 1. Introducción

### 1.1 ¿Qué es este Sistema?

El **Sistema de Gestión de Citas Médicas** es una aplicación web que se utiliza en el **Hospital Dr. Salvador Allende** para administrar las citas médicas, horarios de los especialistas, diagnósticos y reportes del hospital.

### 1.2 Para Qué Sirve

Este sistema le permite:

- **Crear y gestionar citas médicas** de los pacientes.
- **Planificar los horarios** de los médicos especialistas.
- **Registrar diagnósticos** con enfermedades y síntomas.
- **Ver indicadores y métricas** del rendimiento del hospital.
- **Generar reportes** en diferentes formatos (Excel, PDF, Word).
- **Realizar copias de seguridad** de los datos.
- **Consultar el historial** de todos los cambios realizados.

### 1.3 Requisitos para Usar el Sistema

| Requisito | Detalle |
|---|---|
| **Navegador Web** | Google Chrome, Mozilla Firefox o Microsoft Edge (versiones recientes) |
| **Conexión a Internet** | Se requiere conexión al servidor del hospital |
| **Resolución de pantalla** | Mínimo 1024 x 768 (se recomienda 1920 x 1080) |

> **Nota:** No es necesario instalar ningún programa adicional. El sistema se accede desde el navegador web.

---

## 2. Cómo Iniciar Sesión

### 2.1 Acceder al Sistema

1. Abra su navegador web.
2. Ingrese la dirección del sistema (proporcionada por el administrador).
3. Se mostrará la pantalla de inicio de sesión.

> **[INSERTAR DIAGRAMA: Flujo de Inicio de Sesión]**
> Ver archivo `Diagramas_PlantUML.md` — Diagrama 1

**Pasos para iniciar sesión:**

1. Ingrese su **correo electrónico** registrado.
2. Ingrese su **contraseña**.
3. Haga clic en **Iniciar Sesión**.
4. Si los datos son correctos, entrará al **Panel Principal** (Dashboard).

> **[INSERTAR IMAGEN: Pantalla de inicio de sesión del sistema]**
> Ruta: Documentacion/imagenes documentacion/Registrar cita/1.jpeg

### 2.2 Recuperar Contraseña

Si ha olvidado su contraseña:

> **[INSERTAR DIAGRAMA: Flujo de Recuperar Contraseña]**
> Ver archivo `Diagramas_PlantUML.md` — Diagrama 2

1. Haga clic en **¿Olvidó su contraseña?** en la pantalla de login.
2. Ingrese su correo electrónico.
3. Haga clic en **Enviar Código**.
4. Revise su correo electrónico: recibirá un código de 6 dígitos (válido por 15 minutos).
5. Ingrese el código recibido.
6. Haga clic en **Verificar**.
7. Ingrese y confirme su nueva contraseña.
8. Haga clic en **Restablecer Contraseña**.
9. Será redirigido a la pantalla de inicio de sesión.

### 2.3 Cerrar Sesión

1. Haga clic en el ícono de **usuario** (👤) en la esquina superior derecha.
2. Seleccione **Cerrar Sesión** en el menú desplegable.
3. Será redirigido a la pantalla de inicio de sesión.

---

## 3. Conocer la Interfaz

### 3.1 Pantalla Principal

Una vez que inicia sesión, verá la pantalla principal del sistema:

> **[INSERTAR DIAGRAMA: Mapa de Navegación del Sistema]**
> Ver archivo `Diagramas_PlantUML.md` — Diagrama 6

La pantalla se divide en tres áreas principales:
- **Barra Lateral** (izquierda): Donde se encuentran todos los módulos del sistema.
- **Área de Contenido** (centro): Donde se muestra la información de cada módulo.
- **Barra Superior** (arriba): Donde están las notificaciones, el cambio de tema y su cuenta.

### 3.2 Barra Lateral de Navegación

La barra lateral está en el lado izquierdo de la pantalla y contiene los accesos a todos los módulos:

| Ícono | Módulo | Para Qué Sirve |
|---|---|---|
| 📊 | **Dashboard** | Ver indicadores y métricas del hospital |
| 📅 | **Citas** | Crear, editar y cancelar citas médicas |
| 📋 | **Jornadas** | Administrar horarios y sesiones de los médicos |
| 👨‍⚕️ | **Especialistas** | Ver y gestionar los médicos especialistas |
| 🔬 | **Diagnósticos** | Registrar enfermedades y síntomas de pacientes |
| 👥 | **Usuarios** | Gestionar cuentas de usuario *(solo administradores)* |
| 📝 | **Auditoría** | Ver el historial de todos los cambios realizados |
| ⚙️ | **Ajustes** | Cambiar el tema visual del sistema |

**Para colapsar o expandir la barra lateral:**
- Haga clic en el ícono de **menú** (☰) en la esquina superior izquierda.

### 3.3 Barra Superior

La barra superior contiene los siguientes elementos:

| Elemento | Función |
|---|---|
| **Menú** (☰) | Colapsar o expandir la barra lateral |
| **Barra de búsqueda** | Buscar información en el sistema |
| **Campana** (🔔) | Ver notificaciones pendientes |
| **Sol/Luna** (🌙/☀️) | Cambiar entre modo claro y oscuro |
| **Usuario** (👤) | Ver su cuenta y cerrar sesión |

### 3.4 Cambiar el Tema Visual

El sistema ofrece **8 temas visuales** para personalizar la apariencia:

**Modos Claros:** Azul Celeste, Verde Esmeralda, Violeta Claro, Marrón Claro
**Modos Oscuros:** Morado/Rosa, Escarlata, Negro/Verde, Blanco/Gris

> Para cambiar el tema, vea la sección [11. Módulo de Ajustes](#11-módulo-de-ajustes).

---

## 4. Módulo de Dashboard (Panel de Control)

### 4.1 Tarjetas de Métricas

El Dashboard muestra **5 tarjetas de métricas principales** en la parte superior:

| Indicador | Qué Muestra |
|---|---|
| **% Citas de Hoy** | Porcentaje de citas del día sobre el total programado |
| **Total de Consultas** | Número total de consultas registradas |
| **Total de Pacientes** | Número total de pacientes activos |
| **Carga por Especialista** | Distribución de trabajo entre los médicos |
| **% de Urgencias** | Porcentaje de citas clasificadas como urgencia |

Cada tarjeta muestra el nombre, el valor numérico, un ícono y un **color de semáforo** que indica el estado.

### 4.2 Significado de los Colores

| Color | Significado | Qué Hacer |
|---|---|---|
| 🟢 **Verde** | Todo está bien | No se requiere acción |
| 🟡 **Amarillo** | Requiere atención | Revise la situación |
| 🔴 **Rojo** | Situación crítica | Actúe de inmediato |

### 4.3 Gráficos e Indicadores

Debajo de las tarjetas, el Dashboard muestra **5 ranuras de gráficos** configurables:

| Gráfico | Qué Muestra |
|---|---|
| **Distribución por Edad** | Pacientes agrupados por grupos de edad |
| **Tasa de Retención** | Evolución temporal de la retención de pacientes |
| **Distribución de Enfermedades** | Enfermedades más frecuentes |
| **Matriz de Decisión** | Priorización de acciones según impacto y urgencia |
| **KPI Geográfico** | Densidad epidemiológica por comunidad |

**Para personalizar los gráficos:**
1. Haga clic en el ícono de **configuración** (⚙️) en el área de gráficos.
2. Seleccione los indicadores que desea ver.
3. Haga clic en **Guardar**.

### 4.4 Tabla de Pacientes

En la parte inferior del Dashboard se encuentra una tabla de pacientes con las siguientes opciones:

- **Búsqueda**: Escriba un nombre o cédula para filtrar.
- **Filtro por Comunidad**: Seleccione una comunidad específica.
- **Paginación**: Navegue entre páginas con los controles inferiores.
- **Exportación**: Exporte la lista de pacientes.

---

## 5. Módulo de Citas Médicas

### 5.1 Ver Lista de Citas

Al acceder al módulo de Citas, verá un listado completo de todas las citas registradas:

> **[INSERTAR IMAGEN: Lista de citas médicas con filtros y acciones]**
> Ruta: Documentacion/imagenes documentacion/Registrar cita/1.jpeg

La tabla incluye:
- **Columnas**: ID, Paciente, Médico, Fecha, Hora, Tipo, Estado, Motivo.
- **Barra de búsqueda**: Para filtrar por paciente, médico o motivo.
- **Filtros avanzados**: Por rango de fechas, tipo de cita y estado.
- **Acciones por fila**: Editar, cancelar o ver detalles de cada cita.

### 5.2 Crear una Cita

> **[INSERTAR DIAGRAMA: Flujo de Crear una Cita Médica]**
> Ver archivo `Diagramas_PlantUML.md` — Diagrama 3

**Pasos para crear una cita:**

1. Haga clic en **Nueva Cita** (esquina superior derecha de la tabla).
2. Complete el formulario:

| Campo | Qué Hacer |
|---|---|
| **Paciente** | Busque y seleccione el paciente por nombre o cédula |
| **Médico** | Seleccione el médico especialista |
| **Sesión Médica** | Seleccione el horario disponible |
| **Motivo de Consulta** | Describa el motivo (mínimo 10 caracteres) |
| **Tipo de Cita** | Seleccione: Control, Primera vez o Emergencia |
| **Nivel de Urgencia** | Seleccione: Bajo, Medio o Alto |
| **Fecha** | Seleccione la fecha de la cita |

3. Haga clic en **Guardar**.
4. La cita aparecerá en la lista con estado **"Agendada"**.

> **[INSERTAR IMAGEN: Formulario de registro de nueva cita médica]**
> Ruta: Documentacion/imagenes documentacion/Registrar cita/10.jpeg

### 5.3 Editar una Cita

1. Localice la cita que desea modificar en la tabla.
2. Haga clic en el ícono de **editar** (✏️) en la columna de acciones.
3. Modifique los campos necesarios.
4. Haga clic en **Guardar Cambios**.

### 5.4 Cancelar una Cita

1. Localice la cita que desea cancelar.
2. Haga clic en el ícono de **eliminar** (🗑️) en la columna de acciones.
3. Confirme la cancelación en el diálogo de confirmación.
4. El estado de la cita cambiará a **"Cancelada"**.

> **Nota:** Las citas canceladas permanecen en el historial pero no se cuentan en los indicadores de productividad.

### 5.5 Ver Calendario

El módulo de citas incluye una vista de calendario mensual:

1. Use las **flechas de navegación** (← →) para moverse entre meses.
2. Los días con citas se muestran resaltados.
3. Haga clic en un día para ver las citas programadas.
4. Use el selector de fechas para ir a una fecha específica.

### 5.6 Exportar Citas

1. Seleccione las citas que desea exportar usando los **checkboxes** de las filas.
2. Haga clic en el botón de **exportar**.
3. Seleccione el formato deseado: **CSV**, **XLSX**, **PDF** o **DOCX**.
4. El archivo se descargará automáticamente.

> Para exportar todas las citas sin seleccionar, use el botón de **exportación completa**.

---

## 6. Módulo de Planificación de Jornadas

### 6.1 Ver Disponibilidad Semanal

El módulo presenta una tabla que muestra la disponibilidad de cada médico por día de la semana:

> **[INSERTAR IMAGEN: Tabla de disponibilidad semanal mostrando horarios]**
> Ruta: Documentacion/imagenes documentacion/jornadas medicas/3.jpeg

| Color | Significado |
|---|---|
| 🟢 **Verde** | Horario disponible |
| 🔴 **Rojo** | Horario ocupado |
| 🟡 **Amarillo** | Horario bloqueado |

### 6.2 Crear Sesión Médica

Una sesión médica es un bloque de tiempo definido por un médico, un turno y un día de la semana.

> **[INSERTAR DIAGRAMA: Flujo de Crear una Sesión Médica]**
> Ver archivo `Diagramas_PlantUML.md` — Diagrama 4

**Pasos para crear una sesión médica:**

1. Haga clic en **Nueva Sesión**.
2. Complete los campos:

| Campo | Qué Seleccionar |
|---|---|
| **Médico** | El médico que atenderá |
| **Turno** | Mañana, Tarde o Noche |
| **Día de la Semana** | Lunes a Domingo |
| **Hora de Inicio** | Hora de inicio del turno |
| **Hora de Fin** | Hora de fin del turno |

3. Haga clic en **Guardar**.

> **[INSERTAR IMAGEN: Formulario de creación de sesión médica]**
> Ruta: Documentacion/imagenes documentacion/jornadas medicas/8.jpeg

**Para editar o eliminar una sesión:**
1. Localice la sesión en la tabla.
2. Haga clic en **editar** (✏️) o **eliminar** (🗑️).
3. Confirme la acción.

### 6.3 Bloquear Agenda

Los bloqueos de agenda permiten registrar períodos en los que un médico no estará disponible.

> **[INSERTAR DIAGRAMA: Flujo de Bloquear Agenda]**
> Ver archivo `Diagramas_PlantUML.md` — Diagrama 5

**Pasos para bloquear agenda:**

1. Haga clic en **Nuevo Bloqueo**.
2. Complete los campos:

| Campo | Qué Seleccionar |
|---|---|
| **Médico** | El médico que se bloqueará |
| **Fecha de Inicio** | Primer día del bloqueo |
| **Fecha de Fin** | Último día del bloqueo |
| **Motivo** | Vacaciones, Permiso, Reposo, Cirugía, Capacitación, Congreso u Otro |

3. Haga clic en **Guardar**.

> **[INSERTAR IMAGEN: Formulario de bloqueo de agenda]**
> Ruta: Documentacion/imagenes documentacion/bloqueo de jornada (horas en especifico)/1.jpeg

### 6.4 Indicadores de Jornada

El módulo incluye tarjetas de indicadores:

| Indicador | Qué Muestra |
|---|---|
| **% Ocupación de Agenda** | Porcentaje de horarios ocupados vs. disponibles |
| **% Bloqueos de Agenda** | Porcentaje de horarios bloqueados vs. total |

Ambos indicadores utilizan el sistema de colores (verde, amarillo, rojo) descrito en la sección [4.2](#42-significado-de-los-colores).

---

## 7. Módulo de Especialistas Médicos

### 7.1 Ver Lista de Especialistas

El módulo muestra un listado visual de todos los médicos registrados en tarjetas. Cada tarjeta muestra:

- **Nombre completo** del médico
- **Nro. MPPS** (registro del Ministerio de Salud)
- **Especialidad** médica
- **Teléfono** de contacto
- **Estado de disponibilidad**

### 7.2 Crear Especialista

1. Haga clic en **Nuevo Especialista**.
2. Complete el formulario:

| Campo | Requerido | Descripción | Validación |
|---|---|---|---|
| **Nro. MPPS** | Sí | Número de registro del MPPS | 4 a 6 dígitos, único en el sistema |
| **Nombre Completo** | Sí | Nombre y apellidos del médico | Solo letras, mínimo 2 caracteres |
| **Especialidad** | Sí | Seleccione la especialidad | Lista desplegable |
| **Teléfono** | Sí | Número de teléfono | 11 dígitos |

3. Haga clic en **Guardar**.

### 7.3 Editar Especialista

1. Localice el especialista en la lista.
2. Haga clic en el ícono de **editar** en su tarjeta.
3. Modifique los campos necesarios.
4. Guarde los cambios.

### 7.4 Gestionar Especialidades

Desde el módulo de Especialistas también puede gestionar las especialidades médicas:

#### Crear Nueva Especialidad
1. Haga clic en **Nueva Especialidad**.
2. Complete los campos:

| Campo | Descripción | Validación |
|---|---|---|
| **Nombre** | Nombre de la especialidad | Solo letras, 3-100 caracteres |
| **Descripción** | Descripción de la especialidad | Texto libre, obligatorio |

3. Haga clic en **Guardar**.

---

## 8. Módulo de Diagnósticos

### 8.1 Ver Lista de Diagnósticos

El módulo muestra un listado de todos los diagnósticos clínicos registrados:

- **Paciente** diagnosticado
- **Enfermedad** identificada
- **Síntomas** reportados
- **Nivel de severidad**
- **Etapa** del diagnóstico
- **Cita médica** asociada
- **¿Es crónico?** (Sí/No)

### 8.2 Crear Diagnóstico

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

### 8.3 Gestionar Enfermedades

Desde el módulo puede administrar el catálogo de enfermedades:

1. Acceda a la sección de **Enfermedades**.
2. **Crear**: Haga clic en "Nueva Enfermedad", ingrese nombre y descripción, guarde.
3. **Editar**: Seleccione la enfermedad, modifique los campos, guarde.
4. **Eliminar**: Seleccione la enfermedad y confirme la eliminación.

### 8.4 Gestionar Síntomas

El sistema permite registrar y administrar síntomas:

| Propiedad | Descripción |
|---|---|
| **Nombre** | Identificación del síntoma |
| **Descripción** | Detalle del síntoma |
| **Severidad** | Nivel del 1 al 5 (1 = leve, 5 = grave) |

---

## 9. Módulo de Gestión de Usuarios

> **Nota:** Este módulo está disponible únicamente para usuarios con rol de **Administrador**.

### 9.1 Ver Lista de Usuarios

El módulo muestra un listado de todos los usuarios del sistema con:

- **Nombre** completo
- **Correo electrónico**
- **Rol** asignado
- **Estado** (Activo/Inactivo)

### 9.2 Crear Usuario

1. Haga clic en **Nuevo Usuario**.
2. Complete el formulario:

| Campo | Requerido | Descripción | Validación |
|---|---|---|---|
| **Nombre Completo** | Sí | Nombre del usuario | Mínimo 5 caracteres |
| **Correo Electrónico** | Sí | Email de acceso | Formato válido, único en el sistema |
| **Contraseña** | Sí | Contraseña de acceso | Seguridad mínima requerida |
| **Rol** | Sí | Nivel de acceso | Administrador / Auxiliar Administrativo |

3. Haga clic en **Guardar**.

### 9.3 Activar / Desactivar Usuarios

1. Localice el usuario en la lista.
2. Haga clic en el **interruptor (toggle)** de estado.
3. El usuario cambiará de estado:
   - **Activo** → Puede iniciar sesión y usar el sistema.
   - **Inactivo** → No podrá iniciar sesión.

### Roles y Permisos

| Rol | Qué Puede Hacer |
|---|---|
| **Administrador** | Todo: gestionar usuarios, ver auditoría, ajustes, y todos los módulos |
| **Auxiliar Administrativo** | Citas, Jornadas, Especialistas, Diagnósticos, Dashboard |

---

## 10. Módulo de Auditoría

### 10.1 Ver Historial de Cambios

El módulo de Auditoría muestra un registro cronológico de todas las acciones realizadas en el sistema:

| Campo | Qué Muestra |
|---|---|
| **Fecha y Hora** | Cuándo se realizó la acción |
| **Usuario** | Quién realizó la acción |
| **Entidad** | Sobre qué objeto se actuó (Paciente, Cita, Médico, etc.) |
| **Tipo de Acción** | Qué se hizo (crear, editar, eliminar, etc.) |
| **Detalles** | Información adicional del cambio |

### 10.2 Filtrar Registros

Puede filtrar el historial por:

| Filtro | Opciones |
|---|---|
| **Tipo de Acción** | Crear, Editar, Eliminar, Iniciar Sesión, Cerrar Sesión |
| **Entidad** | Paciente, Cita, Médico, Diagnóstico, Usuario, etc. |
| **Usuario** | Filtrar por quién realizó la acción |
| **Rango de Fechas** | Período específico de consulta |

---

## 11. Módulo de Ajustes

### 11.1 Cambiar Tema Visual

> **[INSERTAR DIAGRAMA: Flujo de Cambiar Tema Visual]**
> Ver archivo `Diagramas_PlantUML.md` — Diagrama 8

1. Navegue al módulo **Ajustes** (⚙️) desde la barra lateral.
2. Se mostrarán las opciones de tema disponibles.
3. Haga clic en el tema deseado.
4. Se reproducirá una **animación de ECG** (electrocardiograma) durante el cambio.
5. El tema se aplicará inmediatamente a toda la interfaz.
6. Su preferencia se guardará automáticamente para futuras sesiones.

**Temas disponibles:**

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

## 12. Exportar Datos

### 12.1 Formatos Disponibles

| Formato | Extensión | Cuándo Usarlo |
|---|---|---|
| **CSV** | `.csv` | Datos simples, compatible con cualquier programa |
| **XLSX** | `.xlsx` | Para abrir en Microsoft Excel |
| **PDF** | `.pdf` | Documentos formales, para imprimir o archivar |
| **DOCX** | `.docx` | Para editar en Microsoft Word |

### 12.2 Cómo Exportar

> **[INSERTAR DIAGRAMA: Flujo de Exportar Datos]**
> Ver archivo `Diagramas_PlantUML.md` — Diagrama 7

1. Navegue al módulo desde el cual desea exportar (Citas, Especialistas, Diagnósticos, etc.).
2. **Para exportar todo**: Haga clic en **Exportación completa**.
3. **Para exportar parte**: Seleccione los registros usando los **checkboxes** de cada fila, luego haga clic en **Exportar**.
4. Seleccione el formato deseado: **CSV**, **XLSX**, **PDF** o **DOCX**.
5. El archivo se descargará automáticamente en su navegador.

> **Nota:** Los reportes PDF incluyen automáticamente el logo del sistema, fecha de generación y numeración de páginas.

---

## 13. Copias de Seguridad

### 13.1 Exportar Respaldo

1. Navegue al módulo de **Auditoría** o acceda a la herramienta de backup.
2. Haga clic en **Exportar Respaldo**.
3. Seleccione el formato: **JSON** (para restauración automática) o **CSV** (para hojas de cálculo).
4. Se descargará el archivo con todos los datos del sistema.
5. Guarde el archivo en un lugar seguro.

> **Importante:** Las copias de seguridad contienen información sensible (datos de pacientes, credenciales). Manipule estos archivos conforme a las políticas de protección de datos.

### 13.2 Importar Respaldo

1. Haga clic en **Importar Respaldo**.
2. Seleccione el archivo de respaldo (JSON o CSV).
3. Confirme la importación.
4. Los datos se cargarán en el sistema.

> **Advertencia:** La importación de un respaldo puede sobrescribir datos existentes. Se recomienda crear un respaldo actual antes de importar.

---

## 14. Notificaciones

El centro de notificaciones se accede haciendo clic en el ícono de **campana** (🔔) en la barra superior.

- **Contador de no leídas**: Muestra el número de notificaciones sin leer.
- **Lista desplegable**: Al hacer clic, se despliega la lista de notificaciones.
- **Tipos de notificación**: Mensajes, eventos, actualizaciones, seguridad.

**Acciones disponibles:**

| Acción | Cómo Hacerlo |
|---|---|
| **Marcar como leída** | Haga clic en una notificación |
| **Marcar todas como leídas** | Use el botón en el encabezado del centro |
| **Eliminar** | Elimine notificaciones individuales |
| **Eliminar todas** | Limpie todo el centro de notificaciones |

---

## 15. Solución de Problemas

### No puedo iniciar sesión

| Causa | Solución |
|---|---|
| Credenciales incorrectas | Verifique su correo y contraseña. Revise mayúsculas/minúsculas. |
| Cuenta desactivada | Contacte al administrador para reactivar su cuenta. |
| Token expirado | Cierre sesión e inicie sesión nuevamente. |

### La página no carga o muestra errores

| Causa | Solución |
|---|---|
| Servidor no disponible | Contacte al administrador del sistema. |
| Error de red | Verifique la conexión a internet. |
| Error persistente | Limpie la caché del navegador (Ctrl+Shift+R). |

### Los datos no se muestran

| Causa | Solución |
|---|---|
| Sin datos registrados | Verifique que existan datos en el sistema. |
| Token inválido | Cierre sesión y vuelva a autenticarse. |
| Error de sistema | Contacte al administrador. |

### No puedo exportar archivos

| Causa | Solución |
|---|---|
| Sin permisos | Verifique que su rol tenga permisos de exportación. |
| Navegador bloquea descargas | Verifique la configuración de descargas del navegador. |
| Sin datos seleccionados | Seleccione al menos un registro antes de exportar. |

### El tema no cambia

| Causa | Solución |
|---|---|
| Caché del navegador | Limpie la caché del navegador y recargue (Ctrl+Shift+R). |
| Error persistente | Contacte al administrador. |

---

## 16. Preguntas Frecuentes

**¿Puedo usar el sistema desde múltiples dispositivos?**
Sí. El sistema es accesible desde cualquier dispositivo con navegador moderno y conexión a internet. Sin embargo, deberá iniciar sesión en cada dispositivo.

**¿Qué sucede si pierdo la conexión a internet?**
El sistema requiere conexión al servidor para la mayoría de operaciones. Si pierde la conexión, las operaciones fallarán. Se recomienda verificar la conexión antes de realizar operaciones importantes.

**¿Puedo recuperar datos eliminados?**
No directamente. Los registros eliminados se quitan permanentemente. Se recomienda realizar copias de seguridad periódicas.

**¿Cómo cambio mi contraseña?**
Contacte al administrador del sistema o utilice la función de recuperación de contraseña.

**¿Puedo exportar solo parte de los datos?**
Sí. Use los checkboxes para seleccionar registros específicos antes de exportar, o use los filtros para acotar el conjunto de datos.

**¿Los reportes PDF incluyen gráficos?**
Los reportes PDF incluyen tablas de datos. Los gráficos del dashboard pueden exportarse como imagen.

---

## 17. Glosario

| Término | Definición |
|---|---|
| **Agenda** | Horario disponible de un médico para atender pacientes |
| **Auditoría** | Registro histórico de todas las acciones realizadas en el sistema |
| **Backup** | Copia de seguridad de los datos del sistema |
| **Bloqueo de Agenda** | Período en el que un médico no está disponible |
| **CI** | Cédula de Identidad; documento de identificación |
| **Dashboard** | Panel de control con indicadores y métricas visuales |
| **Diagnóstico** | Evaluación clínica que vincula un paciente con una enfermedad |
| **ECG** | Electrocardiograma; animación visual utilizada en el cambio de temas |
| **KPI** | Indicador Clave de Desempeño |
| **MPPS** | Ministerio del Poder Popular para la Salud |
| **OTP** | Contraseña de un solo uso; código temporal para recuperación |
| **Paciente** | Persona registrada en el sistema que recibe atención médica |
| **Semáforo** | Sistema de indicadores visuales con colores verde, amarillo y rojo |
| **Sesión Médica** | Bloque de tiempo definido por médico, turno y día de la semana |
| **Turno** | Período de atención: Mañana, Tarde o Noche |

---

*Documento generado como parte del proceso de documentación del Sistema de Gestión de Citas Médicas — Hospital Dr. Salvador Allende. Julio 2026.*
