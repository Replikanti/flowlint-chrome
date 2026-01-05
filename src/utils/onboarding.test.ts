import { describe, it, expect } from 'vitest';
import { shouldShowOnboarding } from './onboarding';

describe('shouldShowOnboarding', () => {
  it('returns true for first-time users (no stored version)', () => {
    expect(shouldShowOnboarding(undefined, '0.13.0')).toBe(true);
    expect(shouldShowOnboarding('', '0.13.0')).toBe(true);
  });

  it('returns false when minor version is the same', () => {
    expect(shouldShowOnboarding('0.13.0', '0.13.0')).toBe(false);
    expect(shouldShowOnboarding('0.13.0', '0.13.1')).toBe(false);
    expect(shouldShowOnboarding('0.13.0', '0.13.5')).toBe(false);
  });

  it('returns true when minor version changes', () => {
    expect(shouldShowOnboarding('0.12.0', '0.13.0')).toBe(true);
    expect(shouldShowOnboarding('0.12.5', '0.13.0')).toBe(true);
    expect(shouldShowOnboarding('0.12.0', '0.14.0')).toBe(true);
  });

  it('returns true when major version changes', () => {
    expect(shouldShowOnboarding('0.13.0', '1.0.0')).toBe(true);
    expect(shouldShowOnboarding('1.5.0', '2.0.0')).toBe(true);
  });

  it('handles edge cases', () => {
    // Downgrade (shouldn't happen but handle gracefully)
    expect(shouldShowOnboarding('0.14.0', '0.13.0')).toBe(true);

    // Same version different patch
    expect(shouldShowOnboarding('0.13.2', '0.13.3')).toBe(false);
  });
});
