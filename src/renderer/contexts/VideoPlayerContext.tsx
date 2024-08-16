import React, { createContext, useState, useContext, ReactNode } from 'react';

interface VideoPlayerContextType {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentMedia: Movie | Show | Anime | null;
  setCurrentMedia: (media: Movie | Show | Anime | any | null) => void;
  currentEpisode: any | null;
  setCurrentEpisode: (episode: any | null) => void;
  currentUrl: string | null;
  setCurrentUrl: (url: string | null) => void;
  showPlayer: boolean;
  setShowPlayer: (show: boolean) => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextType | undefined>(undefined);

export const VideoPlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMedia, setCurrentMedia] = useState<Movie | Show | Anime | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<any | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  return (
    <VideoPlayerContext.Provider 
      value={{ 
        isPlaying,
        setIsPlaying,
        currentMedia,
        setCurrentMedia,
        currentEpisode,
        setCurrentEpisode,
        currentUrl,
        setCurrentUrl,
        showPlayer,
        setShowPlayer
      }}
    >
      {children}
    </VideoPlayerContext.Provider>
  );
};

export const useVideoPlayer = () => {
  const context = useContext(VideoPlayerContext);
  if (context === undefined) {
    throw new Error('useVideoPlayer must be used within a VideoPlayerProvider');
  }
  return context;
};