import { useState, useEffect, useRef } from 'react';
import { Settings, Check } from 'lucide-react';
import { cn } from '../utils/cn';

interface SettingsDropdownProps {
  direction?: 'up' | 'down';
}

export const SettingsDropdown = ({ direction = 'down' }: SettingsDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load initial state
  useEffect(() => {
    chrome.storage.local.get('flowlintEnabled').then((result) => {
      if (typeof result.flowlintEnabled === 'boolean') {
        setEnabled(result.flowlintEnabled);
      }
    });
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      // In Shadow DOM, we need composedPath to see the real target sequence
      const path = event.composedPath();
      if (dropdownRef.current && !path.includes(dropdownRef.current)) {
        setIsOpen(false);
      }
    };

    // Attach to the root node (Shadow Root) if possible, otherwise document
    const root = dropdownRef.current?.getRootNode() as Document | ShadowRoot || document;
    root.addEventListener('mousedown', handleClickOutside);
    
    return () => root.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleEnabled = () => {
    const newState = !enabled;
    setEnabled(newState);
    chrome.storage.local.set({ flowlintEnabled: newState });
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
          <div className="p-1">
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
          </div>
        </div>
      )}
    </div>
  );
};