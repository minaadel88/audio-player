import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Track } from '../lib/types';
import { CHANNELS } from '../lib/constants';

interface PlayerStore {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  history: Track[];
  currentPlaylist: Track[] | null;
  currentTrackIndex: number | null;
  setCurrentTrack: (track: Track, playlist?: Track[]) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  playNext: () => void;
  playPrevious: () => void;
  addToHistory: (track: Track) => void;
  autoPlayNextFromChannel: () => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      isPlaying: false,
      queue: [],
      history: [],
      currentPlaylist: null,
      currentTrackIndex: null,

      setCurrentTrack: (track, playlist) => {
        const currentTrack = get().currentTrack;
        if (currentTrack) {
          get().addToHistory(currentTrack);
        }

        if (playlist) {
          const trackIndex = playlist.findIndex(t => t.id === track.id);
          const nextTracks = playlist.slice(trackIndex + 1);
          set({ 
            currentTrack: track,
            currentPlaylist: playlist,
            currentTrackIndex: trackIndex,
            queue: nextTracks,
            isPlaying: true
          });
        } else {
          // If no playlist provided, find the track in channels
          const channel = CHANNELS.find(ch => 
            ch.videos.some(video => video.id === track.id)
          );
          
          if (channel) {
            const trackIndex = channel.videos.findIndex(video => video.id === track.id);
            const nextTracks = channel.videos.slice(trackIndex + 1);
            set({ 
              currentTrack: track,
              currentPlaylist: channel.videos,
              currentTrackIndex: trackIndex,
              queue: nextTracks,
              isPlaying: true
            });
          } else {
            set({ 
              currentTrack: track,
              currentPlaylist: null,
              currentTrackIndex: null,
              isPlaying: true
            });
          }
        }
      },

      setIsPlaying: (isPlaying) => set({ isPlaying }),
      
      addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),
      
      removeFromQueue: (trackId) => 
        set((state) => ({ queue: state.queue.filter((t) => t.id !== trackId) })),
      
      clearQueue: () => set({ queue: [] }),

      playNext: () => {
        const { queue, currentTrack, currentPlaylist, currentTrackIndex } = get();
        
        if (currentPlaylist && currentTrackIndex !== null) {
          const nextIndex = currentTrackIndex + 1;
          if (nextIndex < currentPlaylist.length) {
            const nextTrack = currentPlaylist[nextIndex];
            if (currentTrack) {
              get().addToHistory(currentTrack);
            }
            set({ 
              currentTrack: nextTrack,
              currentTrackIndex: nextIndex,
              queue: currentPlaylist.slice(nextIndex + 1),
              isPlaying: true
            });
            return;
          }
        }

        if (queue.length > 0) {
          const nextTrack = queue[0];
          const newQueue = queue.slice(1);
          if (currentTrack) {
            get().addToHistory(currentTrack);
          }
          set({ currentTrack: nextTrack, queue: newQueue, isPlaying: true });
        } else {
          get().autoPlayNextFromChannel();
        }
      },

      playPrevious: () => {
        const { history, currentTrack, currentPlaylist, currentTrackIndex } = get();
        
        if (currentPlaylist && currentTrackIndex !== null && currentTrackIndex > 0) {
          const previousIndex = currentTrackIndex - 1;
          const previousTrack = currentPlaylist[previousIndex];
          if (currentTrack) {
            set((state) => ({ queue: [currentTrack, ...state.queue] }));
          }
          set({ 
            currentTrack: previousTrack,
            currentTrackIndex: previousIndex,
            queue: currentPlaylist.slice(previousIndex + 1),
            isPlaying: true
          });
          return;
        }

        if (history.length > 0) {
          const previousTrack = history[history.length - 1];
          const newHistory = history.slice(0, -1);
          if (currentTrack) {
            set((state) => ({ queue: [currentTrack, ...state.queue] }));
          }
          set({ currentTrack: previousTrack, history: newHistory, isPlaying: true });
        }
      },

      addToHistory: (track) => 
        set((state) => ({ history: [...state.history, track] })),

      autoPlayNextFromChannel: () => {
        const { currentTrack } = get();
        if (!currentTrack) return;

        // Find current channel and track
        const currentChannel = CHANNELS.find(ch => 
          ch.videos.some(video => video.id === currentTrack.id)
        );

        if (currentChannel) {
          const currentIndex = currentChannel.videos.findIndex(video => video.id === currentTrack.id);
          
          // If there are more tracks in the current channel
          if (currentIndex < currentChannel.videos.length - 1) {
            const nextTrack = currentChannel.videos[currentIndex + 1];
            get().setCurrentTrack(nextTrack, currentChannel.videos);
          } else {
            // Move to the next channel
            const currentChannelIndex = CHANNELS.findIndex(ch => ch.id === currentChannel.id);
            if (currentChannelIndex < CHANNELS.length - 1) {
              const nextChannel = CHANNELS[currentChannelIndex + 1];
              if (nextChannel.videos.length > 0) {
                get().setCurrentTrack(nextChannel.videos[0], nextChannel.videos);
              }
            }
          }
        }
      }
    }),
    {
      name: 'player-storage',
      partialize: (state) => ({
        currentTrack: state.currentTrack,
        queue: state.queue,
        history: state.history
      })
    }
  )
);