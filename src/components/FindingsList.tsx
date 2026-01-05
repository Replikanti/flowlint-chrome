import { useMemo } from 'react';
import { CheckCircle } from 'lucide-react';
import type { Finding } from '@replikanti/flowlint-core';
import { FindingCard, getSeverityColor, getSeverityWeight } from './FindingCard';
import { cn } from '../utils/cn';

interface FindingsListProps {
  findings: Finding[];
  isFiltered?: boolean;
}

export const FindingsList = ({ findings, isFiltered = false }: FindingsListProps) => {
  const sortedFindings = useMemo(() => 
    [...findings].sort((a, b) => getSeverityWeight(a.severity) - getSeverityWeight(b.severity)), 
    [findings]
  );

  const groupedFindings = useMemo(() => (
    ['must', 'should', 'nit']
      .map(severity => ({
        severity,
        items: sortedFindings.filter(f => f.severity === severity)
      }))
      .filter(group => group.items.length > 0)
  ), [sortedFindings]);

  if (findings.length === 0) {
    if (isFiltered) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-zinc-400">
          <p className="text-xs">No issues match selected filters.</p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center py-10 text-zinc-500">
        <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-3">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Workflow is clean!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-white dark:bg-zinc-900">
      {groupedFindings.map(group => (
        <div key={group.severity} className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <span className={cn(
              "text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-sev-box",
              getSeverityColor(group.severity)
            )}>
              {group.severity}
            </span>
            <div className="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-800"></div>
            <span className="text-[10px] font-bold text-zinc-400">{group.items.length}</span>
          </div>
          {group.items.map((f, i) => (
            <FindingCard key={`${group.severity}-${i}`} finding={f} />
          ))}
        </div>
      ))}
    </div>
  );
};
