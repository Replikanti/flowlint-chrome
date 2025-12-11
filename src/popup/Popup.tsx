import { useState, useEffect } from 'react';
import { parseN8n, runAllRules, defaultConfig, type Finding } from '@replikanti/flowlint-core';


import { AlertCircle, CheckCircle, AlertTriangle, Info, XCircle, Play, ExternalLink, ClipboardPaste } from 'lucide-react';
import type { Finding } from '@replikanti/flowlint-core';


const Popup = () => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<Finding[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clipboardWorkflow, setClipboardWorkflow] = useState<string | null>(null);

  // Check clipboard on mount
  useEffect(() => {
    checkClipboard();
  }, []);

  const checkClipboard = async () => {
    try {
      // We need to focus the window to read clipboard in some browsers, 
      // but usually popup has focus.
      const text = await navigator.clipboard.readText();
      if (isValidWorkflow(text)) {
        setClipboardWorkflow(text);
      }
    } catch (e) {
      // Clipboard permission might be denied or empty
    }
  };

  const isValidWorkflow = (text: string) => {
    if (!text || text.length < 10) return false;
    try {
      // Simple heuristic check
      if (text.includes('"nodes":') && text.includes('"connections":')) {
        return true;
      }
      const json = JSON.parse(text);
      return Array.isArray(json.nodes) && typeof json.connections === 'object';
    } catch {
      return false;
    }
  };

  const handlePasteAndAnalyze = () => {
    if (clipboardWorkflow) {
      setInput(clipboardWorkflow);
      analyzeWorkflow(clipboardWorkflow);
      setClipboardWorkflow(null); // Clear hint
    }
  };

  const handleManualClipboardPaste = async () => {
    try {
      setLoading(true);
      const text = await navigator.clipboard.readText();
      
      if (!isValidWorkflow(text)) {
         setError('Clipboard does not contain a valid n8n workflow.');
         setLoading(false);
         return;
      }

      setInput(text);
      analyzeWorkflow(text);
    } catch (err) {
      console.error(err);
      setError('Could not read clipboard. Please use Ctrl+V inside the text area.');
      setLoading(false);
    }
  };

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

  const handleManualAnalyze = () => {
    if (!input.trim()) return;
    analyzeWorkflow(input);
  };

  return (
    <div className="w-[600px] h-[600px] flex flex-col bg-background text-foreground overflow-hidden">
      <header className="p-4 border-b flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <img src="/icon-32.png" alt="FlowLint Logo" className="w-8 h-8 rounded-md" />
          <h1 className="font-semibold text-lg">FlowLint</h1>
        </div>
        <span className="text-xs text-muted-foreground">Beta</span>
      </header>

      <main className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        {!results ? (
          <div className="flex-1 flex flex-col gap-2">
             
             {/* Clipboard Detection Hint */}
             {clipboardWorkflow ? (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-800 mb-2">
                   <div className="flex items-start gap-3">
                      <ClipboardPaste className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-green-800 dark:text-green-300">Workflow detected in clipboard!</h3>
                        <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                          We found valid n8n JSON in your clipboard.
                        </p>
                        <button
                          onClick={handlePasteAndAnalyze}
                          className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
                        >
                          Paste & Analyze
                        </button>
                      </div>
                   </div>
                </div>
             ) : (
                 <div className="bg-muted/30 p-3 rounded-md border border-dashed border-border mb-2">
                    <button
                      onClick={handleManualClipboardPaste}
                      disabled={loading}
                      className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground py-3 rounded-md font-medium flex items-center justify-center gap-2 transition-colors border border-secondary-foreground/10"
                    >
                      <ClipboardPaste className="w-5 h-5" />
                      {loading ? 'Reading...' : 'Paste & Analyze from Clipboard'}
                    </button>
                    <p className="text-[10px] text-muted-foreground text-center mt-2">
                      Copy workflow (Ctrl+C) and click here.
                    </p>
                 </div>
             )}

            <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground">OR PASTE MANUALLY</span>
                <div className="flex-grow border-t border-border"></div>
            </div>

            <textarea 
              className="flex-1 p-3 font-mono text-xs border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder='{ "nodes": [...], "connections": {...} }'
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            <button
              onClick={handleManualAnalyze}
              disabled={loading || !input.trim()}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Analyzing...' : (
                <>
                  <Play className="w-4 h-4" /> Analyze Workflow
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
             <div className="flex items-center justify-between">
                <h2 className="font-semibold">Analysis Results</h2>
                <button 
                  onClick={() => setResults(null)}
                  className="text-xs text-primary hover:underline"
                >
                  Analyze another
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto pr-2 space-y-3">
               {results.flatMap(r => r.findings).length === 0 && !error ? (
                 <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
                    <p>No issues found! Great job.</p>
                 </div>
               ) : (
                 results.flatMap(r => r.findings).sort((a,b) => getSeverityWeight(a.severity) - getSeverityWeight(b.severity)).map((finding, idx) => (
                   <FindingCard key={idx} finding={finding} />
                 ))
               )}
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

const FindingCard = ({ finding }: { finding: Finding }) => {
  const color = getSeverityColor(finding.severity);
  const Icon = getSeverityIcon(finding.severity);

  return (
    <div className="border rounded-md p-3 bg-card shadow-sm flex gap-3 items-start">
      <div className={`mt-0.5 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-bold uppercase px-1.5 py-0.5 rounded-full bg-muted ${color}`}>
              {finding.severity}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {finding.rule}
            </span>
        </div>
        <p className="text-sm font-medium leading-tight mb-1">
          {finding.message}
        </p>
        {finding.raw_details && (
           <div className="text-xs text-muted-foreground mt-1 p-2 bg-muted/50 rounded">
             {typeof finding.raw_details === 'string' ? finding.raw_details : JSON.stringify(finding.raw_details)}
           </div>
        )}
        {finding.documentationUrl && (
          <a 
            href={finding.documentationUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
          >
            <span>View Example</span>
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
    case 'must': return 'text-red-600';
    case 'should': return 'text-yellow-600';
    case 'nit': return 'text-blue-500';
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

export default Popup;