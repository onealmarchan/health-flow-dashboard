import { useCallback, useMemo, useState } from 'react';

export function useTableSelection<TId extends string | number>() {
  const [selectedIds, setSelectedIds] = useState<Set<TId>>(new Set());

  const toggleRow = useCallback((id: TId) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const setAllVisible = useCallback((ids: TId[], checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) ids.forEach(id => next.add(id));
      else ids.forEach(id => next.delete(id));
      return next;
    });
  }, []);

  const clear = useCallback(() => setSelectedIds(new Set()), []);

  const headerState = useCallback((visibleIds: TId[]): 'empty' | 'indeterminate' | 'all' => {
    if (visibleIds.length === 0) return 'empty';
    const sel = visibleIds.filter(id => selectedIds.has(id)).length;
    if (sel === 0) return 'empty';
    if (sel === visibleIds.length) return 'all';
    return 'indeterminate';
  }, [selectedIds]);

  return useMemo(() => ({ selectedIds, toggleRow, setAllVisible, clear, headerState }),
    [selectedIds, toggleRow, setAllVisible, clear, headerState]);
}
