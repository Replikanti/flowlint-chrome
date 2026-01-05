import { useState, useEffect, useRef, useMemo } from 'react';
import { Settings, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { RULES_METADATA } from '@replikanti/flowlint-core';
import { cn } from '../utils/cn';

interface SettingsDropdownProps {
  direction?: 'up' | 'down';
}

// Initialize all rules as enabled by default
const getDefaultEnabledRules = (): Record<string, boolean> => {
  const defaults: Record<string, boolean> = {};
  RULES_METADATA.forEach(rule => {
    defaults[rule.id] = true;
  });
  return defaults;
};

export const SettingsDropdown = ({ direction = 'down' }: SettingsDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [position, setPosition] = useState('bottom-right');
  const [theme, setTheme] = useState('system');
  const [enabledRules, setEnabledRules] = useState<Record<string, boolean>>(getDefaultEnabledRules);
  const [rulesExpanded, setRulesExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeRuleCount = useMemo(() =>
    Object.values(enabledRules).filter(Boolean).length,
    [enabledRules]
  );

  // Load initial state
  useEffect(() => {
    chrome.storage.local.get(['flowlintEnabled', 'autoAnalyze', 'widgetPosition', 'theme', 'enabledRules']).then((result) => {
      if (typeof result.flowlintEnabled === 'boolean') {
        setEnabled(result.flowlintEnabled);
      }
      if (typeof result.autoAnalyze === 'boolean') {
        setAutoAnalyze(result.autoAnalyze);
      }
      if (typeof result.widgetPosition === 'string') {
        setPosition(result.widgetPosition);
      }
      if (typeof result.theme === 'string') {
        setTheme(result.theme);
      }
      if (result.enabledRules && typeof result.enabledRules === 'object') {
        const savedRules = result.enabledRules as Record<string, boolean>;
        setEnabledRules(prev => ({ ...prev, ...savedRules }));
      }
    });
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: Event) => {
      const path = event.composedPath();
      if (dropdownRef.current && !path.includes(dropdownRef.current)) {
        setIsOpen(false);
      }
    };

    globalThis.addEventListener('mousedown', handleClickOutside);
    return () => globalThis.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleEnabled = () => {
    const newState = !enabled;
    setEnabled(newState);
    chrome.storage.local.set({ flowlintEnabled: newState });
  };

  const toggleAutoAnalyze = () => {
    const newState = !autoAnalyze;
    setAutoAnalyze(newState);
    chrome.storage.local.set({ autoAnalyze: newState });
  };

  const changePosition = (pos: string) => {
    setPosition(pos);
    chrome.storage.local.set({ widgetPosition: pos });
  };

  const changeTheme = (t: string) => {
    setTheme(t);
    chrome.storage.local.set({ theme: t });
  };

  const toggleRule = (id: string) => {
    const newRules = { ...enabledRules, [id]: !enabledRules[id] };
    setEnabledRules(newRules);
    chrome.storage.local.set({ enabledRules: newRules });
  };

  const setAllRules = (enabled: boolean) => {
    const newRules: Record<string, boolean> = {};
    RULES_METADATA.forEach(rule => {
      newRules[rule.id] = enabled;
    });
    setEnabledRules(newRules);
    chrome.storage.local.set({ enabledRules: newRules });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'must': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
      case 'should': return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20';
      case 'nit': return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20';
      default: return 'text-zinc-600 bg-zinc-50';
    }
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
            <label className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded cursor-pointer transition-colors">
              <span>Enable analysis</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={toggleEnabled}
                  className="sr-only"
                  aria-label="Enable analysis"
                />
                <div className={cn(
                  "w-4 h-4 border rounded flex items-center justify-center transition-all duration-200",
                  enabled ? "bg-brand-600 border-brand-600 text-white" : "border-zinc-300 dark:border-zinc-600 bg-transparent"
                )}>
                  <Check className={cn("w-3 h-3 transition-transform duration-200", enabled ? "scale-100" : "scale-0")} />
                </div>
              </div>
            </label>

            <label className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded cursor-pointer transition-colors">
              <span>Auto-analyze paste</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={autoAnalyze}
                  onChange={toggleAutoAnalyze}
                  className="sr-only"
                  aria-label="Auto-analyze clipboard"
                />
                <div className={cn(
                  "w-4 h-4 border rounded flex items-center justify-center transition-all duration-200",
                  autoAnalyze ? "bg-brand-600 border-brand-600 text-white" : "border-zinc-300 dark:border-zinc-600 bg-transparent"
                )}>
                  <Check className={cn("w-3 h-3 transition-transform duration-200", autoAnalyze ? "scale-100" : "scale-0")} />
                </div>
              </div>
            </label>

            <div className="px-2 pt-2 pb-1 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">Theme</span>
              <div className="grid grid-cols-3 gap-1">
                {['system', 'light', 'dark'].map((t) => (
                  <button
                    key={t}
                    onClick={() => changeTheme(t)}
                    className={cn(
                      "py-1 border rounded text-[10px] capitalize transition-all",
                      theme === t 
                        ? "bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-900/20 dark:border-brand-800 dark:text-brand-400 font-bold" 
                        : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Rules Configuration */}
            <div className="px-2 pt-2 pb-1 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setRulesExpanded(!rulesExpanded)}
                className="w-full flex items-center justify-between text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                aria-label="Rules"
              >
                <span>Rules ({activeRuleCount}/{RULES_METADATA.length})</span>
                {rulesExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {rulesExpanded && (
                <div className="mt-2 space-y-1">
                  {/* All / None buttons */}
                  <div className="flex gap-1 mb-2">
                    <button
                      type="button"
                      onClick={() => setAllRules(true)}
                      className="flex-1 py-1 text-[9px] font-medium border rounded bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                      aria-label="All"
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllRules(false)}
                      className="flex-1 py-1 text-[9px] font-medium border rounded bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                      aria-label="None"
                    >
                      None
                    </button>
                  </div>

                  {/* Rule list */}
                  <div className="max-h-40 overflow-y-auto space-y-0.5">
                    {RULES_METADATA.map((rule) => (
                      <label
                        key={rule.id}
                        className="flex items-center gap-2 px-1 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={enabledRules[rule.id] ?? true}
                          onChange={() => toggleRule(rule.id)}
                          className="sr-only"
                          aria-label={rule.id}
                        />
                        <div className={cn(
                          "w-3.5 h-3.5 border rounded flex items-center justify-center transition-all duration-200 flex-shrink-0",
                          enabledRules[rule.id] ? "bg-brand-600 border-brand-600 text-white" : "border-zinc-300 dark:border-zinc-600 bg-transparent"
                        )}>
                          <Check className={cn("w-2.5 h-2.5 transition-transform duration-200", enabledRules[rule.id] ? "scale-100" : "scale-0")} />
                        </div>
                        <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 w-5">{rule.id}</span>
                        <span className={cn("text-[8px] font-bold px-1 py-0.5 rounded", getSeverityColor(rule.severity))}>
                          {rule.severity}
                        </span>
                        <span className="text-[9px] text-zinc-600 dark:text-zinc-400 truncate flex-1" title={rule.name}>
                          {rule.name.replace(/_/g, ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-2 pt-2 pb-1 border-t border-zinc-100 dark:border-zinc-800">
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
