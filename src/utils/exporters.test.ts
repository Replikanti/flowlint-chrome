import { describe, it, expect } from 'vitest';
import { 
  formatCsv, 
  analysisResultsToRun, 
  formatStylish, 
  formatJson, 
  formatSarif, 
  formatJunit, 
  formatGithubActionsLog, 
  formatGithubActionsSummary,
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
  const mockFindings: Finding[] = [
    {
      rule: 'R1',
      severity: 'must',
      message: 'Error message',
      nodeId: 'node-1',
      line: 10,
      path: 'workflow.json'
    },
    {
      rule: 'R2',
      severity: 'should',
      message: 'Warning message',
      nodeId: 'node-2',
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
      expect(run.findings).toHaveLength(2);
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
           message: 'Message with "quotes" and, commas',
           nodeId: 'node-1',
           path: 'workflow.json'
       }];

       const run: FlowLintRun = {
        meta: { workflowName: 'Tricky', generatedAt: '', flowlintVersion: '' },
        findings: trickyFindings
       };

       const csv = formatCsv(run);
       // Should wrap in quotes: "Message with ""quotes"" and, commas"
       expect(csv).toContain('"Message with ""quotes"" and, commas"');
    });
  });

  describe('formatStylish', () => {
    it('formats findings in stylish text format', () => {
      const output = formatStylish(mockRun);
      expect(output).toContain('FlowLint Report – test-workflow');
      expect(output).toContain('Node: node-1');
      expect(output).toContain('R1    MUST    Error message');
      expect(output).toContain('Node: node-2');
      expect(output).toContain('R2    SHOULD  Warning message');
      expect(output).toContain('problems (1 must, 1 should, 0 nit)');
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
      expect(parsed.runs[0].results).toHaveLength(2);
      expect(parsed.runs[0].results[0].ruleId).toBe('R1');
      expect(parsed.runs[0].results[0].level).toBe('error'); // must -> error
      expect(parsed.runs[0].results[1].ruleId).toBe('R2');
      expect(parsed.runs[0].results[1].level).toBe('warning'); // should -> warning
    });
  });

  describe('formatJunit', () => {
    it('formats findings as JUnit XML', () => {
      const output = formatJunit(mockRun);
      
      expect(output).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(output).toContain('<testsuite name="FlowLint" tests="2" failures="2">');
      expect(output).toContain('<testcase classname="test-workflow" name="R1 – node-1">');
      expect(output).toContain('<failure message="Error message">');
      expect(output).toContain('<testcase classname="test-workflow" name="R2 – node-2">');
    });
  });

  describe('formatGithubActionsLog', () => {
    it('formats findings for GitHub Actions logs', () => {
      const output = formatGithubActionsLog(mockRun);
      const lines = output.split('\n');
      
      expect(lines[0]).toBe('::error title=FlowLint R1,file=test-workflow.json,line=10::Error message Node: node-1.');
      expect(lines[1]).toContain('::warning title=FlowLint R2');
    });
  });

  describe('formatGithubActionsSummary', () => {
    it('formats findings for GitHub Actions summary', () => {
      const output = formatGithubActionsSummary(mockRun);
      
      expect(output).toContain('# FlowLint Report');
      expect(output).toContain('**Workflow:** test-workflow');
      expect(output).toContain('Total issues:** 2');
      expect(output).toContain('| MUST     | 1 |');
      expect(output).toContain('| SHOULD   | 1 |');
      expect(output).toContain('🔴 **R1** (must): Error message');
      expect(output).toContain('⚠️ **R2** (should): Warning message');
    });
  });
});
