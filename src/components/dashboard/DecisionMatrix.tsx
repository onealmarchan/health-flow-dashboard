import { cn } from '@/lib/utils';
import { KPIWrapper } from './KPIWrapper';

interface MatrixCell {
  label: string;
  value: number;
  urgency: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
}

const matrixData: MatrixCell[] = [
  { label: 'Cardiología', value: 45, urgency: 'high', impact: 'high' },
  { label: 'Pediatría', value: 78, urgency: 'medium', impact: 'high' },
  { label: 'Dermatología', value: 32, urgency: 'low', impact: 'medium' },
  { label: 'Traumatología', value: 56, urgency: 'high', impact: 'medium' },
  { label: 'Medicina General', value: 120, urgency: 'medium', impact: 'medium' },
  { label: 'Oftalmología', value: 28, urgency: 'low', impact: 'low' },
  { label: 'Neurología', value: 34, urgency: 'high', impact: 'high' },
  { label: 'Ginecología', value: 65, urgency: 'medium', impact: 'high' },
  { label: 'Psiquiatría', value: 42, urgency: 'medium', impact: 'medium' },
];

const interconsultaData = [
  { from: 'Cardiología', to: 'Neurología', current: 12, previous: 10 },
  { from: 'Pediatría', to: 'Dermatología', current: 8, previous: 6 },
  { from: 'Medicina General', to: 'Cardiología', current: 25, previous: 22 },
  { from: 'Traumatología', to: 'Neurología', current: 15, previous: 18 },
  { from: 'Ginecología', to: 'Pediatría', current: 10, previous: 9 },
];

const urgencyColors = {
  high: 'bg-destructive/20 border-destructive/40 text-destructive',
  medium: 'bg-warning/20 border-warning/40 text-warning',
  low: 'bg-success/20 border-success/40 text-success',
};

function PriorityMatrix() {
  const grid: MatrixCell[][][] = [[[], [], []], [[], [], []], [[], [], []]];
  const urgencyMap = { high: 0, medium: 1, low: 2 };
  const impactMap = { high: 0, medium: 1, low: 2 };
  matrixData.forEach(cell => {
    grid[urgencyMap[cell.urgency]][impactMap[cell.impact]].push(cell);
  });

  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Matriz de Prioridades</h3>
        <p className="text-sm text-muted-foreground">Especialidades por urgencia e impacto</p>
      </div>
      <div className="relative">
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-medium text-muted-foreground whitespace-nowrap">
          Urgencia →
        </div>
        <div className="pl-6">
          <div className="text-center text-xs font-medium text-muted-foreground mb-2">Impacto →</div>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="text-center text-xs font-medium text-success">Alto</div>
            <div className="text-center text-xs font-medium text-warning">Medio</div>
            <div className="text-center text-xs font-medium text-destructive">Bajo</div>
          </div>
          <div className="space-y-2">
            {['Alta', 'Media', 'Baja'].map((_, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-3 gap-2">
                {grid[rowIdx].map((cells, colIdx) => (
                  <div key={`${rowIdx}-${colIdx}`}
                    className={cn("min-h-[70px] rounded-lg border-2 p-2 transition-all",
                      rowIdx === 0 && colIdx === 0 ? "bg-destructive/10 border-destructive/30"
                        : rowIdx === 2 && colIdx === 2 ? "bg-success/10 border-success/30"
                        : "bg-secondary/50 border-border"
                    )}>
                    <div className="flex flex-wrap gap-1">
                      {cells.map(cell => (
                        <div key={cell.label}
                          className={cn("px-2 py-1 rounded text-xs font-medium border cursor-pointer hover:scale-105 transition-transform", urgencyColors[cell.urgency])}
                          title={`${cell.label}: ${cell.value} pacientes`}>
                          {cell.label.substring(0, 4)}
                          <span className="ml-1 opacity-70">{cell.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InterconsultaMatrix() {
  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Matriz de Interconsulta</h3>
        <p className="text-sm text-muted-foreground">Remisiones entre especialidades vs periodo anterior</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-2 text-muted-foreground">Origen</th>
              <th className="text-left p-2 text-muted-foreground">Destino</th>
              <th className="text-center p-2 text-muted-foreground">Actual</th>
              <th className="text-center p-2 text-muted-foreground">Anterior</th>
              <th className="text-center p-2 text-muted-foreground">Variación</th>
            </tr>
          </thead>
          <tbody>
            {interconsultaData.map((row, idx) => {
              const variation = ((row.current / row.previous) * 100 - 100).toFixed(1);
              const isPositive = row.current >= row.previous;
              return (
                <tr key={idx} className="border-b border-border/50 hover:bg-secondary/50">
                  <td className="p-2 font-medium text-foreground">{row.from}</td>
                  <td className="p-2 text-foreground">{row.to}</td>
                  <td className="p-2 text-center text-foreground">{row.current}</td>
                  <td className="p-2 text-center text-muted-foreground">{row.previous}</td>
                  <td className="p-2 text-center">
                    <span className={isPositive ? 'text-warning' : 'text-success'}>
                      {isPositive ? '+' : ''}{variation}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReservedView() {
  return (
    <div>
      <div className="mb-4 pr-8">
        <h3 className="text-lg font-semibold text-foreground">Vista Reservada</h3>
        <p className="text-sm text-muted-foreground">Espacio para futuras funcionalidades</p>
      </div>
      <div className="h-[240px] flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Próximamente...</p>
      </div>
    </div>
  );
}

export function DecisionMatrix() {
  return (
    <KPIWrapper views={[
      { label: 'Prioridades', component: <PriorityMatrix /> },
      { label: 'Interconsultas', component: <InterconsultaMatrix /> },
      { label: 'Reservado', component: <ReservedView /> },
    ]} />
  );
}
