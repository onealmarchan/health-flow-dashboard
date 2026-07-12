# Diagramas PlantUML - Sistema de Gestion de Citas Medicas
## Hospital Dr. Salvador Allende

> Copia solo el contenido que esta ENTRE @startuml y @enduml (sin las comillas).
> Pegalo en http://www.plantuml.com/plantuml/uml/

---

## Diagrama 1: Flujo de Inicio de Sesion

```
@startuml
skinparam defaultFontName Arial
skinparam defaultFontSize 12
skinparam backgroundColor #FEFEFE
skinparam activityBackgroundColor #E8F4FD
skinparam activityBorderColor #2196F3
skinparam activityDiamondBackgroundColor #FFF9C4
skinparam activityDiamondBorderColor #F9A825

title Flujo de Inicio de Sesion

start

:Acceder al sistema\nen el navegador;

:Ingresar correo electronico;

:Ingresar contrasena;

:Hacer clic en "Iniciar Sesion";

if (Datos correctos?) then (Si)
  :Entrar al Panel Principal\n(Dashboard);
  stop
else (No)
  :Ver mensaje de error;
  :Corregir datos;
  :Volver a ingresar datos;
endif

@enduml
```

---

## Diagrama 2: Flujo de Recuperar Contrasena

```
@startuml
skinparam defaultFontName Arial
skinparam defaultFontSize 12
skinparam backgroundColor #FEFEFE
skinparam activityBackgroundColor #E8F4FD
skinparam activityBorderColor #2196F3
skinparam activityDiamondBackgroundColor #FFF9C4
skinparam activityDiamondBorderColor #F9A825

title Flujo de Recuperar Contrasena

start

:Hacer clic en\n"Olvido su contrasena?";

:Ingresar correo electronico;

:Hacer clic en "Enviar Codigo";

:Recibir codigo de 6 digitos\npor correo electronico\n(valido por 15 minutos);

:Ingresar el codigo recibido;

:Hacer clic en "Verificar";

if (Codigo valido?) then (Si)
  :Ingresar nueva contrasena;
  :Confirmar nueva contrasena;
  :Hacer clic en\n"Restablecer Contrasena";
  :Volver a pantalla de login;
  stop
else (No)
  :Ver mensaje de error;
  :Solicitar nuevo codigo;
endif

@enduml
```

---

## Diagrama 3: Flujo de Crear una Cita Medica

```
@startuml
skinparam defaultFontName Arial
skinparam defaultFontSize 12
skinparam backgroundColor #FEFEFE
skinparam activityBackgroundColor #E8F4FD
skinparam activityBorderColor #2196F3
skinparam activityDiamondBackgroundColor #FFF9C4
skinparam activityDiamondBorderColor #F9A825

title Flujo de Crear una Cita Medica

start

:Navegar al modulo "Citas";

:Hacer clic en "Nueva Cita";

:Seleccionar paciente\n(buscando por nombre o cedula);

:Seleccionar medico especialista;

:Seleccionar sesion medica\n(horario disponible);

:Describir motivo de consulta\n(minimo 10 caracteres);

:Seleccionar tipo de cita\n(Control / Primera vez / Emergencia);

:Establecer nivel de urgencia\n(Bajo / Medio / Alto);

:Seleccionar fecha de la cita;

:Hacer clic en "Guardar";

if (Horario disponible?) then (Si)
  :Cita registrada con\nestado "Agendada";
  stop
else (No)
  :Ver mensaje de\n"horario no disponible";
  :Seleccionar otro horario;
  :Volver a seleccionar sesion medica;
endif

@enduml
```

---

## Diagrama 4: Flujo de Crear una Sesion Medica

```
@startuml
skinparam defaultFontName Arial
skinparam defaultFontSize 12
skinparam backgroundColor #FEFEFE
skinparam activityBackgroundColor #E8F4FD
skinparam activityBorderColor #2196F3
skinparam activityDiamondBackgroundColor #FFF9C4
skinparam activityDiamondBorderColor #F9A825

title Flujo de Crear una Sesion Medica

start

:Navegar al modulo "Jornadas";

:Hacer clic en "Nueva Sesion";

:Seleccionar medico;

:Seleccionar turno\n(Manana / Tarde / Noche);

:Seleccionar dia de la semana;

:Definir hora de inicio;

:Definir hora de fin;

:Hacer clic en "Guardar";

:Sesion medica creada.\nAparecera en la tabla\nde disponibilidad semanal;

stop

@enduml
```

---

## Diagrama 5: Flujo de Bloquear Agenda

