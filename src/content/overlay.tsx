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

  // Detect and apply dark mode based on system preference
  const updateDarkMode = () => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      rootContainer.classList.add('dark');
    } else {
      rootContainer.classList.remove('dark');
    }
  };

  // Initial dark mode detection
  updateDarkMode();

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateDarkMode);

  shadow.appendChild(rootContainer);

  // --- 1. Global History Patching REMOVED ---
  // We now rely on background script messaging for URL changes to avoid polluting global scope
  // and ensuring better compatibility with n8n SPA router.

  // --- 2. React Component ---
  const OverlayApp = () => {
    const [isVisible, setIsVisible] = React.useState(false);

    const isN8nWorkflowPage = () => {
      const href = window.location.href || '';
      return href.includes('/workflow') || href.includes('/workflows');
    };

    // Check Logic
    const checkUrl = () => {
      const match = isN8nWorkflowPage();
      setIsVisible(match);
    };

    React.useEffect(() => {
      // Initial check
      checkUrl();
      
      // Listen to messages from background script
      const msgListener = (msg: any) => {
        if (msg.type === 'TOGGLE_WIDGET') {
          // Only allow toggling on n8n workflow pages
          if (!isN8nWorkflowPage()) return;
          setIsVisible(prev => !prev);
        }
        if (msg.type === 'URL_CHANGED') {
          checkUrl();
        }
      };
      chrome.runtime.onMessage.addListener(msgListener);

      return () => {
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
