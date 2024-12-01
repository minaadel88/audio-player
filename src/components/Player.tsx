import { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, ChevronUp, ChevronDown } from 'lucide-react';
import { usePlayerStore } from '../stores/playerStore';
import { setupMediaSession } from '../lib/utils/mediaSession';
import clsx from 'clsx';

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default function Player() {
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const playerRef = useRef<any>(null);
  const progressInterval = useRef<any>(null);
  
  const { 
    currentTrack, 
    isPlaying, 
    setIsPlaying, 
    queue, 
    playNext, 
    playPrevious,
    history 
  } = usePlayerStore();

  useEffect(() => {
    if (playerRef.current && isPlaying) {
      playerRef.current.playVideo();
    }
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    if (currentTrack && playerRef.current) {
      setupMediaSession(playerRef, duration);
    }
  }, [currentTrack, duration]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && playerRef.current && isPlaying) {
        playerRef.current.playVideo();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying]);

  if (!currentTrack) return null;

  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume);
      } else {
        playerRef.current.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const handleReady = (event: any) => {
    playerRef.current = event.target;
    event.target.setVolume(volume);
    setDuration(event.target.getDuration());
    if (isPlaying) {
      event.target.playVideo();
    }
  };

  const handleStateChange = (event: any) => {
    const state = event.data;
    
    if (state === 1) { // playing
      setIsPlaying(true);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      progressInterval.current = setInterval(() => {
        if (playerRef.current) {
          const currentTime = playerRef.current.getCurrentTime();
          setCurrentTime(currentTime);
          if ('mediaSession' in navigator) {
            navigator.mediaSession.setPositionState({
              duration: duration,
              playbackRate: 1,
              position: currentTime
            });
          }
        }
      }, 1000);
    } else if (state === 2) { // paused
      setIsPlaying(false);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    } else if (state === 0) { // ended
      setIsPlaying(false);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      playNext();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    if (playerRef.current) {
      playerRef.current.seekTo(seekTime);
      setCurrentTime(seekTime);
    }
  };

  return (
    <div className={clsx(
      'player-container transition-all duration-300',
      isExpanded ? 'h-48' : 'h-24',
    )}>
      <div className="container mx-auto max-w-7xl px-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 bg-gray-800 dark:bg-gray-700 rounded-full p-1 hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          aria-label={isExpanded ? 'Collapse player' : 'Expand player'}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>

        <div className="flex flex-col h-full py-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-4">
              <img 
                src={currentTrack.thumbnail} 
                alt={currentTrack.title} 
                className={clsx(
                  'w-12 h-12 rounded-full object-cover',
                  isPlaying && 'animate-spin-slow'
                )}
              />
              <div className="min-w-0">
                <h3 className="text-sm font-medium truncate">{currentTrack.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {currentTrack.channelTitle}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={playPrevious}
                disabled={history.length === 0}
                className={clsx(
                  'p-2 rounded-full transition-colors',
                  history.length === 0 
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button 
                onClick={togglePlay}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>
              <button 
                onClick={playNext}
                disabled={queue.length === 0}
                className={clsx(
                  'p-2 rounded-full transition-colors',
                  queue.length === 0 
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button 
                onClick={toggleMute} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => {
                  const newVolume = parseInt(e.target.value);
                  setVolume(newVolume);
                  if (playerRef.current) {
                    playerRef.current.setVolume(newVolume);
                  }
                }}
                className="w-24"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(duration)}
            </span>
          </div>

          {isExpanded && (
            <div className="mt-4 animate-fade-in">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Up Next</h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {queue.length} tracks in queue
                </span>
              </div>
              {queue.length > 0 && (
                <div className="mt-2 space-y-2 overflow-y-auto max-h-20">
                  {queue.slice(0, 3).map((track, index) => (
                    <div key={track.id} className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{index + 1}</span>
                      <img
                        src={track.thumbnail}
                        alt={track.title}
                        className="w-8 h-8 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{track.title}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {track.channelTitle}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <YouTube
          videoId={currentTrack.id}
          opts={{
            height: '0',
            width: '0',
            playerVars: {
              autoplay: 1,
              controls: 0,
              disablekb: 1,
              fs: 0,
              modestbranding: 1,
              playsinline: 1
            },
          }}
          onReady={handleReady}
          onStateChange={handleStateChange}
          className="hidden"
        />
      </div>
    </div>
  );
}