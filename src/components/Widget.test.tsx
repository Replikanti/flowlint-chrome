import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Widget } from './Widget';
import { runAllRules } from '@replikanti/flowlint-core';

// Mock chrome
const mockStorage: Record<string, any> = {};
const listeners: Function[] = [];

const mockChrome = {
  runtime: {
    getURL: vi.fn((path) => path),
    getManifest: () => ({ version: '1.0.0' }),
  },
  storage: {
    local: {
      get: vi.fn((keys) => Promise.resolve({ flowlintEnabled: mockStorage.flowlintEnabled })),
      set: vi.fn((items) => {
        Object.assign(mockStorage, items);
        return Promise.resolve();
      }),
    },
    onChanged: {
      addListener: vi.fn((cb) => listeners.push(cb)),
      removeListener: vi.fn(),
    },
  },
} as any;

(globalThis as any).chrome = mockChrome;

// Mock clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    readText: vi.fn().mockResolvedValue(''),
  },
  writable: true,
});

vi.mock('@replikanti/flowlint-core', () => ({
  parseN8n: vi.fn().mockReturnValue({ meta: {} }),
  runAllRules: vi.fn().mockReturnValue([
    { rule: 'R1', severity: 'must', message: 'Test Error', nodeId: '1' }
  ]),
  defaultConfig: {},
}));

describe('Widget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage.flowlintEnabled = true;
    listeners.length = 0;
  });

  it('renders floating button initially', () => {
    render(<Widget />);
    expect(screen.getByLabelText('Open FlowLint')).toBeDefined();
  });

  it('renders muted button when disabled', async () => {
    mockStorage.flowlintEnabled = false;
    render(<Widget />);
    
    await waitFor(() => {
      const btn = screen.getByLabelText('Open FlowLint');
      expect(btn.className).toContain('muted');
    });
  });

  it('pauses clipboard check when disabled', async () => {
    mockStorage.flowlintEnabled = false;
    const readTextSpy = vi.spyOn(navigator.clipboard, 'readText');
    
    render(<Widget />);
    
    // Wait for settings to load
    await waitFor(() => expect(mockChrome.storage.local.get).toHaveBeenCalled());
    
    // Should verify readText is NOT called
    expect(readTextSpy).not.toHaveBeenCalled();
  });

  it('updates state when storage changes', async () => {
    render(<Widget />);
    
    // Wait for initial load
    await waitFor(() => expect(screen.getByLabelText('Open FlowLint')).toBeDefined());

    const btn = screen.getByLabelText('Open FlowLint');
    expect(btn.className).not.toContain('muted');

    // Simulate storage change
    await act(async () => {
        listeners.forEach(cb => cb({ flowlintEnabled: { newValue: false } }, 'local'));
    });

    await waitFor(() => {
      expect(btn.className).toContain('muted');
    });
  });

  it('opens main view when clicked', async () => {
    render(<Widget />);
    const btn = screen.getByLabelText('Open FlowLint');
    fireEvent.click(btn);
    
    expect(screen.getByRole('heading', { name: 'FlowLint' })).toBeDefined();
    expect(screen.getByPlaceholderText(/Paste your n8n workflow/i)).toBeDefined();
  });

  it('runs analysis when input provided', async () => {
    render(<Widget />);
    // Open
    fireEvent.click(screen.getByLabelText('Open FlowLint'));
    
    // Input
    const textarea = screen.getByPlaceholderText(/Paste your n8n workflow/i);
    fireEvent.change(textarea, { target: { value: '{"nodes":[]}' } });
    
    // Analyze
    const analyzeBtn = screen.getByText('Analyze');
    await act(async () => {
        fireEvent.click(analyzeBtn);
    });
    
    // Check results
    expect(screen.getByText('Test Error')).toBeDefined();
    const severityBadges = screen.getAllByText('must');
    expect(severityBadges.length).toBeGreaterThan(0);
  });

  it('clears results', async () => {
    render(<Widget />);
    fireEvent.click(screen.getByLabelText('Open FlowLint'));
    
    const textarea = screen.getByPlaceholderText(/Paste your n8n workflow/i);
    fireEvent.change(textarea, { target: { value: '{"nodes":[]}' } });
    
    await act(async () => {
        fireEvent.click(screen.getByText('Analyze'));
    });
    
    expect(screen.getByText('Test Error')).toBeDefined();
    
    // Clear
    const clearBtn = screen.getByText('Clear');
    fireEvent.click(clearBtn);
    
    expect(screen.queryByText('Test Error')).toBeNull();
    expect(screen.getByPlaceholderText(/Paste your n8n workflow/i)).toBeDefined();
  });

  it('detects workflow in clipboard and shows prompt', async () => {
    vi.spyOn(navigator.clipboard, 'readText').mockResolvedValue('{"nodes": [], "connections": {}}');
    
    render(<Widget />);
    
    await waitFor(() => {
        expect(screen.getByText('Workflow detected! Click to analyze.')).toBeDefined();
    });
    
    // Click prompt
    await act(async () => {
        fireEvent.click(screen.getByText('Workflow detected! Click to analyze.'));
    });
    
    expect(screen.getByPlaceholderText(/Paste your n8n workflow/i)).toBeDefined();
  });

  it('ignores invalid clipboard content', async () => {
    vi.spyOn(navigator.clipboard, 'readText').mockResolvedValue('invalid json');
    render(<Widget />);
    
    // Wait for effect
    await waitFor(() => {});
    
    // Prompt should NOT appear
    expect(screen.queryByText('Workflow detected! Click to analyze.')).toBeNull();
  });

  it('ignores short clipboard content', async () => {
    vi.spyOn(navigator.clipboard, 'readText').mockResolvedValue('short');
    render(<Widget />);
    await waitFor(() => {});
    expect(screen.queryByText('Workflow detected! Click to analyze.')).toBeNull();
  });
});