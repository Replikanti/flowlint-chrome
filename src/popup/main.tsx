import React from 'react'
import ReactDOM from 'react-dom/client'
import Popup from './Popup'
import '../index.css'

console.log('Main.tsx loaded');

// Global error handler to catch startup issues
window.addEventListener('error', (event) => {
  console.error('Caught global error:', event.error);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="color: red; padding: 20px; font-family: monospace;">
        <h3>Runtime Error</h3>
        <p>${event.message}</p>
        <pre>${event.error?.stack}</pre>
      </div>
    `;
  }
});

try {
  console.log('Attempting to mount React app...');
  const rootEl = document.getElementById('root');
  if (!rootEl) throw new Error('Root element not found');
  
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>,
  );
  console.log('React mount call completed');
} catch (err) {
  console.error('Failed to mount React app:', err);
}
