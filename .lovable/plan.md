

## Reestructuración del Modal "Registrar Nuevo Paciente"

Voy a reorganizar el modal de registro de pacientes en `src/components/pages/CitasPage.tsx` y actualizar los botones de acción reutilizables.

### Cambios en el Modal (CitasPage.tsx)

**1. Reubicación del checkbox "Paciente Menor de Edad/Sin C.I":**
Se moverá desde el final del formulario hacia el inicio, justo debajo del "Nº Paciente" mostrado en el `DialogDescription`. El campo de "Cédula del Representante" (que aparece al marcar el checkbox) se mostrará inmediatamente después, antes de la sección superior.

**2. División en dos secciones visuales:**
El formulario se reorganizará en dos bloques claramente separados, cada uno con un encabezado y un borde sutil para diferenciarlos:

- **Sección Superior — "Datos Personales"** (grid de 2 columnas):
  Cédula de Identidad → Nombres → Apellidos → Fecha de Nacimiento → Sexo → Dirección → Teléfono → Nacionalidad → Estado del Paciente → Estado Civil.

- **Sección Inferior — "Ubicación"** (grid de 2 columnas, nuevos campos):
  Comunidad → Estado → Municipio → Parroquia.
  Se añadirán al estado `newPatient` cuatro campos nuevos como inputs de texto, y al reset correspondiente en `handleSavePatient` y "Guardar y Continuar".

**3. Nuevos botones de acción:**
Se reemplazará el componente `ModalFormButtons` actual por una nueva fila de botones inline (alineada a la derecha, justo debajo de la sección Ubicación), con este orden exacto:

1. **Guardar** (primario, color principal)
2. **Guardar y Continuar** (secundario)
3. **Cancelar** (outline)

Cada botón disparará el `ConfirmDialog` ("¿Estás seguro?") existente antes de ejecutar su acción, manteniendo el estándar CRUD del proyecto.

### Diagrama de la nueva estructura

```text
┌─ Modal: Registrar Nuevo Paciente ──────────────── X ─┐
│ Nº Paciente: AUTO-0005                                │
│ ☐ Paciente menor de edad sin C.I.                     │
│   └─ (si activo) Cédula del Representante: [______]   │
│                                                       │
│ ── Datos Personales ─────────────────────────────     │
│ [C.I.]            [Nombres]                           │
│ [Apellidos]       [Fecha Nac.]                        │
│ [Sexo ▼]          [Dirección]                         │
│ [Teléfono]        [Nacionalidad]                      │
│ [Estado ▼]        [Estado Civil ▼]                    │
│                                                       │
│ ── Ubicación ───────────────────────────────────      │
│ [Comunidad]       [Estado]                            │
│ [Municipio]       [Parroquia]                         │
│                                                       │
│            [Guardar] [Guardar y Continuar] [Cancelar] │
└───────────────────────────────────────────────────────┘
```

### Detalles Técnicos

- **Archivo principal modificado:** `src/components/pages/CitasPage.tsx`.
  - Ampliar el estado `newPatient` con: `comunidad`, `estadoUbic`, `municipio`, `parroquia`.
  - Reordenar el JSX del Dialog `register`: checkbox arriba, dos `<div>` con `className="space-y-4"` y subtítulos (`<h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">`) para "Datos Personales" y "Ubicación".
  - Inline footer con 3 `<Button>` envueltos en lógica de `ConfirmDialog` (state local `confirmAction`).
- **Decisión sobre `ModalFormButtons`:** dado que solo se usa aquí y el orden/etiquetas cambian (de "Cancelar/Guardar y Otra/Guardar" → "Guardar/Guardar y Continuar/Cancelar"), se implementarán los botones directamente dentro de `CitasPage.tsx` reutilizando `ConfirmDialog`. El componente `ModalFormButtons.tsx` se mantendrá intacto por compatibilidad con futuros formularios.
- **Sin cambios:** los demás modales (Buscar Paciente, Agendar Cita) y la tabla principal de citas permanecen igual.

