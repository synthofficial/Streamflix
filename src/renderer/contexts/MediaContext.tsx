import React, { createContext, useState, useContext, ReactNode } from 'react';

interface MediaContextType {
  selectedMedia: Movie | Show | Anime | null;
  setSelectedMedia: (media: Movie | Show | Anime | null) => void;
  selectedEpisode: any | null;
  setSelectedEpisode: (episode: any | null) => void;
  episodeUrl: string | null;
  setEpisodeUrl: (url: string | null) => void;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedMedia, setSelectedMedia] = useState<Movie | Show | Anime | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<any | null>(null);
  const [episodeUrl, setEpisodeUrl] = useState<string | null>(null);

  return (
    <MediaContext.Provider 
      value={{ 
        selectedMedia, 
        setSelectedMedia, 
        selectedEpisode, 
        setSelectedEpisode, 
        episodeUrl, 
        setEpisodeUrl 
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (context === undefined) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
};