import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Buscar...', className = '' }: Props) {
  return (
    <div className={`relative flex-1 min-w-[200px] ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}
