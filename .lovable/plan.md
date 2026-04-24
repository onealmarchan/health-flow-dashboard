
## Implementación: Icono de notificaciones en el header principal

Se agregará un módulo visual e interactivo de notificaciones dentro del header principal de la aplicación, sin conexión a backend y manteniendo el estilo existente.

### Archivo a modificar

- `src/components/layout/Header.tsx`

### Cambios principales

#### 1. Nuevo icono de notificaciones

- Importar el icono `Bell` desde `lucide-react`.
- Insertar el botón de notificaciones dentro del grupo derecho del header, antes del botón de temas/colores y antes del perfil de usuario.
- Mantener el mismo patrón visual de los botones actuales:
  - `rounded-lg`
  - `bg-secondary`
  - `hover:bg-secondary/80`
  - transición suave
  - alineación horizontal con `gap-3`

El orden quedará así:

```text
[Notificaciones] [Temas/Colores] [Perfil]
```

#### 2. Badge rojo con contador

- Crear un estado local para notificaciones simuladas.
- El contador inicial será `3`, calculado desde las notificaciones no leídas.
- El badge se mostrará en la esquina superior derecha del botón de campana.
- Si el contador llega a `0`, el badge se ocultará.

Estilo previsto:

```text
absolute -top-1 -right-1
min-w-5 h-5
rounded-full
bg-red-600
text-white
text-xs
font-bold
```

#### 3. Dropdown de notificaciones

- Reutilizar el componente existente `DropdownMenu`.
- Agregar un nuevo estado:
  - `notificationsOpen`
- El dropdown se abrirá/cerrará al hacer clic en el icono y se cerrará automáticamente al hacer clic fuera, siguiendo el comportamiento de Radix/shadcn.
- El panel tendrá un ancho mayor que los menús existentes, por ejemplo `w-80`, para permitir título, descripción y hora.

Contenido simulado inicial:

```text
1. Nuevo mensaje recibido
   Tienes un mensaje pendiente de revisión.
   Hace 5 min

2. Evento próximo
   Jornada médica programada para mañana.
   Hace 20 min

3. Actualización del sistema
   Se actualizaron los módulos de diagnóstico.
   Hace 1 h

4. Alerta de seguridad
   Inicio de sesión detectado desde nuevo dispositivo.
   Hace 2 h
```

Cada ítem tendrá:
- título
- descripción corta
- hora ficticia
- tipo
- estado `read/unread`

#### 4. Estado visual leído/no leído

- Las notificaciones no leídas se mostrarán con mayor énfasis:
  - título en `font-semibold`
  - fondo sutil `bg-accent/40` o similar
- Las notificaciones leídas se verán más discretas:
  - texto en `text-muted-foreground`
  - sin fondo destacado
  - sin negrita fuerte

Al hacer clic en una notificación individual:
- se mostrará un mensaje emergente con `alert("Notificación seleccionada: [título]")`
- opcionalmente se marcará esa notificación como leída para reducir el contador.

#### 5. Acciones de gestión dentro del panel

En la parte inferior del dropdown se agregará una zona de acciones con separador visual.

Acciones:

1. **Marcar todo como leído**
   - Cambia todas las notificaciones a estado leído.
   - El badge se oculta porque el contador pasa a `0`.

2. **Borrar todo**
   - Vacía la lista de notificaciones.
   - El badge se oculta.
   - El panel muestra un mensaje tipo:
     ```text
     No hay notificaciones.
     ```

3. **Configuración de alertas**
   - Mostrará una simulación con:
     ```text
     Personalización de alertas – próximamente
     ```
   - Se implementará con `alert()` para mantenerlo simple y sin agregar un modal adicional innecesario.

#### 6. Persistencia visual dentro de la app

Como `Header` está montado en `src/pages/Index.tsx` por encima del contenido dinámico de páginas, el nuevo icono:
- permanecerá visible al cambiar entre módulos internos;
- no dependerá de la página actual;
- no afectará el comportamiento del selector de temas ni del menú de perfil.

### Detalles técnicos

- Se mantendrá todo dentro de `Header.tsx` para evitar crear archivos innecesarios.
- Se agregará un tipo local:

```ts
type NotificationItem = {
  id: number;
  title: string;
  description: string;
  time: string;
  type: 'message' | 'event' | 'update' | 'security';
  read: boolean;
};
```

- Nuevos estados:
  - `notifications`
  - `notificationsOpen`
- El contador se calculará con:
  ```ts
  notifications.filter((item) => !item.read).length
  ```
- Se usará `DropdownMenuContent align="end"` para que el panel quede correctamente alineado con el grupo de iconos.
- No se modificará navegación, rutas, páginas ni backend.
- No se alterará el funcionamiento existente del menú de temas ni del menú de usuario.
