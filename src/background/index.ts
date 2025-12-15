// Background service worker

// Listen for URL changes (SPA navigation)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // We check for 'complete' status OR if URL changed directly
  if (changeInfo.status === 'complete' || changeInfo.url) {
    const url = tab.url || changeInfo.url;
    if (url && (url.includes('/workflow') || url.includes('/workflows'))) {
      chrome.tabs.sendMessage(tabId, { type: 'URL_CHANGED', url }).catch(() => {
        // Content script might not be loaded yet, ignore error
      });
    }
  }
});

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
