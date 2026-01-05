import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { RULES_METADATA } from '@replikanti/flowlint-core';
import { cn } from '../utils/cn';

interface RulesWarningProps {
  enabledRules: Record<string, boolean>;
}

export const RulesWarning = ({ enabledRules }: RulesWarningProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Get enabled and disabled rules
  const checkedRules = RULES_METADATA.filter(rule => enabledRules[rule.id] !== false);
  const skippedRules = RULES_METADATA.filter(rule => enabledRules[rule.id] === false);

  // Don't show if all rules are enabled
  if (skippedRules.length === 0) return null;

  const formatRuleName = (name: string) => name.replace(/_/g, ' ');

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-amber-600 dark:text-amber-400 cursor-help">
        <AlertTriangle className="w-3 h-3" />
        <span className="text-[9px] font-bold">{skippedRules.length} skipped</span>
      </div>

      {showTooltip && (
        <div className="absolute right-0 top-full mt-1 z-50 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl p-3 animate-in fade-in zoom-in-95 duration-100">
          {/* Arrow */}
          <div className="absolute -top-1.5 right-4 w-3 h-3 bg-white dark:bg-zinc-900 border-l border-t border-zinc-200 dark:border-zinc-700 rotate-45" />

          {/* Checked Rules */}
          <div className="mb-3">
            <div className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Checked ({checkedRules.length})
            </div>
            <div className="space-y-0.5">
              {checkedRules.map(rule => (
                <div key={rule.id} className="text-[10px] text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                  <span className="font-mono font-bold text-zinc-500 dark:text-zinc-500 w-6">{rule.id}</span>
                  <span>{formatRuleName(rule.name)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skipped Rules */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              Skipped ({skippedRules.length})
            </div>
            <div className="space-y-0.5">
              {skippedRules.map(rule => (
                <div key={rule.id} className="text-[10px] text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                  <span className="font-mono font-bold text-zinc-500 dark:text-zinc-500 w-6">{rule.id}</span>
                  <span>{formatRuleName(rule.name)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
