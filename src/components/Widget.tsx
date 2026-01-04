import { useState, useEffect, useMemo, useCallback } from 'react';
import { parseN8n, runAllRules, defaultConfig } from '@replikanti/flowlint-core';


import { AlertCircle, CheckCircle, AlertTriangle, Info, ExternalLink, ClipboardPaste, X, Minimize2, Maximize2, Eraser, FileJson, ListChecks } from 'lucide-react';
import type { Finding } from '@replikanti/flowlint-core';

import { ExportPanel } from './ExportPanel';
import { SettingsDropdown } from './SettingsDropdown';
import { cn } from '../utils/cn';

export const Widget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  
  const [input, setInput] = useState('');
  const [results, setResults] = useState<Finding[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [clipboardWorkflow, setClipboardWorkflow] = useState<string | null>(null);

  // Load enabled state
  useEffect(() => {
    chrome.storage.local.get('flowlintEnabled').then((result) => {
      if (typeof result.flowlintEnabled === 'boolean') {
        setEnabled(result.flowlintEnabled);
      }
      setSettingsLoaded(true);
    });

    const listener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && changes.flowlintEnabled) {
        setEnabled(!!changes.flowlintEnabled.newValue);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const isValidWorkflow = (text: string) => {
    if (!text || text.length < 10) return false;
    try {
      if (text.includes('"nodes":') && text.includes('"connections":')) {
        return true;
      }
      const json = JSON.parse(text);
      return Array.isArray(json.nodes) && typeof json.connections === 'object';
    } catch {
      return false;
    }
  };

  const checkClipboard = useCallback(async () => {
    if (!settingsLoaded || !enabled) return; // Skip if disabled or loading

    try {
      const text = await navigator.clipboard.readText();
      if (isValidWorkflow(text)) {
        setClipboardWorkflow(prev => prev !== text ? text : prev);
      } else {
        setClipboardWorkflow(null);
      }
    } catch (e) {
      // Permission denied or empty
    }
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
  }, [isOpen, checkClipboard, settingsLoaded]);

  const analyzeWorkflow = async (jsonContent: string) => {
    setLoading(true);
    try {
      const graph = parseN8n(jsonContent);
      const findings = runAllRules(graph, { cfg: defaultConfig, path: 'clipboard.json', nodeLines: graph.meta.nodeLines as Record<string, number> | undefined });
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

  const stopPropagation = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  const findings = useMemo(() => results || [], [results]);
  const sortedFindings = useMemo(() => [...findings].sort((a, b) => getSeverityWeight(a.severity) - getSeverityWeight(b.severity)), [findings]);
  const groupedFindings = useMemo(() => (
    ['must', 'should', 'nit']
      .map(severity => ({
        severity,
        items: sortedFindings.filter(f => f.severity === severity)
      }))
      .filter(group => group.items.length > 0)
  ), [sortedFindings]);
  
  if (!isOpen) {
    return (
      <div className="flex flex-col items-end gap-2 font-sans">
        {clipboardWorkflow && enabled && (
           <button 
                type="button"
                className="bg-brand-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg animate-bounce cursor-pointer font-bold border border-brand-700"
                onClick={() => { setIsOpen(true); handlePasteAndAnalyze(); }}>
              Workflow detected! Click to analyze.
           </button>
        )}
        <button 
          onClick={() => setIsOpen(true)}
          className={cn(
            "w-14 h-14 bg-brand-500 hover:bg-brand-600 rounded-full shadow-xl flex items-center justify-center text-white transition-transform hover:scale-105 border-2 border-white dark:border-zinc-800",
            !enabled && "muted"
          )}
          aria-label="Open FlowLint"
          title={!enabled ? "FlowLint paused - click settings to enable" : "Open FlowLint"}
        >
          <img src={chrome.runtime.getURL('icon-32.png')} className="w-8 h-8 rounded" alt="FlowLint Logo" />
        </button>
      </div>
    );
  }

  const containerStyle: React.CSSProperties = isMinimized 
    ? { width: `280px`, height: `56px`, margin: 0 } 
    : { width: `450px`, height: `600px`, margin: 0 };

  return (
    <section 
      style={containerStyle}
      className="flex flex-col overflow-hidden transition-all duration-300 font-sans"
      aria-label="FlowLint Auditor"
    >
      <div 
        className="w-full h-full bg-app dark:bg-app rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden"
        onKeyDown={stopPropagation}
        onPaste={stopPropagation}
        onCopy={stopPropagation}
        onCut={stopPropagation}
        onClick={stopPropagation}
      >
        {/* Header */}
        <header className="h-14 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 flex-shrink-0 z-10">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-50 dark:bg-brand-900/20 rounded-lg flex items-center justify-center border border-brand-100 dark:border-brand-800">
                 <img src={chrome.runtime.getURL('icon-32.png')} className="w-5 h-5 rounded-sm" alt="Logo" />
              </div>
              <h1 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg tracking-tight">FlowLint</h1>
           </div>
           <div className="flex items-center gap-1">
              <SettingsDropdown />
              <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>
              <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 transition-colors" aria-label={isMinimized ? "Maximize" : "Minimize"}>
                 {isMinimized ? <Maximize2 className="w-4 h-4"/> : <Minimize2 className="w-4 h-4"/>}
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 rounded text-zinc-600 dark:text-zinc-400 transition-colors" aria-label="Close">
                 <X className="w-4 h-4"/>
              </button>
           </div>
        </header>

        {!isMinimized && (
           <div className="flex-1 overflow-hidden flex flex-col relative p-3 gap-3">
              
              {loading && (
                 <div className="absolute inset-0 bg-white/60 dark:bg-zinc-900/60 z-30 flex items-center justify-center backdrop-blur-[1px]">
                    <div className="card p-6 flex flex-col items-center gap-3">
                       <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                       <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Analyzing workflow...</span>
                    </div>
                 </div>
              )}

              {/* Input Card */}
              <div className={`card flex flex-col overflow-hidden transition-all duration-300 \${results ? 'h-32' : 'flex-[1.5]'}`}>
                 <div className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                       <FileJson className="w-3 h-3" /> Workflow JSON
                    </div>
                    {clipboardWorkflow && !results && (
                       <span className="text-[10px] text-brand-600 font-bold animate-pulse">Clipboard ready!</span>
                    )}
                 </div>
                 <div className="flex-1 relative p-2">
                    <textarea 
                       placeholder="Paste your n8n workflow JSON here..."
                       value={input}
                       onChange={e => setInput(e.target.value)}
                       className="w-full h-full bg-transparent border-none resize-none focus:outline-none text-[11px] font-mono text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400"
                    />
                    {input.length > 0 && (
                       <button 
                         onClick={() => analyzeWorkflow(input)}
                         className="absolute bottom-2 right-2 bg-brand-600 hover:bg-brand-700 text-white text-[10px] px-3 py-1.5 rounded-lg font-bold shadow-md transition-all hover:scale-105 active:scale-95"
                       >
                          {results ? 'Re-analyze' : 'Analyze'}
                       </button>
                    )}
                 </div>
              </div>

              {/* Results Card */}
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
                    
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-white dark:bg-zinc-900">
                       {findings.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-10 text-zinc-500">
                             <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-3">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                             </div>
                             <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Workflow is clean!</p>
                          </div>
                       ) : (
                        groupedFindings.map(group => (
                          <div key={group.severity} className="space-y-2">
                            <div className="flex items-center gap-2 px-1">
                               <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-sev-box \${getSeverityColor(group.severity)}`}>
                                 {group.severity}
                               </span>
                               <div className="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-800"></div>
                               <span className="text-[10px] font-bold text-zinc-400">{group.items.length}</span>
                            </div>
                            {group.items.map((f, i) => <FindingCard key={`\${group.severity}-\${i}`} finding={f} />)}
                          </div>
                        ))
                     )}
                  </div>
                  
                  {results.length > 0 && <ExportPanel results={results} workflowName="n8n-workflow" />}
               </div>
            ) : (
               /* Large Empty State Card */
               <div className="card flex-1 flex flex-col items-center justify-center gap-4 text-center p-8 bg-white dark:bg-zinc-900">
                  <div className="w-20 h-20 bg-brand-50 dark:bg-brand-900/20 rounded-3xl flex items-center justify-center border border-brand-100 dark:border-brand-800 shadow-inner">
                     <ClipboardPaste className="w-10 h-10 text-brand-500" />
                  </div>
                  <div>
                     <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">Ready to Audit?</h3>
                     <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                        Copy workflow to clipboard or <br/> paste JSON into the field above.
                     </p>
                  </div>
               </div>
            )}

            {/* Footer */}
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
    </section>
  );
};

const FindingCard = ({ finding }: { finding: Finding }) => {
   const colorClass = getSeverityColor(finding.severity);
   const docUrl = finding.documentationUrl || (finding.rule.match(/^R\d+$/) ? `https://github.com/Replikanti/flowlint-examples/tree/main/${finding.rule}` : null);
   const Icon = getSeverityIcon(finding.severity);
 
   return (
     <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl p-3 bg-white dark:bg-zinc-900/50 shadow-sm flex gap-3 items-start border-l-4 \${getSeverityBorder(finding.severity)} transition-all hover:shadow-md">
       <div className={`mt-0.5 \${colorClass}`}><Icon className="w-5 h-5" /></div>
       <div className="flex-1 min-w-0">
         <div className="flex items-center justify-between mb-1.5">
             <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-sev-box \${colorClass}`}>{finding.severity}</span>
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

function getSeverityWeight(severity: string) {
  switch(severity) {
    case 'must': return 0;
    case 'should': return 1;
    case 'nit': return 2;
    default: return 3;
  }
}

function getSeverityColor(severity: string) {
  switch(severity) {
    case 'must': return 'sev-must';
    case 'should': return 'sev-should';
    case 'nit': return 'sev-nit';
    default: return 'text-zinc-500';
  }
}

function getSeverityBorder(severity: string) {
  switch(severity) {
    case 'must': return 'border-l-red-500';
    case 'should': return 'border-l-amber-500';
    case 'nit': return 'border-l-blue-500';
    default: return 'border-l-zinc-300';
  }
}

function getSeverityIcon(severity: string) {
  switch(severity) {
    case 'must': return AlertCircle;
    case 'should': return AlertTriangle;
    case 'nit': return Info;
    default: return Info;
  }
}
