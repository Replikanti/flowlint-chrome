import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  formatCsv,
  analysisResultsToRun,
  formatStylish,
  formatJson,
  formatSarif,
  formatJunit,
  formatGithubActionsLog,
  formatGithubActionsSummary,
  copyToClipboard,
  type FlowLintRun
} from './exporters';
import type { Finding } from '@replikanti/flowlint-core';

// Mock chrome API
(globalThis as any).chrome = {
  runtime: {
    getManifest: () => ({ version: '1.0.0' }),
  },
} as any;

describe('exporters', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockFindings: Finding[] = [
    {
      rule: 'R1',
      severity: 'must',
      message: 'Error message',
      nodeId: 'node-1',
      line: 10,
      path: 'workflow.json',
      raw_details: 'Details line 1\nDetails line 2'
    },
    {
      rule: 'R2',
      severity: 'should',
      message: 'Warning message',
      nodeId: 'node-2',
      path: 'workflow.json'
    },
    {
      rule: 'R5',
      severity: 'nit',
      message: 'Nit message',
      nodeId: 'node-3',
      path: 'workflow.json'
    }
  ];

  const mockRun: FlowLintRun = {
    meta: {
      workflowName: 'test-workflow',
      generatedAt: '2025-01-01T00:00:00.000Z',
      flowlintVersion: '1.0.0'
    },
    findings: mockFindings
  };

  describe('analysisResultsToRun', () => {
    it('creates a valid FlowLintRun object', () => {
      const run = analysisResultsToRun(mockFindings, 'test-workflow');
      
      expect(run.meta.workflowName).toBe('test-workflow');
      expect(run.meta.flowlintVersion).toBe('1.0.0');
      expect(run.findings).toHaveLength(3);
      expect(run.findings[0].rule).toBe('R1');
    });
  });

  describe('formatCsv', () => {
    it('formats findings as CSV correctly', () => {
      const csv = formatCsv(mockRun);
      const lines = csv.split('\n');

      // Header
      expect(lines[0]).toBe('workflow,severity,rule,message,nodeId,line');
      
      // Row 1
      expect(lines[1]).toContain('test-workflow');
      expect(lines[1]).toContain('must');
      expect(lines[1]).toContain('R1');
      expect(lines[1]).toContain('node-1');
      
      // Row 2
      expect(lines[2]).toContain('should');
      expect(lines[2]).toContain('R2');
    });

    it('escapes special characters in CSV', () => {
       const trickyFindings: Finding[] = [{
           rule: 'R1',
           severity: 'must',
           message: 'Message with "quotes" and, commas\nand newlines',
           nodeId: 'node-1',
           path: 'workflow.json'
       }];

       const run: FlowLintRun = {
        meta: { workflowName: 'Tricky', generatedAt: '', flowlintVersion: '' },
        findings: trickyFindings
       };

       const csv = formatCsv(run);
       // Should wrap in quotes: "Message with ""quotes"" and, commas"
       expect(csv).toContain('"Message with ""quotes"" and, commas');
    });

    it('handles null/undefined values in CSV', () => {
       // @ts-ignore - testing robustness
       const run: FlowLintRun = { meta: { workflowName: undefined }, findings: [{ nodeId: null }] };
       const csv = formatCsv(run);
       expect(csv).toContain(',,,');
    });
  });

  describe('formatStylish', () => {
    it('formats findings in stylish text format', () => {
      const output = formatStylish(mockRun);
      expect(output).toContain('FlowLint Report – test-workflow');
      expect(output).toContain('Node: node-1');
      expect(output).toContain('R1    MUST    Error message');
      expect(output).toContain('→ Details line 1');
      expect(output).toContain('→ Details line 2');
      expect(output).toContain('Node: node-2');
      expect(output).toContain('R2    SHOULD  Warning message');
      expect(output).toContain('problems (1 must, 1 should, 1 nit)');
    });
  });

  describe('formatJson', () => {
    it('formats findings as JSON', () => {
      const output = formatJson(mockRun);
      const parsed = JSON.parse(output);
      expect(parsed).toEqual(mockRun);
    });
  });

  describe('formatSarif', () => {
    it('formats findings as SARIF', () => {
      const output = formatSarif(mockRun);
      const parsed = JSON.parse(output);
      
      expect(parsed.version).toBe('2.1.0');
      expect(parsed.runs[0].tool.driver.name).toBe('FlowLint');
      expect(parsed.runs[0].results).toHaveLength(3);
      expect(parsed.runs[0].results[0].ruleId).toBe('R1');
      expect(parsed.runs[0].results[0].level).toBe('error'); // must -> error
      expect(parsed.runs[0].results[1].ruleId).toBe('R2');
      expect(parsed.runs[0].results[1].level).toBe('warning'); // should -> warning
      expect(parsed.runs[0].results[2].level).toBe('note'); // nit -> note
      
      // Check locations
      const loc = parsed.runs[0].results[0].locations[0];
      expect(loc.physicalLocation.region.startLine).toBe(10);
    });

    it('handles missing line numbers in SARIF', () => {
      const noLineRun = { ...mockRun, findings: [mockFindings[1]] }; // R2 has no line
      const output = formatSarif(noLineRun);
      const parsed = JSON.parse(output);
      expect(parsed.runs[0].results[0].locations[0].physicalLocation.region.startLine).toBeUndefined();
    });
  });

  describe('formatJunit', () => {
    it('formats findings as JUnit XML', () => {
      const output = formatJunit(mockRun);
      
      expect(output).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(output).toContain('<testsuite name="FlowLint" tests="3" failures="2">');
      expect(output).toContain('<testcase classname="test-workflow" name="R1 – node-1">');
      expect(output).toContain('<failure message="Error message">');
      expect(output).toContain('<testcase classname="test-workflow" name="R2 – node-2">');
      // Nit should be a testcase but no failure
      expect(output).toContain('<testcase classname="test-workflow" name="R5 – node-3">');
      expect(output).not.toContain('<failure message="Nit message">');
    });
  });

  describe('formatGithubActionsLog', () => {
    it('formats findings for GitHub Actions logs', () => {
      const output = formatGithubActionsLog(mockRun);
      const lines = output.split('\n');
      
      expect(lines[0]).toBe('::error title=FlowLint R1,file=test-workflow.json,line=10::Error message Node: node-1. Details line 1 Details line 2');
      expect(lines[1]).toContain('::warning title=FlowLint R2');
      expect(lines[2]).toContain('::notice title=FlowLint R5');
    });
  });

  describe('formatGithubActionsSummary', () => {
    it('formats findings for GitHub Actions summary', () => {
      const output = formatGithubActionsSummary(mockRun);
      
      expect(output).toContain('# FlowLint Report');
      expect(output).toContain('**Workflow:** test-workflow');
      expect(output).toContain('Total issues:** 3'); // Adjusted for markdown
      expect(output).toContain('| MUST     | 1 |');
      expect(output).toContain('| SHOULD   | 1 |');
      expect(output).toContain('| NIT      | 1 |');
      expect(output).toContain('🔴 **R1** (must): Error message');
      expect(output).toContain('Details line 1');
      expect(output).toContain('⚠️ **R2** (should): Warning message');
      expect(output).toContain('ℹ️ **R5** (nit): Nit message');
    });
  });

  describe('copyToClipboard', () => {
    it('uses navigator.clipboard if available', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });
      
      const result = await copyToClipboard('test');
      expect(result).toBe(true);
      expect(writeText).toHaveBeenCalledWith('test');
    });

    it('falls back to execCommand if navigator.clipboard fails', async () => {
      // Mock failure
      const writeText = vi.fn().mockRejectedValue(new Error('Fail'));
      Object.assign(navigator, { clipboard: { writeText } });

      // Mock execCommand
      document.execCommand = vi.fn().mockReturnValue(true);

      const result = await copyToClipboard('test');
      expect(result).toBe(true);
      expect(document.execCommand).toHaveBeenCalledWith('copy');
    });

    it('returns false if both fail', async () => {
      // Mock failure
      const writeText = vi.fn().mockRejectedValue(new Error('Fail'));
      Object.assign(navigator, { clipboard: { writeText } });
      document.execCommand = vi.fn().mockImplementation(() => { throw new Error('Fail'); });

      const result = await copyToClipboard('test');
      expect(result).toBe(false);
    });
  });
});
