import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingGuide } from './OnboardingGuide';

// Mock chrome
const mockStorage: Record<string, any> = {};
const mockChrome = {
  runtime: {
    getManifest: () => ({ version: '0.13.0' }),
    getURL: (path: string) => path,
  },
  storage: {
    local: {
      get: vi.fn((keys) => {
        if (typeof keys === 'string') return Promise.resolve({ [keys]: mockStorage[keys] });
        if (Array.isArray(keys)) {
          const res: Record<string, any> = {};
          keys.forEach(k => res[k] = mockStorage[k]);
          return Promise.resolve(res);
        }
        return Promise.resolve({ ...mockStorage });
      }),
      set: vi.fn((items) => {
        Object.assign(mockStorage, items);
        return Promise.resolve();
      }),
    },
  },
} as any;

(globalThis as any).chrome = mockChrome;

describe('OnboardingGuide', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  });

  it('renders first step on initial display', () => {
    render(<OnboardingGuide onComplete={mockOnComplete} />);

    expect(screen.getByText(/Welcome to FlowLint/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /next/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /skip/i })).toBeDefined();
  });

  it('navigates to next step when Next clicked', () => {
    render(<OnboardingGuide onComplete={mockOnComplete} />);

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Second step should be visible
    expect(screen.getByText(/Widget Controls/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /previous/i })).toBeDefined();
  });

  it('navigates back when Previous clicked', () => {
    render(<OnboardingGuide onComplete={mockOnComplete} />);

    // Go to step 2
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText(/Widget Controls/i)).toBeDefined();

    // Go back to step 1
    fireEvent.click(screen.getByRole('button', { name: /previous/i }));
    expect(screen.getByText(/Welcome to FlowLint/i)).toBeDefined();
  });

  it('calls onComplete and saves to storage when Skip clicked', () => {
    render(<OnboardingGuide onComplete={mockOnComplete} />);

    fireEvent.click(screen.getByRole('button', { name: /skip/i }));

    expect(mockOnComplete).toHaveBeenCalled();
    expect(mockChrome.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({ onboardingCompletedVersion: expect.any(String) })
    );
  });

  it('calls onComplete when finishing last step', () => {
    render(<OnboardingGuide onComplete={mockOnComplete} />);

    // Navigate through all steps
    const nextBtn = screen.getByRole('button', { name: /next/i });

    // Step 1 -> 2
    fireEvent.click(nextBtn);
    // Step 2 -> 3
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    // Step 3 -> 4
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    // Step 4 -> 5 (last step)
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Last step should show "Got it" or "Finish" button
    const finishBtn = screen.getByRole('button', { name: /got it|finish/i });
    fireEvent.click(finishBtn);

    expect(mockOnComplete).toHaveBeenCalled();
    expect(mockChrome.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({ onboardingCompletedVersion: '0.13.0' })
    );
  });

  it('shows step indicator dots', () => {
    render(<OnboardingGuide onComplete={mockOnComplete} />);

    // Should have step indicators
    const stepIndicators = screen.getAllByTestId('step-indicator');
    expect(stepIndicators.length).toBeGreaterThanOrEqual(4);
  });

  it('shows keyboard shortcuts on relevant step', () => {
    render(<OnboardingGuide onComplete={mockOnComplete} />);

    // Navigate to keyboard shortcuts step (last one)
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
    }

    expect(screen.getByText(/Keyboard Shortcuts/i)).toBeDefined();
    expect(screen.getByText(/Escape/i)).toBeDefined();
    // Both Ctrl+E and ⌘+E are shown
    expect(screen.getByText('Ctrl+E')).toBeDefined();
    expect(screen.getByText('⌘+E')).toBeDefined();
  });
});

describe('OnboardingGuide version logic', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  });

  it('should show for first-time users (no stored version)', () => {
    // No stored version = first time user
    const { container } = render(<OnboardingGuide onComplete={mockOnComplete} />);
    expect(container.querySelector('[data-testid="onboarding-overlay"]')).toBeDefined();
  });
});
