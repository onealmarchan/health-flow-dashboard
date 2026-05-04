import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TriState = 'empty' | 'indeterminate' | 'all';

interface Props {
  state?: TriState;
  checked?: boolean;
  onChange: (next: boolean) => void;
  ariaLabel?: string;
  className?: string;
}

export function SelectionCheckbox({ state, checked, onChange, ariaLabel, className }: Props) {
  const value: boolean | 'indeterminate' =
    state === 'all' ? true :
    state === 'indeterminate' ? 'indeterminate' :
    state === 'empty' ? false :
    !!checked;

  return (
    <CheckboxPrimitive.Root
      checked={value}
      onCheckedChange={(v) => onChange(v === true)}
      aria-label={ariaLabel}
      className={cn(
        'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background',
        'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        'data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        {value === 'indeterminate' ? <Minus className="h-3 w-3" /> : <Check className="h-3 w-3" />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
