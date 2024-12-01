import { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../../stores/playerStore';
import { CHANNELS } from '../../lib/constants';
import SidebarContent from './SidebarContent';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { useMediaQuery } from '../../lib/hooks/useMediaQuery';

interface SidebarContainerProps {
  selectedChannel: string | null;
  onChannelSelect: (channelId: string) => void;
}

export default function SidebarContainer({ selectedChannel, onChannelSelect }: SidebarContainerProps) {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    if (currentTrack) {
      const channel = CHANNELS.find(ch => 
        ch.videos.some(video => video.id === currentTrack.id)
      );
      
      if (channel && sidebarRef.current) {
        const channelElement = document.getElementById(`channel-${channel.id}`);
        if (channelElement) {
          channelElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && !isCollapsed && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsCollapsed(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isCollapsed]);

  return (
    <>
      {isMobile && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="fixed top-20 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      <div 
        ref={sidebarRef}
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 z-40 ${
          isCollapsed ? 'w-0 md:w-16' : 'w-64'
        } ${isMobile ? 'shadow-xl' : ''}`}
      >
        <SidebarContent 
          selectedChannel={selectedChannel}
          onChannelSelect={(channelId) => {
            onChannelSelect(channelId);
            if (isMobile) setIsCollapsed(true);
          }}
          currentTrack={currentTrack}
          isCollapsed={isCollapsed}
        />
        
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute right-2 top-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
}