# FlowLint Chrome Extension - UI Improvements Plan

Based on user feedback from production user with 8h+ n8n experience.

---

## Feedback Summary

| # | Feedback | Priority | Complexity |
|---|----------|----------|------------|
| 1 | Button gets in the way of clicking n8n elements | High | Medium |
| 2 | Want expanded view showing ALL errors | High | Low |
| 3 | Want to filter error types | Medium | Medium |
| 4 | Export section takes 1/3 of view - hide under button | High | Low |
| 5 | MVP mode - temporarily disable linting | Medium | Low |

---

## Implementation Plan

### Phase 1: Quick Wins (Low Complexity)

#### 1.1 Collapsible Export Panel

**Current State:**
- Export panel (`ExportPanel.tsx`) always visible at bottom of results
- Takes ~100px height with 8 buttons in 4-column grid
- Always shown when results exist

**Changes:**
1. Add `isExpanded` state to `ExportPanel.tsx` (default: `false`)
2. When collapsed: show single "Export" button with download icon
3. When expanded: show current grid of export buttons
4. Add smooth height transition animation

**Files to modify:**
- `src/components/ExportPanel.tsx`
- `src/widget.css` (add transition styles)

**UI Mockup (collapsed):**
```
┌─────────────────────────────────┐
│ [↓ Export Results]              │
└─────────────────────────────────┘
```

**UI Mockup (expanded):**
```
┌─────────────────────────────────┐
│ [↑ Hide Export]                 │
├─────────────────────────────────┤
│ [Text] [GH Log] [GH MD] [JSON]  │
│ [CSV]  [⬇JSON] [⬇CSV] [⬇SARIF] │
└─────────────────────────────────┘
```

---

#### 1.2 Expanded View - Full Error List (Modal Overlay)

**Current State:**
- Widget panel is 450x600px fixed size
- Results area scrollable within that space
- Grouped by severity with headers

**Changes:**
1. Add "Expand" button (icon: Maximize2) in header next to minimize button
2. Clicking expand opens **modal overlay**:
   - Semi-transparent backdrop (black ~50% opacity)
   - Centered panel: 80vw x 80vh (max 1200x800px)
   - Same content as widget, but more space for findings list
3. Backdrop click or `Escape` key closes expanded view
4. Smooth scale/fade transition animation
5. State: component-only (resets on widget close)

**Files to modify:**
- `src/components/Widget.tsx`
- `src/widget.css`

**UI States:**
```
Normal:     [⚙] [_] [□] [×]   (settings, minimize, expand, close)
Expanded:   [⚙] [_] [▣] [×]   (settings, minimize, contract, close)
```

**Modal Structure:**
```
┌──────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░ BACKDROP ░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░┌────────────────────────────┐░░░░░░░ │
│ ░░░░░░░│  FlowLint - Expanded View  │░░░░░░░ │
│ ░░░░░░░│  [Filter chips]            │░░░░░░░ │
│ ░░░░░░░│  ─────────────────────     │░░░░░░░ │
│ ░░░░░░░│  Finding 1                 │░░░░░░░ │
│ ░░░░░░░│  Finding 2                 │░░░░░░░ │
│ ░░░░░░░│  ...                       │░░░░░░░ │
│ ░░░░░░░│  [Export ▼]                │░░░░░░░ │
│ ░░░░░░░└────────────────────────────┘░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└──────────────────────────────────────────────┘
```

---

#### 1.3 MVP Mode Toggle (Disable Linting)

**Current State:**
- Widget always active on n8n workflow pages
- Auto-detects clipboard every 2 seconds
- No way to temporarily disable

**Changes:**
1. Add settings gear icon (⚙) in widget header (leftmost position)
2. Clicking gear opens small dropdown/popover with toggle:
   - "Enable analysis" (checkbox, default: on)
3. When disabled (**muted/grayed appearance**):
   - Button opacity reduced to ~40%
   - Grayscale filter applied
   - Clipboard detection paused
   - Tooltip on hover: "FlowLint paused - click ⚙ to enable"
   - Button still clickable to open settings
4. Store preference in `chrome.storage.local`
5. Sync state across tabs via storage change listener

**Files to modify:**
- `src/components/Widget.tsx`
- `src/components/SettingsDropdown.tsx` (NEW)
- `src/content/overlay.tsx` (read initial state)
- `src/widget.css` (muted state styles)

**UI Mockup - Settings Dropdown:**
```
┌──────────────────────┐
│ ⚙ Settings           │
├──────────────────────┤
│ [✓] Enable analysis  │
│ [ ] Auto-analyze     │  ← future enhancement
└──────────────────────┘
```

