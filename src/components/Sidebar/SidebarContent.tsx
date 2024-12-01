import { Music } from 'lucide-react';
import { CHANNELS } from '../../lib/constants';
import type { Track } from '../../lib/types';
import { useCallback } from 'react';

interface SidebarContentProps {
  selectedChannel: string | null;
  onChannelSelect: (channelId: string) => void;
  currentTrack: Track | null;
  isCollapsed: boolean;
}

export default function SidebarContent({ 
  selectedChannel, 
  onChannelSelect,
  currentTrack,
  isCollapsed
}: SidebarContentProps) {
  const getChannelClass = useCallback((channelId: string) => {
    const isSelected = selectedChannel === channelId;
    const isPlaying = currentTrack && 
      CHANNELS.find(ch => ch.id === channelId)?.videos
        .some(video => video.id === currentTrack.id);

    return `w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
      isSelected
        ? 'bg-blue-600 hover:bg-blue-700 text-white'
        : isPlaying
        ? 'bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800'
        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
    }`;
  }, [selectedChannel, currentTrack]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sidebar-scrollbar">
      <h2 className={`text-lg font-semibold mb-4 transition-opacity duration-200 ${
        isCollapsed ? 'opacity-0' : 'opacity-100'
      }`}>
        Artists
      </h2>
      <div className="space-y-2">
        {CHANNELS.map((channel) => (
          <button
            key={channel.id}
            id={`channel-${channel.id}`}
            onClick={() => onChannelSelect(channel.id)}
            className={getChannelClass(channel.id)}
            title={isCollapsed ? channel.name : undefined}
          >
            <Music className="w-5 h-5 flex-shrink-0" />
            <span className={`text-right flex-1 truncate transition-opacity duration-200 ${
              isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
            }`}>
              {channel.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}