import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Props {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
}

export function DateRangeButton({ value, onChange }: Props) {
  const [internal, setInternal] = useState<DateRange | undefined>(value);
  const range = value ?? internal;
  const set = (r: DateRange | undefined) => {
    setInternal(r);
    onChange?.(r);
  };

  const label = range?.from
    ? range.to
      ? `${format(range.from, 'dd/MM/yyyy')} – ${format(range.to, 'dd/MM/yyyy')}`
      : format(range.from, 'dd/MM/yyyy')
    : 'Rango de fechas';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn(!range?.from && 'text-muted-foreground')}>
          <CalendarDays className="w-4 h-4 mr-2" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-popover border border-border z-50" align="end">
        <Calendar
          mode="range"
          selected={range}
          onSelect={set}
          numberOfMonths={2}
          className={cn('p-3 pointer-events-auto')}
        />
        <div className="flex justify-end p-2 border-t border-border">
          <Button variant="ghost" size="sm" onClick={() => set(undefined)}>
            Limpiar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