**Button States:**
```css
/* Normal (enabled) */
.widget-button { opacity: 1; }

/* Muted (disabled/MVP mode) */
.widget-button.muted {
  opacity: 0.4;
  filter: grayscale(80%);
  cursor: pointer; /* Still clickable for settings */
}
```

---

### Phase 2: Medium Complexity

#### 2.1 Movable/Repositionable Button

**Current State:**
- Fixed position: `bottom: 24px; right: 24px`
- Cannot be moved by user
- May overlap n8n UI elements

**Approach A: Preset Positions (Recommended)**

1. Add position selector in settings dropdown
2. Four preset positions:
   - Bottom-right (default)
   - Bottom-left
   - Top-right
   - Top-left
3. Store preference in `chrome.storage.local`
4. Apply position via CSS classes

**Files to modify:**
- `src/components/Widget.tsx`
- `src/content/overlay.tsx` (apply position to host element)
- `src/widget.css` (position classes)

**Approach B: Drag & Drop (More Complex)**

1. Make button draggable
2. Constrain to viewport edges
3. Store last position in `chrome.storage.local`
4. Snap to corners on release

**Recommendation:** Start with Approach A (preset positions) for simplicity. Can add drag-drop later if users request it.

**Complete Settings Dropdown (Header position):**
```
     Widget Header: [⚙] [_] [□] [×]
                     ↓
┌────────────────────────┐
│ ⚙ Settings             │
├────────────────────────┤
│ [✓] Enable analysis    │
│                        │
│ Widget position:       │
│ ● Bottom-right         │
│ ○ Bottom-left          │
│ ○ Top-right            │
│ ○ Top-left             │
└────────────────────────┘
```

---

#### 2.2 Error Type Filtering

**Current State:**
- Findings grouped by severity (must/should/nit)
- All findings always visible
- No filtering capability

**Changes:**
1. Add filter bar above results list
2. Three toggle chips/buttons: `MUST` `SHOULD` `NIT`
3. All enabled by default
4. Clicking toggles visibility of that severity
5. Show count on each chip: `MUST (3)` `SHOULD (5)` `NIT (2)`
6. **Persist filter state** in `chrome.storage.local` (survives browser restart)
7. Optional future: Add rule filter dropdown (R1-R14)

**Files to modify:**
- `src/components/Widget.tsx`
- `src/widget.css`

**UI Mockup:**
```
┌─────────────────────────────────────────┐
│ Filter: [MUST ✓ (3)] [SHOULD ✓ (5)] [NIT (2)] │
├─────────────────────────────────────────┤
│ ▼ MUST (3 issues)                       │
│   [Finding card 1]                      │
│   [Finding card 2]                      │
│   [Finding card 3]                      │
│ ▼ SHOULD (5 issues)                     │
│   [Finding card 4]                      │
│   ...                                   │
└─────────────────────────────────────────┘
```

**Filter Logic:**
```tsx
const [enabledSeverities, setEnabledSeverities] = useState({
  must: true,
  should: true,
  nit: true,
});

const visibleFindings = sortedFindings.filter(
  f => enabledSeverities[f.severity]
);
```

---

### Phase 3: Polish & Refinements

#### 3.1 Additional Settings (Future)

- **Auto-analyze on paste**: Toggle automatic analysis when clipboard changes
- **Theme override**: Force light/dark regardless of system preference
- **Notification sound**: Play sound when issues found
- **Badge count**: Show issue count on extension icon

#### 3.2 Keyboard Shortcuts

- `Escape`: Close expanded view / close widget
- `Ctrl/Cmd + E`: Toggle expand
- `Ctrl/Cmd + F`: Focus filter

#### 3.3 Accessibility Improvements

- ARIA labels for all interactive elements
- Focus management when opening/closing panels
- Screen reader announcements for state changes

---

## Implementation Order (Recommended)

1. **1.1 Collapsible Export Panel** - Quick win, immediate value
2. **1.3 MVP Mode Toggle** - Addresses direct user pain point
3. **2.2 Error Type Filtering** - High value feature
4. **1.2 Expanded View** - Nice to have, builds on existing
5. **2.1 Movable Button** - Medium priority, preset positions first

---

## TDD Approach (REQUIRED)

**All features MUST be implemented using Test-Driven Development.**

### TDD Workflow

For each feature, follow this cycle:

```
1. RED    → Write failing test first
2. GREEN  → Write minimal code to pass
3. REFACTOR → Clean up, maintain tests passing
```

### Test Structure per Feature

#### 1.1 Collapsible Export Panel

