import { createRoot } from 'react-dom/client';
import React from 'react';
import { Widget } from '../components/Widget';
// @ts-ignore
import styleText from '../widget.css?inline'; // Vite feature to import CSS as string
import { logger } from '../utils/logger-shim';

const MOUNT_POINT_ID = 'flowlint-overlay-root';

logger.info('[FlowLint] Overlay script loaded');

// Ensure we don't mount twice
if (!document.getElementById(MOUNT_POINT_ID)) {
  // Create host element
  const host = document.createElement('div');
  host.id = MOUNT_POINT_ID;
  // Position the host element itself
  host.style.position = 'fixed';
  host.style.bottom = '24px';
  host.style.right = '24px';
  host.style.zIndex = '2147483647'; // Max z-index
  host.style.display = 'flex';
  host.style.flexDirection = 'column';
  host.style.alignItems = 'flex-end';
  // Note: We don't set pointer-events: none here because the host wraps the widget tightly.
  // If we did, we'd need to reset it on the widget children.
  
  document.body.appendChild(host);

  // Attach Shadow DOM to isolate styles from the page (and vice versa)
  const shadow = host.attachShadow({ mode: 'open' });

  // Inject Styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styleText;
  shadow.appendChild(styleSheet);

  // Mount Point inside Shadow DOM
  const rootContainer = document.createElement('div');
  // Pass the dark mode preference if the host page has it
  if (document.documentElement.classList.contains('dark')) {
      rootContainer.classList.add('dark');
  }
  shadow.appendChild(rootContainer);

  // --- 1. Global History Patching (Outside React) ---
  // This ensures we catch URL changes even in SPA mode without re-patching on every render
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  const notifyUrlChanged = () => {
    window.dispatchEvent(new CustomEvent('flowlint-url-changed'));
  };

  history.pushState = function(...args) {
    originalPushState.apply(this, args);
    notifyUrlChanged();
  };

  history.replaceState = function(...args) {
    originalReplaceState.apply(this, args);
    notifyUrlChanged();
  };

  window.addEventListener('popstate', notifyUrlChanged);


  // --- 2. React Component ---
  const OverlayApp = () => {
    const [isVisible, setIsVisible] = React.useState(false);

    // Check Logic
    const checkUrl = () => {
        const match = window.location.href.includes('/workflow/');
        // If we match, show. If not, hide.
        // We use functional update to avoid dependency loops if we were to use useCallback
        setIsVisible(match);
    };

    React.useEffect(() => {
      // Initial check
      checkUrl();

      // Listen to our custom event
      window.addEventListener('flowlint-url-changed', checkUrl);
      
      // Also listen to toggle messages
      const msgListener = (msg: any) => {
        if (msg.type === 'TOGGLE_WIDGET') {
           setIsVisible(prev => !prev);
        }
      };
      chrome.runtime.onMessage.addListener(msgListener);

      return () => {
        window.removeEventListener('flowlint-url-changed', checkUrl);
        chrome.runtime.onMessage.removeListener(msgListener);
      };
    }, []);

    // Don't render anything if not visible
    if (!isVisible) return null;

    return <Widget />;
  };

  createRoot(rootContainer).render(
    <React.StrictMode>
      <OverlayApp />
    </React.StrictMode>
  );
}