```
@startuml
skinparam defaultFontName Arial
skinparam defaultFontSize 12
skinparam backgroundColor #FEFEFE
skinparam activityBackgroundColor #E8F4FD
skinparam activityBorderColor #2196F3
skinparam activityDiamondBackgroundColor #FFF9C4
skinparam activityDiamondBorderColor #F9A825

title Flujo de Bloquear Agenda

start

:Navegar al modulo "Jornadas";

:Hacer clic en "Nuevo Bloqueo";

:Seleccionar medico;

:Seleccionar fecha de inicio\n(primer dia del bloqueo);

:Seleccionar fecha de fin\n(ultimo dia del bloqueo);

:Seleccionar motivo del bloqueo\n(Vacaciones / Permiso /\nReposo / Cirugia / Otro);

:Hacer clic en "Guardar";

:Horarios bloqueados.\nEl medico no aparecera\ndisponible en esas fechas;

stop

@enduml
```

---

## Diagrama 6: Mapa de Navegacion del Sistema

```
@startuml
skinparam defaultFontName Arial
skinparam defaultFontSize 11
skinparam backgroundColor #FEFEFE
skinparam defaultTextAlignment center
skinparam rectangle {
  BackgroundColor #E3F2FD
  BorderColor #1565C0
  FontSize 11
}

title Mapa de Navegacion del Sistema

rectangle "PANTALLA PRINCIPAL" as root {
  rectangle "BARRA LATERAL\n(menu izquierdo)" as sidebar

  rectangle "Dashboard\nIndicadores y metricas" as dash
  rectangle "Citas\nCrear, editar, cancelar\ncitas medicas" as citas
  rectangle "Jornadas\nHorarios, sesiones\ny bloqueos de agenda" as jornadas
  rectangle "Especialistas\nMedicos registrados" as esp
  rectangle "Diagnosticos\nEnfermedades y sintomas" as diag
  rectangle "Usuarios\nGestion de cuentas\n(solo admin)" as usu
  rectangle "Auditoria\nHistorial de cambios" as aud
  rectangle "Ajustes\nCambiar tema visual" as ajustes

  sidebar --> dash
  sidebar --> citas
  sidebar --> jornadas
  sidebar --> esp
  sidebar --> diag
  sidebar --> usu
  sidebar --> aud
  sidebar --> ajustes
}

rectangle "BARRA SUPERIOR\n(parte de arriba)" as header
rectangle "Notificaciones" as notif
rectangle "Cambiar tema" as tema
rectangle "Mi cuenta\nCerrar sesion" as cuenta

header --> notif
header --> tema
header --> cuenta

@enduml
```

---

## Diagrama 7: Flujo de Exportar Datos

```
@startuml
skinparam defaultFontName Arial
skinparam defaultFontSize 12
skinparam backgroundColor #FEFEFE
skinparam activityBackgroundColor #E8F4FD
skinparam activityBorderColor #2196F3
skinparam activityDiamondBackgroundColor #FFF9C4
skinparam activityDiamondBorderColor #F9A825

title Flujo de Exportar Datos

start

:Navegar al modulo desde el cual\ndesea exportar\n(Citas, Especialistas, Diagnosticos);

if (Exportar todo o parte?) then (Todo)
  :Hacer clic en "Exportacion completa";
else (Parte)
  :Seleccionar registros\nusando los checkboxes\nde cada fila;
  :Hacer clic en "Exportar";
endif

:Seleccionar formato:\nCSV / XLSX / PDF / DOCX;

:El archivo se descarga\nautomaticamente en\nsu navegador;

stop

@enduml
```

---

## Diagrama 8: Flujo de Cambiar Tema Visual

```
@startuml
skinparam defaultFontName Arial
skinparam defaultFontSize 12
skinparam backgroundColor #FEFEFE
skinparam activityBackgroundColor #E8F4FD
skinparam activityBorderColor #2196F3
skinparam activityDiamondBackgroundColor #FFF9C4
skinparam activityDiamondBorderColor #F9A825

title Flujo de Cambiar Tema Visual

start

:Navegar al modulo "Ajustes"\nen la barra lateral;

:Ver las opciones de tema\n(Modos Claro y Oscuro);

:Seleccionar el tema\nde su preferencia;

:Se reproducira una\nanimacion de electrocardiograma\ndurante el cambio;

:El nuevo tema se aplica\ninmediatamente a toda\nla interfaz;

:Su preferencia se guarda\nautomaticamente para\nproximas sesiones;

stop

@enduml
```
