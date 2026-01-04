import { useState, useEffect, useRef } from 'react';
import { Settings, Check } from 'lucide-react';
import { cn } from '../utils/cn';

export const SettingsDropdown = () => {
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
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleEnabled = () => {
    const newState = !enabled;
    setEnabled(newState);
    chrome.storage.local.set({ flowlintEnabled: newState });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        aria-label="Settings"
      >
        <Settings className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg z-50">
          <div className="p-2 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 px-2">Settings</h3>
          </div>
          <div className="p-1">
            <button
              role="checkbox"
              aria-checked={enabled}
              aria-label="Enable analysis"
              onClick={toggleEnabled}
              className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded cursor-pointer"
            >
              <span>Enable analysis</span>
              <div className={cn(
                "w-4 h-4 border rounded flex items-center justify-center transition-colors",
                enabled ? "bg-brand-600 border-brand-600 text-white" : "border-zinc-300 dark:border-zinc-600"
              )}>
                {enabled && <Check className="w-3 h-3" />}
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
