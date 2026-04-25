
## Cambios: Usuarios + Renombrar Auditorías + Pantalla de Login

### 1. `src/components/pages/UsuariosPage.tsx` — Roles y Control de Registro

**1.1 Restringir roles a 2 valores únicamente**
- Ajustar el array `users` mock: cualquier usuario con rol distinto de `Administrador` o `Auxiliar Administrativo` será reasignado a uno de esos dos (ej. Médico/Enfermera/Recepcionista/Técnico → `Auxiliar Administrativo`).
- En el `<Select>` del modal "Nuevo Usuario", dejar solo dos `SelectItem`:
  - `Administrador`
  - `Auxiliar Administrativo`

**1.2 Reemplazar columnas "Creado en" / "Actualizado en" por "Control de Registro"**
- En el header de la tabla, cambiar `['ID', 'Nombre', 'Apellido', 'Email', 'Rol', 'Estado', 'Creado en', 'Actualizado en', 'Acciones']` por `['ID', 'Nombre', 'Apellido', 'Email', 'Rol', 'Estado', 'Control de Registro', 'Acciones']`.
- En cada `<tr>`, eliminar las dos celdas de fechas y agregar una única celda con un botón `variant="ghost" size="sm"` con icono `Clock` (lucide-react) + tooltip implícito vía `title="Ver control de registro"`.
- Al hacer clic, abre un `Dialog` ligero (`max-w-sm`) con título "Control de Registro" mostrando dos bloques apilados verticalmente:
  - **Creado en:** `{user.creadoEn}`
  - **Actualizado en:** `{user.actualizadoEn}`
  - Botón **Cerrar** en el footer (además de la X nativa del Dialog).
- Estado adicional: `const [registroUser, setRegistroUser] = useState<typeof users[0] | null>(null);`.

### 2. Renombrar "Auditorías" → "Historias de Cambios"

Cambios mínimos, sin tocar funcionalidad ni datos:

- **`src/components/pages/AuditoriasPage.tsx`**: cambiar el `<h1>` de `Auditorías` a `Historias de Cambios`. (Mantener el nombre del archivo y del componente exportado para no romper imports — la URL no aplica porque la app usa navegación por estado, no rutas reales por página).
- **`src/components/layout/Sidebar.tsx`**: en `menuItems`, cambiar el label `'Auditorías'` por `'Historias de Cambios'` (el `id: 'auditorias'` se conserva como clave interna).
- **No se modifica** `src/pages/Index.tsx` (la clave `auditorias` sigue mapeando al mismo componente).

### 3. Nueva pantalla `/login` con animaciones

**3.1 Nuevo archivo: `src/pages/Login.tsx`**

Estructura:
- Layout pantalla completa: `min-h-screen flex items-center justify-center bg-background relative overflow-hidden`.
- **Fondo decorativo médico**: capa absoluta con SVGs/iconos de `lucide-react` (`Stethoscope`, `HeartPulse`, `Pill`, `Cross`, `Activity`, `Syringe`) posicionados en distintas esquinas con `opacity-10`, `blur-sm` y animación suave `animate-pulse`. Algunos con `rotate` distintos para sensación orgánica.
- **Card del formulario**: `w-full max-w-md` (≈ 400px), `bg-card`, `rounded-2xl`, `shadow-2xl`, `border border-border`, `p-8`, `animate-fade-in`, `relative z-10`.
- Header dentro del card: logo redondo con `gradient-primary` + icono `Activity` + título `MediCitas` + subtítulo `Sistema de Gestión Médica`.

**3.2 Estado interno**
```ts
type Mode = 'login' | 'recover';
const [mode, setMode] = useState<Mode>('login');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [showPassword, setShowPassword] = useState(false);
const [recoverEmail, setRecoverEmail] = useState('');
const [shake, setShake] = useState(false);
const [loading, setLoading] = useState(false);
```

