import { useState, useEffect, useRef } from 'react';
import { Settings, Check } from 'lucide-react';
import { cn } from '../utils/cn';

interface SettingsDropdownProps {
  direction?: 'up' | 'down';
}

export const SettingsDropdown = ({ direction = 'down' }: SettingsDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [position, setPosition] = useState('bottom-right');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load initial state
  useEffect(() => {
    chrome.storage.local.get(['flowlintEnabled', 'widgetPosition']).then((result) => {
      if (typeof result.flowlintEnabled === 'boolean') {
        setEnabled(result.flowlintEnabled);
      }
      if (typeof result.widgetPosition === 'string') {
        setPosition(result.widgetPosition);
      }
    });
  }, []);

  // ... existing close logic ...

  const toggleEnabled = () => {
    const newState = !enabled;
    setEnabled(newState);
    chrome.storage.local.set({ flowlintEnabled: newState });
  };

  const changePosition = (pos: string) => {
    setPosition(pos);
    chrome.storage.local.set({ widgetPosition: pos });
  };

  const positionClasses = direction === 'up' 
    ? "bottom-full mb-1 origin-bottom-right" 
    : "top-full mt-1 origin-top-right";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-1.5 rounded-md transition-colors",
          isOpen ? "bg-zinc-100 dark:bg-zinc-800 text-brand-600" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        )}
        aria-label="Settings"
      >
        <Settings className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className={cn(
          "absolute right-0 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100",
          positionClasses
        )}>
          <div className="p-2 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 px-2">Settings</h3>
          </div>
          <div className="p-1 space-y-1">
            <button
              role="checkbox"
              aria-checked={enabled}
              aria-label="Enable analysis"
              onClick={toggleEnabled}
              className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded cursor-pointer transition-colors"
            >
              <span>Enable analysis</span>
              <div className={cn(
                "w-4 h-4 border rounded flex items-center justify-center transition-all duration-200",
                enabled ? "bg-brand-600 border-brand-600 text-white" : "border-zinc-300 dark:border-zinc-600 bg-transparent"
              )}>
                <Check className={cn("w-3 h-3 transition-transform duration-200", enabled ? "scale-100" : "scale-0")} />
              </div>
            </button>

            <div className="px-2 pt-2 pb-1">
              <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">Widget Position</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'top-left', label: 'Top Left' },
                  { id: 'top-right', label: 'Top Right' },
                  { id: 'bottom-left', label: 'Bottom Left' },
                  { id: 'bottom-right', label: 'Bottom Right' }
                ].map((pos) => (
                  <button
                    key={pos.id}
                    aria-label={pos.label}
                    onClick={() => changePosition(pos.id)}
                    className={cn(
                      "h-8 border rounded flex items-center justify-center text-[10px] transition-all",
                      position === pos.id 
                        ? "bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-900/20 dark:border-brand-800 dark:text-brand-400 font-bold shadow-sm" 
                        : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                    )}
                  >
                    {/* Visual indicator of quadrant */}
                    <div className={cn(
                      "w-3 h-3 border rounded-[1px] relative bg-white dark:bg-zinc-900",
                      position === pos.id ? "border-brand-300 dark:border-brand-700" : "border-zinc-300 dark:border-zinc-600"
                    )}>
                      <div className={cn(
                        "absolute w-1.5 h-1.5 rounded-[0.5px] bg-current",
                        pos.id.includes('top') ? "top-0" : "bottom-0",
                        pos.id.includes('left') ? "left-0" : "right-0",
                        position === pos.id ? "bg-brand-500" : "bg-zinc-400"
                      )} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};