import { toast } from 'react-hot-toast';

export const registerServiceWorker = async () => {
  // Skip service worker registration in development or on StackBlitz
  if (import.meta.env.DEV || window.location.hostname.includes('stackblitz')) {
    return;
  }

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              toast.success('New version available! Refresh to update.', {
                duration: 5000,
                position: 'bottom-center',
              });
            }
          });
        }
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};