import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { ErrorBoundary } from './lib/utils/errorBoundary';
import { registerServiceWorker } from './lib/utils/serviceWorkerRegistration';
import { checkBrowserSupport } from './lib/utils/browserSupport';

// Check browser support
const support = checkBrowserSupport();
if (!support.hasLocalStorage) {
  console.warn('LocalStorage is not supported. Some features may not work.');
}

// Register service worker only in production and not on StackBlitz
if (import.meta.env.PROD && !window.location.hostname.includes('stackblitz')) {
  registerServiceWorker();
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);