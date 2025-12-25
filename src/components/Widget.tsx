import { useState, useEffect, useMemo, useCallback } from 'react';
import { parseN8n, runAllRules, defaultConfig } from '@replikanti/flowlint-core';


import { AlertCircle, CheckCircle, AlertTriangle, Info, XCircle, Play, ExternalLink, ClipboardPaste, X, Minimize2, Maximize2, Eraser, ChevronDown, ChevronRight } from 'lucide-react';
import type { Finding } from '@replikanti/flowlint-core';

import { ExportPanel } from './ExportPanel';

export const Widget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  
  const [input, setInput] = useState('');
  const [results, setResults] = useState<Finding[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clipboardWorkflow, setClipboardWorkflow] = useState<string | null>(null);

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
  }, []);

  // Monitor clipboard and window focus
  useEffect(() => {
    const check = () => checkClipboard();
    
    window.addEventListener('focus', check);
    check(); // Initial check
    
    const interval = setInterval(check, 2000); // Periodic check for convenience

    return () => {
      window.removeEventListener('focus', check);
      clearInterval(interval);
    };
  }, [isOpen, checkClipboard]); // Re-check when opened

  const analyzeWorkflow = async (jsonContent: string) => {
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const graph = parseN8n(jsonContent);
      const findings = runAllRules(graph, { cfg: defaultConfig, path: 'clipboard.json', nodeLines: graph.meta.nodeLines as Record<string, number> | undefined });
      
      setResults(findings);
      
      } catch (err) {
       console.error(err);
       setError(err instanceof Error ? err.message : 'Analysis failed');
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

  // Stop propagation to prevent n8n from catching events (Ghost Paste)
  const stopPropagation = (e: React.KeyboardEvent | React.ClipboardEvent | React.MouseEvent) => {
    e.stopPropagation();
  };

  // -- Render Helpers --
  const severityOrder: Finding['severity'][] = ['must', 'should', 'nit'];
  const severityLabels: Record<Finding['severity'], string> = {
    must: 'Must-fix',
    should: 'Should-fix',
    nit: 'Nitpicks'
  };

  const findings = useMemo(() => results || [], [results]);
  const sortedFindings = useMemo(() => [...findings].sort((a, b) => getSeverityWeight(a.severity) - getSeverityWeight(b.severity)), [findings]);
  const groupedFindings = useMemo(() => (
    severityOrder
      .map(severity => ({
        severity,
        items: sortedFindings.filter(f => f.severity === severity)
      }))
      .filter(group => group.items.length > 0)
  ), [sortedFindings]);
  const counts = useMemo(() => ({
    must: findings.filter(f => f.severity === 'must').length,
    should: findings.filter(f => f.severity === 'should').length,
    nit: findings.filter(f => f.severity === 'nit').length,
  }), [findings]);

  const toggleGroup = (severity: string) => {
    setCollapsedGroups(prev => ({ ...prev, [severity]: !prev[severity] }));
  };

  const collapseAllGroups = () => {
    const next = severityOrder.reduce((acc, sev) => ({ ...acc, [sev]: true }), {} as Record<string, boolean>);
    setCollapsedGroups(next);
  };

  const expandAllGroups = () => {
    const next = severityOrder.reduce((acc, sev) => ({ ...acc, [sev]: false }), {} as Record<string, boolean>);
    setCollapsedGroups(next);
  };

  if (!isOpen) {
    return (
      <div className="flex flex-col items-end gap-2 font-sans">
        {clipboardWorkflow && (
           <div className="bg-brand-600 text-white text-xs px-3 py-1.5 rounded-md shadow-lg animate-bounce cursor-pointer font-medium whitespace-nowrap border border-brand-700"
                onClick={() => { setIsOpen(true); handlePasteAndAnalyze(); }}>
              Workflow detected! Click to analyze.
           </div>
        )}
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-brand-500 hover:bg-brand-600 rounded-full shadow-xl flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95 border-2 border-white dark:border-zinc-800"
          title="Open FlowLint"
        >
          <img src={chrome.runtime.getURL('icon-32.png')} className="w-8 h-8 rounded" />
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`bg-white! dark:bg-zinc-900! rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-700 flex flex-col overflow-hidden transition-all duration-300 font-sans \${isMinimized ? 'w-72 h-14' : 'w-[450px] h-[600px] max-h-[85vh]'}`}
      onKeyDown={stopPropagation}
      onPaste={stopPropagation}
      onCopy={stopPropagation}
      onCut={stopPropagation}
      onClick={stopPropagation}
    >
      
      {/* Header */}
      <header className="h-14 bg-brand-50 dark:bg-zinc-900 border-b border-brand-100 dark:border-zinc-700 flex items-center justify-between px-4 flex-shrink-0">
         <div className="flex items-center gap-2">
            <img src={chrome.runtime.getURL('icon-32.png')} className="w-6 h-6 rounded shadow-sm" />
            <h1 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">FlowLint</h1>
         </div>
         <div className="flex items-center gap-1">
            <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-brand-100 dark:hover:bg-zinc-800 rounded text-zinc-700 dark:text-zinc-400 transition-colors">
               {isMinimized ? <Maximize2 className="w-4 h-4"/> : <Minimize2 className="w-4 h-4"/>}
            </button>
            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 rounded text-zinc-700 dark:text-zinc-400 transition-colors">
               <X className="w-4 h-4"/>
            </button>
         </div>
      </header>

      {/* Body */}
      {!isMinimized && (
         <div className="flex-1 overflow-hidden flex flex-col relative bg-white dark:bg-zinc-950">
            
            {/* Loading Overlay */}
            {loading && (
               <div className="absolute inset-0 bg-white/90 dark:bg-zinc-900/90 z-20 flex items-center justify-center backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-2">
                     <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                     <span className="text-sm font-bold text-zinc-900 dark:text-brand-400">Analyzing...</span>
                  </div>
               </div>
            )}

            {/* Input area - always present but smaller when results exist */}
            <div className={`p-4 border-b border-zinc-100 dark:border-zinc-800 transition-all \${results ? 'h-32' : 'flex-[1.5]'}`}>
               <div className="h-full flex flex-col gap-3">
                  {/* Smart Clipboard Banner */}
                  {clipboardWorkflow && !results && (
                     <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-lg p-4 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 text-zinc-900 dark:text-brand-200 font-bold text-sm">
                           <ClipboardPaste className="w-4 h-4 text-brand-600" />
                           Workflow detected
                        </div>
                        <p className="text-xs text-zinc-700 dark:text-brand-300/80">
                           We found n8n JSON in your clipboard.
                        </p>
                        <button 
                          onClick={handlePasteAndAnalyze}
                          className="mt-1 bg-brand-600 hover:bg-brand-700 text-white py-2 rounded-md text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
                        >
                           <Play className="w-3 h-3 fill-current" /> Paste & Analyze
                        </button>
                     </div>
                  )}

                  {!results && !clipboardWorkflow && (
                     <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg p-6 flex flex-col items-center justify-center gap-4 text-center flex-1">
                        <div className="space-y-1">
                           <h3 className="font-bold text-zinc-800 dark:text-zinc-100">Ready to verify?</h3>
                           <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[200px] mx-auto leading-relaxed">
                              Copy your workflow to clipboard to start automatic analysis.
                           </p>
                        </div>
                     </div>
                  )}

                  <div className="relative group flex-1">
                     <textarea 
                        placeholder="Or paste JSON here manually..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={stopPropagation}
                        onPaste={stopPropagation}
                        className="w-full h-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md p-3 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 transition-shadow"
                     />
                     {input.length > 0 && (
                        <button 
                          onClick={() => analyzeWorkflow(input)}
                          className="absolute bottom-2 right-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs px-3 py-1.5 rounded font-bold hover:bg-black dark:hover:bg-white transition-colors"
                        >
                           {results ? 'Re-analyze' : 'Analyze'}
                        </button>
                     )}
                  </div>
               </div>
            </div>

            {/* Results - scrollable findings area */}
            {results && (
               <div className="flex-[2] overflow-hidden flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <div className="sticky top-0 z-20 -mx-4 px-4 py-2 bg-white! dark:bg-zinc-950! border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                             Found {findings.length} issues
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setResults(null)} className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 hover:underline font-medium flex items-center gap-1 transition-colors">
                             <Eraser className="w-3 h-3" /> Clear
                          </button>
                        </div>
                     </div>

                     {findings.length === 0 && !error ? (
                        <div className="flex flex-col items-center justify-center h-40 text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
                           <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
                           <p className="font-bold text-zinc-700 dark:text-zinc-200">All checks passed!</p>
                        </div>
                     ) : (
                        groupedFindings.map(group => {
                          const collapsed = collapsedGroups[group.severity] ?? false;
                          return (
                            <div key={group.severity} className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900/50 shadow-sm overflow-hidden">
                              <button
                                className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                onClick={() => toggleGroup(group.severity)}
                              >
                                <div className="flex items-center gap-2">
                                  {collapsed ? <ChevronRight className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 \${getSeverityColor(group.severity)}`}>
                                    {group.severity}
                                  </span>
                                  <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                                    {severityLabels[group.severity]} ({group.items.length})
                                  </span>
                                </div>
                              </button>
                              {!collapsed && (
                                <div className="p-2 space-y-2">
                                  {group.items.map((f, i) => <FindingCard key={`\${group.severity}-\${i}`} finding={f} />)}
                                </div>
                              )}
                            </div>
                          );
                        })
                     )}
                  </div>

                  {/* Export Panel - sticky footer */}
                  {results.length > 0 && (
                     <ExportPanel results={results} workflowName="n8n-workflow" />
                  )}
               </div>
            )}

            {/* Footer - always visible */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-3 py-1.5 flex items-center justify-between flex-shrink-0">
               <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-medium">
                  FlowLint ready
               </span>
               <div className="flex items-center gap-2">
                 <a
                   href="https://flowlint.dev/support"
                   target="_blank"
                   rel="noreferrer noopener"
                   className="text-[10px] text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-200 font-semibold inline-flex items-center gap-1"
                 >
                   Support
                   <ExternalLink className="w-3 h-3" />
                 </a>
                 <span className="text-[9px] text-zinc-400 dark:text-zinc-600 font-mono">
                    v{chrome.runtime.getManifest().version}
                 </span>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

const FindingCard = ({ finding }: { finding: Finding }) => {
   const colorClass = getSeverityColor(finding.severity);
   const Icon = getSeverityIcon(finding.severity);
   
   const docUrl = finding.documentationUrl || 
     (finding.rule.match(/^R\d+$/) ? `https://github.com/Replikanti/flowlint-examples/tree/main/${finding.rule}` : null);
 
   return (
     <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 bg-white dark:bg-zinc-900/50 shadow-sm flex gap-3 items-start hover:border-brand-200 dark:hover:border-brand-900 transition-colors">
       <div className={`mt-0.5 \${colorClass}`}>
         <Icon className="w-5 h-5" />
       </div>
       <div className="flex-1 min-w-0">
         <div className="flex items-center justify-between mb-1">
             <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 \${colorClass}`}>
               {finding.severity}
             </span>
             <span className="text-[10px] text-zinc-400 font-mono">
               {finding.rule}
             </span>
         </div>
         <p className="text-sm font-medium leading-snug text-zinc-900 dark:text-zinc-100 mb-1">
           {finding.message}
         </p>
         
         {finding.raw_details && (
             <pre className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded leading-relaxed border border-zinc-100 dark:border-zinc-800/50 max-h-40 overflow-y-auto whitespace-pre-wrap break-words w-full">
               {finding.raw_details}
             </pre>
         )}
 
         {docUrl && (
           <a 
             href={docUrl} 
             target="_blank" 
             rel="noopener noreferrer"
             className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-200 underline underline-offset-2 mt-2 font-bold transition-colors"
           >
             <span>See example fix</span>
             <ExternalLink className="w-3 h-3" />
           </a>
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
    case 'must': return 'text-red-600 dark:text-red-500';
    case 'should': return 'text-amber-600 dark:text-amber-500';
    case 'nit': return 'text-blue-600 dark:text-blue-400';
    default: return 'text-gray-500';
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