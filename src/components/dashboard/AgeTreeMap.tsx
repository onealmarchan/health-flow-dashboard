import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { KPIWrapper } from './KPIWrapper';

interface AgeGroup {
  name: string;
  size: number;
  fill: string;
  patients: number;
}

const ageData: AgeGroup[] = [
  { name: '0-12 años', size: 245, patients: 245, fill: 'hsl(var(--chart-1))' },
  { name: '13-18 años', size: 180, patients: 180, fill: 'hsl(var(--chart-2))' },
  { name: '19-59 años', size: 520, patients: 520, fill: 'hsl(var(--chart-3))' },
  { name: '60+ años', size: 310, patients: 310, fill: 'hsl(var(--chart-4))' },
];

const totalPatients = ageData.reduce((acc, item) => acc + item.patients, 0);

// View 2: Distribution by specialty
const specialtyAgeData = [
  { name: 'Cardiología', size: 180, patients: 180, fill: 'hsl(var(--chart-1))' },
  { name: 'Pediatría', size: 260, patients: 260, fill: 'hsl(var(--chart-2))' },
  { name: 'Dermatología', size: 140, patients: 140, fill: 'hsl(var(--chart-3))' },
  { name: 'Neurología', size: 120, patients: 120, fill: 'hsl(var(--chart-4))' },
  { name: 'Traumatología', size: 155, patients: 155, fill: 'hsl(var(--chart-5))' },
];

// View 3: Condition concentration by age
const conditionAgeData = [
  { name: 'Gripe (0-12)', size: 85, patients: 85, fill: 'hsl(var(--chart-1))' },
  { name: 'COVID (19-59)', size: 120, patients: 120, fill: 'hsl(var(--chart-2))' },
  { name: 'Diabetes (60+)', size: 95, patients: 95, fill: 'hsl(var(--chart-3))' },
  { name: 'Hepatitis (19-59)', size: 65, patients: 65, fill: 'hsl(var(--chart-4))' },
  { name: 'Varicela (0-12)', size: 55, patients: 55, fill: 'hsl(var(--chart-5))' },
];

interface CustomContentProps {
  x: number; y: number; width: number; height: number;
  name: string; patients: number; fill: string;
  total: number;
}

const CustomContent = ({ x, y, width, height, patients, fill, total }: CustomContentProps) => {
  const percentage = ((patients / total) * 100).toFixed(1);
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill}
        stroke="hsl(var(--background))" strokeWidth={3} rx={8}
        className="transition-all duration-200 hover:opacity-80 cursor-pointer"
      />
      {width > 60 && height > 40 && (
        <text x={x + width / 2} y={y + height / 2 + 4} textAnchor="middle"
          fill="white" className="text-lg font-bold">
          {percentage}%
        </text>
      )}
    </g>
  );
};

function TreeMapView({ data, title, subtitle, total }: { data: AgeGroup[]; title: string; subtitle: string; total: number }) {
  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap data={data} dataKey="size" stroke="hsl(var(--background))"
            content={<CustomContent x={0} y={0} width={0} height={0} name="" patients={0} fill="" total={total} />}
          >
            <Tooltip content={({ payload }) => {
              if (payload && payload.length) {
                const d = payload[0].payload as AgeGroup;
                const pct = ((d.patients / total) * 100).toFixed(1);
                return (
                  <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                    <p className="font-semibold text-foreground">{d.name}</p>
                    <p className="text-sm text-muted-foreground">{d.patients} pacientes</p>
                    <p className="text-lg font-bold text-primary">{pct}%</p>
                  </div>
                );
              }
              return null;
            }} />
          </Treemap>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.fill }} />
            <span className="text-sm text-muted-foreground">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AgeTreeMap() {
  const totalSpec = specialtyAgeData.reduce((a, b) => a + b.patients, 0);
  const totalCond = conditionAgeData.reduce((a, b) => a + b.patients, 0);

  return (
    <KPIWrapper views={[
      {
        label: 'Distribución Etaria',
        component: <TreeMapView data={ageData} title="Distribución por Edad" subtitle="Rangos etarios de pacientes" total={totalPatients} />,
      },
      {
        label: 'Por Especialidad',
        component: <TreeMapView data={specialtyAgeData} title="Distribución Etaria por Especialidad" subtitle="Pacientes por grupo etario y especialidad" total={totalSpec} />,
      },
      {
        label: 'Condiciones por Edad',
        component: <TreeMapView data={conditionAgeData} title="Concentración de Condiciones por Edad" subtitle="Enfermedades específicas por rango etario" total={totalCond} />,
      },
    ]} />
  );
}
