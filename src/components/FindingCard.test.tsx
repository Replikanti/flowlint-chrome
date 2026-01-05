import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FindingCard } from './FindingCard';
import type { Finding } from '@replikanti/flowlint-core';

describe('FindingCard', () => {
  const mockFinding: Finding = {
    rule: 'R1',
    severity: 'must',
    message: 'Test message',
    nodeId: 'node-1',
    path: 'workflow.json',
    raw_details: 'Detailed info'
  };

  it('renders severity and rule ID', () => {
    render(<FindingCard finding={mockFinding} />);
    expect(screen.getByText('must')).toBeDefined();
    expect(screen.getByText('R1')).toBeDefined();
  });

  it('renders message and details', () => {
    render(<FindingCard finding={mockFinding} />);
    expect(screen.getByText('Test message')).toBeDefined();
    expect(screen.getByText('Detailed info')).toBeDefined();
  });

  it('renders documentation link when available', () => {
    // R1 should have a default doc link generated if not provided
    render(<FindingCard finding={mockFinding} />);
    const link = screen.getByLabelText('View documentation');
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toContain('R1');
  });

  it('applies correct severity styles', () => {
    const { container } = render(<FindingCard finding={mockFinding} />);
    const card = container.firstChild as HTMLElement;
    // We expect border-l-red-500 for 'must'
    expect(card.className).toContain('border-l-red-500');
  });
});
