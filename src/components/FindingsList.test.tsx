import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FindingsList } from './FindingsList';
import type { Finding } from '@replikanti/flowlint-core';

describe('FindingsList', () => {
  const mockFindings: Finding[] = [
    { rule: 'R1', severity: 'must', message: 'Error 1', nodeId: '1', path: 'wf.json' },
    { rule: 'R2', severity: 'should', message: 'Warning 1', nodeId: '2', path: 'wf.json' },
    { rule: 'R3', severity: 'must', message: 'Error 2', nodeId: '3', path: 'wf.json' },
  ];

  it('renders findings grouped by severity', () => {
    render(<FindingsList findings={mockFindings} />);
    
    // Check headers
    expect(screen.getAllByText('must').length).toBeGreaterThan(0);
    expect(screen.getAllByText('should').length).toBeGreaterThan(0);
    
    // Check counts
    expect(screen.getByText('2')).toBeDefined(); // 2 must
    expect(screen.getByText('1')).toBeDefined(); // 1 should
    
    // Check cards
    expect(screen.getByText('Error 1')).toBeDefined();
    expect(screen.getByText('Error 2')).toBeDefined();
    expect(screen.getByText('Warning 1')).toBeDefined();
  });

  it('shows clean state when no findings', () => {
    render(<FindingsList findings={[]} />);
    expect(screen.getByText('Workflow is clean!')).toBeDefined();
  });

  it('shows empty filter state when findings exist but filtered out', () => {
    // This component receives already filtered findings.
    // If findings array is empty but we know input exists? 
    // Actually FindingsList should probably handle "No matches" message too if we pass original count.
    render(<FindingsList findings={[]} isFiltered={true} />);
    expect(screen.getByText('No issues match selected filters.')).toBeDefined();
  });
});
