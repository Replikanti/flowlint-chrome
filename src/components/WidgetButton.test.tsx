import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WidgetButton } from './WidgetButton';

// Mock chrome
(globalThis as any).chrome = {
  runtime: {
    getURL: vi.fn((path) => path),
  },
} as any;

describe('WidgetButton', () => {
  const mockOnClick = vi.fn();

  it('renders logo button', () => {
    render(<WidgetButton onClick={mockOnClick} enabled={true} />);
    expect(screen.getByLabelText('Open FlowLint')).toBeDefined();
  });

  it('shows detection banner when workflow in clipboard', () => {
    render(
      <WidgetButton 
        onClick={mockOnClick} 
        enabled={true} 
        hasClipboardWorkflow={true} 
        onAnalyzeClick={vi.fn()}
      />
    );
    expect(screen.getByText(/Workflow detected/i)).toBeDefined();
  });

  it('applies muted class when disabled', () => {
    const { container } = render(<WidgetButton onClick={mockOnClick} enabled={false} />);
    const btn = screen.getByLabelText('Open FlowLint');
    expect(btn.className).toContain('muted');
  });

  it('calls onClick when logo clicked', () => {
    render(<WidgetButton onClick={mockOnClick} enabled={true} />);
    fireEvent.click(screen.getByLabelText('Open FlowLint'));
    expect(mockOnClick).toHaveBeenCalled();
  });
});
