import { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import { useMediaQuery } from '../../lib/hooks/useMediaQuery';
import { usePlayerStore } from '../../stores/playerStore';
import { setupMediaSession } from '../../lib/utils/mediaSession';
import MobilePlayer from './MobilePlayer';
import DesktopPlayer from './DesktopPlayer';

export default function Player() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const playerRef = useRef<any>(null);
  const [duration, setDuration] = useState(0);
  const { currentTrack, isPlaying, setIsPlaying, playNext } = usePlayerStore();

  useEffect(() => {
    if (currentTrack && playerRef.current) {
      setupMediaSession(playerRef, duration);
    }
  }, [currentTrack, duration]);

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

  const handleReady = (event: any) => {
    playerRef.current = event.target;
    setDuration(event.target.getDuration());
    if (isPlaying) {
      event.target.playVideo();
    }
  };

  const handleStateChange = (event: any) => {
    switch (event.data) {
      case 1: // playing
        setIsPlaying(true);
        break;
      case 2: // paused
        setIsPlaying(false);
        break;
      case 0: // ended
        setIsPlaying(false);
        playNext();
        break;
    }
  };

  return (
    <>
      {isMobile ? (
        <MobilePlayer playerRef={playerRef} duration={duration} />
      ) : (
        <DesktopPlayer playerRef={playerRef} duration={duration} />
      )}

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
            playsinline: 1,
            rel: 0,
            showinfo: 0
          },
        }}
        onReady={handleReady}
        onStateChange={handleStateChange}
        className="hidden"
      />
    </>
  );
}