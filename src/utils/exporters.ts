/**
 * FlowLint Export/Sharing Formatters
 * Client-side only - no backend, no API
 */

import type { Finding } from '@flowlint/review/types';
import type { AnalysisResult } from '@flowlint/review/providers';

export type Severity = 'must' | 'should' | 'nit';

export interface FlowLintRunMeta {
  workflowName: string;
  generatedAt: string;
  flowlintVersion: string;
}

export interface FlowLintRun {
  meta: FlowLintRunMeta;
  findings: Finding[];
}

/* ------------------------------------------------------------------ */
/* HELPER FUNCTIONS                                                    */
/* ------------------------------------------------------------------ */

function summarizeBySeverity(findings: Finding[]) {
  return findings.reduce(
    (acc, f) => {
      acc.total += 1;
      acc.bySeverity[f.severity] += 1;
      return acc;
    },
    {
      total: 0,
      bySeverity: { must: 0, should: 0, nit: 0 } as Record<Severity, number>
    }
  );
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/* ------------------------------------------------------------------ */
/* FORMATTER - STYLISH (COPY TO CLIPBOARD)                            */
/* ------------------------------------------------------------------ */

export function formatStylish(run: FlowLintRun): string {
  const { findings, meta } = run;
  const summary = summarizeBySeverity(findings);

  // Group by nodeId
  const byNode = new Map<string, Finding[]>();
  for (const finding of findings) {
    const key = finding.nodeId || 'unknown';
    if (!byNode.has(key)) byNode.set(key, []);
    byNode.get(key)!.push(finding);
  }

  const lines: string[] = [];
  lines.push(`FlowLint Report – ${meta.workflowName}`);
  lines.push(`Generated: ${meta.generatedAt}`);
  lines.push(`Version: ${meta.flowlintVersion}`);
  lines.push('');

  for (const [nodeKey, nodeFindings] of byNode) {
    lines.push(`Node: ${nodeKey}`);
    for (const finding of nodeFindings) {
      const rulePadded = finding.rule.padEnd(5);
      const sevPadded = finding.severity.toUpperCase().padEnd(7);
      lines.push(`  ${rulePadded} ${sevPadded} ${finding.message}`);
      if (finding.raw_details) {
        const detailLines = finding.raw_details.split('\n');
        detailLines.forEach(line => {
          if (line.trim()) lines.push(`      → ${line.trim()}`);
        });
      }
    }
    lines.push('');
  }

  lines.push(
    `✖ ${summary.total} problems (${summary.bySeverity.must} must, ${summary.bySeverity.should} should, ${summary.bySeverity.nit} nit)`
  );

  return lines.join('\n');
}

/* ------------------------------------------------------------------ */
/* FORMATTER - JSON (DOWNLOAD)                                         */
/* ------------------------------------------------------------------ */

export function formatJson(run: FlowLintRun): string {
  return JSON.stringify(run, null, 2);
}

/* ------------------------------------------------------------------ */
/* FORMATTER - CSV (COPY/DOWNLOAD)                                     */
/* ------------------------------------------------------------------ */

function csvEscape(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '';
  const str = String(value);
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function formatCsv(run: FlowLintRun): string {
  const headers = ['workflow', 'severity', 'rule', 'message', 'nodeId', 'line'];
  const rows = run.findings.map((f) =>
    [
      csvEscape(run.meta.workflowName),
      csvEscape(f.severity),
      csvEscape(f.rule),
      csvEscape(f.message),
      csvEscape(f.nodeId),
      csvEscape(f.line)
    ].join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

/* ------------------------------------------------------------------ */
/* FORMATTER - SARIF 2.1.0 (DOWNLOAD)                                  */
/* ------------------------------------------------------------------ */

type SarifLevel = 'error' | 'warning' | 'note';

function severityToSarifLevel(severity: Severity): SarifLevel {
  switch (severity) {
    case 'must':
      return 'error';
    case 'should':
      return 'warning';
    case 'nit':
    default:
      return 'note';
  }
}

export function formatSarif(run: FlowLintRun): string {
  const { findings, meta } = run;

  // Unique rules
  const rulesMap = new Map<string, { ruleId: string; description: string }>();
  for (const finding of findings) {
    if (!rulesMap.has(finding.rule)) {
      rulesMap.set(finding.rule, {
        ruleId: finding.rule,
        description: finding.message
      });
    }
  }

  const sarif = {
    version: '2.1.0',
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    runs: [
      {
        tool: {
          driver: {
            name: 'FlowLint',
            version: meta.flowlintVersion,
            informationUri: 'https://flowlint.dev',
            rules: Array.from(rulesMap.values()).map((r) => ({
              id: r.ruleId,
              shortDescription: { text: r.description },
              fullDescription: { text: r.description },
              helpUri: r.ruleId.match(/^R\d+$/)
                ? `https://github.com/Replikanti/flowlint-examples/tree/main/${r.ruleId}`
                : 'https://flowlint.dev'
            }))
          }
        },
        results: findings.map((finding) => ({
          ruleId: finding.rule,
          level: severityToSarifLevel(finding.severity),
          message: {
            text: finding.message
          },
          locations: [
            {
              physicalLocation: {
                artifactLocation: {
                  uri: `n8n://workflow/${meta.workflowName}`
                },
                region: finding.line ? {
                  startLine: finding.line,
                  message: {
                    text: finding.nodeId ? `Node: ${finding.nodeId}` : 'Workflow'
                  }
                } : {
                  message: {
                    text: finding.nodeId ? `Node: ${finding.nodeId}` : 'Workflow'
                  }
                }
              }
            }
          ]
        }))
      }
    ]
  };

  return JSON.stringify(sarif, null, 2);
}

/* ------------------------------------------------------------------ */
/* FORMATTER - JUNIT XML (DOWNLOAD)                                    */
/* ------------------------------------------------------------------ */

export function formatJunit(run: FlowLintRun): string {
  const { findings, meta } = run;
  const summary = summarizeBySeverity(findings);

  const lines: string[] = [];
  lines.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  lines.push(
    `<testsuite name="FlowLint" tests="${summary.total}" failures="${summary.bySeverity.must + summary.bySeverity.should}">`
  );

  for (const finding of findings) {
    const testName = `${finding.rule} – ${finding.nodeId || 'workflow'}`;
    const className = meta.workflowName;
    const failureNeeded = finding.severity === 'must' || finding.severity === 'should';

    lines.push(
      `  <testcase classname="${escapeXml(className)}" name="${escapeXml(testName)}">`
    );

    if (failureNeeded) {
      const msg = escapeXml(finding.message);
      const details = [
        `Rule: ${finding.rule}`,
        `Severity: ${finding.severity}`,
        finding.nodeId ? `Node: ${finding.nodeId}` : '',
        finding.line ? `Line: ${finding.line}` : '',
        finding.raw_details ? `Details: ${finding.raw_details}` : ''
      ]
        .filter(Boolean)
        .join('\n');

      lines.push(`    <failure message="${msg}">`);
      lines.push(`      <![CDATA[`);
      lines.push(escapeXml(details));
      lines.push(`      ]]>`);
      lines.push(`    </failure>`);
    }

    lines.push(`  </testcase>`);
  }

  lines.push(`</testsuite>`);
  return lines.join('\n');
}

/* ------------------------------------------------------------------ */
/* FORMATTER - GITHUB ACTIONS (COPY TO CLIPBOARD)                      */
/* ------------------------------------------------------------------ */

function severityToGhCommand(severity: Severity): 'error' | 'warning' | 'notice' {
  switch (severity) {
    case 'must':
      return 'error';
    case 'should':
      return 'warning';
    case 'nit':
    default:
      return 'notice';
  }
}

export function formatGithubActionsLog(run: FlowLintRun): string {
  const { findings, meta } = run;
  const lines: string[] = [];

  for (const finding of findings) {
    const cmd = severityToGhCommand(finding.severity);
    const title = `FlowLint ${finding.rule}`;
    const file = `${meta.workflowName}.json`;
    const line = finding.line || 1;

    const message = finding.message;
    const details = finding.raw_details ? ` ${finding.raw_details.replace(/\n/g, ' ')}` : '';
    const nodeInfo = finding.nodeId ? ` Node: ${finding.nodeId}.` : '';

    lines.push(
      `::${cmd} title=${title},file=${file},line=${line}::${message}${nodeInfo}${details}`
    );
  }

  return lines.join('\n');
}

export function formatGithubActionsSummary(run: FlowLintRun): string {
  const { findings, meta } = run;
  const summary = summarizeBySeverity(findings);

  const lines: string[] = [];
  lines.push(`# FlowLint Report`);
  lines.push('');
  lines.push(`- **Workflow:** ${meta.workflowName}`);
  lines.push(`- **Generated:** ${meta.generatedAt}`);
  lines.push(`- **Version:** ${meta.flowlintVersion}`);
  lines.push(
    `- **Total issues:** ${summary.total} (${summary.bySeverity.must} must, ${summary.bySeverity.should} should, ${summary.bySeverity.nit} nit)`
  );
  lines.push('');
  lines.push(`| Severity | Count |`);
  lines.push(`|----------|-------|`);
  lines.push(`| MUST     | ${summary.bySeverity.must} |`);
  lines.push(`| SHOULD   | ${summary.bySeverity.should} |`);
  lines.push(`| NIT      | ${summary.bySeverity.nit} |`);
  lines.push('');

  if (findings.length > 0) {
    lines.push('## Issues');
    lines.push('');
    for (const finding of findings) {
      const icon = finding.severity === 'must' ? '🔴' : finding.severity === 'should' ? '⚠️' : 'ℹ️';
      lines.push(`${icon} **${finding.rule}** (${finding.severity}): ${finding.message}`);
      if (finding.nodeId) lines.push(`   - Node: \`${finding.nodeId}\``);
      if (finding.raw_details) {
        lines.push(`   - ${finding.raw_details.split('\n')[0]}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

/* ------------------------------------------------------------------ */
/* HELPER - CONVERT ANALYSIS RESULTS TO FLOWLINT RUN                   */
/* ------------------------------------------------------------------ */

export function analysisResultsToRun(results: AnalysisResult[], workflowName = 'workflow'): FlowLintRun {
  const allFindings = results.flatMap(r => r.findings);

  return {
    meta: {
      workflowName,
      generatedAt: new Date().toISOString(),
      flowlintVersion: chrome.runtime.getManifest().version
    },
    findings: allFindings
  };
}

/* ------------------------------------------------------------------ */
/* CLIPBOARD & DOWNLOAD HELPERS                                        */
/* ------------------------------------------------------------------ */

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch {
      return false;
    }
  }
}

export function downloadAsFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
