import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn utility', () => {
  it('merges class names correctly', () => {
    expect(cn('p-4', 'text-red-500')).toBe('p-4 text-red-500');
  });

  it('handles conditional classes', () => {
    const isTrue = true;
    const isFalse = false;
    expect(cn('p-4', isTrue && 'block', isFalse && 'hidden')).toBe('p-4 block');
  });

  it('resolves tailwind conflicts', () => {
    // twMerge should let the last one win
    expect(cn('p-4', 'p-8')).toBe('p-8');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('handles arrays and objects', () => {
    expect(cn(['flex', 'items-center'], { 'justify-center': true, 'hidden': false })).toBe('flex items-center justify-center');
  });
});
