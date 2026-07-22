import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TablePaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function TablePagination({ currentPage, totalPages, totalItems, onPageChange, className }: TablePaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className={cn('flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-t border-border bg-card/50', className)}>
      <p className="text-xs text-muted-foreground">
        {Math.min((currentPage - 1) * 10 + 1, totalItems)}–{Math.min(currentPage * 10, totalItems)} / {totalItems}
      </p>
      <div className="flex items-center gap-0.5 sm:gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </Button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`e${i}`} className="px-0.5 sm:px-1 text-xs text-muted-foreground" aria-hidden="true">…</span>
          ) : (
            <Button
              key={p}
              variant={p === currentPage ? 'default' : 'outline'}
              size="icon"
              className={cn(
                'h-7 w-7 text-xs',
                p === currentPage && 'bg-primary text-primary-foreground'
              )}
              onClick={() => onPageChange(p)}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p}
            </Button>
          )
        )}
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
