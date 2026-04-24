
## Ajuste del modal "Motivo de Consulta" y validación de menor sin C.I.

Se modificará exclusivamente `src/components/pages/CitasPage.tsx`, manteniendo intacto el flujo actual de apertura/cierre entre:

```text
Buscar Paciente / Agendar Cita → Motivo de Consulta → Cita Médica pantalla completa
```

### 1. Modal "Motivo de Consulta" — dimensiones más equilibradas

Actualmente el modal usa `max-w-lg` y no tiene control de altura/scroll interno. Se ajustará para que tenga un aspecto menos alargado verticalmente y más cómodo visualmente.

Cambios previstos:

- Ampliar el ancho del modal:
  - de `max-w-lg`
  - a algo como `w-[92vw] max-w-2xl`
- Limitar la altura máxima:
  - `max-h-[82vh]`
- Convertir el contenido en layout flexible:
  - `flex flex-col`
  - `overflow-hidden`
- Agregar scroll interno únicamente al cuerpo del formulario:
  - `overflow-y-auto`
  - `pr-2`
  - altura flexible
- Mantener el header fijo en la parte superior del modal.
- Mantener el footer con el botón **Siguiente** visible en la parte inferior.
- Agregar separación interna armoniosa:
  - `p-6`
  - `gap-4`
  - bordes/separadores consistentes con el diseño actual.

Estructura resultante:

```text
┌─ Motivo de Consulta ─────────────── X ┐
│ Dr. / Especialidad                    │
├───────────────────────────────────────┤
│ Nº Paciente                           │
│ Descripción                           │
│ Nivel de Urgencia                     │  ← zona scrolleable si hace falta
│ Fecha                                 │
│ Observación                           │
├───────────────────────────────────────┤
│                            [Siguiente]│
└───────────────────────────────────────┘
```

### 2. Botón "Siguiente"

Se conservará el comportamiento existente:

- El botón seguirá ubicado abajo a la derecha.
- Seguirá deshabilitado hasta completar todos los campos requeridos:
  - Nº Paciente
  - Descripción
  - Nivel de Urgencia
  - Fecha
  - Observación
- Al hacer clic, seguirá abriendo el modal/pantalla completa de la cita médica.
- No se modificará la lógica de `isMotivoValid`.
- No se modificará `handleSiguienteMotivo`.

### 3. Scroll del modal "Motivo de Consulta"

Se agregará barra de scroll interna para el formulario, evitando que el modal se corte en pantallas pequeñas.

La barra de scroll estará dentro del contenido del modal, no sobre toda la pantalla, para que:

- el header permanezca visible;
- el botón **Siguiente** permanezca visible;
- los campos no queden cortados ni solapados;
- no haya scroll excesivo para llegar al botón.

### 4. Modal "Registrar Nuevo Paciente" — validación de menor sin C.I.

Se agregará la validación solicitada para el caso:

```text
Paciente menor de edad sin C.I. = marcado
```

Cuando el usuario marque la casilla:

- El campo **Cédula de Identidad** de la sección **Datos Personales** se limpiará automáticamente.
- El campo **Cédula de Identidad** quedará deshabilitado.
- Se mostrará un placeholder o ayuda visual indicando que se usará la cédula del representante.
- El campo **Cédula del Representante** seguirá activo y será el documento de identificación usado para este caso.

Cuando el usuario desmarque la casilla:

- El campo **Cédula de Identidad** volverá a habilitarse.
- El usuario podrá escribir la C.I. del paciente normalmente.
- Se conservará el comportamiento actual del formulario.

### 5. Ajuste del checkbox "Paciente menor de edad sin C.I."

Se reemplazará el `onChange` actual por una función controlada, por ejemplo:

```ts
const handleMinorChange = (checked: boolean) => {
  setIsMinor(checked);

  if (checked) {
    setNewPatient(prev => ({
      ...prev,
      ci: '',
    }));
  }
};
```

Luego el checkbox usará esa función para garantizar que el campo C.I. se anule inmediatamente al marcar la opción.

### 6. Campo "Cédula de Identidad" en Datos Personales

El `Input` de C.I. se ajustará así:

- `disabled={isMinor}`
- `value={isMinor ? '' : newPatient.ci}`
- `onChange` solo actualizará si `!isMinor`
- `placeholder` dinámico:
  - normal: `"Ej: 12345678"`
  - menor sin C.I.: `"Se usará la cédula del representante"`

También se agregará un texto breve bajo el campo cuando `isMinor` esté activo:

```text
Campo anulado: se usará la Cédula del Representante como documento de identificación.
```

### 7. Alcance técnico

Archivo a modificar:

- `src/components/pages/CitasPage.tsx`

No se modificarán:

- otros modales;
- la pantalla completa de cita médica;
- la búsqueda de pacientes;
- la tabla principal;
- rutas;
- sidebar;
- backend;
- datos mock existentes.

### 8. Resultado esperado

- El modal **Motivo de Consulta** se verá más ancho, menos estirado verticalmente y con scroll interno.
- El botón **Siguiente** permanecerá visible abajo a la derecha.
- El flujo hacia la pantalla completa de cita médica seguirá funcionando igual.
- En **Registrar Nuevo Paciente**, al marcar **Paciente menor de edad sin C.I.**, el campo **Cédula de Identidad** quedará anulado/deshabilitado y se usará la **Cédula del Representante** como documento pertinente.
