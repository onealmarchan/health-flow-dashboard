import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps a table with horizontal scroll on mobile.
 * On desktop: normal table display.
 * On mobile: horizontally scrollable with snap hints.
 */
export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className={cn('table-responsive', className)}>
      <div className="overflow-x-auto scrollbar-thin -mx-4 px-4 sm:mx-0 sm:px-0 pb-2">
        <div className="min-w-[640px]">
          {children}
        </div>
      </div>
    </div>
  );
}

interface MobileCardRowProps {
  children: ReactNode;
  className?: string;
}

/**
 * On mobile, renders children as stacked card items.
 * On desktop, renders as a table row.
 * Usage: wrap the <tr> content, put card view inside.
 */
export function MobileCardRow({ children, className }: MobileCardRowProps) {
  return (
    <>
      {/* Desktop: normal row */}
      <tr className={cn('hidden sm:table-row', className)}>
        {children}
      </tr>
    </>
  );
}
