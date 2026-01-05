import { useState, useEffect, useMemo, useCallback } from 'react';
import { parseN8n, runAllRules, defaultConfig } from '@replikanti/flowlint-core';
import type { Finding } from '@replikanti/flowlint-core';
import { X, Minimize2, Maximize2, Eraser, FileJson, ListChecks, ClipboardPaste } from 'lucide-react';

import { SettingsDropdown } from './SettingsDropdown';
import { FilterBar } from './FilterBar';
import { FindingsList } from './FindingsList';
import { ExpandedView } from './ExpandedView';
import { WidgetButton } from './WidgetButton';
import { cn } from '../utils/cn';

export const Widget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpandedView, setIsExpandedView] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [position, setPosition] = useState('bottom-right');
  
  const [filters, setFilters] = useState({ must: true, should: true, nit: true });

  const [input, setInput] = useState('');
  const [results, setResults] = useState<Finding[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [clipboardWorkflow, setClipboardWorkflow] = useState<string | null>(null);

  // Load settings
  useEffect(() => {
    chrome.storage.local.get(['flowlintEnabled', 'autoAnalyze', 'severityFilters', 'widgetPosition', 'theme']).then((result) => {
      if (typeof result.flowlintEnabled === 'boolean') {
        setEnabled(result.flowlintEnabled);
      }
      if (typeof result.autoAnalyze === 'boolean') {
        setAutoAnalyze(result.autoAnalyze);
      }
      if (result.severityFilters && typeof result.severityFilters === 'object') {
        setFilters(result.severityFilters as { must: boolean; should: boolean; nit: boolean });
      }
      if (typeof result.widgetPosition === 'string') {
        setPosition(result.widgetPosition);
      }
      setSettingsLoaded(true);
    });

    const listener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName !== 'local') return;
      if (changes.flowlintEnabled) setEnabled(!!changes.flowlintEnabled.newValue);
      if (changes.autoAnalyze) setAutoAnalyze(!!changes.autoAnalyze.newValue);
      if (changes.severityFilters) setFilters(changes.severityFilters.newValue as { must: boolean; should: boolean; nit: boolean });
      if (changes.widgetPosition && typeof changes.widgetPosition.newValue === 'string') {
        setPosition(changes.widgetPosition.newValue);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  // Auto-analyze when clipboard content changes
  useEffect(() => {
    if (enabled && autoAnalyze && clipboardWorkflow) {
      // Only auto-analyze if current input is different or empty
      if (clipboardWorkflow !== input || !results) {
        setInput(clipboardWorkflow);
        analyzeWorkflow(clipboardWorkflow);
      }
    }
  }, [clipboardWorkflow, autoAnalyze, enabled]);

  const toggleFilter = (type: 'must' | 'should' | 'nit') => {
    const newFilters = { ...filters, [type]: !filters[type] };
    setFilters(newFilters);
    chrome.storage.local.set({ severityFilters: newFilters });
  };

  const dropdownDirection = useMemo(() => {
    if (!isMinimized) return 'down';
    return position.startsWith('top') ? 'down' : 'up';
  }, [isMinimized, position]);

  const isValidWorkflow = (text: string) => {
    if (!text || text.length < 10) return false;
    try {
      if (text.includes('"nodes":') && text.includes('"connections":')) return true;
      const json = JSON.parse(text);
      return Array.isArray(json.nodes) && typeof json.connections === 'object';
    } catch {
      return false;
    }
  };

  const checkClipboard = useCallback(async () => {
    if (!settingsLoaded || !enabled) return;
    try {
      const text = await navigator.clipboard.readText();
      if (isValidWorkflow(text)) {
        setClipboardWorkflow(prev => prev !== text ? text : prev);
      } else {
        setClipboardWorkflow(null);
      }
    } catch (e) { /* ignored */ }
  }, [enabled, settingsLoaded]);

  useEffect(() => {
    if (!settingsLoaded) return;
    const check = () => checkClipboard();
    window.addEventListener('focus', check);
    check();
    const interval = setInterval(check, 2000);
    return () => {
      window.removeEventListener('focus', check);
      clearInterval(interval);
    };
  }, [checkClipboard, settingsLoaded]);

  const analyzeWorkflow = async (jsonContent: string) => {
    setLoading(true);
    try {
      const graph = parseN8n(jsonContent);
      const findings = runAllRules(graph, { 
        cfg: defaultConfig, 
        path: 'clipboard.json', 
        nodeLines: graph.meta.nodeLines as Record<string, number> | undefined 
      });
      setResults(findings);
    } catch (err) {
       console.error(err);
    } finally {
       setLoading(false);
    }
  };

  const handlePasteAndAnalyze = () => {
    if (clipboardWorkflow) {
      setInput(clipboardWorkflow);
      analyzeWorkflow(clipboardWorkflow);
      setClipboardWorkflow(null); 
      if (!isOpen) setIsOpen(true);
    }
  };

  const filteredFindings = useMemo(() => {
    if (!results) return [];
    return results.filter(f => filters[f.severity as keyof typeof filters]);
  }, [results, filters]);

  const counts = useMemo(() => ({
    must: (results || []).filter(f => f.severity === 'must').length,
    should: (results || []).filter(f => f.severity === 'should').length,
    nit: (results || []).filter(f => f.severity === 'nit').length,
  }), [results]);

  if (!isOpen) {
    return (
      <WidgetButton 
        onClick={() => setIsOpen(true)}
        enabled={enabled}
        hasClipboardWorkflow={!!clipboardWorkflow}
        onAnalyzeClick={handlePasteAndAnalyze}
      />
    );
  }

  const containerStyle: React.CSSProperties = isMinimized 
    ? { width: `280px`, height: `56px`, margin: 0 } 
    : { width: `450px`, height: `600px`, margin: 0 };

  const renderInnerContent = (isModal = false) => {
    return (
      <div className={cn(
        "w-full h-full bg-app dark:bg-app rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col",
        isMinimized && !isModal ? "overflow-visible" : "overflow-hidden",
        isModal && "rounded-xl border-none"
      )}>
        {/* Header */}
        <header className="h-14 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 flex-shrink-0 z-10">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-50 dark:bg-brand-900/20 rounded-lg flex items-center justify-center border border-brand-100 dark:border-brand-800">
                 <img src={chrome.runtime.getURL('icon-32.png')} className="w-5 h-5 rounded-sm" alt="Logo" />
              </div>
              <h1 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg tracking-tight">
                {isModal ? 'FlowLint - Expanded View' : 'FlowLint'}
              </h1>
           </div>
           <div className="flex items-center gap-1">
              <SettingsDropdown direction={(isMinimized && !isModal) ? 'up' : 'down'} />
              <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>
              
              {!isModal && (
                <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 transition-colors" aria-label={isMinimized ? "Maximize" : "Minimize"}>
                   {isMinimized ? <Maximize2 className="w-4 h-4"/> : <Minimize2 className="w-4 h-4"/>}
                </button>
              )}

              {!isMinimized && (
                <button onClick={() => setIsExpandedView(!isExpandedView)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 transition-colors" aria-label={isExpandedView ? "Contract" : "Expand"}>
                   <Maximize2 className="w-4 h-4"/>
                </button>
              )}

              <button 
                onClick={() => isModal ? setIsExpandedView(false) : setIsOpen(false)} 
                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 rounded text-zinc-600 dark:text-zinc-400 transition-colors" 
                aria-label="Close"
              >
                 <X className="w-4 h-4"/>
              </button>
           </div>
        </header>

        {(!isMinimized || isModal) && (
           <div className="flex-1 overflow-hidden flex flex-col relative p-3 gap-3">
              {loading && (
                 <div className="absolute inset-0 bg-white/60 dark:bg-zinc-900/60 z-30 flex items-center justify-center backdrop-blur-[1px]">
                    <div className="card p-6 flex flex-col items-center gap-3">
                       <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                       <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Analyzing workflow...</span>
                    </div>
                 </div>
              )}

              {/* Input Section */}
              <div className={cn("card flex flex-col overflow-hidden transition-all duration-300", results ? 'h-32' : 'flex-[1.5]', isModal && results && "h-24")}>
                 <div className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                       <FileJson className="w-3 h-3" /> Workflow JSON
                    </div>
                    {clipboardWorkflow && !results && <span className="text-[10px] text-brand-600 font-bold animate-pulse">Clipboard ready!</span>}
                 </div>
                 <div className="flex-1 relative p-2">
                    <textarea 
                       placeholder="Paste your n8n workflow JSON here..."
                       value={input}
                       onChange={e => setInput(e.target.value)}
                       className="w-full h-full bg-transparent border-none resize-none focus:outline-none text-[11px] font-mono text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400"
                    />
                    {input.length > 0 && (
                       <button onClick={() => analyzeWorkflow(input)} className="absolute bottom-2 right-2 bg-brand-600 hover:bg-brand-700 text-white text-[10px] px-3 py-1.5 rounded-lg font-bold shadow-md transition-all hover:scale-105 active:scale-95">
                          {results ? 'Re-analyze' : 'Analyze'}
                       </button>
                    )}
                 </div>
              </div>

              {/* Results Section */}
              {results ? (
                 <div className="card flex-1 flex flex-col overflow-hidden">
                    <div className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                       <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                          <ListChecks className="w-3 h-3" /> Results
                       </div>
                       <button onClick={() => setResults(null)} className="text-[10px] text-brand-600 font-bold hover:underline flex items-center gap-1">
                          <Eraser className="w-3 h-3" /> Clear
                       </button>
                    </div>
                    <FilterBar counts={counts} filters={filters} onToggle={toggleFilter} />
                    <FindingsList findings={filteredFindings} isFiltered={Object.values(filters).some(v => !v)} />
                 </div>
              ) : (
                 <div className="card flex-1 flex flex-col items-center justify-center gap-4 text-center p-8 bg-white dark:bg-zinc-900">
                    <div className="w-20 h-20 bg-brand-50 dark:bg-brand-900/20 rounded-3xl flex items-center justify-center border border-brand-100 dark:border-brand-800 shadow-inner">
                       <ClipboardPaste className="w-10 h-10 text-brand-500" />
                    </div>
                    <div>
                       <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">Ready to Audit?</h3>
                       <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">Copy workflow to clipboard or <br/> paste JSON into the field above.</p>
                    </div>
                 </div>
              )}

              <footer className="flex items-center justify-between px-1 flex-shrink-0">
                 <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">FlowLint</span>
                 <div className="flex items-center gap-3">
                   <a href="https://flowlint.dev/support" target="_blank" rel="noreferrer" className="text-[10px] text-zinc-500 hover:text-brand-600 transition-colors font-medium">Support</a>
                   <span className="text-[9px] text-zinc-300 dark:text-zinc-600 font-mono">v{chrome.runtime.getManifest().version}</span>
                 </div>
              </footer>
           </div>
        )}
      </div>
    );
  };

  return (
    <>
      <section 
        style={containerStyle}
        className={cn("flex flex-col transition-all duration-300 font-sans", isMinimized ? "overflow-visible" : "overflow-hidden")}
        aria-label="FlowLint Auditor"
        onClick={e => e.stopPropagation()}
      >
        {renderInnerContent(false)}
      </section>

      {isExpandedView && (
        <ExpandedView 
          findings={filteredFindings}
          allFindings={results || []}
          filters={filters}
          counts={counts}
          onClose={() => setIsExpandedView(false)}
          onToggleFilter={toggleFilter}
        />
      )}
    </>
  );
};
