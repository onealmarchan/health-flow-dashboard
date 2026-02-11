import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { KPIWrapper } from './KPIWrapper';

const monthlyDiseaseData = [
  { month: 'Ene', gripe: 18.5, covid: 12.3, hepatitis: 5.2, otras: 64.0 },
  { month: 'Feb', gripe: 20.1, covid: 10.8, hepatitis: 4.8, otras: 64.3 },
  { month: 'Mar', gripe: 25.0, covid: 15.2, hepatitis: 6.1, otras: 53.7 },
  { month: 'Abr', gripe: 22.3, covid: 13.1, hepatitis: 5.5, otras: 59.1 },
  { month: 'May', gripe: 19.8, covid: 14.5, hepatitis: 6.8, otras: 58.9 },
  { month: 'Jun', gripe: 16.2, covid: 11.0, hepatitis: 4.2, otras: 68.6 },
];

const reconsultaData = [
  { month: 'Ene', cardio: 12, neuro: 8, pediatria: 5, trauma: 15 },
  { month: 'Feb', cardio: 14, neuro: 10, pediatria: 6, trauma: 12 },
  { month: 'Mar', cardio: 11, neuro: 12, pediatria: 8, trauma: 18 },
  { month: 'Abr', cardio: 16, neuro: 9, pediatria: 4, trauma: 14 },
  { month: 'May', cardio: 13, neuro: 11, pediatria: 7, trauma: 16 },
  { month: 'Jun', cardio: 15, neuro: 10, pediatria: 5, trauma: 13 },
];

const trimestralData = [
  { trimestre: 'Q1 2023', cardio: 100, neuro: 80, pediatria: 120 },
  { trimestre: 'Q2 2023', cardio: 110, neuro: 85, pediatria: 115 },
  { trimestre: 'Q3 2023', cardio: 105, neuro: 92, pediatria: 130 },
  { trimestre: 'Q4 2023', cardio: 120, neuro: 88, pediatria: 125 },
  { trimestre: 'Q1 2024', cardio: 130, neuro: 95, pediatria: 140 },
];

const chartStyle = {
  grid: { strokeDasharray: "3 3", stroke: 'hsl(var(--border))', vertical: false as const },
  xAxis: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 },
  tooltip: {
    backgroundColor: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
  },
};

function DiseaseDistribution() {
  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Distribución de Enfermedades</h3>
        <p className="text-sm text-muted-foreground">Porcentaje mensual por diagnóstico</p>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyDiseaseData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid {...chartStyle.grid} />
            <XAxis dataKey="month" tick={chartStyle.xAxis} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} />
            <YAxis tick={chartStyle.xAxis} axisLine={false} tickLine={false} unit="%" />
            <Tooltip contentStyle={chartStyle.tooltip} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar dataKey="gripe" stackId="a" fill="hsl(var(--chart-1))" name="Gripe" />
            <Bar dataKey="covid" stackId="a" fill="hsl(var(--chart-2))" name="COVID" />
            <Bar dataKey="hepatitis" stackId="a" fill="hsl(var(--chart-4))" name="Hepatitis" />
            <Bar dataKey="otras" stackId="a" fill="hsl(var(--chart-3))" name="Otras" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ReconsultaFrequency() {
  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Frecuencia de Reconsultas</h3>
        <p className="text-sm text-muted-foreground">Pacientes críticos reconsultados por especialidad</p>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={reconsultaData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid {...chartStyle.grid} />
            <XAxis dataKey="month" tick={chartStyle.xAxis} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} />
            <YAxis tick={chartStyle.xAxis} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={chartStyle.tooltip} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Line type="monotone" dataKey="cardio" stroke="hsl(var(--chart-1))" name="Cardiología" strokeWidth={2} />
            <Line type="monotone" dataKey="neuro" stroke="hsl(var(--chart-2))" name="Neurología" strokeWidth={2} />
            <Line type="monotone" dataKey="pediatria" stroke="hsl(var(--chart-3))" name="Pediatría" strokeWidth={2} />
            <Line type="monotone" dataKey="trauma" stroke="hsl(var(--chart-4))" name="Traumatología" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TrimestralTrend() {
  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Tasa Trimestral por Especialidad</h3>
        <p className="text-sm text-muted-foreground">Aumento/decremento de enfermedades</p>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trimestralData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid {...chartStyle.grid} />
            <XAxis dataKey="trimestre" tick={{ ...chartStyle.xAxis, fontSize: 10 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={false} />
            <YAxis tick={chartStyle.xAxis} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={chartStyle.tooltip} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar dataKey="cardio" fill="hsl(var(--chart-1))" name="Cardiología" />
            <Bar dataKey="neuro" fill="hsl(var(--chart-2))" name="Neurología" />
            <Bar dataKey="pediatria" fill="hsl(var(--chart-3))" name="Pediatría" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function StackedBarChartComponent() {
  return (
    <KPIWrapper views={[
      { label: 'Distribución Enfermedades', component: <DiseaseDistribution /> },
      { label: 'Reconsultas', component: <ReconsultaFrequency /> },
      { label: 'Tendencia Trimestral', component: <TrimestralTrend /> },
    ]} />
  );
}
