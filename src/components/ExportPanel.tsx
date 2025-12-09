import { useState } from 'react';
import { Download, Copy, CheckCircle } from 'lucide-react';
import type { AnalysisResult } from '@flowlint/review/providers';
import {
  analysisResultsToRun,
  formatStylish,
  formatJson,
  formatCsv,
  formatSarif,
  formatJunit,
  formatGithubActionsLog,
  formatGithubActionsSummary,
  copyToClipboard,
  downloadAsFile
} from '../utils/exporters';

interface ExportPanelProps {
  results: AnalysisResult[];
  workflowName?: string;
}

export const ExportPanel = ({ results, workflowName = 'workflow' }: ExportPanelProps) => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const run = analysisResultsToRun(results, workflowName);

  const handleCopy = async (format: string, content: string) => {
    const success = await copyToClipboard(content);
    if (success) {
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
    }
  };

  const handleDownload = (content: string, filename: string, mimeType: string) => {
    downloadAsFile(content, filename, mimeType);
  };

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
          Export
        </h3>
        <p className="text-[9px] text-zinc-400 dark:text-zinc-600">
          Client-side
        </p>
      </div>

      {/* Compact grid */}
      <div className="grid grid-cols-4 gap-1.5">
        {/* Copy buttons */}
        <button
          onClick={() => handleCopy('stylish', formatStylish(run))}
          className="flex flex-col items-center gap-1 px-2 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-[10px] font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          title="Copy as stylish format"
        >
          {copiedFormat === 'stylish' ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Text</span>
            </>
          )}
        </button>

        <button
          onClick={() => handleCopy('gh-log', formatGithubActionsLog(run))}
          className="flex flex-col items-center gap-1 px-2 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-[10px] font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          title="Copy as GitHub Actions log"
        >
          {copiedFormat === 'gh-log' ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>GH Log</span>
            </>
          )}
        </button>

        <button
          onClick={() => handleCopy('gh-summary', formatGithubActionsSummary(run))}
          className="flex flex-col items-center gap-1 px-2 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-[10px] font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          title="Copy as GitHub markdown summary"
        >
          {copiedFormat === 'gh-summary' ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>GH MD</span>
            </>
          )}
        </button>

        <button
          onClick={() => handleCopy('json', formatJson(run))}
          className="flex flex-col items-center gap-1 px-2 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-[10px] font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          title="Copy as JSON"
        >
          {copiedFormat === 'json' ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>JSON</span>
            </>
          )}
        </button>

        <button
          onClick={() => handleCopy('csv', formatCsv(run))}
          className="flex flex-col items-center gap-1 px-2 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-[10px] font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          title="Copy as CSV"
        >
          {copiedFormat === 'csv' ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>CSV</span>
            </>
          )}
        </button>

        {/* Download buttons */}
        <button
          onClick={() => handleDownload(formatJson(run), 'flowlint-report.json', 'application/json')}
          className="flex flex-col items-center gap-1 px-2 py-1.5 bg-brand-500 hover:bg-brand-600 border border-brand-600 dark:border-brand-700 rounded text-[10px] font-bold text-white transition-colors"
          title="Download as JSON"
        >
          <Download className="w-3.5 h-3.5" />
          <span>JSON</span>
        </button>

        <button
          onClick={() => handleDownload(formatCsv(run), 'flowlint-report.csv', 'text/csv')}
          className="flex flex-col items-center gap-1 px-2 py-1.5 bg-brand-500 hover:bg-brand-600 border border-brand-600 dark:border-brand-700 rounded text-[10px] font-bold text-white transition-colors"
          title="Download as CSV"
        >
          <Download className="w-3.5 h-3.5" />
          <span>CSV</span>
        </button>

        <button
          onClick={() => handleDownload(formatSarif(run), 'flowlint-report.sarif', 'application/json')}
          className="flex flex-col items-center gap-1 px-2 py-1.5 bg-brand-500 hover:bg-brand-600 border border-brand-600 dark:border-brand-700 rounded text-[10px] font-bold text-white transition-colors"
          title="Download as SARIF (GitHub Code Scanning)"
        >
          <Download className="w-3.5 h-3.5" />
          <span>SARIF</span>
        </button>

        <button
          onClick={() => handleDownload(formatJunit(run), 'flowlint-report.xml', 'application/xml')}
          className="flex flex-col items-center gap-1 px-2 py-1.5 bg-brand-500 hover:bg-brand-600 border border-brand-600 dark:border-brand-700 rounded text-[10px] font-bold text-white transition-colors"
          title="Download as JUnit XML"
        >
          <Download className="w-3.5 h-3.5" />
          <span>JUnit</span>
        </button>
      </div>
    </div>
  );
};