**3.3 Formulario de Login (mode === 'login')**
- Campo email: `Input type="email"` con icono `Mail` absoluto a la izquierda y placeholder `"correo@ejemplo.com"`.
- Campo password: `Input type={showPassword ? 'text' : 'password'}` con icono `Lock` a la izquierda y botón al final con `Eye` / `EyeOff` (transición `transition-all duration-200`) que togglea `showPassword`.
- Botón **Iniciar Sesión**: `w-full`, `bg-primary`, `hover:bg-primary/90`, `transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`.
- Enlace texto **"¿Olvidaste la Contraseña?"** centrado debajo: `button` tipo link, `text-primary hover:underline` que cambia `mode` a `'recover'`.

**3.4 Lógica de autenticación simulada**
- Credenciales válidas hardcodeadas: `admin@ejemplo.com` / `admin123`.
- `handleLogin`:
  - Si coinciden → `toast.success("Autenticación exitosa")` (sonner) con icono check, pequeño delay (~600ms), luego `navigate('/')`.
  - Si no → activa `setShake(true)` por 400ms (clase `animate-shake`) y `toast.error("Correo o contraseña incorrectos")` con fondo rojo leve (sonner permite `style`).
- Card recibe `className={cn(..., shake && 'animate-shake')}`.

**3.5 Formulario de Recuperación (mode === 'recover')**
- Mismo card, pero contenido distinto, envuelto en `<div key={mode} className="animate-fade-in">` para que React fuerce remount → animación al cambiar.
- Título: `Recuperar Contraseña`.
- Input email único + botón **Enviar enlace de recuperación** (`w-full`).
- Botón secundario / link **"Volver al inicio de sesión"** que vuelve a `mode='login'`.
- `handleRecover`: toast con icono `MailCheck` → `"Si el correo existe, recibirás un enlace de recuperación"`. Si email vacío/sin `@`, toast error `"Correo inválido"`.

**3.6 Animación shake (nueva)**
Agregar en `tailwind.config.ts` (sección `keyframes` y `animation`):
```ts
keyframes: {
  // ... existentes
  shake: {
    '0%, 100%': { transform: 'translateX(0)' },
    '20%, 60%': { transform: 'translateX(-6px)' },
    '40%, 80%': { transform: 'translateX(6px)' },
  },
},
animation: {
  // ... existentes
  shake: 'shake 0.4s ease-in-out',
},
```
Usadas también: `animate-fade-in`, `animate-scale-in` (ya existen vía configuración base), `transition-all duration-200`.

**3.7 Registro de la ruta**
- Modificar `src/App.tsx` para agregar:
  ```tsx
  import Login from "./pages/Login";
  // ...
  <Route path="/login" element={<Login />} />
  ```
- **No** se agrega protección de rutas ni redirección automática (especificación: solo página accesible vía `/login`, sin lógica de sesión real).

### 4. Componentes / librerías reutilizadas

- `Dialog`, `Button`, `Input`, `Label` de `@/components/ui/*`.
- `toast` de `sonner` (ya disponible vía `<Sonner />` montado en `App.tsx`).
- `useNavigate` de `react-router-dom`.
- Iconos `lucide-react`: `Clock`, `Mail`, `Lock`, `Eye`, `EyeOff`, `Activity`, `Stethoscope`, `HeartPulse`, `Pill`, `Cross`, `Syringe`, `MailCheck`, `ArrowLeft`.

### 5. Alcance — qué NO se modifica

- Funcionalidad y datos de Auditorías (solo el título visible).
- Otras páginas, sidebar (más allá del label), header, modales no relacionados.
- No se añade Supabase, autenticación real, profiles ni roles en BD.
- No se agrega protección de la ruta `/` (la pantalla `/login` es independiente y simulada).

### 6. Resultado esperado

- Tabla de Usuarios menos comprimida, con roles limitados a 2 y modal pequeño para fechas.
- Sidebar muestra **Historias de Cambios** y la cabecera de la página coincide.
- `/login` accesible: card centrado, fondo decorativo médico sutil, toggle ojo, transición fluida entre login/recuperación, shake al fallar, toast de éxito y `navigate('/')` al autenticar con `admin@ejemplo.com` / `admin123`.
