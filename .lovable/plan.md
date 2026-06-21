# Vista de Análisis — Especialistas Médicos

## Objetivo
Añadir una **segunda vista** ("Análisis") en `EspecialistasPage`, sin tocar la vista actual de tarjetas. Alternancia mediante un segmented control en la barra superior.

## Cambios

### 1. `EspecialistasPage.tsx`
- En la barra superior, a la izquierda de "+ Agregar Especialista", añadir segmented control:
  - `[ ⊞ Tarjetas ]  [ ≡ Análisis ]` (iconos `LayoutGrid` / `BarChart3`).
  - Estado local `view: 'cards' | 'analysis'`, default `cards`.
  - Activo: `bg-primary text-primary-foreground`; inactivo: `bg-secondary text-muted-foreground`.
- Render condicional con transición `animate-fade-in` (~200ms).
  - `view === 'cards'`: grid actual intacto.
  - `view === 'analysis'`: nuevo `<AnalysisView specialists={...} />`.

### 2. Nuevos componentes (en `src/components/pages/especialistas/`)
- `AnalysisView.tsx` — layout split:
  - `lg:grid-cols-[340px_1fr]`, en `<lg` apila vertical. `min-h-[480px]`, separador `border-r border-border`.
  - Estado `chart: 'violin' | 'diverging'`, default `violin`.
- `SpecialistList.tsx`:
  - Header sticky con etiquetas `Nº / MÉDICO · MPPS / PACIENTES` (text-xs uppercase muted).
  - Filas: Nº (28px, muted) · Avatar 32px círculo con color de especialidad y `UserCog` · nombre `text-sm font-medium` + segunda línea `<Especialidad>` color acento + ` · ` + MPPS muted · a la derecha conteo + mini-barra 60×4px (porcentaje = `pacientes/max*100`). Si `pacientes >= 350` → número y barra `#e05252`.
  - Hover, selección con `bg-primary/10` y `border-l-[3px] border-primary` (sólo visual, no filtra).
  - `overflow-y-auto` con header fijo.
- `ViolinPlot.tsx` (D3 v7):
  - KDE gaussiano bandwidth ~22–24 por especialidad, área simétrica con `d3.curveBasis`, fill acento opacity 0.18, stroke 0.65.
  - Box plot interno: Q1/Q3, mediana (stroke `#333` 2.5), bigotes Tukey con caps.
  - Jitter: círculos r=4.5 con desplazamiento horizontal vía Mulberry32 seeded por índice de especialidad. Excepción crítica (≥350): `#e05252`, r=5.5, stroke `#a01010`.
  - Línea meta `y=250` punteada `#f09030` con etiqueta "Meta: 250".
  - Tooltip flotante (div absoluto con anti-overflow): nombre, especialidad, pacientes, desviación, badge crítico si aplica.
  - Eje Y "Nº Pacientes" ticks ~50; eje X especialidades; grilla horizontal punteada `#ebebeb`.
- `DivergingBar.tsx` (D3 v7, horizontal):
  - Agrega por especialidad: `promedio`, `desviacion = round((prom-250)*10)/10`, `cantidad_medicos`.
  - Orden ASC por desviación. Escala simétrica.
  - 6 tramos de color (`>+60 #c0392b`, `+30..+60 #e05252`, `0..+30 #f09090`, `-30..0 #7dcfb6`, `-60..-30 #0f9e7b`, `<-60 #0a5c48`).
  - Etiquetas: desviación con signo (font-weight 700, 11.5px) y `(N pac.)` muted 9.5px.
  - Línea central x=0 (`#bbb` 1.5) con "Meta 250 pac./médico" arriba.
  - Etiquetas zona: "← Capacidad disponible" `#0f9e7b`, "Sobrecarga →" `#e05252`.
  - Leyenda inferior 2×3 con los 6 tramos.
  - Tooltip por barra.

### 3. Helpers (`src/components/pages/especialistas/utils.ts`)
- `SPECIALTY_COLORS`: mapping fijo (Cardiología `#1a9bd8`, Pediatría `#0f9e7b`, Dermatología `#7c5bc4`, Neurología `#d85a30`, Traumatología `#d4537e`, Ginecología `#ba7517`). Fallback para nuevas.
- `META = 250` (constante exportada).
- `mulberry32(seed)`, `kde(values, bandwidth)`, `quantiles(arr)`, `groupBy(spec)`.

### 4. Dependencia
- Agregar `d3` y `@types/d3` (D3 v7) vía `bun add`.

## Notas técnicas
- Cálculos se hacen en cliente sobre `useEspecialistas()`.
- SVG usa variables CSS del tema cuando aplica (texto/grilla). Colores categóricos y de severidad son fijos por requerimiento.
- Jitter determinístico (seed = `specialtyIndex * 1013 + 7`).
- MPPS: helper `parseInt(mpps.split('-')[1])` disponible aunque aquí no se ordene por MPPS.
- Sin cambios en stores, rutas, ni en la vista de tarjetas existente.
