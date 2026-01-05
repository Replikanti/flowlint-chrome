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
      get: vi.fn((keys) => Promise.resolve({ flowlintEnabled: mockStorage.flowlintEnabled, severityFilters: mockStorage.severityFilters })),
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
    { rule: 'R1', severity: 'must', message: 'Test Error', nodeId: '1', path: 'workflow.json' }
  ]),
  defaultConfig: {},
}));

describe('Widget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage.flowlintEnabled = true;
    mockStorage.severityFilters = undefined;
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

  it('shows success state when no findings', async () => {
    vi.mocked(runAllRules).mockReturnValueOnce([]);
    
    render(<Widget />);
    fireEvent.click(screen.getByLabelText('Open FlowLint'));
    
    const textarea = screen.getByPlaceholderText(/Paste your n8n workflow/i);
    fireEvent.change(textarea, { target: { value: '{"nodes":[]}' } });
    
    await act(async () => {
        fireEvent.click(screen.getByText('Analyze'));
    });
    
    expect(screen.getByText('Workflow is clean!')).toBeDefined();
  });

  it('filters results by severity', async () => {
    vi.mocked(runAllRules).mockReturnValue([
        { rule: 'R1', severity: 'must', message: 'Error 1', nodeId: '1', path: 'workflow.json' },
        { rule: 'R2', severity: 'should', message: 'Warning 1', nodeId: '2', path: 'workflow.json' },
        { rule: 'R3', severity: 'nit', message: 'Info 1', nodeId: '3', path: 'workflow.json' },
    ]);

    render(<Widget />);
    fireEvent.click(screen.getByLabelText('Open FlowLint'));
    const textarea = screen.getByPlaceholderText(/Paste your n8n workflow/i);
    fireEvent.change(textarea, { target: { value: '{"nodes":[]}' } });
    await act(async () => { fireEvent.click(screen.getByText('Analyze')); });

    // Initial state: all visible
    expect(screen.getByText('Error 1')).toBeDefined();
    expect(screen.getByText('Warning 1')).toBeDefined();
    expect(screen.getByText('Info 1')).toBeDefined();

    // Toggle MUST off
    const mustFilter = screen.getByText(/must/i, { selector: 'button span' }).closest('button');
    if (mustFilter) {
        await act(async () => { fireEvent.click(mustFilter); });
    }

    // MUST should be gone
    expect(screen.queryByText('Error 1')).toBeNull();
    expect(screen.getByText('Warning 1')).toBeDefined();

    // Verify storage update
    expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        severityFilters: expect.objectContaining({ must: false, should: true, nit: true })
    });
  });

  it('toggles expanded view modal', async () => {
    render(<Widget />);
    fireEvent.click(screen.getByLabelText('Open FlowLint'));
    
    // Find Expand button
    const expandBtn = screen.getByLabelText(/expand/i);
    fireEvent.click(expandBtn);
    
    // Check for modal overlay title
    expect(screen.getByText(/Expanded View/i)).toBeDefined();
    
    // Close modal
    const closeOverlayBtn = screen.getByLabelText(/close expanded view/i);
    fireEvent.click(closeOverlayBtn);
    
    expect(screen.queryByText(/Expanded View/i)).toBeNull();
  });
});
