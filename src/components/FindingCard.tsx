import { AlertCircle, AlertTriangle, Info, ExternalLink } from 'lucide-react';
import type { Finding } from '@replikanti/flowlint-core';
import { cn } from '../utils/cn';

interface FindingCardProps {
  finding: Finding;
}

export const FindingCard = ({ finding }: FindingCardProps) => {
  const colorClass = getSeverityColor(finding.severity);
  const docUrl = finding.documentationUrl || (finding.rule.match(/^R\d+$/) ? `https://github.com/Replikanti/flowlint-examples/tree/main/${finding.rule}` : null);
  const Icon = getSeverityIcon(finding.severity);

  return (
    <div className={cn(
      "border border-zinc-100 dark:border-zinc-800 rounded-xl p-3 bg-white dark:bg-zinc-900/50 shadow-sm flex gap-3 items-start border-l-4 transition-all hover:shadow-md",
      getSeverityBorder(finding.severity)
    )}>
      <div className={cn("mt-0.5", colorClass)}><Icon className="w-5 h-5" /></div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
            <span className={cn("text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-sev-box", colorClass)}>{finding.severity}</span>
            <span className="text-[10px] text-zinc-400 font-mono font-bold tracking-tighter">{finding.rule}</span>
            {docUrl && (
              <a href={docUrl} target="_blank" rel="noreferrer" className="text-brand-600 hover:text-brand-700" aria-label="View documentation">
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
        </div>
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">{finding.message}</p>
        {finding.raw_details && (
           <div className="mt-2 p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
              <pre className="text-[10px] text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap break-words leading-relaxed font-mono">{finding.raw_details}</pre>
           </div>
        )}
      </div>
    </div>
  );
};

export function getSeverityWeight(severity: string) {
  switch(severity) {
    case 'must': return 0;
    case 'should': return 1;
    case 'nit': return 2;
    default: return 3;
  }
}

export function getSeverityColor(severity: string) {
  switch(severity) {
    case 'must': return 'sev-must';
    case 'should': return 'sev-should';
    case 'nit': return 'sev-nit';
    default: return 'text-zinc-500';
  }
}

export function getSeverityBorder(severity: string) {
  switch(severity) {
    case 'must': return 'border-l-red-500';
    case 'should': return 'border-l-amber-500';
    case 'nit': return 'border-l-blue-500';
    default: return 'border-l-zinc-300';
  }
}

export function getSeverityIcon(severity: string) {
  switch(severity) {
    case 'must': return AlertCircle;
    case 'should': return AlertTriangle;
    case 'nit': return Info;
    default: return Info;
  }
}
