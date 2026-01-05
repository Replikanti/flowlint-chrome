import { cn } from '../utils/cn';

interface FilterBarProps {
  counts: { must: number; should: number; nit: number };
  filters: { must: boolean; should: boolean; nit: boolean };
  onToggle: (type: 'must' | 'should' | 'nit') => void;
}

export const FilterBar = ({ counts, filters, onToggle }: FilterBarProps) => {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mr-1">Filter:</span>
      
      <FilterChip 
        type="must" 
        count={counts.must} 
        active={filters.must} 
        onClick={() => onToggle('must')} 
      />
      <FilterChip 
        type="should" 
        count={counts.should} 
        active={filters.should} 
        onClick={() => onToggle('should')} 
      />
      <FilterChip 
        type="nit" 
        count={counts.nit} 
        active={filters.nit} 
        onClick={() => onToggle('nit')} 
      />
    </div>
  );
};

interface FilterChipProps {
  type: 'must' | 'should' | 'nit';
  count: number;
  active: boolean;
  onClick: () => void;
}

const FilterChip = ({ type, count, active, onClick }: FilterChipProps) => {
  const styles = {
    must: active ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30" : "",
    should: active ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30" : "",
    nit: active ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30" : "",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border transition-all duration-200",
        active 
          ? styles[type] 
          : "bg-zinc-50 text-zinc-400 border-zinc-100 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700 opacity-60 hover:opacity-80"
      )}
    >
      <span className="uppercase">{type}</span>
      <span className={cn(
        "px-1 py-0.5 rounded-[3px] text-[9px] leading-none min-w-[14px] text-center",
        active ? "bg-white/50 dark:bg-black/20" : "bg-zinc-200 dark:bg-zinc-700"
      )}>
        {count}
      </span>
    </button>
  );
};
