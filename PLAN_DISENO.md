# Plan de Mejora Visual - MediCitas

## Contexto
Sistema de gestión médica (MediCitas) con React + Tailwind + shadcn/ui. Se busca mejorar el diseño visual sin tocar lógica ni conexiones con backend. Se usó la skill `ui-ux-pro-max` para generar el design system recomendado.

## Design System Recomendado (ui-ux-pro-max)
- **Patrón**: Real-Time / Operations Landing (dashboard médico)
- **Estilo**: Accessible & Ethical (WCAG AAA, alto contraste)
- **Paleta**: Cyan calma (#0891B2) + verde salud (#059669)
- **Tipografía**: Figtree (headings) + Noto Sans (body)
- **Efectos**: Focus rings claros, 44x44px touch targets, reduced motion

---

## Cambios a Implementar

### 1. Tipografía: Inter → Figtree + Noto Sans
**Archivos**: `index.html`, `tailwind.config.ts`, `index.css`
- Agregar Google Fonts import en `index.html`
- Actualizar `fontFamily.sans` en Tailwind config a `['Figtree', 'Noto Sans', 'system-ui', 'sans-serif']`
- Figtree da un look más amigable y profesional para healthcare

### 2. Paleta de Colores Refinada
**Archivo**: `index.css` (tema `:root` light-blue)
- Ajustar `--primary` de `200 85% 50%` → `186 90% 42%` (cyan más profundo #0891B2)
- Ajustar `--accent` de `190 70% 45%` → `160 84% 39%` (verde salud #059669)
- Ajustar `--background` a un tono más cálido: `187 60% 97%`
- Ajustar `--card` para mejor separación: `187 50% 99%`
- Mejorar contraste de `--muted-foreground` para WCAG AA
- Ajustar `--border` a un cyan más sutil: `186 40% 85%`
- Ajustar `--sidebar-background` para coherencia
- Refinar tokens de gráficas para coherencia con nueva paleta

### 3. Sidebar - Refinamiento Visual
**Archivo**: `src/components/layout/Sidebar.tsx`
- Agregar efecto glass sutil al sidebar (`backdrop-blur-sm bg-sidebar/95`)
- Mejorar el área del logo: sombra más sutil, transición de colores más suave
- Agregar indicador de sección activa con barra lateral animada (no solo cambio de fondo)
- Mejorar espaciado vertical entre items del menú
- Agregar separador visual entre items principales y secundarios (Ajustes, FAQ, Help Desk)

### 4. Header - Pulido Visual
**Archivo**: `src/components/layout/Header.tsx`
- Agregar sutil efecto glass al header (`backdrop-blur-sm bg-card/90`)
- Mejorar el toggle de tema: agregar transición de color más suave, mejor feedback visual
- Refinar el badge de notificaciones: mejor sombra y centrado
- Agregar separador visual más sutil entre secciones

### 5. Login Page - Elevación Visual
**Archivo**: `src/pages/Login.tsx`
- Mejorar el fondo decorativo: usar un gradiente radial sutil en lugar de iconos sueltos
- Refinar la tarjeta de login: mejor sombra, bordes más suaves
- Agregar efecto glass a la tarjeta
- Mejorar el botón de login con gradiente sutil
- Agregar transiciones más suaves entre modos (login/recover)

### 6. Dashboard - Metric Cards Mejoradas
**Archivo**: `src/components/dashboard/MetricCard.tsx`
- Agregar sutil gradiente de fondo a las cards (de card a muted)
- Mejorar el ícono: sombra sutil, mejor centrado
- Agregar borde izquierdo de color según semáforo (verde/ámbar/rojo)
- Refinar la tipografía del valor: mejor jerarquía visual
- Mejorar el chip de tendencia con fondo sutil

### 7. Dashboard Content - Layout Mejorado
**Archivo**: `src/components/dashboard/DashboardContent.tsx`
- Agregar encabezado de sección con borde inferior sutil
- Mejorar el botón "Configurar KPIs" con mejor estilo
- Agregar spacing más consistente entre secciones

### 8. KPI Wrapper - Pulido
**Archivo**: `src/components/dashboard/KPIWrapper.tsx`
- Mejorar los controles de navegación: mejor feedback hover
- Refinar los dots indicadores de página
- Agregar borde sutil en el contenedor del chart

### 9. Tablas - Mejora Visual General
**Archivos**: `PatientTable.tsx`, `CitasPage.tsx`, `UsuariosPage.tsx`, `DiagnosticosPage.tsx`, `EspecialistasPage.tsx`
- Mejorar el encabezado de tabla: fondo más definido, mejor contraste
- Refinar hover de filas: transición más suave
- Mejorar los badges de estado: más padding, mejor contraste
- Agregar sombra sutil a la tabla contenedora
- Mejorar paginación visual

### 10. Páginas - Headers Consistentes
**Archivos**: Todas las páginas en `src/components/pages/`
- Unificar estilo de encabezado de página: título + subtítulo + botón de acción
- Agregar borde inferior sutil o separador
- Mejorar espaciado entre secciones

### 11. Especialistas Page - Cards Mejoradas
**Archivo**: `src/components/pages/EspecialistasPage.tsx`
- Mejorar las cards de especialistas: mejor sombra, gradiente sutil de fondo
- Refinar el badge de disponibilidad
- Mejorar el avatar del doctor con borde de color

### 12. NotFound Page - Rediseño
**Archivo**: `src/pages/NotFound.tsx`
- Agregar ícono médico decorativo (usando lucide-react)
- Mejorar la presentación: centrado, mejor espaciado
- Agregar botón de regreso con mejor estilo
- Traducir texto al español

### 13. CSS Utilities - Mejoras
**Archivo**: `src/index.css`
- Refinar `.glass-effect` con mejor opacidad
- Mejorar `.hover-lift` con transición más suave
- Refinar `.gradient-primary` y `.gradient-card`
- Agregar utilidad `.section-header` para encabezados consistentes
- Mejorar `.metric-card` con mejor jerarquía de sombras
- Agregar animación `fade-in-up` más suave

### 14. index.html - Meta Tags
**Archivo**: `index.html`
- Actualizar título: "MediCitas - Sistema de Gestión Médica"
- Actualizar meta description
- Actualizar og:title y og:description

### 15. Tailwind Config - Animaciones Mejoradas
**Archivo**: `tailwind.config.ts`
- Refinar keyframes existentes para ser más suaves
- Agregar animación `slide-in-right` para sidebar items
- Mejorar `pulse-soft` para ser más sutil

---

## Archivos a Modificar (en orden)
1. `index.html` - Meta tags y Google Fonts
2. `tailwind.config.ts` - Tipografía y animaciones
3. `src/index.css` - Paleta de colores y utilidades
4. `src/components/layout/Sidebar.tsx` - Sidebar visual
5. `src/components/layout/Header.tsx` - Header visual
6. `src/pages/Login.tsx` - Login visual
7. `src/components/dashboard/MetricCard.tsx` - Cards de métricas
8. `src/components/dashboard/DashboardContent.tsx` - Layout dashboard
9. `src/components/dashboard/KPIWrapper.tsx` - KPI wrapper
10. `src/components/shared/SearchBar.tsx` - SearchBar refinado
11. `src/components/shared/FiltersButton.tsx` - FiltersButton refinado
12. `src/pages/NotFound.tsx` - NotFound rediseñado
13. `src/components/pages/CitasPage.tsx` - Tabla de citas
14. `src/components/pages/EspecialistasPage.tsx` - Cards de especialistas
15. `src/components/pages/UsuariosPage.tsx` - Tabla de usuarios
16. `src/components/pages/DiagnosticosPage.tsx` - Tabla de diagnósticos
17. `src/components/pages/JornadasPage.tsx` - Jornadas visual
18. `src/components/pages/AjustesPage.tsx` - Ajustes visual
19. `src/pages/AccesoDenegado.tsx` - Acceso denegado refinado

## Lo que NO se toca
- Ninguna lógica de negocio
- Conexiones con backend/API
- Hooks, servicios, contextos de datos
- Estructura de rutas
- Componentes de reportes/exportación

## Verificación
- Ejecutar `npm run build` para verificar que no hay errores de TypeScript
- Verificar que el tema light-blue se ve correctamente
- Probar cambio de tema dark/light
- Verificar que todas las páginas renderizan correctamente
