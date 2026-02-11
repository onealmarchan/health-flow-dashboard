import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { KPIWrapper } from './KPIWrapper';

const densityData = [
  { comunidad: 'Centro', casos: 85, poblacion: 5000, densidad: 1.7 },
  { comunidad: 'Norte', casos: 62, poblacion: 4200, densidad: 1.48 },
  { comunidad: 'Sur', casos: 98, poblacion: 6100, densidad: 1.61 },
  { comunidad: 'Este', casos: 45, poblacion: 3800, densidad: 1.18 },
  { comunidad: 'Oeste', casos: 72, poblacion: 4500, densidad: 1.6 },
];

const concentrationData = [
  { zona: 'Centro', actual: 85, anterior: 72, indice: 18.1 },
  { zona: 'Norte', actual: 62, anterior: 58, indice: 6.9 },
  { zona: 'Sur', actual: 98, anterior: 105, indice: -6.7 },
  { zona: 'Este', actual: 45, anterior: 40, indice: 12.5 },
  { zona: 'Oeste', actual: 72, anterior: 68, indice: 5.9 },
];

const growthData = [
  { zona: 'Centro', q1: 65, q2: 72, q3: 80, q4: 85 },
  { zona: 'Norte', q1: 50, q2: 55, q3: 58, q4: 62 },
  { zona: 'Sur', q1: 90, q2: 95, q3: 105, q4: 98 },
  { zona: 'Este', q1: 35, q2: 38, q3: 40, q4: 45 },
  { zona: 'Oeste', q1: 60, q2: 65, q3: 68, q4: 72 },
];

const vulnerabilityData = [
  { comunidad: 'Centro', encamados: 12, visitados: 800, tasa: 1.5 },
  { comunidad: 'Norte', encamados: 8, visitados: 650, tasa: 1.23 },
  { comunidad: 'Sur', encamados: 18, visitados: 900, tasa: 2.0 },
  { comunidad: 'Este', encamados: 6, visitados: 550, tasa: 1.09 },
  { comunidad: 'Oeste', encamados: 10, visitados: 700, tasa: 1.43 },
];

const ts = {
  grid: { strokeDasharray: "3 3" as const, stroke: 'hsl(var(--border))', vertical: false as const },
  xTick: { fill: 'hsl(var(--muted-foreground))', fontSize: 11 },
  tooltip: { backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' },
};

function DensityView() {
  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Densidad Epidemiológica</h3>
        <p className="text-sm text-muted-foreground">Casos por comunidad / Población estimada × 100</p>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={densityData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid {...ts.grid} />
            <XAxis dataKey="comunidad" tick={ts.xTick} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} />
            <YAxis tick={ts.xTick} axisLine={false} tickLine={false} unit="%" />
            <Tooltip contentStyle={ts.tooltip} />
            <Bar dataKey="densidad" fill="hsl(var(--chart-1))" name="Densidad %" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ConcentrationView() {
  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Concentración Geográfica</h3>
        <p className="text-sm text-muted-foreground">Índice de concentración de casos por zona</p>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={concentrationData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid {...ts.grid} />
            <XAxis dataKey="zona" tick={ts.xTick} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} />
            <YAxis tick={ts.xTick} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={ts.tooltip} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar dataKey="actual" fill="hsl(var(--chart-1))" name="Actual" />
            <Bar dataKey="anterior" fill="hsl(var(--chart-3))" name="Anterior" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function GrowthView() {
  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Crecimiento Epidemiológico</h3>
        <p className="text-sm text-muted-foreground">Tasa de crecimiento por zona (trimestral)</p>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={growthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid {...ts.grid} />
            <XAxis dataKey="zona" tick={ts.xTick} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} />
            <YAxis tick={ts.xTick} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={ts.tooltip} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar dataKey="q1" fill="hsl(var(--chart-1))" name="Q1" />
            <Bar dataKey="q2" fill="hsl(var(--chart-2))" name="Q2" />
            <Bar dataKey="q3" fill="hsl(var(--chart-3))" name="Q3" />
            <Bar dataKey="q4" fill="hsl(var(--chart-4))" name="Q4" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function VulnerabilityView() {
  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Vulnerabilidad Comunitaria</h3>
        <p className="text-sm text-muted-foreground">Pacientes encamados/dependientes por comunidad</p>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={vulnerabilityData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid {...ts.grid} horizontal={false} />
            <XAxis type="number" tick={ts.xTick} axisLine={false} tickLine={false} unit="%" />
            <YAxis type="category" dataKey="comunidad" tick={ts.xTick} axisLine={false} tickLine={false} width={60} />
            <Tooltip contentStyle={ts.tooltip} />
            <Bar dataKey="tasa" fill="hsl(var(--chart-5))" name="Tasa %" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function GeographicKPI() {
  return (
    <KPIWrapper views={[
      { label: 'Densidad', component: <DensityView /> },
      { label: 'Concentración', component: <ConcentrationView /> },
      { label: 'Crecimiento', component: <GrowthView /> },
      { label: 'Vulnerabilidad', component: <VulnerabilityView /> },
    ]} />
  );
}
