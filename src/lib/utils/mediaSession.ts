import { usePlayerStore } from '../../stores/playerStore';

export const setupMediaSession = (
  playerRef: React.MutableRefObject<any>,
  duration: number
) => {
  if ('mediaSession' in navigator && playerRef.current) {
    const store = usePlayerStore.getState();
    const track = store.currentTrack;

    if (!track) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.channelTitle,
      artwork: [
        {
          src: track.thumbnail,
          sizes: '512x512',
          type: 'image/jpeg'
        }
      ]
    });

    navigator.mediaSession.setActionHandler('play', () => {
      playerRef.current?.playVideo();
      store.setIsPlaying(true);
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      playerRef.current?.pauseVideo();
      store.setIsPlaying(false);
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      store.playPrevious();
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      store.playNext();
    });

    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime && playerRef.current) {
        playerRef.current.seekTo(details.seekTime);
      }
    });

    navigator.mediaSession.setPositionState({
      duration: duration || 0,
      playbackRate: 1,
      position: playerRef.current?.getCurrentTime() || 0
    });

    // Keep screen awake during playback
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').catch((err) => {
        console.log('Wake Lock error:', err);
      });
    }
  }
};