```typescript
// ExportPanel.test.tsx - Write BEFORE implementation

describe('ExportPanel', () => {
  describe('collapsed state (default)', () => {
    it('should render only "Export Results" button when collapsed');
    it('should not render export format buttons when collapsed');
    it('should have aria-expanded="false" when collapsed');
  });

  describe('expanded state', () => {
    it('should expand when "Export Results" button is clicked');
    it('should render all export format buttons when expanded');
    it('should have aria-expanded="true" when expanded');
    it('should collapse when "Hide Export" button is clicked');
  });

  describe('accessibility', () => {
    it('should be keyboard navigable');
    it('should announce state changes to screen readers');
  });
});
```

#### 1.3 MVP Mode Toggle

```typescript
// SettingsDropdown.test.tsx - Write BEFORE implementation

describe('SettingsDropdown', () => {
  describe('rendering', () => {
    it('should render settings gear icon in header');
    it('should open dropdown on gear icon click');
    it('should close dropdown on outside click');
    it('should close dropdown on Escape key');
  });

  describe('enable analysis toggle', () => {
    it('should show checkbox checked when analysis enabled');
    it('should toggle analysis state on checkbox click');
    it('should call onSettingsChange with new state');
  });
});

// Widget.test.tsx - Add tests for muted state

describe('Widget - MVP Mode', () => {
  describe('muted state', () => {
    it('should apply muted class when analysis disabled');
    it('should show tooltip "FlowLint paused" when muted');
    it('should pause clipboard detection when muted');
    it('should still allow opening settings when muted');
  });

  describe('persistence', () => {
    it('should load enabled state from chrome.storage.local');
    it('should save enabled state to chrome.storage.local on change');
    it('should sync state across tabs via storage listener');
  });
});
```

#### 2.2 Error Type Filtering

```typescript
// FilterBar.test.tsx - Write BEFORE implementation

describe('FilterBar', () => {
  const mockFindings = [
    { severity: 'must', rule: 'R1', message: 'Error 1' },
    { severity: 'must', rule: 'R2', message: 'Error 2' },
    { severity: 'should', rule: 'R3', message: 'Warning 1' },
    { severity: 'nit', rule: 'R5', message: 'Info 1' },
  ];

  describe('rendering', () => {
    it('should render three filter chips: MUST, SHOULD, NIT');
    it('should show count for each severity: MUST (2), SHOULD (1), NIT (1)');
    it('should have all filters enabled by default');
  });

  describe('filtering', () => {
    it('should hide MUST findings when MUST chip is toggled off');
    it('should show MUST findings when MUST chip is toggled on');
    it('should allow multiple filters to be disabled');
    it('should show empty state when all filters disabled');
  });

  describe('persistence', () => {
    it('should load filter state from chrome.storage.local');
    it('should save filter state to chrome.storage.local on change');
  });

  describe('accessibility', () => {
    it('should have aria-pressed attribute on filter chips');
    it('should be keyboard navigable');
  });
});
```

#### 1.2 Expanded View

```typescript
// Widget.test.tsx - Add tests for expanded view

describe('Widget - Expanded View', () => {
  describe('expand button', () => {
    it('should render expand button in header');
    it('should open modal overlay on expand button click');
    it('should change icon to "contract" when expanded');
  });

  describe('modal overlay', () => {
    it('should render backdrop when expanded');
    it('should center content panel on screen');
    it('should close on backdrop click');
    it('should close on Escape key press');
    it('should trap focus within modal');
  });

  describe('expanded content', () => {
    it('should display all findings in larger view');
    it('should include filter bar in expanded view');
    it('should include collapsible export panel');
  });
});
```

#### 2.1 Movable Button (Preset Positions)

```typescript
// Widget.test.tsx - Add tests for position

describe('Widget - Position', () => {
  describe('position settings', () => {
    it('should render in bottom-right by default');
    it('should render in bottom-left when position is "bottom-left"');
    it('should render in top-right when position is "top-right"');
    it('should render in top-left when position is "top-left"');
  });

  describe('position persistence', () => {
    it('should load position from chrome.storage.local');
    it('should save position to chrome.storage.local on change');
  });

  describe('settings dropdown', () => {
    it('should show position radio buttons in settings');
    it('should highlight current position');
    it('should change position on radio button select');
  });
});
```

### Chrome Storage Mocking

