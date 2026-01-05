import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsDropdown } from './SettingsDropdown';

// Mock flowlint-core
vi.mock('@replikanti/flowlint-core', () => ({
  RULES_METADATA: [
    { id: 'R1', name: 'rate_limit_retry', severity: 'must', description: 'Test', details: '' },
    { id: 'R2', name: 'error_handling', severity: 'must', description: 'Test', details: '' },
    { id: 'R3', name: 'idempotency', severity: 'should', description: 'Test', details: '' },
  ],
}));

// Mock chrome.storage
const mockStorage: Record<string, any> = {};
const mockChrome = {
  storage: {
    local: {
      get: vi.fn().mockImplementation((keys) => {
        if (typeof keys === 'string') return Promise.resolve({ [keys]: mockStorage[keys] });
        if (Array.isArray(keys)) {
            const res: any = {};
            keys.forEach(k => res[k] = mockStorage[k]);
            return Promise.resolve(res);
        }
        return Promise.resolve({ ...mockStorage }); // get all
      }),
      set: vi.fn().mockImplementation((items) => {
        Object.assign(mockStorage, items);
        return Promise.resolve();
      }),
    },
  },
} as any;

(globalThis as any).chrome = mockChrome;

describe('SettingsDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    mockStorage.flowlintEnabled = true; // default
  });

  it('renders settings gear icon', () => {
    render(<SettingsDropdown />);
    // Look for button with settings icon or aria-label
    expect(screen.getByRole('button', { name: /settings/i })).toBeDefined();
  });

  it('opens dropdown on click', async () => {
    render(<SettingsDropdown />);
    const button = screen.getByRole('button', { name: /settings/i });
    
    fireEvent.click(button);
    
    // Should show "Enable analysis" checkbox
    await waitFor(() => {
      expect(screen.getByText('Enable analysis')).toBeDefined();
    });
  });

  it('toggles analysis state', async () => {
    render(<SettingsDropdown />);
    const button = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(button); // Open

    await waitFor(() => screen.getByText('Enable analysis'));

    const checkbox = screen.getByRole('checkbox', { name: /enable analysis/i });
    
    // Initial state (mocked as true)
    // Note: If component loads async, we might need to wait for state? 
    // Assuming simple implementation for now.
    // Actually, radix-ui checkbox logic might be complex to test with fireEvent directly if not mounted?
    // We'll see.
    
    // Toggle off
    fireEvent.click(checkbox);
    
    expect(mockChrome.storage.local.set).toHaveBeenCalledWith({ flowlintEnabled: false });
    
    // Toggle on
    fireEvent.click(checkbox);
    expect(mockChrome.storage.local.set).toHaveBeenCalledWith({ flowlintEnabled: true });
  });

  it('toggles auto-analyze state', async () => {
    render(<SettingsDropdown />);
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    await waitFor(() => screen.getByText('Auto-analyze paste'));

    const checkbox = screen.getByRole('checkbox', { name: /auto-analyze clipboard/i });
    fireEvent.click(checkbox);
    expect(mockChrome.storage.local.set).toHaveBeenCalledWith({ autoAnalyze: false });
  });

  it('changes widget position', async () => {
    render(<SettingsDropdown />);
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));

    await waitFor(() => screen.getByText('Widget Position'));

    // Default is bottom-right (mocked empty or default)
    // Click Top-Left
    const tlBtn = screen.getByLabelText('Top Left');
    fireEvent.click(tlBtn);

    expect(mockChrome.storage.local.set).toHaveBeenCalledWith({ widgetPosition: 'top-left' });
  });

  describe('Rule Configuration', () => {
    it('shows rules section with toggle', async () => {
      render(<SettingsDropdown />);
      fireEvent.click(screen.getByRole('button', { name: /settings/i }));

      await waitFor(() => {
        expect(screen.getByText(/Rules/i)).toBeDefined();
      });
    });

    it('expands rules list when clicked', async () => {
      render(<SettingsDropdown />);
      fireEvent.click(screen.getByRole('button', { name: /settings/i }));

      await waitFor(() => screen.getByText(/Rules/i));

      // Click to expand rules section
      const rulesToggle = screen.getByRole('button', { name: /rules/i });
      fireEvent.click(rulesToggle);

      // Should show individual rules (name is rendered with spaces instead of underscores)
      await waitFor(() => {
        expect(screen.getByText('R1')).toBeDefined();
        expect(screen.getByText(/rate limit retry/i)).toBeDefined();
      });
    });

    it('toggles individual rule', async () => {
      render(<SettingsDropdown />);
      fireEvent.click(screen.getByRole('button', { name: /settings/i }));
      await waitFor(() => screen.getByText(/Rules/i));

      // Expand rules
      fireEvent.click(screen.getByRole('button', { name: /rules/i }));
      await waitFor(() => screen.getByText(/R1/));

      // Toggle R1 rule off
      const r1Checkbox = screen.getByRole('checkbox', { name: /R1/i });
      fireEvent.click(r1Checkbox);

      // Should save to storage
      expect(mockChrome.storage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({ enabledRules: expect.any(Object) })
      );
    });

    it('has select all and deselect all buttons', async () => {
      render(<SettingsDropdown />);
      fireEvent.click(screen.getByRole('button', { name: /settings/i }));
      await waitFor(() => screen.getByText(/Rules/i));

      // Expand rules
      fireEvent.click(screen.getByRole('button', { name: /rules/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /all/i })).toBeDefined();
        expect(screen.getByRole('button', { name: /none/i })).toBeDefined();
      });
    });

    it('deselects all rules when None clicked', async () => {
      render(<SettingsDropdown />);
      fireEvent.click(screen.getByRole('button', { name: /settings/i }));
      await waitFor(() => screen.getByText(/Rules/i));

      fireEvent.click(screen.getByRole('button', { name: /rules/i }));
      await waitFor(() => screen.getByRole('button', { name: /none/i }));

      fireEvent.click(screen.getByRole('button', { name: /none/i }));

      // Should save with all rules disabled
      expect(mockChrome.storage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({
          enabledRules: expect.objectContaining({ R1: false, R2: false })
        })
      );
    });

    it('loads saved rule configuration', async () => {
      // Pre-set some rules as disabled
      mockStorage.enabledRules = { R1: false, R3: false };

      render(<SettingsDropdown />);
      fireEvent.click(screen.getByRole('button', { name: /settings/i }));
      await waitFor(() => screen.getByText(/Rules/i));

      fireEvent.click(screen.getByRole('button', { name: /rules/i }));

      // Should show count reflecting disabled rules (1/3 since R1 and R3 are disabled)
      await waitFor(() => {
        expect(screen.getByText(/1\/3/)).toBeDefined();
      });
    });
  });
});
