import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsDropdown } from './SettingsDropdown';

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

  it('closes dropdown on outside click', async () => {
    render(<SettingsDropdown />);
    const button = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(button); // Open

    await waitFor(() => screen.getByText('Settings'));

    fireEvent.mouseDown(document.body);
    
    // Should be closed (settings text gone)
    await waitFor(() => {
        expect(screen.queryByText('Settings')).toBeNull();
    });
  });
});