```typescript
// tests/setup.ts or tests/mocks/chrome.ts

const mockStorage: Record<string, unknown> = {};

global.chrome = {
  storage: {
    local: {
      get: vi.fn((keys) => Promise.resolve(
        typeof keys === 'object'
          ? { ...keys, ...mockStorage }
          : { [keys]: mockStorage[keys] }
      )),
      set: vi.fn((items) => {
        Object.assign(mockStorage, items);
        return Promise.resolve();
      }),
    },
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  runtime: {
    getURL: vi.fn((path) => `chrome-extension://mock-id/${path}`),
  },
} as unknown as typeof chrome;
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode during TDD
npm run test:watch

# Run tests for specific component
npm test -- FilterBar

# Run with coverage
npm run test:coverage
```

### Definition of Done (per feature)

- [ ] All tests written FIRST (RED phase)
- [ ] Minimal implementation to pass tests (GREEN phase)
- [ ] Code refactored, tests still passing (REFACTOR phase)
- [ ] Test coverage ≥ 80% for new code
- [ ] No skipped or pending tests
- [ ] Manual testing on n8n.io completed
- [ ] Dark mode verified
- [ ] Accessibility checked (keyboard nav, screen reader)

---

## Technical Notes

### State Persistence

Use `chrome.storage.local` for user preferences:

**Persisted Settings:**
| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `flowlintEnabled` | boolean | `true` | MVP mode toggle |
| `widgetPosition` | string | `'bottom-right'` | Button position |
| `severityFilters` | object | `{must:true,should:true,nit:true}` | Filter visibility |

```ts
// Save
chrome.storage.local.set({
  flowlintEnabled: true,
  widgetPosition: 'bottom-right',
  severityFilters: { must: true, should: true, nit: true },
});

// Load
const settings = await chrome.storage.local.get({
  flowlintEnabled: true,
  widgetPosition: 'bottom-right',
  severityFilters: { must: true, should: true, nit: true },
});

// Listen for changes (sync across tabs)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    // Update component state from changes
  }
});
```

### Component Structure Updates

Consider extracting new components:
- `SettingsDropdown.tsx` - Settings gear menu
- `FilterBar.tsx` - Severity filter chips
- `ExpandedView.tsx` - Full-screen error view (optional)

### CSS Variables for Position

```css
:host {
  --widget-offset: 24px;
}

:host(.position-bottom-right) {
  bottom: var(--widget-offset);
  right: var(--widget-offset);
}

:host(.position-bottom-left) {
  bottom: var(--widget-offset);
  left: var(--widget-offset);
}

/* etc. */
```

---

## Testing Checklist (TDD)

**Before writing any implementation code:**
- [ ] Write failing tests for the feature (RED)
- [ ] Verify tests actually fail

**During implementation:**
- [ ] Write minimal code to pass tests (GREEN)
- [ ] Run tests after each small change
- [ ] Refactor while keeping tests green

**After implementation:**
- [ ] All unit tests passing
- [ ] Test coverage ≥ 80% for new code (`npm run test:coverage`)
- [ ] Manual test on n8n.io workflow editor
- [ ] Test dark mode appearance
- [ ] Test with 0, 1, 10, 50+ findings
- [ ] Test persistence across page reloads
- [ ] Test on different viewport sizes
- [ ] Verify no n8n UI element conflicts
- [ ] Accessibility: keyboard navigation works
- [ ] Accessibility: screen reader announces changes

---

## Files Summary

| File | Phase | Changes |
|------|-------|---------|
| `src/components/Widget.tsx` | 1-2 | Expand view, settings button, filters, position, muted state |
| `src/components/ExportPanel.tsx` | 1.1 | Collapsible toggle state |
| `src/components/SettingsDropdown.tsx` | 1.3 | **NEW**: Settings gear menu with toggles |
| `src/components/FilterBar.tsx` | 2.2 | **NEW**: Severity filter chips |
| `src/content/overlay.tsx` | 1.3, 2.1 | Position classes, initial settings load, storage listener |
| `src/widget.css` | 1-2 | Transitions, position classes, expanded modal, muted styles |
| `src/background/index.ts` | - | Optional: extension badge updates |

**New Component Dependencies:**
```
Widget.tsx
├── SettingsDropdown.tsx (gear menu)
├── FilterBar.tsx (severity toggles)
└── ExportPanel.tsx (collapsible export)
```

---

## Design Decisions (Resolved)

| Question | Decision | Rationale |
|----------|----------|-----------|
| Filter persistence | **Yes, persist across sessions** | User expects settings to be remembered |
| Expanded view | **Modal overlay** | Stays in n8n context, quick Escape to close, no window management |
| MVP mode appearance | **Muted/grayed button** | Still visible as reminder, one-click to re-enable, no hunting in browser menu |
| Settings icon placement | **Header** | Consistent with other header controls (minimize, expand, close) |
