import { cn } from '../utils/cn';

interface WidgetButtonProps {
  onClick: () => void;
  enabled: boolean;
  hasClipboardWorkflow?: boolean;
  onAnalyzeClick?: () => void;
}

export const WidgetButton = ({ 
  onClick, 
  enabled, 
  hasClipboardWorkflow = false, 
  onAnalyzeClick 
}: WidgetButtonProps) => {
  return (
    <div className="flex flex-col items-end gap-2 font-sans">
      {hasClipboardWorkflow && enabled && onAnalyzeClick && (
         <button 
              type="button"
              className="bg-brand-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg animate-bounce cursor-pointer font-bold border border-brand-700"
              onClick={onAnalyzeClick}>
            Workflow detected! Click to analyze.
         </button>
      )}
      <button 
        onClick={onClick}
        className={cn(
          "w-14 h-14 bg-brand-500 hover:bg-brand-600 rounded-full shadow-xl flex items-center justify-center text-white transition-transform hover:scale-105 border-2 border-white dark:border-zinc-800",
          !enabled && "muted"
        )}
        aria-label="Open FlowLint"
        title={enabled ? "Open FlowLint" : "FlowLint paused - click settings to enable"}
      >
        <img src={chrome.runtime.getURL('icon-32.png')} className="w-8 h-8 rounded" alt="FlowLint Logo" />
      </button>
    </div>
  );
};
