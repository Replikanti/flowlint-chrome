import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ExportPanel } from './ExportPanel';
import * as exporters from '../utils/exporters';
import type { Finding } from '@replikanti/flowlint-core';

// Mock exporters
vi.mock('../utils/exporters', async (importOriginal) => {
  const actual = await importOriginal<typeof exporters>();
  return {
    ...actual,
    copyToClipboard: vi.fn().mockResolvedValue(true),
    downloadAsFile: vi.fn(),
  };
});

// Mock URL.createObjectURL and revokeObjectURL
globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
globalThis.URL.revokeObjectURL = vi.fn();

// Mock chrome
(globalThis as any).chrome = {
  runtime: {
    getManifest: () => ({ version: '1.0.0' }),
  },
} as any;

describe('ExportPanel', () => {
  const mockFindings: Finding[] = [
    {
      rule: 'R1',
      severity: 'must',
      message: 'Test finding',
      nodeId: 'node-1',
      path: 'workflow.json'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('collapsed state (default)', () => {
    it('should render only "Export Results" button when collapsed', () => {
      render(<ExportPanel results={mockFindings} workflowName="test-workflow" />);
      
      expect(screen.getByText('Export Results')).toBeDefined();
      expect(screen.queryByText('Client-side')).toBeNull();
      expect(screen.queryByText('GH Log')).toBeNull();
    });

    it('should expand when "Export Results" button is clicked', async () => {
      render(<ExportPanel results={mockFindings} workflowName="test-workflow" />);
      
      const expandBtn = screen.getByText('Export Results').closest('button');
      await act(async () => {
        if (expandBtn) fireEvent.click(expandBtn);
      });

      expect(screen.getByText('Hide Export')).toBeDefined();
      expect(screen.getByText('Client-side')).toBeDefined();
      expect(screen.getByText('GH Log')).toBeDefined();
    });
  });

  describe('expanded state interactions', () => {
    it('calls copyToClipboard when copy buttons are clicked', async () => {
      render(<ExportPanel results={mockFindings} workflowName="test-workflow" />);
      
      // Expand first
      const expandBtn = screen.getByText('Export Results').closest('button');
      await act(async () => {
        if (expandBtn) fireEvent.click(expandBtn);
      });

      const formats = [
        { text: 'Text', format: 'stylish' },
        { text: 'GH Log', format: 'gh-log' },
        { text: 'GH MD', format: 'gh-summary' },
        { text: 'JSON', format: 'json', index: 0 }, // First JSON button is copy
        { text: 'CSV', format: 'csv', index: 0 }    // First CSV button is copy
      ];

      for (const { text, index } of formats) {
        const buttons = screen.getAllByText(text);
        const btn = (index === undefined ? buttons[0] : buttons[index]).closest('button');
        
        // Click button
        await act(async () => {
          if (btn) fireEvent.click(btn);
        });
        
        expect(exporters.copyToClipboard).toHaveBeenCalled();
        
        // Check for feedback "Copied!"
        expect(screen.getByText('Copied!')).toBeDefined();

        // Fast-forward timer to revert state
        await act(async () => {
          vi.runAllTimers();
        });

        // Feedback should be gone
        expect(screen.queryByText('Copied!')).toBeNull();
        
        vi.clearAllMocks();
      }
    });

    it('calls downloadAsFile when download buttons are clicked', async () => {
      render(<ExportPanel results={mockFindings} workflowName="test-workflow" />);
      
      // Expand first
      const expandBtn = screen.getByText('Export Results').closest('button');
      await act(async () => {
        if (expandBtn) fireEvent.click(expandBtn);
      });

      const downloads = [
        { text: 'JSON', index: 1, type: 'application/json' },
        { text: 'CSV', index: 1, type: 'text/csv' },
        { text: 'SARIF', index: 0, type: 'application/json' },
        { text: 'JUnit', index: 0, type: 'application/xml' }
      ];

      for (const { text, index, type } of downloads) {
         const buttons = screen.getAllByText(text);
         const btn = buttons[index].closest('button');
         if (btn) fireEvent.click(btn);
         expect(exporters.downloadAsFile).toHaveBeenCalledWith(
           expect.any(String),
           expect.stringContaining('flowlint-report'),
           type
         );
         vi.clearAllMocks();
      }
    });

    it('should collapse when "Hide Export" button is clicked', async () => {
      render(<ExportPanel results={mockFindings} workflowName="test-workflow" />);
      
      // Expand first
      const expandBtn = screen.getByText('Export Results').closest('button');
      await act(async () => {
        if (expandBtn) fireEvent.click(expandBtn);
      });

      expect(screen.getByText('Hide Export')).toBeDefined();

      // Collapse
      const collapseBtn = screen.getByText('Hide Export').closest('button');
      await act(async () => {
        if (collapseBtn) fireEvent.click(collapseBtn);
      });

      expect(screen.getByText('Export Results')).toBeDefined();
      expect(screen.queryByText('Client-side')).toBeNull();
    });
  });
});