import { useState } from 'react';
import { Activity, ArrowLeftRight } from 'lucide-react';
import type { Especialista } from '@/data/especialistasStore';
import { SpecialistList } from './SpecialistList';
import { ViolinPlot } from './ViolinPlot';
import { DivergingBar } from './DivergingBar';

interface Props {
  specialists: Especialista[];
}

type Chart = 'violin' | 'diverging';

export function AnalysisView({ specialists }: Props) {
  const [chart, setChart] = useState<Chart>('violin');

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] min-h-[480px]">
        <div className="border-b lg:border-b-0 lg:border-r border-border">
          <SpecialistList specialists={specialists} />
        </div>
        <div className="p-4 flex flex-col gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setChart('violin')}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                chart === 'violin' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Violin Plot · Intensidad
            </button>
            <button
              onClick={() => setChart('diverging')}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                chart === 'diverging' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Diverging Bar · Ratio vs Meta
            </button>
          </div>
          <div className="flex-1 min-w-0 min-h-[420px]">
            {chart === 'violin'
              ? <ViolinPlot specialists={specialists} />
              : <DivergingBar specialists={specialists} />}
          </div>
        </div>
      </div>
    </div>
  );
}
