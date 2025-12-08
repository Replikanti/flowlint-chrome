import { useState } from 'react';
import { Download, Copy, CheckCircle } from 'lucide-react';
import type { AnalysisResult } from '@flowlint/review/providers';
import {
  analysisResultsToRun,
  formatStylish,
  formatJson,
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
    <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-4">
      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3">
        Export / Share Report
      </h3>

      {/* Copy to Clipboard Section */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wide">
          Copy to clipboard
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleCopy('stylish', formatStylish(run))}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
            {copiedFormat === 'stylish' ? (
              <>
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Stylish</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleCopy('gh-log', formatGithubActionsLog(run))}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
            {copiedFormat === 'gh-log' ? (
              <>
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>GH Actions</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleCopy('gh-summary', formatGithubActionsSummary(run))}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors col-span-2"
          >
            {copiedFormat === 'gh-summary' ? (
              <>
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>GH Summary (Markdown)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Download as File Section */}
      <div>
        <h4 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wide">
          Download as file
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleDownload(formatJson(run), 'flowlint-report.json', 'application/json')}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-brand-500 hover:bg-brand-600 border border-brand-600 dark:border-brand-700 rounded-md text-xs font-bold text-white transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>JSON</span>
          </button>

          <button
            onClick={() => handleDownload(formatSarif(run), 'flowlint-report.sarif', 'application/json')}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-brand-500 hover:bg-brand-600 border border-brand-600 dark:border-brand-700 rounded-md text-xs font-bold text-white transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>SARIF</span>
          </button>

          <button
            onClick={() => handleDownload(formatJunit(run), 'flowlint-report.xml', 'application/xml')}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-brand-500 hover:bg-brand-600 border border-brand-600 dark:border-brand-700 rounded-md text-xs font-bold text-white transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>JUnit</span>
          </button>
        </div>
      </div>

      {/* Info Text */}
      <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-3 text-center">
        All exports are generated client-side. No data is sent to any server.
      </p>
    </div>
  );
};
