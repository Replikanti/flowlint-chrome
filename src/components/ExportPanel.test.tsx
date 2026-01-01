import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly', () => {
    render(<ExportPanel results={mockFindings} workflowName="test-workflow" />);
    
    expect(screen.getByText('Export')).toBeDefined();
    expect(screen.getByText('Client-side')).toBeDefined();
    
    // Check if buttons exist (by text content)
    expect(screen.getByText('Text')).toBeDefined(); // Copy Text
    expect(screen.getByText('GH Log')).toBeDefined();
    expect(screen.getByText('GH MD')).toBeDefined();
    expect(screen.getAllByText('JSON')).toHaveLength(2); // Copy JSON and Download JSON
    expect(screen.getAllByText('CSV')).toHaveLength(2); // Copy CSV and Download CSV
    expect(screen.getByText('SARIF')).toBeDefined();
    expect(screen.getByText('JUnit')).toBeDefined();
  });

  it('calls copyToClipboard when copy buttons are clicked', async () => {
    render(<ExportPanel results={mockFindings} workflowName="test-workflow" />);
    
    // Find the "Text" button (Copy Stylish)
    // The button contains the text "Text" in a span
    const copyTextBtn = screen.getByText('Text').closest('button');
    fireEvent.click(copyTextBtn!);
    
    expect(exporters.copyToClipboard).toHaveBeenCalled();
    // We expect formatStylish to be called, which generates the report.
    // Since we didn't mock formatStylish specifically, it runs the real code.
    // The clipboard content should be what formatStylish returns.
    
    // Check if UI updates to "Copied!"
    // This requires waiting for state update? React Testing Library handles synchronous updates.
    // But copyToClipboard is async.
    await screen.findByText('Copied!');
  });

  it('calls downloadAsFile when download buttons are clicked', () => {
    render(<ExportPanel results={mockFindings} workflowName="test-workflow" />);
    
    // Find "SARIF" download button
    const downloadSarifBtn = screen.getByText('SARIF').closest('button');
    fireEvent.click(downloadSarifBtn!);
    
    expect(exporters.downloadAsFile).toHaveBeenCalledWith(
        expect.stringContaining('"version": "2.1.0"'), // SARIF content content check
        'flowlint-report.sarif',
        'application/json'
    );
  });
});
