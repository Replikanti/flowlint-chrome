// Background service worker

// Listen for extension icon clicks
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    // Send a message to the content script in the active tab
    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_WIDGET' }).catch(() => {
       console.log('FlowLint: Content script not ready. User might need to refresh.');
       // We cannot easily inject the script dynamically in a Vite build without complex manifest mapping.
       // It's safer to rely on reload for the first install.
    });
  }
});

// Removed onInstalled listener as it caused errors with file resolution.
