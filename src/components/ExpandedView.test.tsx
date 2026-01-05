import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExpandedView } from './ExpandedView';
import type { Finding } from '@replikanti/flowlint-core';

// Mock chrome
(globalThis as any).chrome = {
  runtime: {
    getURL: vi.fn((path) => path),
    getManifest: () => ({ version: '1.0.0' }),
  },
  storage: {
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
    },
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
} as any;

describe('ExpandedView', () => {
  const mockFindings: Finding[] = [
    { rule: 'R1', severity: 'must', message: 'Error 1', nodeId: '1', path: 'wf.json' },
  ];
  const mockFilters = { must: true, should: true, nit: true };
  const mockCounts = { must: 1, should: 0, nit: 0 };
  const mockOnClose = vi.fn();
  const mockOnToggleFilter = vi.fn();

  it('renders title and content', () => {
    render(
      <ExpandedView 
        findings={mockFindings}
        allFindings={mockFindings}
        filters={mockFilters}
        counts={mockCounts}
        onClose={mockOnClose}
        onToggleFilter={mockOnToggleFilter}
      />
    );
    
    expect(screen.getByText(/Expanded View/i)).toBeDefined();
    expect(screen.getByText('Error 1')).toBeDefined();
  });

  it('calls onClose when close button clicked', () => {
    mockOnClose.mockClear();
    render(
      <ExpandedView
        findings={mockFindings}
        allFindings={mockFindings}
        filters={mockFilters}
        counts={mockCounts}
        onClose={mockOnClose}
        onToggleFilter={mockOnToggleFilter}
      />
    );

    // The header close button has exact aria-label "Close Expanded View"
    const closeBtn = screen.getByRole('button', { name: 'Close Expanded View' });
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop clicked', () => {
    mockOnClose.mockClear();
    render(
      <ExpandedView
        findings={mockFindings}
        allFindings={mockFindings}
        filters={mockFilters}
        counts={mockCounts}
        onClose={mockOnClose}
        onToggleFilter={mockOnToggleFilter}
      />
    );

    // Backdrop is the clickable overlay div
    const backdrop = screen.getByTestId('expanded-view-backdrop');
    fireEvent.click(backdrop);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
