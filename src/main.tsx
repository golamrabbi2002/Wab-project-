import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safely suppress benign dev-server websocket closed noise from uncaught handlers
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason &&
      (typeof event.reason === 'string' || event.reason.message) &&
      (String(event.reason).includes('WebSocket') || String(event.reason?.message).includes('WebSocket'))
    ) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
    }
  });

  window.addEventListener('error', (event) => {
    if (
      event.message &&
      (event.message.includes('WebSocket') || event.message.includes('websocket'))
    ) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

