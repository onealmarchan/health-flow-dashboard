import { cn } from '@/lib/utils';

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

const urgencyColors = {
  high: 'bg-destructive/20 border-destructive/40 text-destructive',
  medium: 'bg-warning/20 border-warning/40 text-warning',
  low: 'bg-success/20 border-success/40 text-success',
};

export function DecisionMatrix() {
  const getGridPosition = (cell: MatrixCell) => {
    const urgencyMap = { high: 0, medium: 1, low: 2 };
    const impactMap = { high: 0, medium: 1, low: 2 };
    return {
      row: urgencyMap[cell.urgency],
      col: impactMap[cell.impact],
    };
  };

  // Group cells by position
  const grid: MatrixCell[][][] = [
    [[], [], []],
    [[], [], []],
    [[], [], []],
  ];

  matrixData.forEach((cell) => {
    const pos = getGridPosition(cell);
    grid[pos.row][pos.col].push(cell);
  });

  return (
    <div className="chart-container animate-fade-in">
      <h3 className="text-lg font-semibold text-foreground mb-1">Matriz de Prioridades</h3>
      <p className="text-sm text-muted-foreground mb-4">Especialidades por urgencia e impacto</p>
      
      <div className="relative">
        {/* Y-axis label */}
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-medium text-muted-foreground whitespace-nowrap">
          Urgencia →
        </div>
        
        <div className="pl-6">
          {/* X-axis label */}
          <div className="text-center text-xs font-medium text-muted-foreground mb-2">
            Impacto →
          </div>
          
          {/* Column headers */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="text-center text-xs font-medium text-success">Alto</div>
            <div className="text-center text-xs font-medium text-warning">Medio</div>
            <div className="text-center text-xs font-medium text-destructive">Bajo</div>
          </div>

          {/* Matrix Grid */}
          <div className="space-y-2">
            {['Alta', 'Media', 'Baja'].map((rowLabel, rowIdx) => (
              <div key={rowLabel} className="grid grid-cols-3 gap-2">
                {grid[rowIdx].map((cells, colIdx) => (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    className={cn(
                      "min-h-[80px] rounded-lg border-2 p-2 transition-all",
                      rowIdx === 0 && colIdx === 0 
                        ? "bg-destructive/10 border-destructive/30" 
                        : rowIdx === 2 && colIdx === 2
                        ? "bg-success/10 border-success/30"
                        : "bg-secondary/50 border-border"
                    )}
                  >
                    <div className="flex flex-wrap gap-1">
                      {cells.map((cell) => (
                        <div
                          key={cell.label}
                          className={cn(
                            "px-2 py-1 rounded text-xs font-medium border cursor-pointer hover:scale-105 transition-transform",
                            urgencyColors[cell.urgency]
                          )}
                          title={`${cell.label}: ${cell.value} pacientes`}
                        >
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

          {/* Row labels */}
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Prioridad Alta</span>
            <span>Prioridad Baja</span>
          </div>
        </div>
      </div>
    </div>
  );
}
