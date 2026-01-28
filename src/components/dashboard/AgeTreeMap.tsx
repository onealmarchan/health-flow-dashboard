import { useState } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

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

interface CustomContentProps {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  patients: number;
  fill: string;
}

const CustomContent = ({ x, y, width, height, name, patients, fill }: CustomContentProps) => {
  const percentage = ((patients / totalPatients) * 100).toFixed(1);
  
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        stroke="hsl(var(--background))"
        strokeWidth={3}
        rx={8}
        className="transition-all duration-200 hover:opacity-80 cursor-pointer"
      />
      {width > 80 && height > 60 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 12}
            textAnchor="middle"
            fill="white"
            className="font-semibold text-sm"
          >
            {name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 8}
            textAnchor="middle"
            fill="white"
            className="text-xs opacity-90"
          >
            {patients} pacientes
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 24}
            textAnchor="middle"
            fill="white"
            className="text-lg font-bold"
          >
            {percentage}%
          </text>
        </>
      )}
    </g>
  );
};

export function AgeTreeMap() {
  const [selectedGroup, setSelectedGroup] = useState<AgeGroup | null>(null);

  return (
    <div className="chart-container animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Distribución por Edad</h3>
          <p className="text-sm text-muted-foreground">Rangos etarios de pacientes registrados</p>
        </div>
        {selectedGroup && (
          <div className="px-4 py-2 rounded-lg bg-primary/10 animate-scale-in">
            <span className="text-sm font-medium text-primary">
              {selectedGroup.name}: {((selectedGroup.patients / totalPatients) * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={ageData}
            dataKey="size"
            stroke="hsl(var(--background))"
            content={<CustomContent x={0} y={0} width={0} height={0} name="" patients={0} fill="" />}
            onClick={(data) => {
              if (data && 'name' in data && 'patients' in data) {
                setSelectedGroup(data as unknown as AgeGroup);
              }
            }}
          >
            <Tooltip
              content={({ payload }) => {
                if (payload && payload.length) {
                  const data = payload[0].payload as AgeGroup;
                  const percentage = ((data.patients / totalPatients) * 100).toFixed(1);
                  return (
                    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold text-foreground">{data.name}</p>
                      <p className="text-sm text-muted-foreground">{data.patients} pacientes</p>
                      <p className="text-lg font-bold text-primary">{percentage}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </Treemap>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4">
        {ageData.map((item) => (
          <div 
            key={item.name}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setSelectedGroup(item)}
          >
            <div 
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: item.fill }}
            />
            <span className="text-sm text-muted-foreground">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
