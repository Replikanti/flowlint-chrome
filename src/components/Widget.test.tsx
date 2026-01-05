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
      get: vi.fn((keys) => Promise.resolve({ 
        flowlintEnabled: mockStorage.flowlintEnabled, 
        severityFilters: mockStorage.severityFilters,
        widgetPosition: mockStorage.widgetPosition 
      })),
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
    { rule: 'R1', severity: 'must', message: 'Test Error', nodeId: '1', path: 'wf.json' }
  ]),
  defaultConfig: {},
}));

describe('Widget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage.flowlintEnabled = true;
    mockStorage.severityFilters = undefined;
    mockStorage.widgetPosition = 'bottom-right';
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
    
    await waitFor(() => expect(mockChrome.storage.local.get).toHaveBeenCalled());
    expect(readTextSpy).not.toHaveBeenCalled();
  });

  it('updates state when storage changes', async () => {
    render(<Widget />);
    await waitFor(() => expect(screen.getByLabelText('Open FlowLint')).toBeDefined());

    const btn = screen.getByLabelText('Open FlowLint');
    expect(btn.className).not.toContain('muted');

    await act(async () => {
        listeners.forEach(cb => cb({ flowlintEnabled: { newValue: false } }, 'local'));
    });

    await waitFor(() => {
      expect(btn.className).toContain('muted');
    });
  });

  it('opens main view when clicked', async () => {
    render(<Widget />);
    fireEvent.click(screen.getByLabelText('Open FlowLint'));
    
    await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'FlowLint' })).toBeDefined();
    });
  });

  it('runs analysis when input provided', async () => {
    render(<Widget />);
    fireEvent.click(screen.getByLabelText('Open FlowLint'));
    
    const textarea = await screen.findByPlaceholderText(/Paste your n8n workflow JSON here/i);
    fireEvent.change(textarea, { target: { value: '{"nodes":[]}' } });
    
    const analyzeBtn = screen.getByText('Analyze');
    await act(async () => {
        fireEvent.click(analyzeBtn);
    });
    
    await waitFor(() => {
        expect(screen.getByText('Test Error')).toBeDefined();
    });
  });

  it('clears results', async () => {
    render(<Widget />);
    fireEvent.click(screen.getByLabelText('Open FlowLint'));
    
    const textarea = await screen.findByPlaceholderText(/Paste your n8n workflow JSON here/i);
    fireEvent.change(textarea, { target: { value: '{"nodes":[]}' } });
    
    await act(async () => {
        fireEvent.click(screen.getByText('Analyze'));
    });
    
    await screen.findByText('Test Error');
    
    const clearBtn = screen.getByText('Clear');
    fireEvent.click(clearBtn);
    
    await waitFor(() => {
        expect(screen.queryByText('Test Error')).toBeNull();
    });
  });

  it('detects workflow in clipboard and shows prompt', async () => {
    vi.spyOn(navigator.clipboard, 'readText').mockResolvedValue('{"nodes": [], "connections": {}}');
    render(<Widget />);
    
    await waitFor(() => {
        expect(screen.getByText(/Workflow detected/i)).toBeDefined();
    });
    
    await act(async () => {
        fireEvent.click(screen.getByText(/Workflow detected/i));
    });
    
    expect(screen.getByPlaceholderText(/Paste your n8n workflow JSON here/i)).toBeDefined();
  });

  it('shows success state when no findings', async () => {
    vi.mocked(runAllRules).mockReturnValueOnce([]);
    
    render(<Widget />);
    fireEvent.click(screen.getByLabelText('Open FlowLint'));
    
    const textarea = await screen.findByPlaceholderText(/Paste your n8n workflow JSON here/i);
    fireEvent.change(textarea, { target: { value: '{"nodes":[]}' } });
    
    await act(async () => {
        fireEvent.click(screen.getByText('Analyze'));
    });
    
    await waitFor(() => {
        const cleanElements = screen.getAllByText(/Workflow is clean/i);
        expect(cleanElements.length).toBeGreaterThan(0);
    });
  });

  it('filters results by severity', async () => {
    vi.mocked(runAllRules).mockReturnValue([
        { rule: 'R1', severity: 'must', message: 'Error 1', nodeId: '1', path: 'wf.json' },
        { rule: 'R2', severity: 'should', message: 'Warning 1', nodeId: '2', path: 'wf.json' },
        { rule: 'R3', severity: 'nit', message: 'Info 1', nodeId: '3', path: 'wf.json' },
    ]);

    render(<Widget />);
    fireEvent.click(screen.getByLabelText('Open FlowLint'));
    const textarea = await screen.findByPlaceholderText(/Paste your n8n workflow JSON here/i);
    fireEvent.change(textarea, { target: { value: '{"nodes":[]}' } });
    await act(async () => { fireEvent.click(screen.getByText('Analyze')); });

    await waitFor(() => expect(screen.getByText('Error 1')).toBeDefined());

    const mustFilter = screen.getAllByRole('button').find(b => b.textContent?.toLowerCase().includes('must'));
    if (mustFilter) {
        await act(async () => { fireEvent.click(mustFilter); });
    }

    await waitFor(() => {
        expect(screen.queryByText('Error 1')).toBeNull();
    });
  });

  it('closes widget on Escape key', async () => {
    render(<Widget />);
    fireEvent.click(screen.getByLabelText('Open FlowLint'));
    await screen.findByRole('heading', { name: 'FlowLint' });

    fireEvent.keyDown(window, { key: 'Escape' });
    
    await waitFor(() => {
        expect(screen.queryByRole('heading', { name: 'FlowLint' })).toBeNull();
    });
  });

  it('toggles expanded view on Ctrl+E', async () => {
    render(<Widget />);
    fireEvent.click(screen.getByLabelText('Open FlowLint'));
    
    const textarea = await screen.findByPlaceholderText(/Paste your n8n workflow JSON here/i);
    fireEvent.change(textarea, { target: { value: '{"nodes":[]}' } });
    await act(async () => { fireEvent.click(screen.getByText('Analyze')); });
    
    await screen.findByRole('heading', { name: 'FlowLint' });
    
    // Toggle on
    fireEvent.keyDown(window, { key: 'e', ctrlKey: true });
    await waitFor(() => {
        expect(screen.getByText(/Expanded View/i)).toBeDefined();
    });

    // Toggle off
    fireEvent.keyDown(window, { key: 'e', ctrlKey: true });
    await waitFor(() => {
        expect(screen.queryByText(/Expanded View/i)).toBeNull();
    });
  });
});
