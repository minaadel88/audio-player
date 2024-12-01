export const checkBrowserSupport = () => {
  // Check for Service Worker support
  const hasServiceWorker = 'serviceWorker' in navigator;
  
  // Check for WebAudio support
  const hasWebAudio = 'AudioContext' in window || 'webkitAudioContext' in window;
  
  // Check for localStorage support
  const hasLocalStorage = (() => {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }
  })();

  return {
    hasServiceWorker,
    hasWebAudio,
    hasLocalStorage
  };
};