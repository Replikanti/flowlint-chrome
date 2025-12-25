import { describe, it, expect, vi } from 'vitest';
import { formatCsv, analysisResultsToRun, type FlowLintRun } from './exporters';
import type { Finding } from '@replikanti/flowlint-core';

// Mock chrome API
global.chrome = {
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
      const run: FlowLintRun = {
        meta: {
          workflowName: 'My Workflow',
          generatedAt: '2025-01-01',
          flowlintVersion: '1.0.0'
        },
        findings: mockFindings
      };

      const csv = formatCsv(run);
      const lines = csv.split('\n');

      // Header
      expect(lines[0]).toBe('workflow,severity,rule,message,nodeId,line');
      
      // Row 1
      expect(lines[1]).toContain('My Workflow');
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
});
