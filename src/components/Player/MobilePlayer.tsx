import { useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, ChevronUp, ChevronDown } from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore';
import { formatTime } from '../../lib/utils/formatTime';

export default function MobilePlayer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
  const playNext = usePlayerStore((state) => state.playNext);
  const playPrevious = usePlayerStore((state) => state.playPrevious);
  const queue = usePlayerStore((state) => state.queue);

  if (!currentTrack) return null;

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        isExpanded ? 'h-[70vh]' : 'h-20'
      }`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md"
      >
        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
      </button>

      <div className="h-20 px-4 flex items-center justify-between">
        <div className="flex items-center flex-1 min-w-0">
          <img 
            src={currentTrack.thumbnail} 
            alt={currentTrack.title}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div className="ml-3 flex-1 min-w-0">
            <h3 className="text-sm font-medium truncate">{currentTrack.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {currentTrack.channelTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={playPrevious}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-3 bg-blue-600 text-white rounded-full"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button 
            onClick={playNext}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 h-[calc(70vh-5rem)] overflow-y-auto">
          <img 
            src={currentTrack.thumbnail} 
            alt={currentTrack.title}
            className="w-full aspect-video rounded-lg object-cover mb-4"
          />
          
          <h2 className="text-lg font-semibold mb-1">{currentTrack.title}</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{currentTrack.channelTitle}</p>

          <div className="space-y-4">
            <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">Up Next</h3>
            {queue.map((track, index) => (
              <div key={track.id} className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">{index + 1}</span>
                <img
                  src={track.thumbnail}
                  alt={track.title}
                  className="w-10 h-10 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{track.title}</p>
                  <p className="text-xs text-gray-500 truncate">{track.channelTitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}