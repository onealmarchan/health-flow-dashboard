import { useMemo } from 'react';
import { KPIWrapper } from './KPIWrapper';
import { DivergingBar } from '@/components/pages/especialistas/DivergingBar';
import { useMedicos } from '@/services/useMedicos';
import { useCitas } from '@/services/useCitas';
import { useSesionesMedicas } from '@/services/useJornadas';

function DivergingBarView() {
  const { data: apiMedicos = [] } = useMedicos();
  const { data: apiCitas = [] } = useCitas();
  const { data: apiSesiones = [] } = useSesionesMedicas();
  
  const specialists = useMemo(() => {
    // Map sessions to doctors to count patients per doctor
    const sesMap = new Map();
    apiSesiones.forEach((s: any) => sesMap.set(String(s.pk_num_sesion_medica ?? s.id), String(s.fk_cm_b001_num_medico_ministerio_salud ?? '')));
    
    const docPatients = new Map<string, Set<string>>();
    apiCitas.forEach((c: any) => {
      const pId = String(c.fk_ps_b001_num_paciente ?? '');
      const sId = String(c.fk_cm_b005_num_sesion ?? '');
      if (!pId) return;
      const mId = sesMap.get(sId);
      if (mId) {
        if (!docPatients.has(mId)) docPatients.set(mId, new Set());
        docPatients.get(mId)!.add(pId);
      }
    });

    return apiMedicos.map((m: any, idx: number) => {
      const mId = String(m.pk_num_medico_ministerio_salud ?? m.id ?? '');
      return {
        id: m.id || idx,
        mpps: m.mpps || mId || '',
        nombre: m.nombre || m.nombres || '',
        apellido: m.apellido || m.apellidos || '',
        especialidad: m.especialidad?.nombre || 'General',
        pacientes: docPatients.get(mId)?.size || 0,
        telefono: m.telefono || '',
        disponible: true,
        fechaIngreso: '',
        createdAt: Date.now()
      };
    });
  }, [apiMedicos, apiCitas, apiSesiones]);

  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Diverging Bar — Ratio vs Meta</h3>
        <p className="text-sm text-muted-foreground">Desviación de carga por especialidad frente a la meta institucional</p>
      </div>
      <DivergingBar specialists={specialists} />
    </div>
  );
}

function PriorityMatrix() {
  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Matriz de Prioridades</h3>
        <p className="text-sm text-muted-foreground">No disponible (requiere módulo de diagnósticos clínicos)</p>
      </div>
      <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-secondary/20">
        <span className="text-muted-foreground">Sin datos clínicos suficientes</span>
      </div>
    </div>
  );
}

function InterconsultaMatrix() {
  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Matriz de Interconsulta</h3>
        <p className="text-sm text-muted-foreground">No disponible (remisiones origen-destino no registradas)</p>
      </div>
      <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-secondary/20">
        <span className="text-muted-foreground">Sin datos de interconsulta</span>
      </div>
    </div>
  );
}


export function DecisionMatrix() {
  return (
    <KPIWrapper views={[
      { id: 'matriz-prioridades', label: 'Matriz de prioridades', component: <PriorityMatrix /> },
      { id: 'interconsulta',      label: 'Interconsulta entre especialidades', component: <InterconsultaMatrix /> },
      { id: 'ratio-vs-meta',      label: 'Diverging Bar — Ratio vs Meta', component: <DivergingBarView /> },
    ]} />
  );
}
