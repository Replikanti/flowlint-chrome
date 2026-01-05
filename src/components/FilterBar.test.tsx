import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar } from './FilterBar';

describe('FilterBar', () => {
  const mockCounts = { must: 3, should: 5, nit: 2 };
  const mockState = { must: true, should: true, nit: true };
  const mockToggle = vi.fn();

  it('renders filter chips with counts', () => {
    render(<FilterBar counts={mockCounts} filters={mockState} onToggle={mockToggle} />);
    
    expect(screen.getByText(/must/i)).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
    
    expect(screen.getByText(/should/i)).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();
    
    expect(screen.getByText(/nit/i)).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();
  });

  it('toggles filter state on click', () => {
    render(<FilterBar counts={mockCounts} filters={mockState} onToggle={mockToggle} />);
    
    const mustChip = screen.getByText(/must/i).closest('button');
    if (mustChip) fireEvent.click(mustChip);
    
    expect(mockToggle).toHaveBeenCalledWith('must');
  });

  it('shows disabled state visually', () => {
    const disabledState = { ...mockState, must: false };
    render(<FilterBar counts={mockCounts} filters={disabledState} onToggle={mockToggle} />);
    
    const mustChip = screen.getByText(/must/i).closest('button');
    // Check for some visual indicator class (e.g. opacity or different bg)
    // We expect "opacity-60" for disabled (as per implementation)
    expect(mustChip?.className).toContain('opacity-60'); 
    // Or check absence of active class
  });
});
