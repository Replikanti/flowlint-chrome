import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { Finding } from '@replikanti/flowlint-core';
import { FilterBar } from './FilterBar';
import { FindingsList } from './FindingsList';
import { ExportPanel } from './ExportPanel';
import { SettingsDropdown } from './SettingsDropdown';
import { RulesWarning } from './RulesWarning';

interface ExpandedViewProps {
  findings: Finding[];
  allFindings: Finding[];
  filters: { must: boolean; should: boolean; nit: boolean };
  counts: { must: number; should: number; nit: number };
  enabledRules: Record<string, boolean>;
  onClose: () => void;
  onToggleFilter: (type: 'must' | 'should' | 'nit') => void;
}

export const ExpandedView = ({
  findings,
  allFindings,
  filters,
  counts,
  enabledRules,
  onClose,
  onToggleFilter
}: ExpandedViewProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Auto-focus dialog on mount for keyboard events to work
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  const handleBackdropClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      open
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-[2147483647] flex items-center justify-center p-8 bg-transparent w-full h-full max-w-none m-0 outline-none"
      data-testid="expanded-view-dialog"
      aria-labelledby="expanded-view-title"
    >
      {/* Backdrop overlay - button for click-to-close */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 cursor-default border-none p-0"
        onClick={handleBackdropClick}
        aria-label="Close by clicking backdrop"
        data-testid="expanded-view-backdrop"
        tabIndex={-1}
      />
      <div
        className="relative w-full h-full max-w-6xl max-h-[800px] bg-app dark:bg-app rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <header className="h-14 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 flex-shrink-0 z-10">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-50 dark:bg-brand-900/20 rounded-lg flex items-center justify-center border border-brand-100 dark:border-brand-800">
                 <img src={chrome.runtime.getURL('icon-32.png')} className="w-5 h-5 rounded-sm" alt="Logo" />
              </div>
              <h1 id="expanded-view-title" className="font-bold text-zinc-900 dark:text-zinc-100 text-lg tracking-tight">
                FlowLint - Expanded View
              </h1>
           </div>
           <div className="flex items-center gap-1">
              <RulesWarning enabledRules={enabledRules} />
              <SettingsDropdown direction="down" />
              <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>
              <button 
                onClick={onClose} 
                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 rounded text-zinc-600 dark:text-zinc-400 transition-colors" 
                aria-label="Close Expanded View"
              >
                 <X className="w-4 h-4"/>
              </button>
           </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col relative">
          <div className="p-3 pb-0">
            <FilterBar counts={counts} filters={filters} onToggle={onToggleFilter} />
          </div>
          <div className="flex-1 overflow-hidden flex flex-col p-3 pt-3">
            <FindingsList findings={findings} isFiltered={Object.values(filters).some(v => !v)} />
          </div>
          {allFindings.length > 0 && (
            <div className="flex-shrink-0">
              <ExportPanel results={allFindings} workflowName="n8n-workflow" />
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
};
