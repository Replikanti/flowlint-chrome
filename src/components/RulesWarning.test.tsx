import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RulesWarning } from './RulesWarning';

// Mock flowlint-core
vi.mock('@replikanti/flowlint-core', () => ({
  RULES_METADATA: [
    { id: 'R1', name: 'rate_limit_retry', severity: 'must', description: 'Test', details: '' },
    { id: 'R2', name: 'error_handling', severity: 'must', description: 'Test', details: '' },
    { id: 'R3', name: 'idempotency', severity: 'should', description: 'Test', details: '' },
  ],
}));

describe('RulesWarning', () => {
  it('does not render when all rules are enabled', () => {
    const { container } = render(
      <RulesWarning enabledRules={{ R1: true, R2: true, R3: true }} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('does not render when enabledRules is empty (all enabled by default)', () => {
    const { container } = render(<RulesWarning enabledRules={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders warning when some rules are disabled', () => {
    render(<RulesWarning enabledRules={{ R1: true, R2: false, R3: true }} />);
    expect(screen.getByText('1 skipped')).toBeDefined();
  });

  it('shows correct count of skipped rules', () => {
    render(<RulesWarning enabledRules={{ R1: false, R2: false, R3: true }} />);
    expect(screen.getByText('2 skipped')).toBeDefined();
  });

  it('shows tooltip on hover with rule lists', async () => {
    render(<RulesWarning enabledRules={{ R1: true, R2: false, R3: false }} />);

    // Hover over the warning
    const warning = screen.getByText('2 skipped').parentElement!;
    fireEvent.mouseEnter(warning.parentElement!);

    // Should show checked rules
    expect(screen.getByText('Checked (1)')).toBeDefined();
    expect(screen.getByText('rate limit retry')).toBeDefined();

    // Should show skipped rules
    expect(screen.getByText('Skipped (2)')).toBeDefined();
    expect(screen.getByText('error handling')).toBeDefined();
    expect(screen.getByText('idempotency')).toBeDefined();
  });

  it('hides tooltip on mouse leave', () => {
    render(<RulesWarning enabledRules={{ R1: false, R2: true, R3: true }} />);

    const warning = screen.getByText('1 skipped').parentElement!;

    // Show tooltip
    fireEvent.mouseEnter(warning.parentElement!);
    expect(screen.getByText('Skipped (1)')).toBeDefined();

    // Hide tooltip
    fireEvent.mouseLeave(warning.parentElement!);
    expect(screen.queryByText('Skipped (1)')).toBeNull();
  });
});
