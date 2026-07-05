import { useMemo } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { KPIWrapper } from './KPIWrapper';
import { usePacientes } from '@/services/usePacientes';
import { useCitas } from '@/services/useCitas';
import { useMedicos } from '@/services/useMedicos';
import { useSesionesMedicas } from '@/services/useJornadas';

interface AgeGroup {
  name: string;
  size: number;
  fill: string;
  patients: number;
}

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
  const { data: pacientes = [] } = usePacientes();
  const { data: citas = [] } = useCitas();
  const { data: medicos = [] } = useMedicos();
  const { data: sesiones = [] } = useSesionesMedicas();

  const { ageData, specialtyAgeData, conditionAgeData } = useMemo(() => {
    // 1. Age distribution
    let g0_12 = 0; let g13_18 = 0; let g19_59 = 0; let g60 = 0;
    const currentYear = new Date().getFullYear();
    
    pacientes.forEach((p: any) => {
      if (p.fecha_nacimiento) {
        const birthYear = new Date(p.fecha_nacimiento).getFullYear();
        const age = currentYear - birthYear;
        if (age <= 12) g0_12++;
        else if (age <= 18) g13_18++;
        else if (age <= 59) g19_59++;
        else g60++;
      } else {
        // Fallback for missing dates
        g19_59++;
      }
    });

    const calculatedAgeData = [
      { name: '0-12 años', size: Math.max(g0_12, 1), patients: g0_12, fill: 'hsl(var(--chart-1))' },
      { name: '13-18 años', size: Math.max(g13_18, 1), patients: g13_18, fill: 'hsl(var(--chart-2))' },
      { name: '19-59 años', size: Math.max(g19_59, 1), patients: g19_59, fill: 'hsl(var(--chart-3))' },
      { name: '60+ años', size: Math.max(g60, 1), patients: g60, fill: 'hsl(var(--chart-4))' },
    ].filter(g => g.patients > 0);

    // 2. Specialty distribution
    const medMap = new Map();
    medicos.forEach((m: any) => medMap.set(String(m.pk_num_medico_ministerio_salud ?? m.id), m));
    
    const sesMap = new Map();
    sesiones.forEach((s: any) => sesMap.set(String(s.pk_num_sesion_medica ?? s.id), String(s.fk_cm_b001_num_medico_ministerio_salud ?? '')));

    const specCount: Record<string, Set<string>> = {};
    
    citas.forEach((c: any) => {
      const pId = String(c.fk_ps_b001_num_paciente ?? '');
      const sId = String(c.fk_cm_b005_num_sesion ?? '');
      const mId = sesMap.get(sId);
      const m = medMap.get(mId);
      const spec = m?.especialidad?.nombre || 'General';
      
      if (!specCount[spec]) specCount[spec] = new Set();
      if (pId) specCount[spec].add(pId);
    });

    const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
    const calculatedSpecialtyData = Object.entries(specCount).map(([spec, patientSet], idx) => ({
      name: spec,
      size: Math.max(patientSet.size, 1),
      patients: patientSet.size,
      fill: colors[idx % colors.length]
    })).filter(g => g.patients > 0);

    if (calculatedSpecialtyData.length === 0) {
       calculatedSpecialtyData.push({ name: 'Sin registros', size: 1, patients: 0, fill: 'hsl(var(--muted))' });
    }
    if (calculatedAgeData.length === 0) {
       calculatedAgeData.push({ name: 'Sin registros', size: 1, patients: 0, fill: 'hsl(var(--muted))' });
    }

    return {
      ageData: calculatedAgeData,
      specialtyAgeData: calculatedSpecialtyData,
      conditionAgeData: [{ name: 'Datos no disponibles', size: 1, patients: 0, fill: 'hsl(var(--muted))' }] // Placeholder since backend lacks condition links
    };
  }, [pacientes, citas, medicos, sesiones]);

  const totalPatients = ageData.reduce((acc, item) => acc + item.patients, 0);
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
        component: <TreeMapView data={specialtyAgeData} title="Distribución Etaria por Especialidad" subtitle="Pacientes únicos por especialidad" total={totalSpec} />,
      },
      {
        label: 'Condiciones por Edad',
        component: <TreeMapView data={conditionAgeData} title="Concentración de Condiciones por Edad" subtitle="Datos no disponibles en base de datos" total={totalCond} />,
      },
    ]} />
  );
}
