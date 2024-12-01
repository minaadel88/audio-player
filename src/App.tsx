import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useThemeStore } from './stores/themeStore';
import clsx from 'clsx';
import Navbar from './components/Navbar';
import Player from './components/Player';
import Home from './pages/Home';
import Library from './pages/Library';
import Auth from './pages/Auth';
import { useAuthStore } from './stores/authStore';
import { useMediaQuery } from './lib/hooks/useMediaQuery';
import { optimizePerformance } from './lib/utils/performance';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

// Initialize performance optimizations
const { lazyLoadImages } = optimizePerformance();
lazyLoadImages();

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const theme = useThemeStore((state) => state.theme);
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className={clsx(
          'app-layout',
          theme === 'dark' ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'
        )}>
          <Navbar isMobile={isMobile} />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route 
                path="/library" 
                element={isAuthenticated ? <Library /> : <Auth />} 
              />
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </main>
          <Player />
          <Toaster 
            position="bottom-center"
            toastOptions={{
              className: theme === 'dark' ? '!bg-gray-800 !text-white' : '',
              duration: 3000,
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;