import React from 'react';
import { Box, VStack } from '@chakra-ui/react';
import TopCarousel from "./tabs/TopCarousel";
import TrendingMovies from "./tabs/TrendingMovies";
import TrendingShows from "./tabs/TrendingShows";
import TrendingAnime from "./tabs/TrendingAnime";
import discordRPCManager from '../../constants/DiscordRPC';
import { useVideoPlayer } from '../contexts/VideoPlayerContext'; // Make sure this path is correct

const Homepage: React.FC = () => {
  const { setShowPlayer, setCurrentMedia, setCurrentEpisode, setCurrentUrl } = useVideoPlayer();

  const handlePlayClick = (media: Movie | Show | Anime, episodeData?: any, url?: string) => {
    setCurrentMedia(media);
    setCurrentEpisode(episodeData || null);
    setCurrentUrl(url || null);
    setShowPlayer(true);

    console.log(media, episodeData, url);
    
    // Update Discord RPC
    discordRPCManager.setPresence({
      state: 'Watching a video',
      details: media.title.toString(),
      startTimestamp: Date.now(),
      largeImageKey: media.thumbnail || '',
      largeImageText: media.title.toString(),
      smallImageKey: episodeData ? episodeData.thumbnail : media?.thumbnail,
    });
  };

  return (
    <Box className="w-full h-full text-white overflow-y-auto">
      <VStack spacing={8} align="stretch" className="p-8 overflow-x-hidden">
        <TopCarousel onPlayClick={handlePlayClick} />
        <TrendingMovies onPlayClick={handlePlayClick} />
        <TrendingShows onPlayClick={handlePlayClick} />
        <TrendingAnime onPlayClick={handlePlayClick}/>
      </VStack>
    </Box>
  );
};

export default Homepage;